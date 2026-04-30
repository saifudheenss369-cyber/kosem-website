export const INSTAMOJO_CONFIG = {
    clientId: process.env.INSTAMOJO_CLIENT_ID || '',
    clientSecret: process.env.INSTAMOJO_CLIENT_SECRET || '',
    isTestMode: process.env.INSTAMOJO_ENV === 'test'
};

const getBaseUrl = () => {
    return INSTAMOJO_CONFIG.isTestMode ? 'https://test.instamojo.com' : 'https://api.instamojo.com';
};

// Cached access token
let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
    // Return cached token if valid (buffer of 60 seconds)
    if (cachedToken && Date.now() < tokenExpiry - 60000) {
        return cachedToken;
    }

    const authString = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: INSTAMOJO_CONFIG.clientId,
        client_secret: INSTAMOJO_CONFIG.clientSecret
    });

    const res = await fetch(`${getBaseUrl()}/oauth2/token/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: authString
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Instamojo Auth Failed: ${error}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);

    return cachedToken;
}

/**
 * Create an Instamojo Payment Request
 */
export async function createPaymentRequest(amount, orderId, name, email, phone) {
    try {
        const token = await getAccessToken();
        
        // We ensure exact integer or 2 decimal float max
        const finalAmount = parseFloat(amount).toFixed(2);

        // Required URLs for user redirect post payment
        const appDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://kosem.vercel.app';
        const redirectUrl = `${appDomain}/api/payment/verify?orderId=${orderId}`;

        const payload = {
            amount: finalAmount,
            purpose: `Order #${orderId}`,
            buyer_name: name || 'Guest',
            email: email || 'guest@kosemperfume.com',
            phone: phone ? phone.replace(/\D/g, '').slice(-10) : undefined, // Must be exactly 10 digits without +91 usually
            redirect_url: redirectUrl,
            allow_repeated_payments: false,
            send_email: false,
            send_sms: false
        };

        const res = await fetch(`${getBaseUrl()}/v2/payment_requests/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
            return {
                success: true,
                id: data.id,
                url: data.longurl
            };
        } else {
            console.error('Instamojo creation failed response', data);
            return { success: false, error: data.message || 'Payment Request Failed' };
        }
    } catch (e) {
        console.error('Instamojo create error', e);
        return { success: false, error: e.message };
    }
}

/**
 * Verify an Instamojo Payment using the ID
 */
export async function getPaymentStatus(paymentRequestId, paymentId) {
    try {
        const token = await getAccessToken();

        const res = await fetch(`${getBaseUrl()}/v2/payment_requests/${paymentRequestId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        
        if (res.ok && data.success) {
            // Find the specific payment in the payments array (sometimes it's directly there)
            const paymentDetails = data.payments ? data.payments.find(p => p.id === paymentId) : null;
            
            // Check overall status or specific payment status
            const status = paymentDetails ? paymentDetails.status : data.status;

            return {
                success: true,
                status: status, // Expected: 'Credit', 'Failed', 'Pending'
                amount: data.amount
            };
        } else {
            return { success: false, error: data.message || 'Fetch failed' };
        }
    } catch (e) {
        return { success: false, error: e.message };
    }
}
