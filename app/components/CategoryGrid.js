'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const categories = [
    {
        id: 'Perfume',
        title: 'Perfumes',
        subtitle: 'Signature scents crafted for the modern individual.',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800'
    },
    {
        id: 'Attar',
        title: 'Pure Attars',
        subtitle: 'Traditional concentrated oils, zero alcohol.',
        image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800'
    },
    {
        id: 'Oudh',
        title: 'Oudh & Bakhoor',
        subtitle: 'The royal essence of agarwood and incense.',
        image: 'https://images.unsplash.com/photo-1608501821300-4f99e58bba77?q=80&w=800'
    },
    {
        id: 'Gift Sets',
        title: 'Luxury Gifts',
        subtitle: 'Elegantly curated boxes for your loved ones.',
        image: 'https://images.unsplash.com/photo-1543363363-f09b30746ebf?q=80&w=800'
    }
];

export default function CategoryGrid() {
    return (
        <div style={{ width: '100%', marginBottom: '4rem' }}>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '1.5rem' 
            }}>
                {categories.map((cat) => (
                    <Link 
                        key={cat.id}
                        href={`/shop?category=${encodeURIComponent(cat.id)}`}
                        style={{
                            position: 'relative',
                            height: '300px',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            display: 'block',
                            textDecoration: 'none',
                            border: '1px solid rgba(184, 134, 11, 0.2)'
                        }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                            <Image 
                                src={cat.image} 
                                alt={cat.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
                            />
                            <div style={{ 
                                position: 'absolute', 
                                top: 0, left: 0, width: '100%', height: '100%', 
                                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%)' 
                            }} />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: 0, left: 0, width: '100%',
                            padding: '1.5rem',
                            zIndex: 2,
                            color: 'white'
                        }}>
                            <h3 style={{ 
                                fontFamily: 'var(--font-serif)', 
                                fontSize: '1.5rem', 
                                marginBottom: '0.3rem', 
                                color: '#d4af37' 
                            }}>{cat.title}</h3>
                            <p style={{ 
                                fontSize: '0.85rem', 
                                color: '#eee', 
                                marginBottom: '0.5rem', 
                                opacity: 0.8 
                            }}>{cat.subtitle}</p>
                            <span style={{ 
                                fontSize: '0.7rem', 
                                textTransform: 'uppercase', 
                                letterSpacing: '1px', 
                                fontWeight: 'bold' 
                            }}>Explore &rarr;</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

