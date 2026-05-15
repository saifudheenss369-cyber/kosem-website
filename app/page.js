import Link from 'next/link';
import Image from 'next/image';
import Navbar from './components/Navbar';
import FeaturedCarousel from './components/FeaturedCarousel';
import MovingCarousel from './components/MovingCarousel';
import MainBannerCarousel from './components/MainBannerCarousel';
import ImageHero from './components/ImageHero';
import CategoryGrid from './components/CategoryGrid';
import prisma from '@/lib/prisma';

// Force dynamic rendering to skip build-time DB checks
export const dynamic = 'force-dynamic';


function deduplicateVariants(products) {
    if (!products) return [];

    const bestVariantMap = new Map();
    for (const p of products) {
        if (p.variantGroupId) {
            if (!bestVariantMap.has(p.variantGroupId)) {
                bestVariantMap.set(p.variantGroupId, p);
            } else {
                const currentBest = bestVariantMap.get(p.variantGroupId);
                if (p.isMainVariant && !currentBest.isMainVariant) {
                    bestVariantMap.set(p.variantGroupId, p);
                } else if (p.isMainVariant === currentBest.isMainVariant) {
                    if (currentBest.stock <= 0 && p.stock > 0) {
                        bestVariantMap.set(p.variantGroupId, p);
                    }
                }
            }
        }
    }

    const seenGroups = new Set();
    const result = [];
    for (const p of products) {
        if (!p.variantGroupId) {
            result.push(p);
        } else if (!seenGroups.has(p.variantGroupId)) {
            seenGroups.add(p.variantGroupId);
            result.push(bestVariantMap.get(p.variantGroupId));
        }
    }
    return result;
}

