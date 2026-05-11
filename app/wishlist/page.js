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
            <main style={{ paddingTop: '160px', paddingBottom: '4rem', minHeight: '80vh' }} className="container">
                <h1 style={{ 
                    fontFamily: 'var(--font-serif)', 
                    fontSize: '3rem', 
                    marginBottom: '3rem', 
                    textAlign: 'center',
                    color: 'var(--color-text-main)',
                    letterSpacing: '2px'
                }}>
                    MY WISHLIST
                </h1>

                {wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--color-text-muted)' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Your wishlist is currently empty.</p>
                        <Link href="/shop" className="btn-primary" style={{ display: 'inline-block' }}>
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="product-layout">
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
