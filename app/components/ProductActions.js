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
                    className="btn-outline-gold"
                >
                    Add to Cart
                </button>
                <button
                    onClick={handleBuyNow}
                    className="btn-solid-gold"
                >
                    Buy Now
                </button>
            </div>

            <button
                onClick={() => toggleWishlist(product)}
                className={`btn-wishlist ${isSaved ? 'active' : ''}`}
            >
                <FiHeart size={20} fill={isSaved ? 'var(--color-gold)' : 'none'} color={isSaved ? 'var(--color-gold)' : 'currentColor'} />
                {isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>
        </div>
    );
}
