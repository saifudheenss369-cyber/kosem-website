'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from './ProductCard';

export default function FeaturedCarousel({ category, title, subtitle, bg, initialProducts = [] }) {
    const [products, setProducts] = useState(initialProducts);
    const [loading, setLoading] = useState(initialProducts.length === 0);

    useEffect(() => {
        if (initialProducts.length > 0) return; // Skip fetch if data provided

        let url = '/api/products?groupVariants=true';
        if (category === 'Best Seller') {
            url += '&bestSeller=true';
        } else if (category) {
            url += `&category=${category}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Just use the latest 10 items without artificial duplication
                    let finalProducts = data.slice(0, 10);
                    // (Removed duplication logic: it caused UI confusion if a category has very few items)
                    setProducts(finalProducts);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [category, initialProducts]);

    const scrollRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        // Randomize start time to avoid robotic sync between multiple carousels
        const startDelay = Math.random() * 2000; // 0-2s delay
        let interval;

        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                if (!isPaused && scrollRef.current) {
                    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                    const scrollAmount = clientWidth * 0.2; // Move one item width
                    if (scrollLeft + clientWidth >= scrollWidth - 10) {
                        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    }
                }
            }, 3000 + Math.random() * 1000); // 3-4s random interval for organic feel
        }, startDelay);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, [isPaused]);

    // ... (fetch logic remains)

    if (loading) return null;
    if (products.length === 0) return null;

    return (
        <section style={{ padding: '2px 0', background: bg || 'transparent', position: 'relative' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '2rem',
                        color: 'var(--color-black)',
                        marginBottom: '0.25rem'
                    }}>
                        {title || category}
                    </h2>
                    {subtitle && (
                        <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', letterSpacing: '0.5px' }}>
                            {subtitle}
                        </p>
                    )}
                    <div style={{ width: '40px', height: '2px', background: 'var(--color-gold)', margin: '1rem auto' }}></div>
                </div>

                {/* Left Arrow */}
                <button
                    onClick={() => {
                        if (scrollRef.current) {
                            const scrollAmount = scrollRef.current.clientWidth * 0.2; // One item width
                            scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                        }
                    }}
                    className="carousel-nav-btn left-btn"
                    aria-label="Previous"
                >
                    ←
                </button>

                {/* Horizontal Scroll / Grid */}
                <div
                    ref={scrollRef}
                    className="product-carousel"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    style={{
                        display: 'flex',
                        gap: '15px',
                        overflowX: 'auto',
                        paddingBottom: '1rem',
                        scrollSnapType: 'x mandatory',
                        scrollBehavior: 'smooth'
                    }}>
                    {Array.isArray(products) && products.map((product, idx) => (
                        product && product.id ? (
                            <div
                                key={`${product.id}-${idx}`}
                                className="carousel-item"
                                style={{
                                    flex: '0 0 auto',
                                    width: 'calc(20% - 12px)', // Exact 5 items fit (15px gap * 4 = 60px distributed)
                                    minWidth: 'calc(20% - 12px)',
                                    scrollSnapAlign: 'start'
                                }}
                            >
                                <ProductCard product={product} size="small" />
                            </div>
                        ) : null
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => {
                        if (scrollRef.current) {
                            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                            const scrollAmount = clientWidth * 0.2; // One item width

                            if (scrollLeft + clientWidth >= scrollWidth - 10) {
                                scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' }); // Loop back
                            } else {
                                scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                            }
                        }
                    }}
                    className="carousel-nav-btn right-btn"
                    aria-label="Next"
                >
                    →
                </button>

                <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                    <Link href="/shop" className="btn-outline">
                        View All
                    </Link>
                </div>
            </div>

            <style>{`
                .carousel-nav-btn {
                    position: absolute;
                    top: 50%; /* Centered vertically relative to container, checked visually */
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.95);
                    border: 1px solid var(--color-gold);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    color: var(--color-black);
                    font-size: 1.2rem;
                    opacity: 1;
                }

                .carousel-nav-btn:hover {
                    background: var(--color-gold);
                    color: white;
                    transform: translateY(-50%) scale(1.1);
                }

                .left-btn {
                    left: 0; /* Align to edge */
                }

                .right-btn {
                    right: 0; /* Align to edge */
                }

                .product-carousel::-webkit-scrollbar {
                    height: 4px;
                    display: none;
                }
                .product-carousel {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .product-carousel::-webkit-scrollbar-track {
                    background: #eee;
                }
                .product-carousel::-webkit-scrollbar-thumb {
                    background: var(--color-gold);
                }
                .card:hover {
                    transform: translateY(-5px);
                }
                .card:hover img {
                    transform: scale(1.05);
                    transition: transform 0.6s ease;
                }
                
                @media (max-width: 768px) {
                   .carousel-item {
                        min-width: 160px !important;
                        width: 160px !important;
                        flex: 0 0 160px !important;
                   }
                   .carousel-nav-btn {
                       display: none;
                   }
                }
            `}</style>
        </section>
    );
}