export default async function Home() {
    // Initialize data
    let bestSellers = [];
    let carouselProducts = [];
    let premiumProducts = [];
    let luxuryProducts = [];
    let heroProducts = [];
    let offerBanners = [];

    try {
        // Parallelize all data fetching
        const [
            fetchedBanners,
            fetchedHero,
            fetchedCarousel,
            fetchedBestSellers,
            fetchedPremium,
            fetchedLuxury
        ] = await Promise.all([
            prisma.offerBanner.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
            prisma.product.findMany({ where: { isInHero: true }, take: 5, orderBy: { createdAt: 'desc' } }),
            prisma.product.findMany({ where: { isInCarousel: true }, take: 50, orderBy: { createdAt: 'desc' } }),
            prisma.product.findMany({ where: { isBestSeller: true }, take: 50, orderBy: { createdAt: 'desc' } }),
            prisma.product.findMany({ where: { category: 'Premium' }, take: 50, orderBy: { createdAt: 'desc' } }),
            prisma.product.findMany({ where: { category: 'Luxury' }, take: 50, orderBy: { createdAt: 'desc' } })
        ]);

        offerBanners = fetchedBanners;
        heroProducts = fetchedHero;
        carouselProducts = fetchedCarousel;
        bestSellers = fetchedBestSellers;
        premiumProducts = fetchedPremium;
        luxuryProducts = fetchedLuxury;

    } catch (error) {
        console.error("Failed to fetch products:", error);
    }

    // Deduplicate
    bestSellers = deduplicateVariants(bestSellers || []);
    carouselProducts = deduplicateVariants(carouselProducts || []);
    premiumProducts = deduplicateVariants(premiumProducts || []);
    luxuryProducts = deduplicateVariants(luxuryProducts || []);
    heroProducts = deduplicateVariants(heroProducts || []);
    offerBanners = offerBanners || [];

    return (
        <>
            <Navbar />
            <main style={{ background: 'var(--color-bg-main)' }}>
                {offerBanners && offerBanners.length > 0 ? (
                    <MainBannerCarousel banners={offerBanners} />
                ) : (
                    <ImageHero />
                )}

                {/* Heritage Section - Enhanced Crafted with Purity */}
                <section className="section-padding" style={{ background: 'var(--color-bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                    {/* Subtle Background Accent */}
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'var(--color-gold)', filter: 'blur(150px)', opacity: 0.05, borderRadius: '50%' }}></div>
                    
                    <div className="container responsive-grid-2" style={{ alignItems: 'center' }}>
                        <div style={{ position: 'relative', padding: '1rem' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '1px solid var(--color-gold)', borderRadius: '20px', transform: 'rotate(-2deg)', zIndex: 1, opacity: 0.3 }}></div>
                            <div style={{ position: 'relative', zIndex: 2, overflow: 'hidden', borderRadius: '15px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', height: 'clamp(300px, 50vh, 500px)' }}>
                                <Image 
                                    src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800" 
                                    alt="Luxury Fragrance Crafting" 
                                    fill
                                    style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }} 
                                />
                            </div>
                            <div style={{ position: 'absolute', bottom: '20px', left: 'clamp(-10px, -30px, -30px)', background: 'var(--color-gold)', color: 'var(--color-bg-main)', padding: 'clamp(1rem, 1.5rem, 1.5rem) clamp(1.5rem, 2.5rem, 2.5rem)', borderRadius: '40px 4px 40px 4px', fontWeight: '800', zIndex: 3, boxShadow: '10px 10px 30px rgba(0,0,0,0.3)', letterSpacing: '1px' }}>
                                <span style={{ fontSize: 'clamp(1.2rem, 1.8rem, 1.8rem)' }}>100%</span>
                                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginTop: '-5px' }}>Pure Essence</span>
                            </div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--color-gold)', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '1rem' }}>The Kosem Standard</span>
                            <h2 style={{ marginBottom: '1.5rem' }}>Crafted with Absolute <span className="text-gradient-gold">Purity</span></h2>
                            <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8', marginBottom: '2.5rem', fontSize: 'clamp(1rem, 1.15rem, 1.15rem)', opacity: 0.85 }}>
                                Each drop of Kosem Attar is a result of meticulous distillation. We bypass the shortcuts of modern perfumery, 
                                avoiding alcohol and synthetic fillers to bring you the raw, potent soul of nature's finest scents.
                            </p>
                            <div className="responsive-grid-2" style={{ gap: '2rem' }}>
                                <div style={{ borderLeft: '3px solid var(--color-gold)', paddingLeft: '1.5rem' }}>
                                    <h4 style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Long Lasting</h4>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Distilled for longevity, staying with you for 12+ hours.</p>
                                </div>
                                <div style={{ borderLeft: '3px solid var(--color-gold)', paddingLeft: '1.5rem' }}>
                                    <h4 style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>Skin Friendly</h4>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Concentrated natural oils that are gentle on your skin.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Shop by Category - Redesigned */}
                <section className="section-padding">
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <span style={{ color: 'var(--color-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '600' }}>Collections</span>
                                <h2 style={{ marginTop: '0.5rem' }}>Shop by <span className="text-gradient-gold">Category</span></h2>
                            </div>
                            <Link href="/shop" className="hover-link">View All &rarr;</Link>
                        </div>
                        <CategoryGrid activeCategory="All" />
                    </div>
                </section>

                {/* Moving Carousel (Featured) */}
                <MovingCarousel products={carouselProducts} />

                {/* 1. Best Sellers */}
                {bestSellers.length > 0 && (
                    <section style={{ padding: '4rem 0' }}>
                        <FeaturedCarousel
                            title="Best Sellers"
                            initialProducts={bestSellers}
                        />
                    </section>
                )}

                {/* Value Props - Redesigned Grid */}
                <section className="section-padding" style={{ background: 'var(--color-black)', color: 'white', position: 'relative' }}>
                    <div className="container">
                        <div className="responsive-grid-4">
                            {[
                                { icon: '🌿', title: '100% Pure', desc: 'Alcohol-free, concentrated oils extracted from natural ingredients.' },
                                { icon: '💎', title: 'Premium Quality', desc: 'Aged to perfection to ensure deep and lasting fragrance profiles.' },
                                { icon: '🚚', title: 'Free Shipping', desc: 'Complimentary shipping on all prepaid orders across India.' },
                                { icon: '🏆', title: 'Trusted Heritage', desc: 'Decades of experience in the art of Attar and Oudh making.' }
                            ].map((prop, i) => (
                                <div key={i} className="glass-card hover-glow" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>{prop.icon}</div>
                                    <h3 style={{ color: 'var(--color-gold)' }}>{prop.title}</h3>
                                    <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{prop.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main >
        </>
    );
}
