'use client';

import Link from 'next/link';

export default function VideoHero({ title = 'Kosem', subtitle = 'Premium Attar & Oudh', link = '/shop' }) {
    return (
        <section style={{
            position: 'relative',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)', /* breaks out of any container padding */
            aspectRatio: '16/9', // Forces landscape view
            maxHeight: '90vh',   // Prevents it from being taller than screen
            minHeight: '400px',  // Fallback for mobile
            overflow: 'hidden',
            background: '#0a0a0a',
            marginTop: '0'
        }}>
            {/* Background Video */}
            <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // Will fit perfectly in 16:9 without cropping
                    zIndex: 0,
                    opacity: 0.85 // Adjusted for clarity
                }}
            >
                <source src="/hero-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Subtle Overlay to make text pop */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />

            {/* Content Container */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center', // Center vertically
                alignItems: 'center',     // Center horizontally
                zIndex: 2,
                textAlign: 'center',
                padding: '1rem',
            }}>
                <div style={{
                    animation: 'fadeInUp 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s backwards'
                }}>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontFamily: 'var(--font-serif)',
                        marginBottom: '0.8rem',
                        lineHeight: 1.1,
                        color: 'var(--color-gold, #d4af37)',
                        textShadow: '0 4px 15px rgba(0,0,0,0.6)'
                    }}>
                        {title}
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                        color: '#eee',
                        marginBottom: '2.5rem',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}>
                        {subtitle}
                    </p>
                    <Link
                        href={link}
                        style={{
                            background: 'transparent',
                            color: 'var(--color-gold, #d4af37)',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            fontWeight: 'bold',
                            display: 'inline-block',
                            border: '1px solid var(--color-gold, #d4af37)',
                            padding: '1rem 3rem',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(4px)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'var(--color-gold, #d4af37)';
                            e.currentTarget.style.color = '#000';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--color-gold, #d4af37)';
                        }}
                    >
                        Explore Collection
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(40px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}
