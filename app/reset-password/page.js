'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Password reset successfully! Redirecting...');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to reset password');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    if (!token) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#dc2626' }}>Invalid Link</h2>
                        <p>This password reset link is missing a token.</p>
                        <Link href="/forgot-password" style={{ color: 'var(--color-gold)', textDecoration: 'underline' }}>Request a new one</Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', padding: '1rem' }}>
                <div style={{ background: 'var(--color-bg-secondary)', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px' }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Reset Password</h1>

                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534' }}>
                            <p style={{ fontWeight: 'bold' }}>Success!</p>
                            <p>{message}</p>
                            <Link href="/login" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--color-gold)', textDecoration: 'none' }}>
                                Click here if not redirected &rarr;
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {status === 'error' && (
                                <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center', background: '#fef2f2', padding: '0.5rem', borderRadius: '4px' }}>
                                    {message}
                                </div>
                            )}

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '0.8rem', paddingRight: '40px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    background: status === 'loading' ? '#999' : 'var(--color-black)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    cursor: status === 'loading' ? 'wait' : 'pointer'
                                }}
                            >
                                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
