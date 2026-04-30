/**
 * lib/fcm-server.js
 * Server-side Firebase Admin SDK for sending push notifications
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getAdminApp() {
    if (getApps().length > 0) return getApps()[0];

    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID || 'aljuman-a1a29',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    return initializeApp({ credential: cert(serviceAccount) });
}

/**
 * Send push notification to the admin
 */
export async function sendPushNotification({ title, body, data = {}, token }) {
    if (!token) {
        console.warn('[FCM Server] No FCM token provided, skipping notification');
        return;
    }

    try {
        const app = getAdminApp();
        const messaging = getMessaging(app);

        await messaging.send({
            token,
            data: {
                ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
                title,
                body,
                icon: '/logo.png',
                badge: '/logo.png'
            },
            webpush: {
                fcmOptions: { link: '/admin/orders' }
            }
        });
        console.log('[FCM Server] Push notification sent successfully');
    } catch (err) {
        console.error('[FCM Server] Failed to send push notification:', err.message);
    }
}

/**
 * Build a formatted new order push notification
 */
export function buildOrderPushPayload(order) {
    const itemNames = order.items.map(i => `${i.product?.name || 'Item'} x${i.quantity}`).join(', ');

    return {
        title: `🛍️ New Order #${order.id} — ₹${order.total}`,
        body: `${order.shippingName} | ${itemNames} | ${order.paymentMethod}`,
        data: { orderId: String(order.id) }
    };
}
