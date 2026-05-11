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
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved
            }
        });
    }
    return window.recaptchaVerifier;
};

export { signInWithPhoneNumber };
