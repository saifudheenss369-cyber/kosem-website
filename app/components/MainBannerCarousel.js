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
                    transition: 'transform 0.5s ease-in-out',
                    transform: `translateX(-${currentIndex * 100}%)`
                }}
            >
                {activeBanners.map(banner => (
                    <div 
                        key={banner.id} 
                        style={{ 
                            minWidth: '100%', 
                            position: 'relative',
                            // We use flex to ensure the image centers nicely if it's a bit smaller
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {banner.link ? (
                            <Link href={banner.link} style={{ display: 'block', width: '100%', textDecoration: 'none' }}>
                                <img 
                                    src={banner.imageUrl} 
                                    alt={banner.title || 'Kosem Banner'} 
                                    style={{ 
                                        width: '100%', 
                                        height: 'auto', 
                                        display: 'block',
                                        objectFit: 'contain' 
                                    }} 
                                />
                            </Link>
                        ) : (
                            <img 
                                src={banner.imageUrl} 
                                alt={banner.title || 'Kosem Banner'} 
                                style={{ 
                                    width: '100%', 
                                    height: 'auto', 
                                    display: 'block',
                                    objectFit: 'contain' 
                                }} 
                            />
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
                    margin-top: 100px; 
                }
                
                .carousel-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.7);
                    border: none;
                    color: #333;
                    font-size: 1.2rem;
                    padding: 0.8rem;
                    cursor: pointer;
                    z-index: 10;
                    border-radius: 50%;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .carousel-nav-btn:hover {
                    background: #fff;
                    color: var(--color-gold, #d4af37);
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
                    background: rgba(0,0,0,0.3);
                    padding: 5px 10px;
                    border-radius: 20px;
                }

                .carousel-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .carousel-dot.active {
                    background: #fff;
                    width: 25px;
                    border-radius: 5px;
                }

                @media (max-width: 768px) {
                    .main-banner-carousel {
                        margin-top: 80px; 
                    }
                    .carousel-nav-btn {
                        padding: 0.5rem;
                        font-size: 1rem;
                    }
                    .prev-btn { left: 10px; }
                    .next-btn { right: 10px; }
                    
                    .carousel-dots {
                        bottom: 10px;
                        gap: 6px;
                    }
                    .carousel-dot {
                        width: 8px;
                        height: 8px;
                    }
                    .carousel-dot.active {
                        width: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
