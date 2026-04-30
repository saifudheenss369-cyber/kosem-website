'use client';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-black)',
            color: 'var(--color-white)',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '6rem', fontFamily: 'var(--font-serif)', color: 'var(--color-gold)', margin: 0 }}>404</h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#888' }}>Page Not Found</p>
            <Link href="/" className="btn-primary">
                Return Home
            </Link>
        </div>
    );
}
