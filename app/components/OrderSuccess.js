'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function OrderSuccess({ order, onClose }) {
    if (!order) return null;

    // Generate a mock transaction ID for the "receipt" feel
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
        }}>
            <div className="animate-fade-up" style={{
                background: '#121212',
                border: '1px solid var(--color-gold)',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'var(--color-gold)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    fontSize: '2rem'
                }}>
                    ✓
                </div>

                <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Order Confirmed!</h2>
                <p style={{ color: '#ccc', marginBottom: '2rem' }}>Thank you for shopping with Kosem.</p>

                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#888' }}>Order ID (Tracking):</span>
                        <strong style={{ color: 'var(--color-white)', letterSpacing: '1px' }}>{order.id}</strong>
                    </div>
                    {order.paymentMethod !== 'COD' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#888' }}>Transaction ID:</span>
                            <span style={{ color: '#ccc', fontFamily: 'monospace' }}>{transactionId}</span>
                        </div>
                    )}
                    <div style={{ borderTop: '1px solid #333', margin: '0.5rem 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                        <span style={{ color: 'var(--color-gold)' }}>
                            {order.paymentMethod === 'COD' ? 'Total Amount (COD):' : 'Total Paid:'}
                        </span>
                        <strong style={{ color: 'var(--color-white)' }}>₹{order.total}</strong>
                    </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem' }}>
                    A confirmation email has been sent to you. You can track your order status using the ID above.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link href="/track-order" onClick={onClose} style={{
                        padding: '0.8rem 1.5rem',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        textDecoration: 'none'
                    }}>
                        Track Order
                    </Link>
                    <button onClick={onClose} className="btn-primary" style={{ fontSize: '0.9rem' }}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
