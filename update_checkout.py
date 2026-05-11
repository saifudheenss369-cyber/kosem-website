import re
import sys

with open('app/checkout/page.js', 'r') as f:
    c = f.read()

# 1. Imports and States
c = c.replace(
    "import CustomPopup from '../components/CustomPopup';", 
    "import CustomPopup from '../components/CustomPopup';\nimport { auth, setupRecaptcha, signInWithPhoneNumber } from '../../lib/firebase';"
)

c = c.replace(
    "const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', type: 'info', redirectUrl: '/login' });",
    "const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', type: 'info', redirectUrl: null });\n    const [inlineAuthStep, setInlineAuthStep] = useState(0);\n    const [inlineOtp, setInlineOtp] = useState('');\n    const [confirmationResult, setConfirmationResult] = useState(null);"
)

# 2. useEffect and checkAuth
c = re.sub(
    r"    useEffect\(\(\) => \{\n        checkAuth\(\);\n\n        // Check",
    "    useEffect(() => {\n        checkAuth();\n\n        if (typeof window !== 'undefined' && auth) {\n            setupRecaptcha('recaptcha-checkout');\n        }\n\n        // Check",
    c
)

check_auth_old = """    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                // Pre-fill form
                setFormData({
                    name: userData.name || '',
                    address: userData.address || '',
                    phone: userData.phone || ''
                });

                if (!userData.isVerified) {
                    setPopupConfig({
                        isOpen: true,
                        title: 'Verification Required',
                        message: 'Please verify your account to proceed with checkout.',
                        type: 'login',
                        redirectUrl: '/verify?redirect=/checkout'
                    });
                }
            } else {
                setPopupConfig({
                    isOpen: true,
                    title: 'Authentication Required',
                    message: 'Please log in to proceed with your checkout.',
                    type: 'login',
                    redirectUrl: '/login?redirect=/checkout'
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };"""

check_auth_new = """    const checkAuth = async () => {
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
    };"""
c = c.replace(check_auth_old, check_auth_new)

# 3. Handle Submit
submit_old = """    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cart.length === 0) return;

        // Final check based on Auth state
        if (!user || (!user.isVerified && !user.id)) {
            setPopupConfig({
                isOpen: true,
                title: 'Authentication Required',
                message: 'Please log in or create an account to place an order.',
                type: 'login',
                redirectUrl: '/login?redirect=/checkout'
            });
            return;
        }

        // Format full address
        const fullAddress = `${formData.address}, ${formData.district}, ${formData.state} - ${formData.pincode}`;

        // 1. Create Order (Status: PENDING)
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    address: fullAddress,
                    phone: user.phone || '9999999999',
                    items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
                    total: finalTotal,
                    paymentMethod: paymentMethod, // 'COD' or 'ONLINE'
                    shippingMethod: shippingMethod, // 'STANDARD' or 'EXPRESS'
                    couponCode: appliedCoupon?.code || null,
                    discountAmount: appliedCoupon?.discountAmount || null,
                })
            });"""

submit_new = """    const handleSubmit = async (e) => {
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
        const formattedPhone = formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`;

        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(confirmation);
            setPopupConfig({ isOpen: true, title: 'OTP Sent', message: `OTP sent to ${formData.phone}`, type: 'success' });
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
            });"""
c = c.replace(submit_old, submit_new)

# 4. Find where the processOrder wrapper needs to close
# Since processOrder encloses the old try-catch of handleSubmit, we look for the end of the submit logic.
# Wait, replacing `if (orderPlaced && orderData) {` is a good spot.
process_close_old = """    if (orderPlaced && orderData) {"""
process_close_new = """    };

    if (orderPlaced && orderData) {"""
c = c.replace(process_close_old, process_close_new)


# 5. Form Elements
form_old = """                            <div className="form-group">
                                <label>PIN Code</label>
                                <input
                                    type="text"
                                    value={formData.pincode}
                                    onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                                    maxLength="6"
                                    required
                                    style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>"""

form_new = """                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
                            <div id="recaptcha-checkout" style={{ display: (!user || !user.isVerified) ? 'block' : 'none' }}></div>"""
c = c.replace(form_old, form_new)

# 6. Submit Button Array
btn_old = """                        <button
                            type="submit"
                            form="checkout-form"
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '1.5rem', opacity: user?.isVerified ? 1 : 0.5, cursor: user?.isVerified ? 'pointer' : 'not-allowed' }}
                            disabled={!user?.isVerified}
                        >
                            {paymentMethod === 'ONLINE' ? 'Pay Now' : 'Place Order'}
                        </button>"""

btn_new = """                        {inlineAuthStep === 2 && (
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
                            {(!user || !user.isVerified) ? (inlineAuthStep === 0 ? 'Continue to Verfication' : 'Verifying...') : (paymentMethod === 'ONLINE' ? 'Pay Now' : 'Place Order')}
                        </button>"""
c = c.replace(btn_old, btn_new)

with open('app/checkout/page.js', 'w') as f:
    f.write(c)

print("Checkout page patched successfully.")
