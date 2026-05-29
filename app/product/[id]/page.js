import Navbar from '../../components/Navbar';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import AddToCartButton from '../../components/AddToCartButton';
import Reviews from '../../components/Reviews';
import ProductActions from '../../components/ProductActions';
import ShareButton from '../../components/ShareButton';

import VariantGallery from '../../components/VariantGallery';

export const dynamic = 'force-dynamic';

async function getProduct(id) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: { reviews: true }
                }
            }
        });
        return product;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const product = await getProduct(params.id);
    if (!product) return { title: 'Product Not Found' };

    return {
        title: `${product.name} - Kosem`,
        description: product.description.substring(0, 160),
        openGraph: {
            title: product.name,
            description: product.description,
            images: product.images ? [product.images] : [],
            url: `https://kosem.vercel.app/product/${params.id}`,
            type: 'website',
        },
    };
}

export default async function ProductPage({ params }) {
    const product = await getProduct(params.id);

    if (!product) {
        return <div>Product not found</div>;
    }

    // Fetch Sizes/Variants
    let variants = [];
    if (product.variantGroupId) {
        variants = await prisma.product.findMany({
            where: { variantGroupId: product.variantGroupId },
            select: { id: true, size: true, name: true, images: true, gallery: true }
        });
    }

    // Fetch Similar Products
    let similarProducts = [];
    if (product.similarProductIds) {
        const ids = product.similarProductIds.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (ids.length > 0) {
            similarProducts = await prisma.product.findMany({
                where: { id: { in: ids } }
            });
        }
    }

    const shareUrl = `https://kosem.vercel.app/product/${params.id}`;

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '120px', paddingBottom: '4rem' }} className="container">
                <Link href="/shop" style={{ textDecoration: 'underline', marginBottom: '2rem', display: 'inline-block' }}>&larr; Back to Collection</Link>

                <div className="single-product-grid">

                    {/* Image + Variant Section */}
                    <div>
                        <VariantGallery
                            variants={variants.length > 0 ? variants : []}
                            currentProductId={product.id}
                            productImages={product.images}
                            productGallery={product.gallery}
                        />
                    </div>

                    {/* Details Section */}
                    <div>
                        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>{product.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            <div style={{ color: '#FFD700', fontSize: '1.2rem', letterSpacing: '2px' }}>
                                {'★'.repeat(Math.round(product.rating))}
                                {'☆'.repeat(5 - Math.round(product.rating))}
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>
                                {product.rating.toFixed(1)}
                            </span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', borderLeft: '1px solid #ddd', paddingLeft: '10px' }}>
                                {(product._count?.reviews || 0) + (product.fakeRatingCount || 0)} Reviews
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-gold-dim)' }}>₹{product.price}</span>
                            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                <span style={{ fontSize: '1.4rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', opacity: 0.7 }}>₹{product.originalPrice}</span>
                            )}
                        </div>

                        <div style={{ marginBottom: '2rem', lineHeight: '1.8', color: 'var(--color-text-muted)', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                            {product.description}
                        </div>

                        {/* Variant Size Selector as Links */}
                        {variants.length > 1 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                                    Available Sizes:
                                </span>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {variants.map(v => {
                                        // Product ID could be different types between API and SSR, handle carefully
                                        const isActive = v.id.toString() === product.id.toString();
                                        return (
                                            <Link
                                                href={`/product/${v.id}`}
                                                key={v.id}
                                                style={{
                                                    padding: '10px 20px',
                                                    border: isActive ? '2px solid var(--color-gold)' : '1px solid var(--color-border)',
                                                    background: isActive ? 'var(--color-gold)' : 'var(--color-bg-secondary)',
                                                    color: isActive ? 'var(--color-bg-main)' : 'var(--color-text-main)',
                                                    fontWeight: '600',
                                                    borderRadius: '6px',
                                                    textDecoration: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                                                    fontFamily: 'inherit',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                {v.size || v.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>Availability:</span>
                            <span style={{
                                display: 'inline-block',
                                color: product.stock > 0 ? '#2e7d32' : '#d32f2f',
                                background: 'rgba(0,0,0,0.03)',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                fontWeight: '500'
                            }}>
                                {product.stock > 0
                                    ? (product.showStockCount !== false ? `In Stock (${product.stock} units)` : 'In Stock')
                                    : 'Out of Stock'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <ProductActions product={product} />

                            {/* Removed Pincode Checker as per user request */}

                            <div style={{ marginTop: '1rem' }}>
                                <ShareButton title={`Check out ${product.name} on Kosem`} text={product.description} url={shareUrl} />
                            </div>
                        </div>


                    </div>
                </div>

                {/* Similar Products Section */}
                {similarProducts.length > 0 && (
                    <div style={{ marginTop: '5rem' }}>
                        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '2rem', textAlign: 'center', color: 'var(--color-text-main)' }}>You May Also Like</h2>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                            gap: '2rem' 
                        }}>
                            {similarProducts.map((sp) => (
                                <Link href={`/product/${sp.id}`} key={sp.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '8px', transition: 'transform 0.2s', border: '1px solid var(--color-border)' }}>
                                        <div style={{ background: 'var(--color-bg-secondary)', height: '250px', marginBottom: '1rem', overflow: 'hidden', borderRadius: '4px' }}>
                                            {sp.images ? (
                                                <img src={sp.images} alt={sp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>No Image</div>
                                            )}
                                        </div>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>{sp.name}</h3>
                                        {sp.size && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Size: {sp.size}</p>}
                                        <p style={{ fontWeight: 'bold', color: 'var(--color-gold-dim)' }}>₹{sp.price}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <Reviews productId={product.id} product={product} />
            </main>
        </>
    );
}
