'use client';

import { useCart } from '../context/CartContext';

export default function AddToCartButton({ product }) {
    const { addToCart } = useCart();

    return (
        <button
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className="btn-primary"
            style={{ width: '100%', fontSize: '1.1rem' }}
        >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
    );
}
