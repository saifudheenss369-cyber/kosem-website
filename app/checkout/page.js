'use client';

import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import OrderSuccess from '../components/OrderSuccess';
import CustomPopup from '../components/CustomPopup';
import { auth, setupRecaptcha, signInWithPhoneNumber } from '../../lib/firebase';

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useCart();
    const [formData, setFormData] = useState({ name: '', address: '', district: '', state: '', pincode: '', phone: '' });
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', type: 'info', redirectUrl: null });
    const [inlineAuthStep, setInlineAuthStep] = useState(0);
    const [inlineOtp, setInlineOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [resendTimer, setResendTimer] = useState(0);

    const router = useRouter();

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    useEffect(() => {
        checkAuth();

        // Initialize Recaptcha
        try {
            setupRecaptcha('recaptcha-container');
        } catch (err) {
            console.error("Recaptcha Setup Error:", err);
        }

        // Check for generic payment return callbacks (if any redirect happens)
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const success = params.get('success');

            if (success === 'true') {
                setPopupConfig({ isOpen: true, title: 'Payment Successful', message: 'Your order has been placed successfully.', type: 'info' });
                clearCart();
            }
        }
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                // Pre-fill form
                setFormData({
                    name: userData.name || '',
                    address: userData.address || '',
                    district: userData.city || '',
                    state: userData.state || '',
                    pincode: userData.zip || '',
                    phone: userData.phone || ''
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePincodeChange = async (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, pincode: value }));

        if (value.length === 6) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
                const data = await res.json();
                if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                    const postOffice = data[0].PostOffice[0];
                    setFormData(prev => ({
                        ...prev,
                        district: postOffice.District,
                        state: postOffice.State
                    }));
                }
            } catch (err) {
                console.error("Postal API error:", err);
            }

            // Check COD Availability
            try {
                const res = await fetch('/api/shipping/check-pincode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pincode: value })
                });
                const data = await res.json();
                if (res.ok && data.deliverable && data.codAvailable) {
                    setIsCodAvailable(true);
                } else {
                    setIsCodAvailable(false);
                    if (paymentMethod === 'COD') setPaymentMethod('ONLINE');
                }
            } catch (err) {
                console.error("COD check error:", err);
            }
        } else {
            setIsCodAvailable(true);
        }
    };

    const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or ONLINE
    const [shippingMethod, setShippingMethod] = useState('STANDARD'); // STANDARD or EXPRESS
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isCodAvailable, setIsCodAvailable] = useState(true);

    // Coupon states
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    // Shipping calculations
    const subtotal = cartTotal;
    const shippingCost = shippingMethod === 'EXPRESS' ? 99 : (subtotal >= 500 ? 0 : 50);
    const totalBeforeDiscount = subtotal + shippingCost;
    const finalTotal = appliedCoupon ? totalBeforeDiscount - appliedCoupon.discountAmount : totalBeforeDiscount;

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        setCouponError('');
        if (!couponCodeInput.trim()) return;

        setIsApplyingCoupon(true);
        try {
            const res = await fetch('/api/cart/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCodeInput, cartTotal: totalBeforeDiscount })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setAppliedCoupon({
                    code: couponCodeInput.toUpperCase().trim(),
                    discountAmount: data.discountAmount
                });
                setCouponCodeInput('');
            } else {
                setCouponError(data.error || 'Invalid coupon code');
            }
        } catch (err) {
            setCouponError('Error verifying coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCodeInput('');
        setCouponError('');
    };

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cart.length === 0) return;

        // Force OTP if:
        // 1. Not logged in
        // 2. Logged in but not verified
        // 3. Logged in and verified BUT has changed the phone number in the form
        const isVerifiedUser = user && user.isVerified;
        const phoneMatches = user && user.phone === formData.phone;

        if (isVerifiedUser && phoneMatches) {
            await processOrder(user);
            return;
        }

        // Otherwise, require phone OTP
        handleSendOtp();
    };

    const handleSendOtp = async (overridePhone = null) => {
        if (!auth) {
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Firebase not configured properly.', type: 'error' });
            return;
        }

        const phoneToVerify = overridePhone || formData.phone;

        if (!phoneToVerify || phoneToVerify.length < 10) {
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Please enter a valid 10-digit phone number first.', type: 'error' });
            return;
        }

        setInlineAuthStep(1); // loading
        const formattedPhone = phoneToVerify.startsWith('+91') ? phoneToVerify : `+91${phoneToVerify}`;

        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(confirmation);
            setPopupConfig({ isOpen: true, title: 'OTP Sent', message: `OTP sent to ${phoneToVerify}`, type: 'success' });
            setInlineAuthStep(2); // Show OTP input
            setResendTimer(30); // 30 second timer
        } catch (error) {
            console.error("OTP Error:", error);
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Failed to send OTP. Please write a valid regular mobile number.', type: 'error' });
            setInlineAuthStep(0);
        }
    };

    const handleVerifyOtp = async () => {
        if (!confirmationResult || !inlineOtp) return;

        setInlineAuthStep(1); // loading
        try {
            const res = await confirmationResult.confirm(inlineOtp);
            const firebaseUser = res.user;
            const idToken = await firebaseUser.getIdToken();

            // Verify with backend
            const tokenRes = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseToken: idToken, phone: formData.phone })
            });

            if (tokenRes.ok) {
                const updatedUser = await tokenRes.json();
                setUser(updatedUser.user);
                setInlineAuthStep(0); // hide OTP box
                setPopupConfig({ isOpen: true, title: 'Success', message: 'Verification Successful! Placing your order...', type: 'success' });
                await processOrder(updatedUser.user);
            } else {
                setPopupConfig({ isOpen: true, title: 'Error', message: 'User mapping failed on backend.', type: 'error' });
                setInlineAuthStep(2);
            }
        } catch (error) {
            console.error(error);
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Invalid OTP provided.', type: 'error' });
            setInlineAuthStep(2);
        }
    };

    const processOrder = async (verifiedUser) => {
        setIsPlacingOrder(true);
        // Format full address
        const fullAddress = `${formData.address}, ${formData.district}, ${formData.state} - ${formData.pincode}`;

        // 1. Create Order (Status: PENDING)
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    address: formData.address || fullAddress,
                    district: formData.district,
                    state: formData.state,
                    pincode: formData.pincode,
                    phone: formData.phone || verifiedUser?.phone || '9999999999',
                    email: verifiedUser?.email,
                    items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
                    total: finalTotal,
                    paymentMethod: paymentMethod, // 'COD' or 'ONLINE'
                    shippingMethod: shippingMethod, // 'STANDARD' or 'EXPRESS'
                    couponCode: appliedCoupon?.code || null,
                    discountAmount: appliedCoupon?.discountAmount || null,
                })
            });

            if (res.ok) {
                const order = await res.json();

                if (paymentMethod === 'ONLINE') {
                    // 1. Initiate Instamojo Payment
                    try {
                        const payRes = await fetch('/api/payment/initiate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                amount: finalTotal,
                                mobileNumber: verifiedUser?.phone || formData.phone || '9999999999',
                                orderId: order.id,
                                name: formData.name,
                                email: verifiedUser?.email || 'guest@kosemperfume.com'
                            })
                        });

                        const orderData = await payRes.json();

                        if (orderData.longurl) {
                            // Redirect user to Instamojo hosted secure payment page
                            window.location.href = orderData.longurl;
                        } else {
                            setPopupConfig({ isOpen: true, title: 'Payment Error', message: orderData.error || 'Failed to generate payment link.', type: 'error' });
                        }

                    } catch (payErr) {
                        console.error('Payment initiation error:', payErr);
                        setPopupConfig({ isOpen: true, title: 'Payment Error', message: 'Payment initiation failed. Please try again.', type: 'error' });
                    }
                } else {
                    // COD Success
                    setOrderData(order);
                    setOrderPlaced(true);
                    clearCart();
                }
            } else {
                setPopupConfig({ isOpen: true, title: 'Order Failed', message: 'Failed to place order. Please check your details and try again.', type: 'error' });
            }
        } catch (err) {
            console.error('Error placing order:', err);
            setPopupConfig({ isOpen: true, title: 'Network Error', message: 'Error communicating with the server. Please try again later.', type: 'error' });
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (orderPlaced && orderData) {
        return <OrderSuccess order={orderData} onClose={() => window.location.href = '/'} />;
    }

    return (
        <>
            <Navbar />
            <CustomPopup
                isOpen={popupConfig.isOpen}
                onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                title={popupConfig.title}
                message={popupConfig.message}
                type={popupConfig.type}
                redirectUrl={popupConfig.redirectUrl}
            />
            <main className="container checkout-container">
                <h1>Checkout</h1>
                <div className="checkout-grid">
                    <div>
                        <h3>Shipping & Verification</h3>
                        <form onSubmit={handleSubmit} id="checkout-form">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setFormData({ ...formData, phone: val });
                                        // Auto-send OTP if 10 digits and verification needed
                                        if (val.length === 10) {
                                            const isVerifiedUser = user && user.isVerified;
                                            const phoneMatches = user && user.phone === val;
                                            if (!isVerifiedUser || !phoneMatches) {
                                                // Small delay to ensure state is updated or just call it
                                                setTimeout(() => handleSendOtp(val), 100);
                                            }
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                                {user && user.isVerified && user.phone === formData.phone && (
                                    <div style={{ color: 'green', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>✅</span> Number Verified
                                    </div>
                                )}

                                {inlineAuthStep === 2 && (
                                    <div style={{ marginBottom: '1.5rem', background: '#D4AF3715', padding: '1rem', borderRadius: '8px', border: '1px dashed #D4AF37' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Enter Verification Code</h4>
                                            {resendTimer > 0 ? (
                                                <span style={{ fontSize: '0.8rem', color: '#666' }}>Resend in {resendTimer}s</span>
                                            ) : (
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleSendOtp(formData.phone)}
                                                    style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                                                >
                                                    Resend OTP
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text"
                                                maxLength="6"
                                                value={inlineOtp}
                                                onChange={e => setInlineOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                                placeholder="123456"
                                                style={{ flex: 1, padding: '0.8rem', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyOtp}
                                                className="btn-primary"
                                                disabled={inlineAuthStep === 1}
                                                style={{ padding: '0 1.5rem', opacity: inlineAuthStep === 1 ? 0.5 : 1 }}
                                            >
                                                {inlineAuthStep === 1 ? '...' : 'Verify'}
                                            </button>
                                        </div>
                                        <button type="button" onClick={() => setInlineAuthStep(0)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.7rem', marginTop: '0.5rem', cursor: 'pointer', textDecoration: 'underline' }}>Wrong number? Change</button>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>PIN Code</label>
                                <input
                                    type="text"
                                    value={formData.pincode}
                                    onChange={handlePincodeChange}
                                    maxLength="6"
                                    required
                                    placeholder="Enter 6-digit Pincode"
                                    style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>

                            <div className="city-state-grid">
                                <div className="form-group">
                                    <label>District / City</label>
                                    <input
                                        type="text"
                                        value={formData.district}
                                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', background: '#f9f9f9' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', background: '#f9f9f9' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>House No. & Street Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    rows="2"
                                    style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>

                            {/* Shipping Method */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3>Shipping Method</h3>
                                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: shippingMethod === 'STANDARD' ? '#fcf9eb' : 'white', borderColor: shippingMethod === 'STANDARD' ? '#D4AF37' : '#ddd' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value="STANDARD"
                                                checked={shippingMethod === 'STANDARD'}
                                                onChange={() => setShippingMethod('STANDARD')}
                                            />
                                            <div>
                                                <span style={{ display: 'block', fontWeight: 'bold' }}>Standard Delivery</span>
                                                <span style={{ fontSize: '0.85rem', color: '#666' }}>3-5 Business Days</span>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 'bold', color: subtotal >= 500 ? 'green' : '#333' }}>
                                            {subtotal >= 500 ? 'FREE' : '₹50'}
                                        </span>
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: shippingMethod === 'EXPRESS' ? '#fcf9eb' : 'white', borderColor: shippingMethod === 'EXPRESS' ? '#D4AF37' : '#ddd' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value="EXPRESS"
                                                checked={shippingMethod === 'EXPRESS'}
                                                onChange={() => setShippingMethod('EXPRESS')}
                                            />
                                            <div>
                                                <span style={{ display: 'block', fontWeight: 'bold' }}>EXPRESS Shipping</span>
                                                <span style={{ fontSize: '0.85rem', color: '#666' }}>1-2 Business Days</span>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 'bold' }}>₹99</span>
                                    </label>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h3>Payment Method</h3>
                                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                    {isCodAvailable ? (
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="COD"
                                                checked={paymentMethod === 'COD'}
                                                onChange={() => setPaymentMethod('COD')}
                                            />
                                            <span>Cash on Delivery</span>
                                        </label>
                                    ) : (
                                        <div style={{ padding: '1rem', border: '1px solid #ffccdd', borderRadius: '8px', background: '#ffe6ee', color: '#c00' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>⚠️ COD Not Available</span>
                                            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Cash on Delivery is not supported for this PIN Code. Please pay online.</div>
                                        </div>
                                    )}
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: '#f9f9ff' }}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="ONLINE"
                                            checked={paymentMethod === 'ONLINE'}
                                            onChange={() => setPaymentMethod('ONLINE')}
                                        />
                                        <span>Pay Online (UPI / Card)</span>
                                        <span style={{ fontSize: '0.8rem', background: '#e0e0e0', padding: '2px 5px', borderRadius: '4px' }}>Fast</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    {/* Coupon Section */}
                    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', background: '#fff', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Have a promo code?</h4>

                        {!appliedCoupon ? (
                            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Enter code"
                                    value={couponCodeInput}
                                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                    style={{ flex: 1, padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', textTransform: 'uppercase' }}
                                />
                                <button
                                    type="submit"
                                    disabled={isApplyingCoupon || !couponCodeInput.trim()}
                                    style={{ background: '#333', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '4px', cursor: isApplyingCoupon || !couponCodeInput.trim() ? 'not-allowed' : 'pointer', opacity: isApplyingCoupon || !couponCodeInput.trim() ? 0.7 : 1 }}
                                >
                                    {isApplyingCoupon ? '...' : 'Apply'}
                                </button>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#D4AF3715', border: '1px dashed #D4AF37', padding: '0.8rem', borderRadius: '4px' }}>
                                <div>
                                    <span style={{ fontWeight: 'bold', color: '#B38B22', fontSize: '0.9rem' }}>{appliedCoupon.code}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#666', display: 'block' }}>Discount applied!</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeCoupon}
                                    style={{ background: 'none', border: 'none', color: 'red', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        {couponError && <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem', margin: 0 }}>{couponError}</p>}
                    </div>

                    <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
                        <h3>Order Summary</h3>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <hr style={{ margin: '0.5rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#666' }}>
                            <span>Subtotal</span>
                            <span>₹{subtotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#666' }}>
                            <span>Shipping</span>
                            <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                        </div>

                        {appliedCoupon && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#B38B22', fontWeight: 'bold' }}>
                                <span>Discount ({appliedCoupon.code})</span>
                                <span>- ₹{appliedCoupon.discountAmount}</span>
                            </div>
                        )}

                        <hr style={{ margin: '1rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            <span>Total</span>
                            <span>₹{finalTotal}</span>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            className="btn-primary hide-mobile"
                            style={{ width: '100%', marginTop: '1.5rem', opacity: (inlineAuthStep === 1 || isPlacingOrder) ? 0.5 : 1, cursor: (inlineAuthStep === 1 || isPlacingOrder) ? 'not-allowed' : 'pointer' }}
                            disabled={inlineAuthStep === 1 || isPlacingOrder}
                        >
                            {(user && user.isVerified && user.phone === formData.phone) 
                                ? (isPlacingOrder ? 'Placing Order...' : (paymentMethod === 'ONLINE' ? 'Pay Now' : 'Place Order'))
                                : (inlineAuthStep === 0 ? 'Continue to Verification' : 'Verifying...')}
                        </button>
                    </div>
                </div>

                {/* Mobile Sticky Footer */}
                <div className="mobile-checkout-sticky">
                    <div className="sticky-content">
                        <div className="price-info">
                            <span className="total-label">Total Amount</span>
                            <span className="total-value">₹{finalTotal}</span>
                        </div>
                        <button
                            type="submit"
                            form="checkout-form"
                            className="btn-primary"
                            disabled={inlineAuthStep === 1 || isPlacingOrder}
                            style={{ padding: '0.8rem 1.5rem', minWidth: '140px' }}
                        >
                            {(user && user.isVerified && user.phone === formData.phone) 
                                ? (isPlacingOrder ? '...' : (paymentMethod === 'ONLINE' ? 'Pay Now' : 'Order Now'))
                                : (inlineAuthStep === 0 ? 'Verify' : '...')}
                        </button>
                    </div>
                </div>

                <style jsx>{`
                    .mobile-checkout-sticky {
                        display: none;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: white;
                        box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
                        padding: 1rem 1.5rem;
                        z-index: 1000;
                        border-top-left-radius: 20px;
                        border-top-right-radius: 20px;
                    }

                    .sticky-content {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 1.5rem;
                    }

                    .price-info {
                        display: flex;
                        flex-direction: column;
                    }

                    .total-label {
                        font-size: 0.7rem;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        font-weight: bold;
                    }

                    .total-value {
                        font-size: 1.3rem;
                        font-weight: 900;
                        color: #000;
                    }

                    @media (max-width: 768px) {
                        .mobile-checkout-sticky {
                            display: block;
                        }
                        .hide-mobile {
                            display: none !important;
                        }
                        .checkout-grid {
                            grid-template-columns: 1fr;
                        }
                        .city-state-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                    @media (min-width: 769px) {
                        .checkout-grid {
                            display: grid;
                            grid-template-columns: 1.5fr 1fr;
                            gap: 2rem;
                        }
                        .city-state-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 1rem;
                        }
                    }
                    .checkout-container {
                        padding-top: 100px;
                        padding-bottom: 3rem;
                    }
                    .checkout-grid {
                        margin-top: 2rem;
                        gap: 2rem;
                    }
                    .city-state-grid {
                        margin-bottom: 1rem;
                        gap: 1rem;
                    }
                `}</style>
                <div id="recaptcha-container"></div>
            </main>
        </>
    );
}
