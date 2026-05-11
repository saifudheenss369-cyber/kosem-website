'use client';

import React from 'react';

const categories = [
    {
        id: 'Perfume',
        title: 'Perfumes',
        subtitle: 'Signature scents crafted for the modern individual.',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800',
        gridArea: 'perfume'
    },
    {
        id: 'Attar',
        title: 'Pure Attars',
        subtitle: 'Traditional concentrated oils, zero alcohol.',
        image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800',
        gridArea: 'attar'
    },
    {
        id: 'Oudh',
        title: 'Oudh & Bakhoor',
        subtitle: 'The royal essence of agarwood and incense.',
        image: 'https://images.unsplash.com/photo-1608501821300-4f99e58bba77?q=80&w=800',
        gridArea: 'oudh'
    },
    {
        id: 'Gift Sets',
        title: 'Luxury Gifts',
        subtitle: 'Elegantly curated boxes for your loved ones.',
        image: 'https://images.unsplash.com/photo-1543363363-f09b30746ebf?q=80&w=800',
        gridArea: 'gifts'
    }
];

export default function CategoryGrid({ activeCategory, onSelectCategory }) {
    return (
        <div style={{ marginBottom: '3rem' }}>
            <div className="ajmal-grid">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`ajmal-card hover-glow ${activeCategory === cat.id ? 'active' : ''}`}
                        style={{ gridArea: cat.gridArea }}
                        onClick={() => onSelectCategory ? onSelectCategory(cat.id) : window.location.href = '/shop?category=' + encodeURIComponent(cat.id)}
                    >
                        <div className="bg-img" style={{ backgroundImage: `url(${cat.image})` }} />
                        <div className="overlay" />
                        <div className="content">
                            <h3>{cat.title}</h3>
                            <p>{cat.subtitle}</p>
                            <span className="shop-link">Explore Collection &rarr;</span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .ajmal-grid {
                    display: grid;
                    grid-template-areas: 
                        "perfume attar"
                        "perfume oudh"
                        "gifts   oudh";
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 240px 140px 240px;
                    gap: 1.5rem;
                    width: 100%;
                }

                @media (max-width: 900px) {
                    .ajmal-grid {
                        grid-template-areas: 
                            "perfume"
                            "attar"
                            "oudh"
                            "gifts";
                        grid-template-columns: 1fr;
                        grid-template-rows: repeat(4, 250px);
                    }
                }

                .ajmal-card {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 1px solid var(--color-border);
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .ajmal-card.active {
                    border: 2px solid var(--color-gold);
                }

                .bg-img {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-size: cover;
                    background-position: center;
                    transition: transform 1.2s ease;
                }

                .ajmal-card:hover .bg-img {
                    transform: scale(1.1);
                }

                .overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 50%, transparent 100%);
                    transition: all 0.5s ease;
                }

                .ajmal-card:hover .overlay {
                    background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(184, 134, 11, 0.2) 100%);
                }

                .content {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 2.5rem;
                    color: white;
                    z-index: 2;
                    transition: transform 0.5s ease;
                }

                .ajmal-card:hover .content {
                    transform: translateY(-10px);
                }

                .content h3 {
                    font-family: var(--font-serif);
                    font-size: 2.2rem;
                    margin-bottom: 0.5rem;
                    color: white !important;
                    letter-spacing: 1px;
                }

                .content p {
                    font-size: 0.95rem;
                    line-height: 1.5;
                    color: var(--color-text-muted);
                    margin-bottom: 1.5rem;
                    max-width: 80%;
                }

                .shop-link {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: var(--color-gold);
                    font-weight: bold;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.4s ease;
                }

                .ajmal-card:hover .shop-link {
                    opacity: 1;
                    transform: translateY(0);
                }

                @media (max-width: 768px) {
                    .content {
                        padding: 1.5rem;
                    }
                    .content h3 {
                        font-size: 1.8rem;
                    }
                    .content p {
                        display: none;
                    }
                    .shop-link {
                        opacity: 1;
                        transform: none;
                    }
                }
            `}</style>
        </div >
    );
}

