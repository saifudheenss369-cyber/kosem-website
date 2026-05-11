'use client';

import Link from 'next/link';
import { useWishlist } from '../context/WishlistContext';
import { FiHeart } from 'react-icons/fi';

export default function ProductCard({ product }) {
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
                background: 'var(--color-bg-secondary)',
                borderRadius: '150px 150px 20px 20px', 
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                paddingBottom: '1.5rem',
                border: '1px solid var(--color-border)'
            }}>
                {/* Image Section with Arch */}
                <div className="product-img-container" style={{
                    width: '100%',
                    position: 'relative',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '150px 150px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    height: '260px'
                }}>
                    {product.images ? (
                        <img
                            src={product.images}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease'
                            }}
                            className="product-img"
                        />
                    ) : (
                        <div style={{ color: 'var(--color-text-muted)' }}>No Image</div>
                    )}
 
                    {/* NEW Badge */}
                    {product.isBestSeller && (
                        <span style={{
                            position: 'absolute',
                            top: '30px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(4px)',
                            color: 'var(--color-gold)',
                            padding: '5px 15px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            zIndex: 3
                        }}>
                            NEW
                        </span>
                    )}
                </div>
 
                {/* Content Section */}
                <div className="card-content" style={{
                    textAlign: 'center',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '1.5rem 1rem 0'
                }}>
                    <h3 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.1rem',
                        marginBottom: '0.5rem',
                        color: 'var(--color-gold)',
                        fontWeight: '700',
                        height: '2.4rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}>
                        {product.name}
                    </h3>
 
                    {/* Price Pill */}
                    <div style={{
                        background: 'black',
                        color: 'white',
                        padding: '4px 20px',
                        borderRadius: '30px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        marginBottom: '0.8rem',
                        display: 'inline-block'
                    }}>
                        ₹{product.price}
                    </div>
 
                    {/* Star Rating */}
                    <div style={{ marginBottom: '0.5rem', color: '#FFD700', fontSize: '0.9rem' }}>
                        {'★'.repeat(Math.round(ratingValue))}
                        {'☆'.repeat(5 - Math.round(ratingValue))}
                        <span style={{ color: 'var(--color-text-main)', fontSize: '0.75rem', marginLeft: '5px' }}>
                            ({ratingValue.toFixed(1)})
                        </span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginLeft: '4px' }}>
                            ({reviewCount})
                        </span>
                    </div>
 
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                        Luxury concentrated perfume oil.
                    </p>
 
                    {/* Action Row */}
                    <div style={{ marginTop: 'auto', width: '100%', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <button
                            className="btn-outline-gold"
                            style={{
                                flex: 1,
                                padding: '0.7rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}
                        >
                            Shop Now
                        </button>
 
                        <button
                            className="wishlist-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                toggleWishlist(product);
                            }}
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '8px',
                                background: isSaved ? 'var(--color-gold)' : 'var(--color-gold)',
                                color: 'white',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <FiHeart size={20} fill="white" />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .product-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
                }
                .product-card:hover .product-img {
                    transform: scale(1.1);
                }

                @media (max-width: 768px) {
                    .product-img-container {
                        height: 200px !important;
                    }
                    .card-content h3 {
                        font-size: 0.95rem !important;
                    }
                }
            `}</style>

        </Link>
    );
}
