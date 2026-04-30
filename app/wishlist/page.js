'use client';

import { useWishlist } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { FiTrash2 } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlist();

    return (
        <>
            <Navbar />
            <main style={{ padding: '120px 2rem 4rem', minHeight: '80vh' }} className="container">
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                    My Wishlist
                </h1>

                {wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--color-text-muted)' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Your wishlist is currently empty.</p>
                        <Link href="/shop" style={{
                            padding: '1rem 3rem',
                            background: 'var(--color-black)',
                            color: 'white',
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: 'bold',
                            display: 'inline-block'
                        }}>
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="product-grid">
                        {wishlist.map(product => (
                            <div key={product.id} style={{ position: 'relative' }}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
