'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
            <h2>Something went wrong!</h2>
            <p style={{ color: 'red' }}>{error.message || 'Unknown error'}</p>
            <button
                onClick={() => reset()}
                style={{
                    padding: '0.5rem 1rem',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Try again
            </button>
        </div>
    );
}
