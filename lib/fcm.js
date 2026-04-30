/**
 * lib/fcm.js
 * Firebase Cloud Messaging helper for admin push notifications
 * VAPID Key: Get from Firebase Console → Project Settings → Cloud Messaging → Web Push Certificates
 */

// ⚠️ SETUP: Get your VAPID key from:
// Firebase Console → Project Settings → Cloud Messaging → Web Push Certificates → Generate Key Pair
// Then add to .env.local: NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_key_here

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

/**
 * Request notification permission and get FCM token
 * Call this in the admin panel so you can receive push notifications
 */
export async function requestNotificationPermission(messaging) {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('[FCM] Notification permission denied');
            return null;
        }

        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
            // Save token to backend
            await fetch('/api/admin/fcm-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            console.log('[FCM] Token registered:', token.substring(0, 20) + '...');
            return token;
        }
    } catch (err) {
        console.error('[FCM] Error getting token:', err);
    }
    return null;
}

// Re-export getToken, onMessage for use in components
export { getToken, onMessage };
