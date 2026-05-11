import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyB4CSA4s7u3XGdmeiQDAPy9h-zzM790thC",
    authDomain: "kosem-website.firebaseapp.com",
    projectId: "kosem-website",
    storageBucket: "kosem-website.firebasestorage.app",
    messagingSenderId: "340088532228",
    appId: "1:340088532228:web:ef21148aaf979c090eb451",
    measurementId: "G-FB9PJ8VJC5"
};

/*
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
*/

// Initialize Firebase
let app;
let auth;

if (firebaseConfig.apiKey) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
    } catch (error) {
        console.error("Firebase Init Error:", error);
    }
} else {
    console.warn("Firebase Config missing (Checking process.env). Skipping initialization.");
}

export { auth };

// Analytics (Safe to initialize conditionally)
if (typeof window !== 'undefined') {
    // getAnalytics(app); 
}

export const setupRecaptcha = (elementId) => {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                // console.log("Recaptcha Verified");
            }
        });
    }
    return window.recaptchaVerifier;
};

export { signInWithPhoneNumber };
