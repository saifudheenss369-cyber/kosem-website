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
    const [formData, setFormData] = useState({ name: '', email: '', address: '', district: '', state: '', pincode: '', phone: '' });
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
                if (res.ok && data.deliverable) {
                    // COD is now always allowed as per user request
                    setIsCodAvailable(true);
                } else {
                    // We still check for deliverability if needed, but for now we keep COD on
                    setIsCodAvailable(true);
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
            // Re-initialize recaptcha fresh each time (fixes resend bug)
            const appVerifier = setupRecaptcha('recaptcha-container');
            if (!appVerifier) {
                setPopupConfig({ isOpen: true, title: 'Error', message: 'reCAPTCHA setup failed. Please refresh the page.', type: 'error' });
                setInlineAuthStep(0);
                return;
            }
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(confirmation);
            setPopupConfig({ isOpen: true, title: 'OTP Sent ✅', message: `OTP sent to +91-${phoneToVerify}. Check your SMS.`, type: 'success' });
            setInlineAuthStep(2); // Show OTP input
            setResendTimer(30); // 30 second timer
        } catch (error) {
            console.error("OTP Error Object:", error);
            let errMsg = `Failed to send OTP. Error: ${error.code || error.message || 'unknown'}. Please try again.`;
            if (error.code === 'auth/too-many-requests') {
                errMsg = 'Too many attempts. Please wait a few minutes and try again.';
            } else if (error.code === 'auth/invalid-phone-number') {
                errMsg = 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.';
            } else if (error.code === 'auth/captcha-check-failed') {
                errMsg = 'reCAPTCHA verification failed. Please refresh the page and try again.';
            } else if (error.code === 'auth/network-request-failed') {
                errMsg = 'Network error. Check your internet connection and try again.';
            } else if (error.code === 'auth/unauthorized-domain') {
                errMsg = 'This website domain is not authorized in Firebase. Please contact support.';
            } else if (error.code === 'auth/quota-exceeded') {
                errMsg = 'SMS quota exceeded. Please try again later.';
            }
            setPopupConfig({ isOpen: true, title: 'OTP Error', message: errMsg, type: 'error' });
            // Reset recaptcha on error
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch (e) { }
                window.recaptchaVerifier = null;
            }
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
                    email: formData.email || verifiedUser?.email || '',
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
                    // Load Razorpay Script
                    const resLoader = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
                    if (!resLoader) {
                        setPopupConfig({ isOpen: true, title: 'Network Error', message: 'Razorpay SDK failed to load. Are you online?', type: 'error' });
                        return;
                    }

                    // 1. Initiate Razorpay Payment
                    try {
                        const payRes = await fetch('/api/payment/initiate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                amount: finalTotal,
                                mobileNumber: verifiedUser?.phone || formData.phone || '9999999999',
                                orderId: order.id
                            })
                        });

                        const orderData = await payRes.json();

                        if (orderData.id) {
                            const options = {
                                key: orderData.keyId,
                                amount: orderData.amount,
                                currency: orderData.currency,
                                name: "Kosem Perfumes",
                                description: "Checkout Payment",
                                image: "/logo.png",
                                order_id: orderData.id,
                                handler: async function (response) {
                                    // 2. Verify Payment
                                    const verifyRes = await fetch('/api/payment/verify', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            orderId: order.id,
                                            razorpayOrderId: response.razorpay_order_id,
                                            razorpayPaymentId: response.razorpay_payment_id,
                                            razorpaySignature: response.razorpay_signature,
                                        })
                                    });

                                    const verifyData = await verifyRes.json();
                                    if (verifyData.success) {
                                        setOrderData(order);
                                        setOrderPlaced(true);
                                        clearCart();
                                    } else {
                                        setPopupConfig({ isOpen: true, title: 'Verification Failed', message: verifyData.error || 'Payment verification failed.', type: 'error' });
                                    }
                                },
                                prefill: {
                                    name: formData.name,
                                    email: verifiedUser?.email || 'guest@kosemperfume.com',
                                    contact: verifiedUser?.phone || formData.phone
                                },
                                theme: { color: "#D4AF37" }
                            };

                            const paymentObject = new window.Razorpay(options);
                            paymentObject.open();

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
                                    className="checkout-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="checkout-input"
                                    placeholder="email@example.com"
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
                                    }}
                                    className="checkout-input"
                                />
                                {user && user.isVerified && user.phone === formData.phone && (
                                    <div className="verified-badge">
                                        <span className="verified-tick">✓</span> Number Verified
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
                                    className="checkout-input"
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
                                        className="checkout-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        required
                                        className="checkout-input"
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
                                    className="checkout-input"
                                />
                            </div>

                            <div className="method-section">
                                <h3>Shipping Method</h3>
                                <div className="method-grid">
                                    <label className={`method-card ${shippingMethod === 'STANDARD' ? 'active' : ''}`}>
                                        <div className="method-info">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value="STANDARD"
                                                checked={shippingMethod === 'STANDARD'}
                                                onChange={() => setShippingMethod('STANDARD')}
                                            />
                                            <div className="method-details">
                                                <span className="method-name">Standard Delivery</span>
                                                <span className="method-desc">3-5 Business Days</span>
                                            </div>
                                        </div>
                                        <span className={`method-price ${subtotal >= 500 ? 'free' : ''}`}>
                                            {subtotal >= 500 ? 'FREE' : '₹50'}
                                        </span>
                                    </label>

                                    <label className={`method-card ${shippingMethod === 'EXPRESS' ? 'active' : ''}`}>
                                        <div className="method-info">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value="EXPRESS"
                                                checked={shippingMethod === 'EXPRESS'}
                                                onChange={() => setShippingMethod('EXPRESS')}
                                            />
                                            <div className="method-details">
                                                <span className="method-name">EXPRESS Shipping</span>
                                                <span className="method-desc">1-2 Business Days</span>
                                            </div>
                                        </div>
                                        <span className="method-price">₹99</span>
                                    </label>
                                </div>
                            </div>

                             <div className="method-section">
                                 <h3>Payment Method</h3>
                                 <div className="method-grid">
                                     {isCodAvailable ? (
                                         <label className={`method-card ${paymentMethod === 'COD' ? 'active' : ''}`}>
                                             <div className="method-info">
                                                 <input
                                                     type="radio"
                                                     name="payment"
                                                     value="COD"
                                                     checked={paymentMethod === 'COD'}
                                                     onChange={() => setPaymentMethod('COD')}
                                                 />
                                                 <div className="method-details">
                                                     <span className="method-name">Cash on Delivery</span>
                                                     <span className="method-desc">Pay when you receive</span>
                                                 </div>
                                             </div>
                                             <span className="method-icon">💵</span>
                                         </label>
                                     ) : (
                                         <div className="method-card disabled">
                                             <div className="method-info">
                                                 <span className="method-icon">⚠️</span>
                                                 <div className="method-details">
                                                     <span className="method-name" style={{ color: '#ef4444' }}>COD Not Available</span>
                                                     <span className="method-desc">Not supported for this PIN Code</span>
                                                 </div>
                                             </div>
                                         </div>
                                     )}

                                     <label className={`method-card ${paymentMethod === 'ONLINE' ? 'active' : ''}`}>
                                         <div className="method-info">
                                             <input
                                                 type="radio"
                                                 name="payment"
                                                 value="ONLINE"
                                                 checked={paymentMethod === 'ONLINE'}
                                                 onChange={() => setPaymentMethod('ONLINE')}
                                             />
                                             <div className="method-details">
                                                 <span className="method-name">Pay Online (UPI / Card)</span>
                                                 <span className="method-desc">Fast and secure checkout</span>
                                             </div>
                                         </div>
                                         <span className="method-icon">💳</span>
                                     </label>
                                 </div>
                             </div>
                         </form>

                         <div className="summary-card">
                             <div className="coupon-section">
                                 <h3>Promo Code</h3>
                                 {!appliedCoupon ? (
                                     <form onSubmit={handleApplyCoupon} className="coupon-form">
                                         <input
                                             type="text"
                                             placeholder="ENTER CODE"
                                             value={couponCodeInput}
                                             onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                             className="checkout-input coupon-input"
                                         />
                                         <button
                                             type="submit"
                                             className="btn-primary apply-btn"
                                             disabled={isApplyingCoupon || !couponCodeInput.trim()}
                                         >
                                             {isApplyingCoupon ? '...' : 'Apply'}
                                         </button>
                                     </form>
                                 ) : (
                                     <div className="applied-coupon-box">
                                         <div className="coupon-info">
                                             <span className="coupon-code">{appliedCoupon.code}</span>
                                             <span className="coupon-status">Discount Applied</span>
                                         </div>
                                         <button type="button" onClick={removeCoupon} className="remove-coupon">
                                             Remove
                                         </button>
                                     </div>
                                 )}
                                 {couponError && <p className="coupon-error">{couponError}</p>}
                             </div>

                             <div className="order-summary-content">
                                 <h3>Order Summary</h3>
                                 <div className="summary-items">
                                     {cart.map(item => (
                                         <div key={item.id} className="summary-item">
                                             <span className="item-name">{item.name} x {item.quantity}</span>
                                             <span className="item-price">₹{item.price * item.quantity}</span>
                                         </div>
                                     ))}
                                 </div>
                                 
                                 <div className="summary-divider" />
                                 
                                 <div className="summary-row">
                                     <span>Subtotal:</span>
                                     <span>₹{subtotal}</span>
                                 </div>
                                 <div className="summary-row">
                                     <span>Shipping:</span>
                                     <span className={shippingCost === 0 ? 'free' : ''}>
                                         {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                                     </span>
                                 </div>

                                 {appliedCoupon && (
                                     <div className="summary-row discount">
                                         <span>Discount ({appliedCoupon.code}):</span>
                                         <span>- ₹{appliedCoupon.discountAmount}</span>
                                     </div>
                                 )}

                                 <div className="summary-divider" />
                                 
                                 <div className="summary-total">
                                     <span>Total Amount</span>
                                     <span>₹{finalTotal}</span>
                                 </div>

                                 <button
                                     type="submit"
                                     form="checkout-form"
                                     className="btn-primary checkout-submit-btn hide-mobile"
                                     disabled={inlineAuthStep === 1 || isPlacingOrder}
                                 >
                                     {(user && user.isVerified && user.phone === formData.phone)
                                         ? (isPlacingOrder ? 'Processing...' : (paymentMethod === 'ONLINE' ? 'Pay Now' : 'Place Order'))
                                         : (inlineAuthStep === 0 ? 'Verify & Continue' : 'Verifying...')}
                                 </button>
                             </div>
                         </div>
                     </div>
                     <div>
                         {/* Empty column or space for extra info later */}
                     </div>
                </div>

                 {/* OTP Modal Overlay */}
                 {inlineAuthStep === 2 && (
                     <div className="otp-modal-overlay">
                         <div className="otp-modal-card">
                             <div className="otp-modal-header">
                                 <div className="otp-icon">📱</div>
                                 <h2>Verify Phone</h2>
                                 <p>We&apos;ve sent a 6-digit code to <strong>+91 {formData.phone}</strong></p>
                             </div>
                             
                             <div className="otp-modal-body">
                                 <input
                                     type="text"
                                     maxLength="6"
                                     value={inlineOtp}
                                     onChange={e => setInlineOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                     placeholder="••••••"
                                     className="otp-modal-input"
                                     autoFocus
                                 />
                                 
                                 <button
                                     type="button"
                                     onClick={handleVerifyOtp}
                                     className="btn-primary verify-submit-btn"
                                     disabled={inlineAuthStep === 1}
                                 >
                                     {inlineAuthStep === 1 ? 'Verifying...' : 'Confirm OTP'}
                                 </button>
                             </div>

                             <div className="otp-modal-footer">
                                 {resendTimer > 0 ? (
                                     <p className="resend-wait">Resend code in <span>{resendTimer}s</span></p>
                                 ) : (
                                     <button type="button" onClick={() => handleSendOtp(formData.phone)} className="resend-link-btn">
                                         Resend Code
                                     </button>
                                 )}
                                 <button type="button" onClick={() => setInlineAuthStep(0)} className="close-modal-btn">
                                     Change Number
                                 </button>
                             </div>
                         </div>
                     </div>
                 )}

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
                    .checkout-container {
                        padding-top: 120px;
                        padding-bottom: 5rem;
                        background: var(--color-bg-main);
                        min-height: 100vh;
                    }

                    h1 {
                        font-family: var(--font-serif);
                        font-size: 2.5rem;
                        margin-bottom: 2rem;
                        color: var(--color-text-main);
                        text-align: center;
                    }

                    h3 {
                        font-family: var(--font-serif);
                        font-size: 1.5rem;
                        color: var(--color-gold);
                        margin-bottom: 1.5rem;
                        border-bottom: 1px solid rgba(184, 134, 11, 0.2);
                        padding-bottom: 0.5rem;
                    }

                    .checkout-grid {
                        display: grid;
                        grid-template-columns: 1.5fr 1fr;
                        gap: 3rem;
                        align-items: start;
                    }

                    .form-group {
                        margin-bottom: 1.5rem;
                    }

                    .form-group label {
                        display: block;
                        margin-bottom: 0.5rem;
                        font-size: 0.9rem;
                        font-weight: 600;
                        color: var(--color-text-muted);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }

                    .checkout-input {
                        width: 100%;
                        padding: 1rem;
                        background: var(--color-bg-secondary);
                        border: 1px solid var(--color-border);
                        border-radius: 4px;
                        color: var(--color-text-main);
                        font-family: var(--font-sans);
                        transition: all 0.3s ease;
                    }

                    .checkout-input:focus {
                        outline: none;
                        border-color: var(--color-gold);
                        box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.1);
                        background: var(--color-black);
                    }

                    .city-state-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1.5rem;
                    }

                    /* Method Cards (Shipping/Payment) */
                    .method-section {
                        margin-top: 2.5rem;
                        margin-bottom: 2rem;
                    }

                    .method-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .method-card {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 1.2rem;
                        background: var(--color-bg-secondary);
                        border: 1px solid var(--color-border);
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .method-card:hover {
                        border-color: rgba(184, 134, 11, 0.5);
                        background: var(--color-black);
                    }

                    .method-card.active {
                        border-color: var(--color-gold);
                        background: rgba(184, 134, 11, 0.05);
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    }

                    .method-info {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }

                    .method-details {
                        display: flex;
                        flex-direction: column;
                    }

                    .method-name {
                        font-weight: 700;
                        color: var(--color-text-main);
                        font-size: 1rem;
                    }

                    .method-desc {
                        font-size: 0.8rem;
                        color: var(--color-text-muted);
                    }

                    .method-price, .method-icon {
                        font-weight: 700;
                        color: var(--color-gold);
                    }

                    .method-price.free {
                        color: #10B981; /* Emerald 500 */
                    }

                    .summary-card {
                        background: var(--color-bg-secondary);
                        padding: 2rem;
                        border-radius: 12px;
                        border: 1px solid var(--color-border);
                        margin-top: 2rem; /* Spacing from the form */
                    }

                    .method-card.disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        border-style: dashed;
                    }

                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 0.5rem;
                        font-size: 0.95rem;
                    }

                    .summary-item {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 1rem;
                        color: var(--color-text-muted);
                    }

                    .summary-divider {
                        height: 1px;
                        background: var(--color-border);
                        margin: 1.5rem 0;
                    }

                     .summary-total {
                        display: flex;
                        justify-content: space-between;
                        align-items: baseline;
                        font-size: 1.6rem;
                        font-weight: 800;
                        color: var(--color-gold);
                        font-family: var(--font-serif);
                        margin-bottom: 2rem;
                    }

                    .checkout-submit-btn {
                        width: 100%;
                        padding: 1.2rem;
                        font-size: 1.1rem;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        background: linear-gradient(135deg, var(--color-gold), #8B6914);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    }

                    .checkout-submit-btn:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(184, 134, 11, 0.3);
                        filter: brightness(1.1);
                    }

                    .checkout-submit-btn:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }

                    /* OTP Modal Styles */
                    .otp-modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.85);
                        backdrop-filter: blur(8px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        padding: 1.5rem;
                        animation: fadeIn 0.3s ease;
                    }

                    .otp-modal-card {
                        background: var(--color-bg-secondary);
                        border: 1px solid var(--color-gold);
                        border-radius: 20px;
                        width: 100%;
                        max-width: 340px; /* Reduced from 400px */
                        padding: 2rem 1.5rem; /* Reduced padding */
                        text-align: center;
                        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                        animation: modalScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }

                    @keyframes modalScale {
                        from { transform: scale(0.8); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }

                    .otp-icon {
                        font-size: 2.5rem; /* Reduced from 3rem */
                        margin-bottom: 1rem;
                    }

                    .otp-modal-header h2 {
                        font-family: var(--font-serif);
                        color: var(--color-gold);
                        font-size: 1.6rem; /* Reduced from 2rem */
                        margin-bottom: 0.5rem;
                    }

                    .otp-modal-header p {
                        color: var(--color-text-muted);
                        font-size: 0.85rem; /* Reduced from 0.95rem */
                        line-height: 1.4;
                        margin-bottom: 1.5rem;
                    }

                    .otp-modal-input {
                        width: 100%;
                        background: #111;
                        border: 2px solid #333;
                        border-radius: 12px;
                        padding: 1rem;
                        font-size: 1.8rem; /* Reduced from 2rem */
                        text-align: center;
                        letter-spacing: 10px;
                        color: var(--color-gold);
                        margin-bottom: 1.2rem;
                        outline: none;
                        transition: border-color 0.3s;
                    }

                    .otp-modal-input:focus {
                        border-color: var(--color-gold);
                    }

                    .verify-submit-btn {
                        width: 100%;
                        padding: 1.2rem;
                        font-size: 1.1rem;
                        font-weight: 700;
                        border-radius: 12px;
                        margin-bottom: 1.5rem;
                    }

                    .otp-modal-footer {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .resend-wait {
                        font-size: 0.9rem;
                        color: var(--color-text-muted);
                    }

                    .resend-wait span {
                        color: var(--color-gold);
                        font-weight: bold;
                    }

                    .resend-link-btn {
                        background: none;
                        border: none;
                        color: var(--color-gold);
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 0.95rem;
                        text-decoration: underline;
                    }

                    .close-modal-btn {
                        background: none;
                        border: none;
                        color: var(--color-text-muted);
                        cursor: pointer;
                        font-size: 0.85rem;
                    }

                    .close-modal-btn:hover {
                        color: #ef4444;
                    }

                    .verified-badge {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        color: #10B981;
                        font-size: 0.9rem;
                        font-weight: 600;
                        margin-bottom: 1.5rem;
                        padding: 0.5rem 1rem;
                        background: rgba(16, 185, 129, 0.1);
                        border-radius: 4px;
                        width: fit-content;
                    }

                    .verified-tick {
                        font-size: 1.2rem;
                    }

                    /* Mobile Sticky Footer */
                    .mobile-checkout-sticky {
                        display: none;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: var(--color-bg-secondary);
                        box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.3);
                        padding: 1.2rem 1.5rem;
                        z-index: 1000;
                        border-top: 1px solid var(--color-gold);
                    }

                    .sticky-content {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .price-info {
                        display: flex;
                        flex-direction: column;
                    }

                    .total-label {
                        font-size: 0.75rem;
                        color: var(--color-text-muted);
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }

                    .total-value {
                        font-size: 1.5rem;
                        font-weight: 800;
                        color: var(--color-gold);
                        font-family: var(--font-serif);
                    }

                    @media (max-width: 768px) {
                        .checkout-grid {
                            grid-template-columns: 1fr;
                            gap: 2rem;
                        }
                        .city-state-grid {
                            grid-template-columns: 1fr;
                        }
                        .mobile-checkout-sticky {
                            display: block;
                        }
                        .summary-card {
                            margin-bottom: 2rem;
                            position: static;
                        }
                    }
                `}</style>
                <div id="recaptcha-container"></div>
            </main>
        </>
    );
}
