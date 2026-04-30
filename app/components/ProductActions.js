'use client';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';

export default function ProductActions({ product }) {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const router = useRouter();
    const [isBuying, setIsBuying] = useState(false);

    const isSaved = isInWishlist(product.id);

    const handleBuyNow = () => {
        setIsBuying(true);
        addToCart(product);
        router.push('/checkout');
    };

    if (product.stock <= 0) {
        return (
            <button
                disabled
                className="btn-primary"
                style={{ width: '100%', fontSize: '1.1rem', opacity: 0.7, cursor: 'not-allowed' }}
            >
                Out of Stock
            </button>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <div className="action-buttons-grid">
                <button
                    onClick={() => addToCart(product)}
                    className="hover-btn"
                    style={{
                        padding: '1rem',
                        background: 'transparent',
                        color: 'var(--color-black)',
                        border: '1px solid var(--color-black)',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Add to Cart
                </button>
                <button
                    onClick={handleBuyNow}
                    className="hover-btn"
                    style={{
                        padding: '1rem',
                        background: 'var(--color-black)',
                        color: 'white',
                        border: '1px solid var(--color-black)',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Buy Now
                </button>
            </div>

            <button
                onClick={() => toggleWishlist(product)}
                style={{
                    padding: '1rem',
                    background: isSaved ? '#f5f5f5' : 'transparent',
                    color: isSaved ? 'var(--color-gold)' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.9rem'
                }}
            >
                <FiHeart size={20} fill={isSaved ? 'var(--color-gold)' : 'none'} color={isSaved ? 'var(--color-gold)' : 'currentColor'} />
                {isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>
        </div>
    );
}
