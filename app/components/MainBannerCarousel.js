'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function MainBannerCarousel({ banners }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;
    const activeBanners = banners?.filter(b => b.isActive !== false) || [];

    // Auto-slide
    useEffect(() => {
        if (activeBanners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % activeBanners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeBanners.length]);

    if (activeBanners.length === 0) return null;

    const nextSlide = () => setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    const prevSlide = () => setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);

    const onTouchStart = e => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = e => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }
    };

    return (
        <div 
            className="main-banner-carousel" 
            style={{ 
                width: '100%', 
                position: 'relative', 
                overflow: 'hidden',
                background: 'var(--color-bg-secondary)' // placeholder background
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div 
                className="carousel-inner"
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    transition: 'transform 0.5s ease-in-out',
                    transform: `translateX(-${currentIndex * 100}%)`
                }}
            >
                {activeBanners.map(banner => (
                    <div 
                        key={banner.id} 
                        className="carousel-item"
                    >
                        {banner.link ? (
                            <Link href={banner.link} style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none' }}>
                                <picture style={{ display: 'block', width: '100%', height: '100%' }}>
                                    {banner.mobileImageUrl && (
                                        <source media="(max-width: 768px)" srcSet={banner.mobileImageUrl} />
                                    )}
                                    <img 
                                        src={banner.imageUrl} 
                                        alt={banner.title || 'Kosem Banner'} 
                                    />
                                </picture>
                            </Link>
                        ) : (
                            <picture style={{ display: 'block', width: '100%', height: '100%' }}>
                                {banner.mobileImageUrl && (
                                    <source media="(max-width: 768px)" srcSet={banner.mobileImageUrl} />
                                )}
                                <img 
                                    src={banner.imageUrl} 
                                    alt={banner.title || 'Kosem Banner'} 
                                />
                            </picture>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {activeBanners.length > 1 && (
                <>
                    <button 
                        onClick={prevSlide} 
                        className="carousel-nav-btn prev-btn"
                        aria-label="Previous Banner"
                    >
                        <FaChevronLeft />
                    </button>
                    <button 
                        onClick={nextSlide} 
                        className="carousel-nav-btn next-btn"
                        aria-label="Next Banner"
                    >
                        <FaChevronRight />
                    </button>

                    {/* Dots */}
                    <div className="carousel-dots">
                        {activeBanners.map((_, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setCurrentIndex(idx)} 
                                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </>
            )}

            <style>{`
                .main-banner-carousel {
                    /* Margin to sit below navbar if navbar is fixed */
                    margin-top: 130px; 
                    height: 600px;
                    width: 100%;
                    position: relative;
                    overflow: hidden;
                    background: #000;
                }
                
                .carousel-inner {
                    height: 100%;
                }

                .carousel-item {
                    min-width: 100%;
                    height: 100%;
                    position: relative;
                }

                .carousel-item picture {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .carousel-item img {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    object-position: center !important;
                }
                
                .carousel-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    font-size: 1.2rem;
                    padding: 0.8rem;
                    cursor: pointer;
                    z-index: 10;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .carousel-nav-btn:hover {
                    background: var(--color-gold, #d4af37);
                    color: #000;
                    border-color: var(--color-gold, #d4af37);
                }

                .prev-btn { left: 20px; }
                .next-btn { right: 20px; }

                .carousel-dots {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 10px;
                    z-index: 10;
                    background: rgba(0,0,0,0.4);
                    padding: 5px 10px;
                    border-radius: 20px;
                    backdrop-filter: blur(4px);
                }

                .carousel-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .carousel-dot.active {
                    background: var(--color-gold, #d4af37);
                    width: 22px;
                    border-radius: 4px;
                }

                @media (max-width: 768px) {
                    .main-banner-carousel {
                        margin-top: 0px !important;
                        height: 400px !important;
                    }
                    .carousel-nav-btn {
                        padding: 0.5rem;
                        font-size: 0.9rem;
                    }
                    .prev-btn { left: 10px; }
                    .next-btn { right: 10px; }
                    
                    .carousel-dots {
                        bottom: 10px;
                        gap: 6px;
                    }
                    .carousel-dot {
                        width: 6px;
                        height: 6px;
                    }
                    .carousel-dot.active {
                        width: 16px;
                    }
                }
            `}</style>
        </div>
    );
}
