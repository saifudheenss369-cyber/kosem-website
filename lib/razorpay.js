import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy initialization — NOT at module level (causes Vercel build crash)
function getRazorpayInstance() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay keys not configured in environment variables');
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

/**
 * Create a Razorpay Order
 */
export async function createRazorpayOrder(amount, orderId) {
    try {
        const razorpay = getRazorpayInstance();
        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: "INR",
            receipt: `order_rcptid_${orderId}`,
        };

        const order = await razorpay.orders.create(options);
        return {
            success: true,
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        };
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify Razorpay Signature
 */
export function verifySignature(orderId, paymentId, signature) {
    try {
        const text = orderId + "|" + paymentId;
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest("hex");

        return generated_signature === signature;
    } catch (error) {
        console.error('Signature Verification Error:', error);
        return false;
    }
}
