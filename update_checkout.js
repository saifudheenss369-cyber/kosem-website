const fs = require('fs');
let code = fs.readFileSync('app/checkout/page.js', 'utf8');

// 1. Imports
code = code.replace(
    "import CustomPopup from '../components/CustomPopup';",
    "import CustomPopup from '../components/CustomPopup';\nimport { auth, setupRecaptcha, signInWithPhoneNumber } from '../../lib/firebase';"
);

// 2. States
code = code.replace(
    "const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', type: 'info', redirectUrl: '/login' });",
    "const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', type: 'info', redirectUrl: null });\n    const [inlineAuthStep, setInlineAuthStep] = useState(0);\n    const [inlineOtp, setInlineOtp] = useState('');\n    const [confirmationResult, setConfirmationResult] = useState(null);"
);

// 3. useEffect
code = code.replace(
    "    useEffect(() => {\n        checkAuth();\n\n        // Check",
    "    useEffect(() => {\n        checkAuth();\n\n        if (typeof window !== 'undefined' && auth) {\n            setupRecaptcha('recaptcha-checkout');\n        }\n\n        // Check"
);

// 4. checkAuth
const checkAuthRegex = /const checkAuth = async \(\) => \{[\s\S]*?finally \{\s*setIsLoading\(false\);\s*\}\s*\};/m;
const checkAuthNew = `const checkAuth = async () => {
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
    };`;
code = code.replace(checkAuthRegex, checkAuthNew);

// 5. handleSubmit and processOrder
const handleSubmitRegex = /const handleSubmit = async \(e\) => \{[\s\S]*?catch \(err\) \{\s*console.error\('Error placing order:', err\);\s*setPopupConfig\(\{ isOpen: true[^\}]+\}\);\s*\}\s*\};/m;
const handleSubmitNew = `const handleSubmit = async (e) => {
        e.preventDefault();

        if (cart.length === 0) return;

        if (!user || !user.isVerified) {
            handleSendOtp();
            return;
        }

        await processOrder(user);
    };

    const handleSendOtp = async () => {
        if (!auth) {
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Firebase not configured properly.', type: 'error' });
            return;
        }

        if (!formData.phone || formData.phone.length < 10) {
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Please enter a valid 10-digit phone number first.', type: 'error' });
            return;
        }

        setInlineAuthStep(1); // loading
        const formattedPhone = formData.phone.startsWith('+91') ? formData.phone : \`+91\${formData.phone}\`;

        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(confirmation);
            setPopupConfig({ isOpen: true, title: 'OTP Sent', message: \`OTP sent to \${formData.phone}\`, type: 'success' });
            setInlineAuthStep(2); // Show OTP input
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
        // Format full address
        const fullAddress = \`\${formData.address}, \${formData.district}, \${formData.state} - \${formData.pincode}\`;

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
                    // Load Razorpay Script
                    const resLoader = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
                    if (!resLoader) {
                        setPopupConfig({ isOpen: true, title: 'Network Error', message: 'Razorpay SDK failed to load. Are you online?', type: 'error' });
                        return;
                    }

                    // 2. Initiate Razorpay Payment
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
                                order_id: orderData.id,
                                handler: async function (response) {
                                    // 3. Verify Payment
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
                                    email: verifiedUser?.email,
                                    contact: verifiedUser?.phone || formData.phone
                                },
                                theme: { color: "#3399cc" }
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
        }
    };`;
code = code.replace(handleSubmitRegex, handleSubmitNew);


// 6. Form Pincode/Phone and Recaptcha
const formRegex = /<div className="form-group">\s*<label>PIN Code<\/label>\s*<input[^>]+value=\{formData\.pincode\}[^>]*\/>\s*<\/div>/;
const formNew = `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label>PIN Code</label>
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                                        maxLength="6"
                                        required
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                                        maxLength="10"
                                        required
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                            </div>
                            <div id="recaptcha-checkout" style={{ display: (!user || !user.isVerified) ? 'block' : 'none', marginBottom: '1rem', minHeight: '80px' }}></div>`;
code = code.replace(formRegex, formNew);

// 7. Submit Button
const btnRegex = /<button\s*type="submit"\s*form="checkout-form"[\s\S]*?<\/button>/;
const btnNew = `{inlineAuthStep === 2 && (
                            <div style={{ marginBottom: '1.5rem', background: '#D4AF3715', padding: '1rem', borderRadius: '8px', border: '1px dashed #D4AF37' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Enter Verification Code</h4>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>Code sent to {formData.phone}</p>
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
                                <button type="button" onClick={() => setInlineAuthStep(0)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', marginTop: '0.5rem', cursor: 'pointer', textDecoration: 'underline' }}>Change Number</button>
                            </div>
                        )}

                        <button
                            type="submit"
                            form="checkout-form"
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '1.5rem', opacity: inlineAuthStep === 1 ? 0.5 : 1, cursor: inlineAuthStep === 1 ? 'not-allowed' : 'pointer' }}
                            disabled={inlineAuthStep === 1}
                        >
                            {(!user || !user.isVerified) ? (inlineAuthStep === 0 ? 'Continue to Verification' : 'Verifying...') : (paymentMethod === 'ONLINE' ? 'Pay Now' : 'Place Order')}
                        </button>`;
code = code.replace(btnRegex, btnNew);

fs.writeFileSync('app/checkout/page.js', code);
console.log("Successfully rewrote page.js with all robust regexes.");
