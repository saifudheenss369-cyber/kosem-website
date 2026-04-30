'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

export default function MovingCarousel({ products }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timeoutRef = useRef(null);

    // Safety: ensure products is an array
    const safeProducts = Array.isArray(products) ? products : [];

    // Auto-play logic
    useEffect(() => {
        if (isPaused || safeProducts.length === 0) return;

        const nextSlide = () => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % safeProducts.length);
        };

        timeoutRef.current = setTimeout(nextSlide, 3000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentIndex, isPaused, safeProducts.length]);

    if (safeProducts.length === 0) return null;

    // Logic for duplicate items if count < 3 to ensure carousel works
    // This is a view-only duplication, we don't change state logic much 
    // but easier to just use safeProducts as is if > 0.
    // If length is 1, prev/next will be same index. 
    // (0 - 1 + 1) % 1 = 0. (0+1)%1 = 0. All point to 0. 
    // This is fine, just shows same card 3 times in different positions.

    const getVisibleProducts = () => {
        const len = safeProducts.length;
        if (len === 0) return [];

        const prevIndex = (currentIndex - 1 + len) % len;
        const nextIndex = (currentIndex + 1) % len;

        return [
            { ...safeProducts[prevIndex], position: 'prev', viewId: 'p' },
            { ...safeProducts[currentIndex], position: 'current', viewId: 'c' },
            { ...safeProducts[nextIndex], position: 'next', viewId: 'n' }
        ];
    };

    const visibleItems = getVisibleProducts();

    return (
        <section style={{ padding: '4rem 0', background: '#fafafa', overflow: 'hidden' }}>
            <div className="container" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem' }}>Featured Collection</h2>
                <div style={{ width: '60px', height: '2px', background: 'var(--color-gold)', margin: '1rem auto' }}></div>
            </div>

            <div
                className="carousel-container"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{
                    display: 'flex',
                    flexDirection: 'column', // Vertical Layout
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '600px',
                    position: 'relative',
                    perspective: '1000px'
                }}
            >
                {visibleItems.map((item, index) => {
                    let style = {};
                    if (item.position === 'current') {
                        style = {
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) scale(1.1)',
                            zIndex: 10,
                            opacity: 1,
                            filter: 'none',
                            transition: 'all 0.5s ease'
                        };
                    } else if (item.position === 'prev') {
                        style = {
                            top: '15%',
                            left: '50%',
                            transform: 'translate(-50%, 0) scale(0.85)',
                            zIndex: 5,
                            opacity: 0.6,
                            filter: 'blur(2px)',
                            transition: 'all 0.5s ease'
                        };
                    } else { // next
                        style = {
                            top: '85%',
                            left: '50%',
                            transform: 'translate(-50%, -100%) scale(0.85)',
                            zIndex: 5,
                            opacity: 0.6,
                            filter: 'blur(2px)',
                            transition: 'all 0.5s ease'
                        };
                    }

                    return (
                        <div key={`${item.id}-${item.viewId}`} style={{
                            width: '300px',
                            position: 'absolute',
                            ...style
                        }}>
                            {/* Double check item exists before rendering card */}
                            {item && item.id ? <ProductCard product={item} /> : null}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
