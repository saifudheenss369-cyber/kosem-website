'use client';

import { useState } from 'react';

export default function ShareButton({ title, text, url }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
                padding: '0.85rem 1.5rem',
                background: '#f8f9fa',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--color-text-main)',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                width: '100%'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.borderColor = '#ccc'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
            title="Share this product"
        >
            {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2e7d32" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.345 1.054.151.322.282.654.39.993m0 0l3.79-1.895m-3.79 1.895L7.545 11M3 12a9 9 0 1118 0 9 9 0 01-18 0zm6.75-4.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm0 9a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                </svg>
            )}
            <span style={{ color: copied ? '#2e7d32' : '#444' }}>
                {copied ? 'Link Copied!' : 'Share with Friends'}
            </span>
        </button>
    );
}
