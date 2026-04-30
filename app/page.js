import Link from 'next/link';
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
    let categoriesWithProducts = [];
    let premiumProducts = [];
    let luxuryProducts = [];
    let heroProducts = [];
    let offerBanners = [];

    try {
        // Fetch Banners
        offerBanners = await prisma.offerBanner.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });

        // -1. Fetch Hero Products
        heroProducts = await prisma.product.findMany({
            where: { isInHero: true },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        // 0. Fetch Carousel Products
        carouselProducts = await prisma.product.findMany({
            where: { isInCarousel: true },
            take: 15,
            orderBy: { createdAt: 'desc' }
        });
        // 1. Fetch Best Sellers
        bestSellers = await prisma.product.findMany({
            where: { isBestSeller: true },
            take: 15,
            orderBy: { createdAt: 'desc' }
        });

        // 2. Fetch Premium Category & Products
        const premiumCategory = await prisma.category.findUnique({ where: { name: 'Premium' } });
        if (premiumCategory) {
            premiumProducts = await prisma.product.findMany({
                where: { category: 'Premium' },
                take: 15,
                orderBy: { createdAt: 'desc' }
            });
        }

        // 3. Fetch Luxury Category & Products
        const luxuryCategory = await prisma.category.findUnique({ where: { name: 'Luxury' } });
        if (luxuryCategory) {
            luxuryProducts = await prisma.product.findMany({
                where: { category: 'Luxury' },
                take: 15,
                orderBy: { createdAt: 'desc' }
            });
        }

    } catch (error) {
        console.error("Failed to fetch products during build:", error);
    }

    // Fallback to empty arrays if undefined (though initialized above, good for safety)
    bestSellers = deduplicateVariants(bestSellers || []);
    carouselProducts = deduplicateVariants(carouselProducts || []);
    premiumProducts = deduplicateVariants(premiumProducts || []);
    luxuryProducts = deduplicateVariants(luxuryProducts || []);
    heroProducts = deduplicateVariants(heroProducts || []);
    offerBanners = offerBanners || [];

    // Removed dummy banner injection as per user request to show video if no banners exist.

    return (
        <>
            <Navbar />
            <main>
                {offerBanners && offerBanners.length > 0 ? (
                    <MainBannerCarousel banners={offerBanners} />
                ) : (
                    <ImageHero />
                )}

                <div style={{ background: 'var(--color-bg-secondary)', padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem', color: '#ffffffff' }}>
                            The Art of Refinement
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: '2', marginBottom: '3rem' }}>
                            At <strong>Kosem Perfumes</strong>, we believe that fragrance is an invisible accessory.
                            Our concentrated oils are derived from the rarest ingredients, distilled to perfection
                            to offer you an aura of sophistication that lingers.
                        </p>
                    </div>
                </div>

                {/* Shop by Category (Interactive Grid) */}
                <section style={{ background: 'var(--color-bg-secondary)', paddingTop: '2rem', paddingBottom: '4rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#ffffffff' }}>Shop by Category</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Discover our curated collections</p>
                    </div>
                    <div className="container">
                        <CategoryGrid activeCategory="All" />
                    </div>
                </section>

                {/* Moving Carousel (Featured) */}
                <MovingCarousel products={JSON.parse(JSON.stringify(carouselProducts))} />

                {/* 1. Best Sellers */}
                {bestSellers.length > 0 && (
                    <section style={{ background: 'var(--color-bg-secondary)' }}>
                        <FeaturedCarousel
                            title="Best Sellers"
                            initialProducts={JSON.parse(JSON.stringify(bestSellers))}
                        />
                    </section>
                )}

                {/* 2. Premium */}
                {premiumProducts.length > 0 && (
                    <section style={{ background: 'var(--color-bg-secondary)' }}>
                        <FeaturedCarousel
                            title="Premium Collection"
                            category="Premium"
                            initialProducts={JSON.parse(JSON.stringify(premiumProducts))}
                        />
                    </section>
                )}

                {/* 3. Luxury */}
                {luxuryProducts.length > 0 && (
                    <section style={{ background: 'var(--color-bg-secondary)' }}>
                        <FeaturedCarousel
                            title="Luxury Edition"
                            category="Luxury"
                            initialProducts={JSON.parse(JSON.stringify(luxuryProducts))}
                        />
                    </section>
                )}

                {/* 3. Why Choose Us / Value Props (Static) */}
                <section style={{ padding: '4rem 1rem', textAlign: 'center', background: 'var(--color-black)', color: 'white' }}>
                    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
                            <h3>100% Pure</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>Alcohol-free, concentrated oils extracted from natural ingredients.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
                            <h3>Premium Quality</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>Aged to perfection to ensure deep and lasting fragrance profiles.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                            <h3>Trusted Heritage</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>Decades of experience in the art of Attar and Oudh making.</p>
                        </div>
                    </div>
                </section>
            </main >
        </>
    );
}
