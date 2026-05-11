'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'If that email exists, we sent a reset link.');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <>
            <Navbar />
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', padding: '1rem' }}>
                <div style={{ background: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px' }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Forgot Password?</h1>

                    {status !== 'success' && (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    )}

                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f0fdf4', borderRadius: '8px', color: '#166534', border: '1px solid #bbf7d0' }}>
                            <div style={{ background: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '32px', height: '32px', color: '#16a34a' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Check your email</h3>
                            <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.5' }}>{message}</p>
                            <Link href="/login" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--color-gold)', fontWeight: '600', textDecoration: 'none' }}>
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="name@example.com"
                                    style={{ width: '100%', padding: '0.875rem', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '1rem', transition: 'border-color 0.2s', outline: 'none' }}
                                />
                            </div>

                            {status === 'error' && (
                                <div style={{ color: '#dc2626', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', background: '#fef2f2', padding: '0.75rem', borderRadius: '6px' }}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    background: status === 'loading' ? '#9ca3af' : 'var(--color-black)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    cursor: status === 'loading' ? 'wait' : 'pointer',
                                    transition: 'background 0.2s, transform 0.1s',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <Link href="/login" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
                                    Remember your password? <span style={{ color: 'var(--color-gold)', fontWeight: '500' }}>Login</span>
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
