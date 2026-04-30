'use client';

import Link from 'next/link';

export default function ImageHero({ title = 'Kosem Perfumes', subtitle = 'Premium Attar & Oudh', link = '/shop', image = '/hero-image.JPG' }) {
    return (
        <section style={{
            position: 'relative',
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            aspectRatio: '16/9',
            maxHeight: '90vh',
            minHeight: '400px',
            overflow: 'hidden',
            background: '#0a0a0a',
            marginTop: '0'
        }}>
            {/* Background Image */}
            <div
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0,
                    opacity: 0.85,
                    transform: 'scale(1.05)', // Subtle zoom for depth
                    transition: 'transform 10s ease-out'
                }}
            />

            {/* Subtle Overlay to make text pop */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />

            {/* Content Container */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
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
