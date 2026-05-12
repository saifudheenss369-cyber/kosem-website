import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB4CSA4s7u3XGdmeiQDAPy9h-zzM790tHc",
    authDomain: "kosem-website.firebaseapp.com",
    projectId: "kosem-website",
    storageBucket: "kosem-website.firebasestorage.app",
    messagingSenderId: "340088532228",
    appId: "1:340088532228:web:ef21148aaf979c090eb451",
    measurementId: "G-FB9PJ8VJC5"
};

// Initialize Firebase
let app;
let auth;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
} catch (error) {
    console.error("Firebase Init Error:", error);
}

export { auth };

export const setupRecaptcha = (elementId) => {
    if (typeof window === 'undefined') return null;
    
    // Clear stale verifier
    if (window.recaptchaVerifier) {
        try {
            window.recaptchaVerifier.clear();
        } catch (e) {
            console.warn('Recaptcha clear warning:', e);
        }
        window.recaptchaVerifier = null;
    }

    // CRITICAL: Also clear the DOM element — verifier.clear() alone doesn't reset it
    const container = document.getElementById(elementId);
    if (container) {
        container.innerHTML = '';
    }

    try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
            'size': 'invisible',
            'callback': (response) => {
                console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
                console.warn('reCAPTCHA expired, resetting...');
                if (window.recaptchaVerifier) {
                    try { window.recaptchaVerifier.clear(); } catch(e) {}
                    window.recaptchaVerifier = null;
                }
                const el = document.getElementById(elementId);
                if (el) el.innerHTML = '';
            }
        });
        return window.recaptchaVerifier;
    } catch (err) {
        console.error('RecaptchaVerifier creation failed:', err);
        return null;
    }
};

export { signInWithPhoneNumber };
