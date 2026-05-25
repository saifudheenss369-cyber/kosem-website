'use client';

import Link from 'next/link';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart } from 'react-icons/fi';

export default function ProductCard({ product, isRectangle = false }) {
    const { toggleWishlist, isInWishlist } = useWishlist();
    if (!product) return null;

    const isSaved = isInWishlist(product.id);

    // Discount Calculation
    let discount = 0;
    const originalPrice = Number(product.originalPrice);
    const price = Number(product.price);

    if (originalPrice && originalPrice > price) {
        discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    // Rating Logic (Fake > Real)
    const ratingValue = Number(product.rating || 5);
    const reviewCount = product.fakeRatingCount > 0 ? product.fakeRatingCount : (product.reviews?.length || 12); // Default to 12 if no data so it looks populated

    return (
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
            <div className="product-card" style={{
                background: 'rgba(255, 255, 255, 0.015)',
                borderRadius: '16px', 
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.03)'
            }}>
                {/* Floating Glass Wishlist Button */}
                <button
                    className="wishlist-btn-floating"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(8px)',
                        border: isSaved ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 5,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        color: isSaved ? 'var(--color-gold)' : '#ffffff'
                    }}
                >
                    <FiHeart size={16} fill={isSaved ? "var(--color-gold)" : "none"} />
                </button>

                {/* Image Section - Perfect 1:1 Square */}
                <div className="product-img-container" style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    position: 'relative',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '16px 16px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    {product.images ? (
                        <img
                            src={product.images}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'
                            }}
                            className="product-img"
                        />
                    ) : (
                        <div style={{ color: 'var(--color-text-muted)' }}>No Image</div>
                    )}
                </div>
 
                {/* Content Section */}
                <div className="card-content" style={{
                    padding: '1.2rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: 'transparent'
                }}>
                    <div>
                        {/* First Row: Product Name & Price perfectly aligned */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%', gap: '10px' }}>
                            <h3 style={{
                                fontFamily: 'var(--font-sans)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '0.85rem',
                                color: '#ffffff',
                                fontWeight: '700',
                                margin: 0,
                                lineHeight: '1.4',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                height: '2.4rem',
                                flex: 1
                            }}>
                                {product.name}
                            </h3>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: '2px',
                                flexShrink: 0
                            }}>
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    color: 'var(--color-gold)',
                                    fontFamily: 'var(--font-sans)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    ₹{product.price}
                                </div>
                                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--color-text-muted)',
                                        fontFamily: 'var(--font-sans)',
                                        textDecoration: 'line-through',
                                        whiteSpace: 'nowrap',
                                        opacity: 0.7
                                    }}>
                                        ₹{product.originalPrice}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Second Row: Star Rating - Clean, minimal */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gold)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                            <span>{'★'.repeat(Math.round(ratingValue))}</span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                                ({reviewCount})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .product-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(184, 134, 11, 0.3) !important;
                    background: rgba(255, 255, 255, 0.03) !important;
                }
                .product-card:hover .product-img {
                    transform: scale(1.06);
                }
                .wishlist-btn-floating:hover {
                    background: rgba(184, 134, 11, 0.25) !important;
                    border-color: var(--color-gold) !important;
                    transform: scale(1.08);
                }

                @media (max-width: 768px) {
                    .product-card {
                        border-radius: 12px !important;
                    }
                    .product-img-container {
                        border-radius: 12px 12px 0 0 !important;
                    }
                    .card-content {
                        padding: 0.8rem !important;
                    }
                    .card-content h3 {
                        font-size: 0.8rem !important;
                        height: 2.2rem !important;
                        letter-spacing: 0.5px !important;
                    }
                    .card-content span {
                        font-size: 0.8rem !important;
                    }
                    .wishlist-btn-floating {
                        width: 32px !important;
                        height: 32px !important;
                        top: 8px !important;
                        right: 8px !important;
                    }
                }
            `}</style>
        </Link>
    );
}
