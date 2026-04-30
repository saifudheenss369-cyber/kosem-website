'use client';

import { useState } from 'react';

export default function PincodeChecker() {
    const [pincode, setPincode] = useState('');
    const [status, setStatus] = useState(null); // 'checking', 'success', 'error', 'prepaid'
    const [message, setMessage] = useState('');

    const handleCheck = async (e) => {
        e.preventDefault();

        if (pincode.length !== 6 || isNaN(pincode)) {
            setStatus('error');
            setMessage('Please enter a valid 6-digit Pincode');
            return;
        }

        setStatus('checking');
        setMessage('');

        try {
            const res = await fetch('/api/shipping/check-pincode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pincode })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.deliverable) {
                    if (data.codAvailable) {
                        setStatus('success');
                        setMessage('Deliverable to this location!');
                    } else {
                        setStatus('prepaid');
                        setMessage('Deliverable (Prepaid Payments Only)');
                    }
                } else {
                    setStatus('error');
                    setMessage('Currently Not Deliverable to this Pincode');
                }
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to check Pincode');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            background: '#fafafa',
            border: '1px solid #eaeaea',
            borderRadius: '8px'
        }}>
            <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                color: 'var(--color-black)'
            }}>
                Check Delivery Availability
            </h4>

            <form onSubmit={handleCheck} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    style={{
                        flex: 1,
                        padding: '0.6rem 1rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        outline: 'none',
                        fontSize: '0.9rem'
                    }}
                />
                <button
                    type="submit"
                    disabled={status === 'checking'}
                    className="btn-primary"
                    style={{
                        padding: '0.6rem 1.5rem',
                        fontSize: '0.9rem',
                        opacity: status === 'checking' ? 0.7 : 1,
                        cursor: status === 'checking' ? 'wait' : 'pointer'
                    }}
                >
                    {status === 'checking' ? 'Checking...' : 'Check'}
                </button>
            </form>

            {message && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.8rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: status === 'success' ? '#edf7ed' :
                        status === 'prepaid' ? '#fff4e5' :
                            '#fdeded',
                    color: status === 'success' ? '#1e4620' :
                        status === 'prepaid' ? '#663c00' :
                            '#5f2120',
                    border: `1px solid ${status === 'success' ? '#c8e6c9' :
                        status === 'prepaid' ? '#ffe0b2' :
                            '#ffcdd2'}`
                }}>
                    <span style={{ fontSize: '1.2rem' }}>
                        {status === 'success' ? '✓' :
                            status === 'prepaid' ? '⚠️' :
                                '✕'}
                    </span>
                    <strong>{message}</strong>
                </div>
            )}

            <p style={{ margin: '0.8rem 0 0 0', fontSize: '0.75rem', color: '#888' }}>
                * Fast delivery across India via Shiprocket. COD eligibility depends on location.
            </p>
        </div>
    );
}
