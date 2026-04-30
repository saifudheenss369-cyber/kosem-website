'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=1600', // Luxury Perfume placeholder
        title: 'The Essence of Luxury',
        subtitle: 'Discover our exclusive collection of premium Attars.',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc0e946e?auto=format&fit=crop&q=80&w=1600', // Oudh placeholder
        title: 'Pure Oudh',
        subtitle: 'Experience the richness of authentic Oudh oils.',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1600', // Floral placeholder
        title: 'Floral Symphony',
        subtitle: 'Captivating floral notes for every occasion.',
    }
];

export default function Carousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden' }}>
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: index === current ? 1 : 0,
                        transition: 'opacity 1s ease-in-out',
                        zIndex: index === current ? 1 : 0
                    }}
                >
                    {/* Background Image with Overlay */}
                    <div
                        style={{
                            backgroundImage: `url(${slide.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            width: '100%',
                            height: '100%',
                            filter: 'brightness(0.5)'
                        }}
                    />

                    {/* Content */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        color: 'white',
                        width: '90%',
                        maxWidth: '800px'
                    }}>
                        <h1 style={{
                            fontSize: 'clamp(3rem, 6vw, 5rem)',
                            fontFamily: 'var(--font-serif)',
                            marginBottom: '1rem',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            color: 'var(--color-gold)'
                        }}>
                            {slide.title}
                        </h1>
                        <p style={{
                            fontSize: '1.5rem',
                            marginBottom: '2rem',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                        }}>
                            {slide.subtitle}
                        </p>
                        <Link href="/shop" className="btn-primary" style={{ border: '2px solid var(--color-gold)' }}>
                            Explore Collection
                        </Link>
                    </div>
                </div>
            ))}

            {/* Dots Navigation */}
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '1rem',
                zIndex: 10
            }}>
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: 'none',
                            background: index === current ? 'var(--color-gold)' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
