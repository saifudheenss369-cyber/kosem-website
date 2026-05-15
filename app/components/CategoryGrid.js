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
        <div className="category-section-wrapper" style={{ width: '100%', marginBottom: '4rem' }}>
            <div className="category-flex-container">
                {categories.map((cat) => (
                    <Link 
                        key={cat.id}
                        href={`/shop?category=${encodeURIComponent(cat.id)}`}
                        className="category-tile"
                    >
                        <div className="tile-image-wrapper">
                            <Image 
                                src={cat.image} 
                                alt={cat.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
                                className="tile-bg"
                            />
                            <div className="tile-overlay" />
                        </div>
                        <div className="tile-content">
                            <h3 className="tile-title">{cat.title}</h3>
                            <p className="tile-subtitle">{cat.subtitle}</p>
                            <span className="tile-cta">Explore Collection &rarr;</span>
                        </div>
                    </Link>
                ))}
            </div>

            <style jsx>{`
                .category-flex-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 2rem;
                }

                .category-tile {
                    position: relative;
                    height: 350px;
                    border-radius: 15px;
                    overflow: hidden;
                    display: block;
                    text-decoration: none;
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    transition: all 0.4s ease;
                }

                .category-tile:hover {
                    transform: translateY(-5px);
                    border-color: var(--color-gold);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.4);
                }

                .tile-image-wrapper {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 1;
                }

                .tile-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 100%);
                    transition: opacity 0.4s ease;
                }

                .category-tile:hover .tile-overlay {
                    background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(184, 134, 11, 0.1) 100%);
                }

                .tile-content {
                    position: absolute;
                    bottom: 0; left: 0; width: 100%;
                    padding: 2rem;
                    z-index: 2;
                    color: white;
                }

                .tile-title {
                    font-family: var(--font-serif);
                    font-size: 1.8rem;
                    margin-bottom: 0.5rem;
                    color: var(--color-gold) !important;
                }

                .tile-subtitle {
                    font-size: 0.9rem;
                    color: #ccc;
                    margin-bottom: 1rem;
                    line-height: 1.4;
                    opacity: 0.8;
                }

                .tile-cta {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: bold;
                    color: white;
                }

                @media (max-width: 900px) {
                    .category-flex-container {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    .category-tile {
                        height: 300px;
                    }
                    .tile-title {
                        font-size: 1.6rem;
                    }
                    .tile-subtitle {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}

