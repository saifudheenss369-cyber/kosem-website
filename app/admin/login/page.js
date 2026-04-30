'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
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
                    // Force a hard refresh to the admin dashboard
                    window.location.href = '/admin';
                } else {
                    setError('Access Denied. You are not an Admin.');
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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
            <div style={{ background: '#2c2c2c', padding: '3rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '100%', maxWidth: '420px', color: 'white' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold)', margin: 0, fontSize: '2rem' }}>Admin Portal</h1>
                    <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Secure Login</p>
                </div>

                {error && <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', color: '#ff6b6b', padding: '0.75rem', borderRadius: '4px', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd', fontSize: '0.9rem' }}>Admin Email or Phone</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            style={{ width: '100%', padding: '0.9rem', background: '#111', border: '1px solid #444', borderRadius: '4px', color: 'white', outline: 'none' }}
                            placeholder="Enter credentials"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.9rem', background: '#111', border: '1px solid #444', borderRadius: '4px', color: 'white', outline: 'none' }}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '1rem', background: 'var(--color-gold)', color: 'var(--color-text-main)', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s' }}>
                        Enter Dashboard
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <a href="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.8rem' }}>&larr; Back to Main Website</a>
                    </div>
                </form>
            </div>
            <style>{`
                input:focus { border-color: var(--color-gold) !important; }
                button:hover { background: #d4af37 !important; }
            `}</style>
        </div>
    );
}
