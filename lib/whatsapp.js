/**
 * lib/whatsapp.js
 * Sends a WhatsApp message to the admin using CallMeBot API (free personal WA alerts)
 * 
 * SETUP STEPS FOR THE ADMIN (one-time):
 *  1. Save +34 644 597 159 in your phone contacts as "CallMeBot"
 *  2. Send this message to that number on WhatsApp: "I allow callmebot to send me messages"
 *  3. You'll receive an API key. Save it as CALLMEBOT_API_KEY in Vercel environment variables.
 *  4. Set ADMIN_WHATSAPP_NUMBER in Vercel environment variables (your number with country code, e.g. 917907032958)
 */

export async function sendWhatsAppAlert(message) {
    const apiKey = process.env.CALLMEBOT_API_KEY;
    const phone = process.env.ADMIN_WHATSAPP_NUMBER;

    if (!apiKey || !phone) {
        console.warn('[WhatsApp] CALLMEBOT_API_KEY or ADMIN_WHATSAPP_NUMBER not set. Skipping notification.');
        return;
    }

    try {
        const encodedMsg = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMsg}&apikey=${apiKey}`;

        const res = await fetch(url);
        if (res.ok) {
            console.log('[WhatsApp] Alert sent successfully.');
        } else {
            console.warn('[WhatsApp] Alert failed:', res.status);
        }
    } catch (err) {
        console.error('[WhatsApp] Error sending alert:', err.message);
    }
}

/**
 * Builds a formatted new-order alert message for the admin
 */
export function buildOrderAlertMessage(order) {
    const itemList = order.items
        .map(i => `• ${i.product?.name || 'Product'} x${i.quantity}`)
        .join('\n');

    return `🛍️ *NEW ORDER ALERT!*

📦 Order #${order.id}
👤 Customer: ${order.shippingName || 'N/A'}
📞 Phone: ${order.shippingPhone || 'N/A'}
📍 Address: ${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} - ${order.shippingPincode}

🛒 Items:
${itemList}

💰 Total: ₹${order.total}
💳 Payment: ${order.paymentMethod}
🚗 Shipping: ${order.shippingMethod}

👉 Pack the order and schedule pickup!`;
}
