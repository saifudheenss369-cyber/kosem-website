'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import CustomPopup from '../components/CustomPopup';

export default function Signup() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [otpCooldown, setOtpCooldown] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const router = useRouter();

    useEffect(() => {
        let timer;
        if (otpCooldown > 0) {
            timer = setInterval(() => setOtpCooldown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [otpCooldown]);

    const handleSendOtp = async () => {
        setError('');
        const email = formData.email.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsChecking(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setIsOtpSent(true);
                setOtpCooldown(30);
                setPopupConfig({ isOpen: true, title: 'OTP Sent', message: `A 6-digit verification code has been sent to ${email}.`, type: 'success' });
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Failed to send OTP. Please try again.');
        } finally {
            setIsChecking(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setError('Please enter the OTP sent to your email.');
            return;
        }

        setIsVerifying(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email.trim(), otp: otp.trim() })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setIsVerified(true);
                setPopupConfig({ isOpen: true, title: 'Verified', message: 'Email verified successfully!', type: 'success' });
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isVerified) {
            setError('Please verify your email address first.');
            return;
        }

        const phoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$/;
        if (!phoneRegex.test(formData.phone.trim())) {
            setError('Please enter a valid 10-digit Indian phone number.');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    phone: formData.phone.trim(),
                    isVerified: true
                }),
            });

            if (res.ok) {
                setPopupConfig({ isOpen: true, title: 'Account Created', message: 'Account created successfully! Please login.', type: 'success' });
                setTimeout(() => router.push('/login'), 1500);
            } else {
                const data = await res.json();
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong');
        }
    };

    return (
        <>
            <Navbar />
            <CustomPopup
                isOpen={popupConfig.isOpen}
                onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                title={popupConfig.title}
                message={popupConfig.message}
                type={popupConfig.type}
            />
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', paddingTop: '160px', paddingBottom: '40px' }}>
                <div style={{ background: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Create Account</h2>

                    {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number (+91)</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="9876543210"
                                required
                                style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                            />
                        </div>

                        {/* Email Verification */}
                        <div className="form-group">
                            <label>Email Address</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => {
                                        setFormData({ ...formData, email: e.target.value });
                                        setIsVerified(false);
                                        setIsOtpSent(false);
                                    }}
                                    placeholder="name@example.com"
                                    disabled={isVerified}
                                    required
                                    style={{ flex: 1, padding: '0.8rem', marginBottom: '1rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: isVerified ? 'var(--color-bg-main)' : 'var(--color-bg-secondary)', color: isVerified ? 'var(--color-text-muted)' : 'var(--color-text-main)' }}
                                />
                                {!isVerified && (
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={!formData.email || isChecking || otpCooldown > 0}
                                        style={{
                                            padding: '0 1rem', height: '42px',
                                            background: isChecking ? '#666' : (otpCooldown > 0 ? '#ddd' : '#333'),
                                            color: otpCooldown > 0 ? '#888' : 'white',
                                            border: 'none', borderRadius: '4px', cursor: (isChecking || otpCooldown > 0) ? 'not-allowed' : 'pointer',
                                            opacity: !formData.email ? 0.6 : 1,
                                            fontWeight: '500',
                                            minWidth: '100px'
                                        }}
                                    >
                                        {isChecking ? 'Sending...' : (otpCooldown > 0 ? `Resend (${otpCooldown}s)` : (isOtpSent ? 'Resend OTP' : 'Send OTP'))}
                                    </button>
                                )}
                            </div>
                        </div>

                        {isOtpSent && !isVerified && (
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Enter Email OTP</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        placeholder="6-digit code"
                                        style={{ flex: 1, padding: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifying}
                                        style={{ padding: '0 1rem', background: 'var(--color-gold)', color: 'var(--color-text-main)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        {isVerifying ? '...' : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isVerified && <p style={{ color: 'green', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>✓ Email Verified Successfully</p>}

                        <div className="form-group">
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength={6}
                                    style={{ width: '100%', padding: '0.8rem', paddingRight: '40px', marginBottom: '1rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '40%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-muted)'
                                    }}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 10.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={agreedToTerms} 
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                style={{ marginTop: '4px', cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                            <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                                I have read and agree to the <Link href="/terms" style={{ color: 'var(--color-gold)', textDecoration: 'underline' }}>Terms & Conditions</Link> and <Link href="/privacy" style={{ color: 'var(--color-gold)', textDecoration: 'underline' }}>Privacy Policy</Link>.
                            </label>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', opacity: (!isVerified || !agreedToTerms) ? 0.5 : 1 }} disabled={!isVerified || !agreedToTerms}>
                            {!agreedToTerms ? 'Accept Terms to Continue' : (isVerified ? 'Create Account' : 'Verify Email to Continue')}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                        Already have an account? <Link href="/login" style={{ color: 'var(--color-gold)' }}>Login here</Link>
                    </p>
                </div>
            </div>
        </>
    );
}
