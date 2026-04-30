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
                background: '#fff',
                borderRadius: '150px 150px 20px 20px', // Deep Arch
                boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'visible', // Visible for the floating button if needed, but 'hidden' is safer for the image clip
                paddingBottom: '1rem',
                border: '1px solid #f9f9f9'
            }}>
                {/* Image Section with Pinkish BG and Scanner Frame */}
                <div className="product-img-container" style={{
                    width: '100%',
                    position: 'relative',
                    background: '#f9f9f9', // Removed pink gradient, simple background
                    borderRadius: '150px 150px 0 0', // Clip image to arch
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    height: '240px' // Fixed height container
                }}>
                    {/* Scanner Frame Overlay - REMOVED for cleaner look if requested, but keeping for now as user didn't ask to remove it, just fix size */}

                    {/* ... keeping overlay code ... -> actually user just said "size" */}
                    <div style={{
                        position: 'absolute',
                        width: '180px',
                        height: '180px',
                        pointerEvents: 'none',
                        zIndex: 2,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}>
                        {/* Corners */}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '3px solid white', borderLeft: '3px solid white', borderRadius: '12px 0 0 0' }}></div>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: '3px solid white', borderRight: '3px solid white', borderRadius: '0 12px 0 0' }}></div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', borderBottom: '3px solid white', borderLeft: '3px solid white', borderRadius: '0 0 0 12px' }}></div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '3px solid white', borderRight: '3px solid white', borderRadius: '0 0 12px 0' }}></div>
                    </div>

                    {product.images ? (
                        <img
                            src={product.images}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover', // cover makes it fill the container completely
                                objectPosition: 'center', // Centers the crop
                                zIndex: 1,
                                transition: 'transform 0.5s ease'
                            }}
                            className="product-img"
                        />
                    ) : (
                        <div style={{ color: '#ccc' }}>No Image</div>
                    )}

                    {/* NEW Badge (Top Center) */}
                    {product.isBestSeller && (
                        <span style={{
                            position: 'absolute',
                            top: '30px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'white',
                            color: '#c58c48',
                            padding: '5px 15px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            zIndex: 3,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
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
                    padding: '1rem',
                    minHeight: '180px' // minHeight to align buttons
                }}>

                    {/* Title */}
                    <h3 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.1rem',
                        marginBottom: '0.5rem',
                        color: '#c58c48',
                        fontWeight: '700',
                        letterSpacing: '-0.5px',
                        height: '2.4rem', // Fixed height for 2 lines
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}>
                        {product.name}
                    </h3>

                    {/* Price Pill (Black) */}
                    <div style={{
                        background: 'black',
                        color: 'white',
                        padding: '4px 15px',
                        borderRadius: '30px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        marginBottom: '0.5rem',
                        display: 'inline-block',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}>
                        ₹{product.price}
                    </div>

                    {/* Star Rating */}
                    <div style={{ marginBottom: '0.5rem', color: '#FFD700', fontSize: '0.9rem', letterSpacing: '2px' }}>
                        {'★'.repeat(Math.round(ratingValue))}
                        {'☆'.repeat(5 - Math.round(ratingValue))}
                        <span style={{ color: '#333', fontSize: '0.75rem', marginLeft: '5px', fontWeight: '600' }}>
                            ({ratingValue.toFixed(1)})
                        </span>
                        <span style={{ color: '#999', fontSize: '0.75rem', marginLeft: '4px' }}>
                            ({reviewCount})
                        </span>
                    </div>

                    {/* Description Line */}
                    <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '1rem', lineHeight: '1.4', maxWidth: '100%' }}>
                        Luxury concentrated perfume oil.
                    </p>

                    {/* Action Row */}
                    <div style={{ marginTop: 'auto', width: '100%', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {product.stock > 0 ? (
                            <button
                                className="hover-btn"
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: '1px solid #ddd',
                                    color: '#555',
                                    padding: '0.6rem',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Shop Now
                            </button>
                        ) : (
                            <button disabled style={{ flex: 1, padding: '0.6rem', background: '#f5f5f5', border: 'none', color: '#aaa', borderRadius: '8px', fontSize: '0.8rem' }}>Sold Out</button>
                        )}

                        <button
                            className="wishlist-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                toggleWishlist(product);
                            }}
                            style={{
                                width: '38px', // Matches height roughly
                                height: '38px',
                                borderRadius: '8px',
                                background: isSaved ? '#c58c48' : 'transparent',
                                color: isSaved ? 'white' : '#c58c48',
                                border: `1px solid ${isSaved ? '#c58c48' : '#ddd'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FiHeart size={18} fill={isSaved ? 'white' : 'none'} color={isSaved ? 'white' : '#c58c48'} />
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
                }
                .product-card:hover .product-img {
                    transform: scale(1.05);
                }

                .product-img-container {
                    height: 220px;
                }
                .card-content {
                    padding: 0 1.5rem;
                }

                @media (max-width: 768px) {
                    .product-img-container {
                        height: 140px !important;
                    }
                    .card-content {
                        padding: 0.5rem 0.5rem !important;
                        min-height: auto !important;
                    }
                    .card-content h3 {
                        font-size: 0.9rem !important;
                        height: 2.2rem !important;
                        margin-bottom: 0.3rem !important;
                    }
                    /* hide description text on mobile grid */
                    .card-content p {
                        display: none !important;
                    }
                    .card-content > div[style*="background: black"] {
                        font-size: 0.75rem !important;
                        padding: 2px 10px !important;
                        margin-bottom: 0.3rem !important;
                    }
                    .hover-btn {
                        padding: 0.4rem !important;
                        font-size: 0.75rem !important;
                    }
                    .wishlist-btn {
                        width: 30px !important;
                        height: 30px !important;
                        font-size: 1rem !important;
                    }
                }
                
                .hover-btn:hover {
                    transform: scale(1.05) rotate(-2deg);
                    background: #a06d35 !important;
                    border-color: #a06d35 !important;
                    color: white !important;
                    box-shadow: 0 5px 15px rgba(197, 140, 72, 0.3);
                }
                
                .wishlist-btn:hover {
                    transform: scale(1.1) rotate(15deg);
                    background: #a06d35 !important;
                    color: white !important;
                }
            `}</style>
        </Link>
    );
}
