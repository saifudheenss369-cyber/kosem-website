import Link from 'next/link';
import Image from 'next/image';
import Navbar from './components/Navbar';
import FeaturedCarousel from './components/FeaturedCarousel';
import MovingCarousel from './components/MovingCarousel';
import MainBannerCarousel from './components/MainBannerCarousel';
import ImageHero from './components/ImageHero';
import CategoryGrid from './components/CategoryGrid';
import ProductCard from './components/ProductCard';
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
    let newArrivals = [];
    let heritageMedia = null;
    let heritageLink = null;

    try {
        // Parallelize all data fetching
        const [
            fetchedBanners,
            fetchedHero,
            fetchedCarousel,
            fetchedBestSellers,
            fetchedPremium,
            fetchedLuxury,
            fetchedNewArrivalsTemp,
            heritageSetting,
            heritageLinkSetting
        ] = await Promise.all([
            prisma.offerBanner.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
            prisma.product.findMany({ where: { isInHero: true }, take: 5, orderBy: { createdAt: 'desc' } }),
            prisma.product.findMany({ where: { isInCarousel: true }, take: 50, orderBy: { createdAt: 'desc' } }),
            prisma.product.findMany({ where: { isBestSeller: true }, take: 50, orderBy: { createdAt: 'desc' } }),
            prisma.product.findMany({ where: { category: 'Premium' }, take: 50, orderBy: { createdAt: 'desc' } }),
            prisma.product.findMany({ where: { category: 'Luxury' }, take: 50, orderBy: { createdAt: 'desc' } }),
            prisma.product.findMany({ where: { isNewArrival: true }, take: 30, orderBy: { createdAt: 'desc' } }),
            prisma.setting.findUnique({ where: { key: 'heritageMedia' } }),
            prisma.setting.findUnique({ where: { key: 'heritageLink' } })
        ]);

        offerBanners = fetchedBanners;
        heroProducts = fetchedHero;
        carouselProducts = fetchedCarousel;
        bestSellers = fetchedBestSellers;
        premiumProducts = fetchedPremium;
        luxuryProducts = fetchedLuxury;
        heritageMedia = heritageSetting?.value || null;
        heritageLink = heritageLinkSetting?.value || null;

        // Fallback: If no products are marked as New Arrival, show the newest 30 products in the database
        if (fetchedNewArrivalsTemp && fetchedNewArrivalsTemp.length > 0) {
            newArrivals = fetchedNewArrivalsTemp;
        } else {
            newArrivals = await prisma.product.findMany({ take: 30, orderBy: { createdAt: 'desc' } });
        }

    } catch (error) {
        console.error("Failed to fetch products:", error);
    }

    // Deduplicate
    bestSellers = deduplicateVariants(bestSellers || []);
    carouselProducts = deduplicateVariants(carouselProducts || []);
    premiumProducts = deduplicateVariants(premiumProducts || []);
    luxuryProducts = deduplicateVariants(luxuryProducts || []);
    heroProducts = deduplicateVariants(heroProducts || []);
    newArrivals = deduplicateVariants(newArrivals || []).slice(0, 6); // Exactly 6 products
    offerBanners = offerBanners || [];

    const defaultBanners = [
        {
            id: 'default-1',
            imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1600&auto=format&fit=crop',
            title: 'Kosem Luxury Collection',
            link: '/shop',
            isActive: true
        },
        {
            id: 'default-2',
            imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1600&auto=format&fit=crop',
            title: 'Purity in Every Drop',
            link: '/shop',
            isActive: true
        },
        {
            id: 'default-3',
            imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1600&auto=format&fit=crop',
            title: 'Exclusive Attar & Oudh',
            link: '/shop',
            isActive: true
        }
    ];

    const displayBanners = offerBanners.length > 0 ? offerBanners : defaultBanners;

    return (
        <>
            <Navbar />
            <main className="home-main" style={{ background: 'var(--color-bg-main)' }}>
                <MainBannerCarousel banners={displayBanners} />

                {/* 1. Best Sellers - Positioned immediately below Hero */}
                {bestSellers.length > 0 && (
                    <section className="best-sellers-section section-padding" style={{ paddingBottom: '0rem' }}>
                        <FeaturedCarousel
                            title="Best Sellers"
                            initialProducts={bestSellers}
                        />
                    </section>
                )}

                {/* Luxury Section Divider */}
                <div className="luxury-divider-wrap">
                    <div className="luxury-divider-line"></div>
                    <div className="luxury-divider-center">
                        <div className="luxury-divider-dot"></div>
                        <div className="luxury-divider-emblem">
                            <span className="luxury-divider-emblem-icon">✨</span>
                        </div>
                        <div className="luxury-divider-dot"></div>
                    </div>
                    <div className="luxury-divider-line right"></div>
                </div>

                {/* Discovery Set Promotional Banner - Positioned right below Best Sellers */}
                <section className="section-padding" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                    <div className="container">
                        <Link href="/discovery-set" className="discovery-promo-banner">
                            <div className="discovery-promo-glow glow-1" />
                            <div className="discovery-promo-glow glow-2" />

                            <div className="discovery-promo-content">
                                <span className="discovery-promo-badge">✨ CURATED FRAGRANCE BOX</span>
                                <h2 className="discovery-promo-title">
                                    Build Your Own <span className="text-gradient-gold">Discovery Set</span>
                                </h2>
                                <p className="discovery-promo-desc">
                                    Can&apos;t decide on a single scent? Handpick your favourite signature fragrances into a custom luxury box — crafted for exploration and gifting.
                                </p>
                                <div className="discovery-promo-pills">
                                    <span>✦ Pick Your Own Scents</span>
                                    <span>✦ Multiple Pack Sizes</span>
                                    <span>✦ Luxury Gift Packaging</span>
                                </div>
                                <div className="discovery-promo-cta">
                                    <span className="btn-primary discovery-cta-btn">
                                        Create Your Set &rarr;
                                    </span>
                                </div>
                            </div>

                            <div className="discovery-promo-visual">
                                <div className="discovery-visual-frame">
                                    <img
                                        src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=900&auto=format&fit=crop"
                                        alt="Kosem Discovery Set"
                                    />
                                    <div className="discovery-visual-overlay" />
                                    <div className="discovery-floating-tag">
                                        <span className="tag-top">CUSTOMIZABLE</span>
                                        <span className="tag-main">Trial &amp; Gift Packs</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .discovery-promo-banner {
                            position: relative;
                            display: grid;
                            grid-template-columns: 1.25fr 0.9fr;
                            align-items: center;
                            gap: 2.5rem;
                            padding: 3rem 3.5rem;
                            border-radius: 24px;
                            background: linear-gradient(135deg, rgba(20, 25, 35, 0.95) 0%, rgba(10, 12, 18, 0.98) 100%);
                            border: 1px solid rgba(212, 175, 55, 0.35);
                            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08);
                            text-decoration: none;
                            color: inherit;
                            overflow: hidden;
                            transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
                        }
                        .discovery-promo-banner:hover {
                            transform: translateY(-4px);
                            border-color: rgba(212, 175, 55, 0.75);
                            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.7), 0 0 35px rgba(212, 175, 55, 0.15);
                        }
                        .discovery-promo-glow {
                            position: absolute;
                            border-radius: 50%;
                            filter: blur(110px);
                            pointer-events: none;
                            background: var(--color-gold);
                        }
                        .discovery-promo-glow.glow-1 {
                            width: 320px;
                            height: 320px;
                            top: -120px;
                            left: -80px;
                            opacity: 0.12;
                        }
                        .discovery-promo-glow.glow-2 {
                            width: 360px;
                            height: 360px;
                            bottom: -150px;
                            right: -60px;
                            opacity: 0.14;
                        }
                        .discovery-promo-content {
                            position: relative;
                            z-index: 2;
                        }
                        .discovery-promo-badge {
                            display: inline-block;
                            padding: 0.4rem 1rem;
                            border-radius: 999px;
                            background: rgba(212, 175, 55, 0.12);
                            border: 1px solid rgba(212, 175, 55, 0.35);
                            color: var(--color-gold);
                            font-size: 0.75rem;
                            font-weight: 700;
                            letter-spacing: 2.5px;
                            text-transform: uppercase;
                            margin-bottom: 1.1rem;
                        }
                        .discovery-promo-title {
                            font-family: var(--font-serif);
                            font-size: clamp(1.9rem, 3.5vw, 2.8rem);
                            line-height: 1.2;
                            color: var(--color-text-main);
                            margin: 0 0 1rem 0;
                        }
                        .discovery-promo-desc {
                            color: var(--color-text-muted);
                            font-size: 1rem;
                            line-height: 1.7;
                            margin: 0 0 1.4rem 0;
                            max-width: 540px;
                        }
                        .discovery-promo-pills {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 0.75rem 1.4rem;
                            margin-bottom: 2rem;
                            font-size: 0.85rem;
                            color: #e5e7eb;
                            opacity: 0.9;
                        }
                        .discovery-promo-pills span {
                            color: var(--color-gold);
                            font-weight: 500;
                        }
                        .discovery-cta-btn {
                            display: inline-block;
                            padding: 0.9rem 2.2rem;
                            font-size: 0.9rem;
                            letter-spacing: 1.5px;
                            border-radius: 8px;
                        }
                        .discovery-promo-visual {
                            position: relative;
                            z-index: 2;
                            display: flex;
                            justify-content: center;
                        }
                        .discovery-visual-frame {
                            position: relative;
                            width: 100%;
                            max-width: 360px;
                            height: 270px;
                            border-radius: 18px;
                            overflow: hidden;
                            border: 1px solid rgba(212, 175, 55, 0.35);
                            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
                        }
                        .discovery-visual-frame img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            transition: transform 0.6s ease;
                        }
                        .discovery-promo-banner:hover .discovery-visual-frame img {
                            transform: scale(1.06);
                        }
                        .discovery-visual-overlay {
                            position: absolute;
                            inset: 0;
                            background: linear-gradient(to top, rgba(0,0,0,0.65), transparent 60%);
                        }
                        .discovery-floating-tag {
                            position: absolute;
                            bottom: 14px;
                            left: 14px;
                            right: 14px;
                            padding: 0.7rem 1rem;
                            border-radius: 12px;
                            background: rgba(15, 18, 26, 0.85);
                            backdrop-filter: blur(8px);
                            border: 1px solid rgba(212, 175, 55, 0.3);
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .discovery-floating-tag .tag-top {
                            font-size: 0.68rem;
                            letter-spacing: 2px;
                            color: var(--color-gold);
                            font-weight: 700;
                        }
                        .discovery-floating-tag .tag-main {
                            font-family: var(--font-serif);
                            font-size: 0.95rem;
                            color: #fff;
                        }
                        @media (max-width: 900px) {
                            .discovery-promo-banner {
                                grid-template-columns: 1fr;
                                padding: 2.2rem 1.6rem;
                                text-align: center;
                                gap: 1.8rem;
                            }
                            .discovery-promo-desc {
                                margin-left: auto;
                                margin-right: auto;
                            }
                            .discovery-promo-pills {
                                justify-content: center;
                            }
                            .discovery-visual-frame {
                                height: 220px;
                            }
                        }
                    `}} />
                </section>

                {/* Luxury Section Divider */}
                <div className="luxury-divider-wrap">
                    <div className="luxury-divider-line"></div>
                    <div className="luxury-divider-center">
                        <div className="luxury-divider-dot"></div>
                        <div className="luxury-divider-emblem">
                            <span className="luxury-divider-emblem-icon">✨</span>
                        </div>
                        <div className="luxury-divider-dot"></div>
                    </div>
                    <div className="luxury-divider-line right"></div>
                </div>

                {/* New Arrivals Section - Positioned right below Discovery Set Banner */}
                {newArrivals.length > 0 && (
                    <section className="section-padding">
                        <div className="container">
                            <div className="carousel-header" style={{ textAlign: 'center', marginBottom: '3rem', width: '100%' }}>
                                <span style={{ color: 'var(--color-gold)', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700' }}>Discover Latest</span>
                                <h2 style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '2.5rem',
                                    color: 'var(--color-text-main)',
                                    marginTop: '0.5rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    New <span className="text-gradient-gold">Arrivals</span>
                                </h2>
                                <div style={{ width: '40px', height: '2px', background: 'var(--color-gold)', margin: '1rem auto' }}></div>
                            </div>

                            {/* Responsive 6 in a row for Desktop, 3x2 Grid for Tablet, 2x3 Grid for Mobile */}
                            <div className="new-arrivals-grid">
                                {newArrivals.map((product) => (
                                    <div key={product.id} className="new-arrival-item">
                                        <ProductCard product={product} isRectangle={true} />
                                    </div>
                                ))}
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
                                <Link href="/shop" className="hover-link">
                                    See All Products &rarr;
                                </Link>
                            </div>
                        </div>

                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .new-arrivals-grid {
                                display: grid;
                                grid-template-columns: repeat(6, 1fr);
                                gap: 15px;
                            }
                            @media (max-width: 1200px) {
                                .new-arrivals-grid {
                                    grid-template-columns: repeat(3, 1fr) !important;
                                    gap: 20px !important;
                                }
                            }
                            @media (max-width: 600px) {
                                .new-arrivals-grid {
                                    grid-template-columns: repeat(2, 1fr) !important;
                                    gap: 12px !important;
                                }
                            }
                        `}} />
                    </section>
                )}

                {/* Luxury Section Divider */}
                <div className="luxury-divider-wrap">
                    <div className="luxury-divider-line"></div>
                    <div className="luxury-divider-center">
                        <div className="luxury-divider-dot"></div>
                        <div className="luxury-divider-emblem">
                            <span className="luxury-divider-emblem-icon">✨</span>
                        </div>
                        <div className="luxury-divider-dot"></div>
                    </div>
                    <div className="luxury-divider-line right"></div>
                </div>

                {/* 2. Shop by Category */}
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

                {/* 3. Heritage / About Section - Positioned below categories / best products */}
                <section className="heritage-section section-padding" style={{ background: 'var(--color-bg-secondary)', position: 'relative', overflow: 'hidden' }}>
                    {/* Artistic Background Accents */}
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'var(--color-gold)', filter: 'blur(150px)', opacity: 0.08, borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', background: 'var(--color-gold)', filter: 'blur(180px)', opacity: 0.05, borderRadius: '50%' }}></div>

                    <div className="container" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '3rem',
                        position: 'relative',
                        zIndex: 2
                    }}>

                        {/* Heritage Image */}
                        <div className="heritage-image-wrapper" style={{ flex: '1', minWidth: '300px', maxWidth: '500px' }}>
                            <div style={{ position: 'relative', height: '450px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(184, 134, 11, 0.2)' }}>
                                {heritageMedia && heritageMedia.startsWith('data:video') ? (
                                    <video
                                        src={heritageMedia}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                                    />
                                ) : (
                                    <img
                                        src={heritageMedia || "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800"}
                                        alt="Heritage"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                                    />
                                )}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    left: '20px',
                                    background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dim))',
                                    color: 'var(--color-bg-main)',
                                    padding: '0.8rem 1.2rem',
                                    borderRadius: '12px 4px 12px 4px',
                                    fontWeight: '900',
                                    zIndex: 3,
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                                    textAlign: 'center'
                                }}>
                                </div>
                            </div>
                        </div>

                        <div className="heritage-content" style={{ flex: '1', minWidth: '300px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem' }} className="heritage-header-wrap">
                                <div style={{ width: '30px', height: '1px', background: 'var(--color-gold)' }}></div>
                                <span style={{ color: 'var(--color-gold)', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '2.1rem', fontWeight: '800' }}>The Heritage</span>
                            </div>

                            <p style={{ color: 'var(--color-text-main)', lineHeight: '1.8', marginBottom: '2.5rem', fontSize: '1rem', opacity: 0.9, borderLeft: '2px solid var(--color-gold)', paddingLeft: '1.2rem' }} className="heritage-p">
                                We didn’t inherit a kingdom. We built a sanctuary of scent, drop by single drop, driven by nothing but the desire to connect one human being to another through the invisible language of perfume
                            </p>
                        </div>
                    </div>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media (max-width: 768px) {
                            .heritage-content { text-align: center; margin-top: 2rem; }
                            .heritage-header-wrap { justify-content: center; }
                            .heritage-p { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(184, 134, 11, 0.3) !important; padding-top: 1.5rem !important; }
                            .heritage-image-wrapper { max-width: 90% !important; margin: 0 auto; flex: none !important; width: 100% !important; }
                        }
                    `}} />
                </section>

                {/* Value Props - Redesigned Grid */}
                <section className="props-section section-padding" style={{ background: 'var(--color-black)', color: 'white', position: 'relative' }}>
                    <div className="container">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '2rem'
                        }} className="props-grid">
                            {[
                                { icon: '💎', title: 'Premium Quality', desc: 'The cost of the ingredients is not counted, only the depth of the impression they leave, is on our mind. Premium quality is our promise that what touches your skin is the absolute truest, richest expression of our art.' },
                                { icon: '🏆', title: 'Trusted Heritage', desc: <span>When a perfume company is born entirely out of passion rather than business lineage, its heritage isn&apos;t measured in centuries-old ledgers or inherited formulas. Its heritage is built on <strong>intuition, experimentation, and raw emotion.</strong></span> }
                            ].map((prop, i) => (
                                <div key={i} className="glass-card hover-glow" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{prop.icon}</div>
                                    <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.8rem', fontSize: '1.2rem' }}>{prop.title}</h3>
                                    <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6', fontSize: '0.9rem' }}>{prop.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media (max-width: 600px) {
                            .props-grid {
                                grid-template-columns: 1fr !important;
                                gap: 1.5rem !important;
                            }
                            .glass-card {
                                padding: 2rem 1rem !important;
                            }
                        }
                    `}} />
                </section>
            </main >
        </>
    );
}
