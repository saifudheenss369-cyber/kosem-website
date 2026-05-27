'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CategoryGrid() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch categories from the database without caching
                const res = await fetch(`/api/categories?_t=${Date.now()}`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    // Optional: only show categories that are marked to show on home or have an image
                    const visibleCategories = data.filter(c => c.showOnHome !== false);
                    setCategories(visibleCategories);
                }
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    // Show skeletons or nothing while loading
    if (categories.length === 0) {
        return <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading collections...</div>;
    }

    return (
        <div style={{ width: '100%', marginBottom: '4rem' }}>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '1.5rem' 
            }}>
                {categories.map((cat) => (
                    <Link 
                        key={cat.id || cat.name}
                        href={`/shop?category=${encodeURIComponent(cat.name)}`}
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
                                src={cat.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800'} 
                                alt={cat.name}
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
                            }}>{cat.name}</h3>
                            <p style={{ 
                                fontSize: '0.85rem', 
                                color: '#eee', 
                                marginBottom: '0.5rem', 
                                opacity: 0.8 
                            }}>{cat.slug ? `Explore our ${cat.name} collection` : 'Premium Fragrances'}</p>
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

