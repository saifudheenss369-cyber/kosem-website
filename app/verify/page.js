'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import { auth, setupRecaptcha, signInWithPhoneNumber } from '../../lib/firebase';
import CustomPopup from '../components/CustomPopup';

function VerifyContent() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [isLoading, setIsLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    useEffect(() => {
        // Fetch current phone if available
        fetch('/api/auth/me').then(res => res.json()).then(data => {
            if (data.phone) setPhone(data.phone);
        });

        // Init Recaptcha
        if (auth) {
            setupRecaptcha('recaptcha-verify');
        }
    }, []);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!auth) {
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Firebase not configured properly.', type: 'error' });
            return;
        }

        setIsLoading(true);
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(confirmation);
            setPopupConfig({ isOpen: true, title: 'Success', message: 'OTP Sent successfully!', type: 'success' });
            setStep(2);
        } catch (error) {
            console.error("OTP Error:", error);
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Failed to send OTP: ' + error.message, type: 'error' });
            // Reset Recaptcha
            if (window.recaptchaVerifier) {
                // window.recaptchaVerifier.clear(); // or reset
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!confirmationResult) return;

        setIsLoading(true);
        try {
            const res = await confirmationResult.confirm(otp);
            // User is now signed in with Firebase
            const firebaseUser = res.user;
            const idToken = await firebaseUser.getIdToken();

            // Verify with backend
            await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseToken: idToken, phone })
            });

            setPopupConfig({ isOpen: true, title: 'Success', message: 'Verification Successful!', type: 'success' });
            setTimeout(() => {
                router.push(redirectUrl);
            }, 1000);
        } catch (error) {
            console.error(error);
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Invalid OTP provided.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
            <CustomPopup
                isOpen={popupConfig.isOpen}
                onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                title={popupConfig.title}
                message={popupConfig.message}
                type={popupConfig.type}
            />
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>Verify Your Account</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                    {step === 1 ? 'Enter your phone number to receive a verification code.' : `Enter the code sent to ${phone}`}
                </p>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="Phone Number"
                            required
                            style={{ width: '100%', padding: '1rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem' }}
                        />
                        <div id="recaptcha-verify"></div>
                        <button disabled={isLoading} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="123456"
                                required
                                style={{ width: '150px', padding: '1rem', fontSize: '1.5rem', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px', letterSpacing: '5px' }}
                            />
                        </div>
                        <button disabled={isLoading} className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
                            {isLoading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#666', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' }}>
                            Change Number
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
                <VerifyContent />
            </Suspense>
        </>
    );
}
