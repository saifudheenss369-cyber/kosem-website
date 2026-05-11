// Firebase Messaging Service Worker
// This file MUST be at /public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDkab-90ZJK6OdgD64JcCrdH9KGgLoCUW0",
    authDomain: "aljuman-a1a29.firebaseapp.com",
    projectId: "aljuman-a1a29",
    storageBucket: "aljuman-a1a29.firebasestorage.app",
    messagingSenderId: "810420529037",
    appId: "1:810420529037:web:384834839fd467b435bfc4"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);

    const { title, body, icon, orderId } = payload.data || {};

    self.registration.showNotification(title || '🛍️ New Order!', {
        body: body || 'A new order has been placed.',
        icon: icon || '/logo.png',
        badge: '/logo.png',
        data: { orderId: orderId },
        actions: [
            { action: 'view', title: '📦 View Order' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        requireInteraction: true,   // Stays on screen until dismissed
        vibrate: [200, 100, 200]
    });
});

// Click on notification → open admin panel
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification Clicked:', event.action);
    event.notification.close();

    if (event.action === 'dismiss') return;

    const orderId = event.notification.data?.orderId;
    const path = orderId
        ? `/admin/orders?highlight=${orderId}`
        : '/admin/orders';
    
    // Use absolute URL to be safe across all platforms
    const url = new URL(path, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                // Check if already on any admin page
                if (client.url.includes('/admin') && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            // If no admin window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
