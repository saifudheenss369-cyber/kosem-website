'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function HeroCarousel({ products }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef(null);
    const sectionRef = useRef(null);

    // If no products, return null (parent will render default hero)
    if (!products || products.length === 0) return null;

    const resetTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        }, 5000);
        return () => resetTimeout();
    }, [currentIndex, products.length]);

    // Scroll listener for parallax
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Entrance animation on mount
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % products.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);

    // Parallax: image moves up as you scroll
    const parallaxOffset = scrollY * 0.45;
    // Lid-open effect: content scales/fades as you scroll in
    const contentScale = Math.max(0.92, 1 - scrollY * 0.0003);
    const sectionOpacity = Math.max(0, 1 - scrollY * 0.0015);

    return (
        <section
            ref={sectionRef}
            style={{
                position: 'relative',
                height: '100vh',
                minHeight: '600px',
                width: '100%',
                overflow: 'hidden',
                background: '#000',
                opacity: sectionOpacity,
            }}
        >
            {products.map((product, idx) => (
                <div
                    key={product.id}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: idx === currentIndex ? 1 : 0,
                        transition: 'opacity 1.2s ease-in-out',
                        zIndex: idx === currentIndex ? 2 : 1,
                    }}
                >
                    {/* Parallax Background Image */}
                    <div style={{
                        position: 'absolute',
                        top: `-${parallaxOffset}px`,
                        left: 0,
                        width: '100%',
                        height: `calc(100% + ${parallaxOffset}px)`,
                        backgroundImage: `url(${product.images})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        filter: 'brightness(0.48)',
                        willChange: 'transform',
                        transition: 'top 0.05s linear',
                    }} />

                    {/* Gold shimmer overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to bottom, rgba(212,175,55,0.04) 0%, rgba(0,0,0,0.3) 100%)',
                        zIndex: 1,
                    }} />

                    {/* Content — lid-open scale effect */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) scale(${contentScale})`,
                        textAlign: 'center',
                        color: 'white',
                        width: '90%',
                        maxWidth: '800px',
                        zIndex: 3,
                        // Entrance lift animation
                        opacity: isVisible ? 1 : 0,
                        transition: 'opacity 0.8s ease',
                        willChange: 'transform',
                    }}>
                        <p style={{
                            fontSize: '1.2rem',
                            letterSpacing: '5px',
                            textTransform: 'uppercase',
                            color: '#d4af37',
                            marginBottom: '1rem',
                            animation: idx === currentIndex ? 'lidOpen 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s backwards' : 'none',
                        }}>
                            Premium Collection
                        </p>
                        <h1 style={{
                            fontSize: '4rem',
                            fontFamily: 'var(--font-serif)',
                            marginBottom: '1.5rem',
                            letterSpacing: '2px',
                            textShadow: '0 4px 30px rgba(0,0,0,0.6)',
                            animation: idx === currentIndex ? 'lidOpen 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.45s backwards' : 'none',
                        }}>
                            {product.name}
                        </h1>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#ddd',
                            marginBottom: '2.5rem',
                            animation: idx === currentIndex ? 'lidOpen 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.7s backwards' : 'none',
                            maxWidth: '600px',
                            margin: '0 auto 2.5rem auto',
                            lineHeight: '1.7',
                        }}>
                            {product.description ? product.description.substring(0, 100) + '...' : 'Experience the essence of luxury.'}
                        </p>

                        <div style={{
                            animation: idx === currentIndex ? 'lidOpen 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) 0.95s backwards' : 'none'
                        }}>
                            <Link href={`/product/${product.id}`} style={{
                                padding: '1rem 3rem',
                                background: '#d4af37',
                                border: '1px solid #d4af37',
                                color: '#000',
                                textDecoration: 'none',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease',
                                display: 'inline-block',
                            }}
                                className="hover-btn-filled"
                            >
                                Shop Now
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Scroll indicator */}
            <div style={{
                position: 'absolute',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                opacity: Math.max(0, 1 - scrollY * 0.008),
                transition: 'opacity 0.2s',
            }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase' }}>Scroll</span>
                <div style={{
                    width: '1px',
                    height: '40px',
                    background: 'linear-gradient(to bottom, rgba(212,175,55,0.8), transparent)',
                    animation: 'scrollLine 1.8s ease-in-out infinite',
                }} />
            </div>

            {/* Navigation Controls */}
            {products.length > 1 && (
                <>
                    <button onClick={prevSlide} style={{
                        position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white', fontSize: '1.5rem',
                        padding: '1rem', cursor: 'pointer', zIndex: 10, borderRadius: '50%',
                        backdropFilter: 'blur(8px)', transition: 'all 0.3s',
                    }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(212,175,55,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                        <FaChevronLeft />
                    </button>

                    <button onClick={nextSlide} style={{
                        position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white', fontSize: '1.5rem',
                        padding: '1rem', cursor: 'pointer', zIndex: 10, borderRadius: '50%',
                        backdropFilter: 'blur(8px)', transition: 'all 0.3s',
                    }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(212,175,55,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                        <FaChevronRight />
                    </button>

                    {/* Dots */}
                    <div style={{
                        position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: '10px', zIndex: 10,
                    }}>
                        {products.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                style={{
                                    width: idx === currentIndex ? '28px' : '8px',
                                    height: '8px',
                                    borderRadius: idx === currentIndex ? '4px' : '50%',
                                    background: idx === currentIndex ? '#d4af37' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s ease',
                                }}
                            />
                        ))}
                    </div>
                </>
            )}

            <style>{`
                @keyframes lidOpen {
                    0%   { opacity: 0; transform: translateY(40px) scaleY(0.95); }
                    100% { opacity: 1; transform: translateY(0) scaleY(1); }
                }
                @keyframes scrollLine {
                    0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
                    50%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
                    100% { transform: scaleY(1); transform-origin: bottom; opacity: 0; }
                }
                .hover-btn-filled:hover {
                    background: white !important;
                    color: black !important;
                    border-color: white !important;
                    transform: scale(1.05);
                }
            `}</style>
        </section>
    );
}
