'use client';

import React from 'react';

const categories = [
    {
        id: 'Perfume',
        title: 'Perfume',
        subtitle: 'Connoisseurs of perfumery — heritage, held in a bottle.',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800',
        gridArea: 'perfume',
        height: '100%'
    },
    {
        id: 'Attar',
        title: 'Attar',
        subtitle: 'Rich fragrant oils — a timeless touch of tradition.',
        image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800',
        gridArea: 'attar',
        height: '100%'
    },
    {
        id: 'Oudh',
        title: 'Oudh / Dakhoon',
        subtitle: 'Aromas of royalty — incense that calms.',
        image: 'https://images.unsplash.com/photo-1608501821300-4f99e58bba77?q=80&w=800',
        gridArea: 'oudh',
        height: '100%'
    },
    {
        id: 'Gift Sets',
        title: 'Gift Set',
        subtitle: 'Thoughtfully wrapped — the fragrance of memories.',
        image: 'https://images.unsplash.com/photo-1543363363-f09b30746ebf?q=80&w=800',
        gridArea: 'gifts',
        height: '100%'
    }
];

export default function CategoryGrid({ activeCategory, onSelectCategory }) {
    return (
        <div style={{ marginBottom: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    display: 'inline-block',
                    borderBottom: '2px solid var(--color-gold)',
                    paddingBottom: '0.5rem'
                }}>
                    Categories
                </h2>
            </div>

            {/* Show "All Categories" toggle to reset */}
            {activeCategory !== 'All' && (
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => onSelectCategory ? onSelectCategory('All') : window.location.href = '/shop'}
                        className="btn-outline"
                        style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem', borderRadius: '20px' }}
                    >
                        ← View All Products
                    </button>
                </div>
            )}

            <div className="ajmal-grid container">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`ajmal-card ${activeCategory === cat.id ? 'active' : ''}`}
                        style={{ gridArea: cat.gridArea }}
                        onClick={() => onSelectCategory ? onSelectCategory(cat.id) : window.location.href = '/shop?category=' + encodeURIComponent(cat.id)}
                    >
                        <div className="bg-img" style={{ backgroundImage: `url(${cat.image})` }} />
                        <div className="overlay" />
                        <div className="content">
                            <h3>{cat.title}</h3>
                            <p>{cat.subtitle}</p>
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
                    grid-template-rows: 200px 100px 200px;
                    gap: 1.5rem;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                @media (max-width: 900px) {
                    .ajmal-grid {
                        grid-template-areas: 
                            "perfume"
                            "attar"
                            "oudh"
                            "gifts";
                        grid-template-columns: 1fr;
                        grid-template-rows: repeat(4, 220px);
                    }
                }

                .ajmal-card {
                    position: relative;
                    border-radius: 4px;
                    overflow: hidden;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .ajmal-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                }

                .ajmal-card.active {
                    border: 3px solid var(--color-gold);
                }

                .bg-img {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-size: cover;
                    background-position: center;
                    transition: transform 0.8s ease;
                }

                .ajmal-card:hover .bg-img {
                    transform: scale(1.05);
                }

                .overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%);
                }

                /* Specific gradient adjustments for different cards based on reference */
                .ajmal-card[style*="gifts"] .overlay,
                .ajmal-card[style*="perfume"] .overlay {
                    background: linear-gradient(to right, rgba(40,20,10,0.9) 0%, rgba(40,20,10,0.6) 40%, transparent 100%);
                }

                .content {
                    position: absolute;
                    top: 0; left: 0; bottom: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 2.5rem;
                    width: 70%;
                    color: white;
                    z-index: 2;
                }

                .content h3 {
                    font-family: var(--font-serif);
                    font-size: 2.4rem;
                    margin-bottom: 0.8rem;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                    color: var(--color-gold, #d4af37) !important;
                }

                .content p {
                    font-size: 1rem;
                    line-height: 1.5;
                    color: #f0f0f0;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
                }

                @media (max-width: 768px) {
                    .content {
                        width: 85%;
                        padding: 1.5rem;
                    }
                    .content h3 {
                        font-size: 1.8rem;
                    }
                    .content p {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </div >
    );
}
