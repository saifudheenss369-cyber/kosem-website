import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    // Hardcoded for debugging to ensure no Env Var issues
    apiKey: "AIzaSyDkab-90ZJK6OdgD64JcCrdH9KGgLoCUW0",
    authDomain: "aljuman-a1a29.firebaseapp.com",
    projectId: "aljuman-a1a29",
    storageBucket: "aljuman-a1a29.firebasestorage.app",
    messagingSenderId: "810420529037",
    appId: "1:810420529037:web:384834839fd467b435bfc4",
    measurementId: "G-G9ST1P3W1C"
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
