"use client";

"use client";

import { useEffect, useState } from 'react';

export default function Loading() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(old => {
                if (old >= 90) return 90; // Stop at 90% until fully loaded
                return old + Math.random() * 15;
            });
        }, 300);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'transparent' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '3px', zIndex: 99999, background: 'transparent' }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${progress}%`,
                    background: 'var(--color-gold, #d4af37)',
                    transition: 'width 0.3s ease',
                    boxShadow: '0 0 10px rgba(212, 175, 55, 0.7)'
                }} />
            </div>
        </div>
    );
}
