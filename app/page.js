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

                {/* Discovery Set Minimal Banner - Matched to Website Theme */}
                <section className="section-padding" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                    <div className="container">
                        <Link href="/discovery-set" className="ds-minimal-banner">
                            <div className="ds-minimal-content">
                                <span className="ds-minimal-eyebrow">CURATED FRAGRANCE BOX</span>

                                <h2 className="ds-minimal-title">
                                    Build Your Own <span className="text-gradient-gold">Discovery Set</span>
                                </h2>

                                <div className="ds-minimal-divider" />

                                <p className="ds-minimal-sub">
                                    Handpick your favourite signature scents in a custom trial or gift box.
                                </p>

                                <div className="ds-minimal-steps">
                                    <div className="ds-minimal-step">
                                        <span className="ds-minimal-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="9" y="3" width="6" height="3" rx="1" />
                                                <path d="M10 6h4v2l3 3v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8l3-3V6z" />
                                                <circle cx="12" cy="14" r="2" />
                                            </svg>
                                        </span>
                                        <span>Pick Scents</span>
                                    </div>

                                    <span className="ds-minimal-sep" />

                                    <div className="ds-minimal-step">
                                        <span className="ds-minimal-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="12 3 3 8 12 13 21 8 12 3" />
                                                <polyline points="3 12.5 12 17.5 21 12.5" />
                                                <polyline points="3 17 12 22 21 17" />
                                            </svg>
                                        </span>
                                        <span>Choose Size</span>
                                    </div>

                                    <span className="ds-minimal-sep" />

                                    <div className="ds-minimal-step">
                                        <span className="ds-minimal-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 12 20 21 4 21 4 12" />
                                                <rect x="2" y="7" width="20" height="5" rx="1" />
                                                <line x1="12" y1="21" x2="12" y2="7" />
                                                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                                                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                                            </svg>
                                        </span>
                                        <span>Gift Ready</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="btn-primary ds-minimal-cta">
                                        Create Your Set &rarr;
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .ds-minimal-banner {
                            position: relative;
                            display: block;
                            max-width: 920px;
                            margin: 0 auto;
                            padding: 2.6rem 2rem;
                            border-radius: 16px;
                            background: var(--color-bg-secondary);
                            border: 1px solid rgba(184, 134, 11, 0.22);
                            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
                            text-align: center;
                            text-decoration: none;
                            color: var(--color-text-main);
                            overflow: hidden;
                            transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                        }
                        .ds-minimal-banner:hover {
                            transform: translateY(-3px);
                            border-color: rgba(184, 134, 11, 0.45);
                            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
                        }
                        .ds-minimal-content {
                            position: relative;
                            z-index: 2;
                            max-width: 600px;
                            margin: 0 auto;
                        }
                        .ds-minimal-eyebrow {
                            display: block;
                            color: var(--color-gold);
                            letter-spacing: 3px;
                            text-transform: uppercase;
                            font-size: 0.75rem;
                            font-weight: 700;
                        }
                        .ds-minimal-title {
                            font-family: var(--font-serif);
                            font-size: clamp(1.75rem, 3.5vw, 2.4rem);
                            color: var(--color-text-main);
                            margin: 0.45rem 0 0.25rem;
                        }
                        .ds-minimal-divider {
                            width: 40px;
                            height: 2px;
                            background: var(--color-gold);
                            margin: 0.85rem auto 1rem;
                        }
                        .ds-minimal-sub {
                            color: var(--color-text-muted);
                            font-size: 0.92rem;
                            line-height: 1.6;
                            margin: 0 auto 1.4rem;
                            max-width: 460px;
                        }
                        .ds-minimal-steps {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            flex-wrap: wrap;
                            gap: 0.75rem 1.1rem;
                            margin-bottom: 1.6rem;
                        }
                        .ds-minimal-step {
                            display: inline-flex;
                            align-items: center;
                            gap: 0.45rem;
                            font-size: 0.84rem;
                            color: var(--color-text-main);
                            font-weight: 500;
                        }
                        .ds-minimal-icon {
                            width: 30px;
                            height: 30px;
                            border-radius: 7px;
                            border: 1px solid rgba(184, 134, 11, 0.35);
                            background: rgba(184, 134, 11, 0.08);
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            color: var(--color-gold);
                        }
                        .ds-minimal-icon svg {
                            width: 15px;
                            height: 15px;
                        }
                        .ds-minimal-sep {
                            width: 1px;
                            height: 18px;
                            background: rgba(255, 255, 255, 0.12);
                        }
                        .ds-minimal-cta {
                            display: inline-block;
                            padding: 0.78rem 2rem;
                            border-radius: 6px;
                            font-size: 0.82rem;
                        }
                        @media (max-width: 600px) {
                            .ds-minimal-banner {
                                padding: 1.9rem 1.1rem;
                                border-radius: 14px;
                            }
                            .ds-minimal-sub {
                                font-size: 0.84rem;
                                margin-bottom: 1.15rem;
                            }
                            .ds-minimal-steps {
                                gap: 0.5rem 0.65rem;
                                margin-bottom: 1.35rem;
                            }
                            .ds-minimal-step {
                                font-size: 0.76rem;
                                gap: 0.35rem;
                            }
                            .ds-minimal-icon {
                                width: 26px;
                                height: 26px;
                            }
                            .ds-minimal-icon svg {
                                width: 13px;
                                height: 13px;
                            }
                            .ds-minimal-sep {
                                height: 14px;
                            }
                            .ds-minimal-cta {
                                padding: 0.7rem 1.6rem;
                                font-size: 0.76rem;
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
