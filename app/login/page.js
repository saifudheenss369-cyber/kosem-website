'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.role === 'ADMIN') {
                    // STRICT SEPARATION: Admins must use the Admin Portal
                    setError('Please use the Admin Login Portal.');
                } else {
                    // Force a hard refresh to ensure the cookie is picked up and AuthContext re-runs
                    window.location.href = '/';
                }
            } else {
                const err = await res.json();
                setError(err.error || 'Login failed');
            }
        } catch (e) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <>
            <Navbar />
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)' }}>
                <div style={{ background: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Login</h1>

                    {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email or Phone Number</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={e => setIdentifier(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                placeholder="Enter your email or phone"
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', paddingRight: '40px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
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
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                            <a href="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}>Forgot Password?</a>
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Sign In</button>
                    </form>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Don't have an account? <a href="/signup" style={{ color: 'var(--color-gold)' }}>Sign up</a></p>
                    </div>
                </div>
            </div>
        </>
    );
}
