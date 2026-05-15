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
                    {/* Artistic Background Accents */}
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'var(--color-gold)', filter: 'blur(150px)', opacity: 0.08, borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', background: 'var(--color-gold)', filter: 'blur(180px)', opacity: 0.05, borderRadius: '50%' }}></div>

                    <div className="container responsive-grid-2" style={{ alignItems: 'center', position: 'relative', zIndex: 2 }}>
                        <div className="heritage-image-wrapper" style={{ position: 'relative' }}>
                            {/* Decorative Frame - Hidden on small mobile to avoid clutter */}
                            <div className="heritage-frame hide-mobile" style={{ position: 'absolute', top: -15, left: -15, width: '100%', height: '100%', border: '1px solid var(--color-gold)', borderRadius: '20px', transform: 'rotate(-2deg)', zIndex: 1, opacity: 0.2 }}></div>

                            <div className="heritage-image-box" style={{ position: 'relative', zIndex: 2, overflow: 'hidden', borderRadius: '15px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)' }}>
                                <Image
                                    src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"
                                    alt="Luxury Fragrance Crafting"
                                    width={800}
                                    height={1000}
                                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                                />
                                {/* Floating Badge */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    left: '20px',
                                    background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dim))',
                                    color: 'var(--color-bg-main)',
                                    padding: '1rem 1.5rem',
                                    borderRadius: '12px 4px 12px 4px',
                                    fontWeight: '900',
                                    zIndex: 3,
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    textAlign: 'center'
                                }}>
                                    <span style={{ fontSize: '1.4rem', display: 'block', lineHeight: '1' }}>100%</span>
                                    <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', display: 'block', letterSpacing: '1px', marginTop: '2px' }}>Pure Essence</span>
                                </div>
                            </div>
                        </div>

                        <div className="heritage-content" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem' }} className="heritage-header-wrap">
                                <div style={{ width: '30px', height: '1px', background: 'var(--color-gold)' }}></div>
                                <span style={{ color: 'var(--color-gold)', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800' }}>The Heritage</span>
                            </div>

                            <h2 style={{ marginBottom: '1.5rem', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>Crafted with Absolute <span className="text-gradient-gold">Purity</span></h2>

                            <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8', marginBottom: '2.5rem', fontSize: '1rem', opacity: 0.9, borderLeft: '2px solid var(--color-gold)', paddingLeft: '1.2rem' }} className="heritage-p">
                                Each drop is a result of meticulous distillation. We bypass the shortcuts of modern perfumery,
                                avoiding alcohol to bring you the raw soul of nature.
                            </p>

                            <div className="responsive-grid-2" style={{ gap: '1.5rem' }}>
                                {[
                                    { title: 'Long Lasting', desc: 'Stays for 12+ hours.' },
                                    { title: 'Skin Friendly', desc: 'Gentle natural oils.' }
                                ].map((item, idx) => (
                                    <div key={idx} style={{ position: 'relative', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ color: 'var(--color-gold)', marginBottom: '0.3rem', fontSize: '1rem', textTransform: 'uppercase' }}>{item.title}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media (max-width: 768px) {
                            .heritage-content { text-align: center; margin-top: 1rem; }
                            .heritage-header-wrap { justify-content: center; }
                            .heritage-p { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(184, 134, 11, 0.3) !important; padding-top: 1.5rem !important; }
                            .heritage-image-wrapper { max-width: 90%; margin: 0 auto; }
                            .hide-mobile { display: none !important; }
                        }
                    `}} />
                </section>

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
