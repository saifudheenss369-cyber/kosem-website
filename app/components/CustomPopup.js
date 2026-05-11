'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CustomPopup({ isOpen, onClose, title, message, type = 'info', redirectUrl = '/login' }) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleAction = () => {
        onClose();
        if (type === 'login') {
            router.push(redirectUrl);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999, // Ensure it sits above mobile navs
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'var(--color-bg-secondary)',
                padding: '2.5rem 2rem',
                borderRadius: '16px',
                maxWidth: '420px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    {type === 'error' ? '❌' : type === 'login' ? '🔒' : type === 'success' ? '✅' : '🔔'}
                </div>

                <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    color: type === 'error' ? '#d32f2f' : 'var(--color-black)',
                    fontSize: '1.5rem',
                    marginBottom: '1rem'
                }}>
                    {title || (type === 'login' ? 'Authentication Required' : 'Notice')}
                </h3>

                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '1rem' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {type === 'login' ? (
                        <>
                            <button
                                onClick={handleAction}
                                className="btn-primary"
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px' }}
                            >
                                Log In
                            </button>
                            <button
                                onClick={onClose}
                                className="btn-outline"
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px' }}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="btn-primary"
                            style={{ padding: '0.8rem 2.5rem', borderRadius: '8px', minWidth: '120px' }}
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
