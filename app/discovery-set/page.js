import prisma from '@/lib/prisma';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Discovery Sets - Kosem',
    description: 'Build your own discovery set and explore our signature scents.',
};

const safeParse = (str) => {
    try {
        const v = JSON.parse(str);
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
};

async function getSets() {
    try {
        return await prisma.discoverySet.findMany({
            where: { isActive: true },
            include: { scents: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error('Discovery sets list error:', e);
        return [];
    }
}

export default async function DiscoverySetsPage() {
    const sets = await getSets();

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '115px', paddingBottom: '5rem', minHeight: '85vh' }} className="container">
                {/* Minimal Header Matched to Site Theme */}
                <header style={{ textAlign: 'center', marginBottom: '2.4rem' }}>
                    <span style={{
                        display: 'block',
                        color: 'var(--color-gold)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem'
                    }}>
                        Curated Fragrance Box
                    </span>
                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.65rem, 3vw, 2.25rem)',
                        margin: '0 0 0.35rem 0',
                        lineHeight: 1.2
                    }}>
                        Discovery <span className="text-gradient-gold">Sets</span>
                    </h1>
                    <div style={{ width: '40px', height: '2px', background: 'var(--color-gold)', margin: '0.75rem auto' }} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto' }}>
                        Handpick your favourite signature scents in a custom trial or gift box.
                    </p>
                </header>

                {sets.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.7 }}>No discovery sets available right now. Please check back soon.</p>
                ) : (
                    <div className="ds-cards-grid">
                        {sets.map(set => {
                            const packs = safeParse(set.packs);
                            const validPacks = packs.filter(p => Number(p.price) > 0);
                            const minPack = validPacks.length
                                ? validPacks.reduce((min, p) => Number(p.price) < Number(min.price) ? p : min, validPacks[0])
                                : null;
                            const from = minPack ? Number(minPack.price) : null;
                            const orig = minPack && Number(minPack.originalPrice) > from ? Number(minPack.originalPrice) : null;
                            const img = set.image || safeParse(set.gallery)[0];

                            return (
                                <Link key={set.id} href={`/discovery-set/${set.id}`} className="ds-set-card">
                                    <div className="ds-card-img-wrap">
                                        {img ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={img} alt={set.name} className="ds-card-img" />
                                        ) : (
                                            <div className="ds-card-placeholder">✨</div>
                                        )}
                                    </div>

                                    <div className="ds-card-body">
                                        <h3 className="ds-card-title">{set.name}</h3>
                                        {set.tagline && <p className="ds-card-tagline">{set.tagline}</p>}

                                        {packs.length > 0 && (
                                            <div className="ds-card-packs-row">
                                                {packs.slice(0, 3).map((p, i) => (
                                                    <span key={i} className="ds-mini-pack-chip">
                                                        {p.label || `${p.count} Pack`}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="ds-card-footer">
                                            <div className="ds-price-line">
                                                <span className="ds-price-from">From</span>
                                                {from !== null && <span className="ds-price-main">₹{from}</span>}
                                                {orig !== null && <span className="ds-price-orig">₹{orig}</span>}
                                            </div>
                                            <span className="btn-primary ds-card-cta">
                                                Build Set &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .ds-cards-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(215px, 240px));
                        gap: 1.25rem;
                        justify-content: flex-start;
                    }
                    .ds-set-card {
                        display: flex;
                        flex-direction: column;
                        background: var(--color-bg-secondary);
                        border: 1px solid rgba(184, 134, 11, 0.22);
                        border-radius: 12px;
                        overflow: hidden;
                        text-decoration: none;
                        color: inherit;
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
                        transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                    }
                    .ds-set-card:hover {
                        transform: translateY(-4px);
                        border-color: rgba(184, 134, 11, 0.5);
                        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.4);
                    }
                    .ds-card-img-wrap {
                        position: relative;
                        aspect-ratio: 1 / 1;
                        background: var(--color-bg-main);
                        overflow: hidden;
                    }
                    .ds-card-img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.45s ease;
                    }
                    .ds-set-card:hover .ds-card-img {
                        transform: scale(1.04);
                    }
                    .ds-card-placeholder {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2rem;
                    }
                    .ds-card-body {
                        padding: 0.9rem;
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                    }
                    .ds-card-title {
                        font-family: var(--font-serif);
                        font-size: 1.08rem;
                        font-weight: 600;
                        color: var(--color-text-main);
                        margin: 0 0 0.2rem 0;
                        line-height: 1.25;
                    }
                    .ds-card-tagline {
                        font-size: 0.78rem;
                        color: var(--color-text-muted);
                        margin: 0 0 0.65rem 0;
                        line-height: 1.4;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .ds-card-packs-row {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.35rem;
                        margin-bottom: 0.75rem;
                    }
                    .ds-mini-pack-chip {
                        font-size: 0.68rem;
                        padding: 0.15rem 0.5rem;
                        border-radius: 4px;
                        background: rgba(184, 134, 11, 0.1);
                        border: 1px solid rgba(184, 134, 11, 0.25);
                        color: var(--color-gold);
                        font-weight: 500;
                    }
                    .ds-card-footer {
                        margin-top: auto;
                        padding-top: 0.65rem;
                        border-top: 1px solid rgba(255, 255, 255, 0.06);
                        display: flex;
                        flex-direction: column;
                        gap: 0.55rem;
                    }
                    .ds-price-line {
                        display: flex;
                        align-items: baseline;
                        gap: 0.35rem;
                        flex-wrap: wrap;
                    }
                    .ds-price-from {
                        font-size: 0.7rem;
                        color: var(--color-text-muted);
                    }
                    .ds-price-main {
                        font-size: 1.05rem;
                        font-weight: 700;
                        color: var(--color-gold);
                    }
                    .ds-price-orig {
                        font-size: 0.75rem;
                        color: var(--color-text-muted);
                        text-decoration: line-through;
                        opacity: 0.65;
                    }
                    .ds-card-cta {
                        display: block;
                        width: 100%;
                        text-align: center;
                        padding: 0.5rem 0.75rem;
                        border-radius: 6px;
                        font-size: 0.72rem;
                        letter-spacing: 1px;
                    }
                    @media (max-width: 600px) {
                        .ds-cards-grid {
                            grid-template-columns: repeat(2, 1fr);
                            gap: 0.75rem;
                        }
                        .ds-card-body {
                            padding: 0.7rem;
                        }
                        .ds-card-title {
                            font-size: 0.96rem;
                        }
                        .ds-card-tagline {
                            font-size: 0.72rem;
                            margin-bottom: 0.5rem;
                        }
                        .ds-mini-pack-chip {
                            font-size: 0.62rem;
                            padding: 0.12rem 0.4rem;
                        }
                        .ds-price-main {
                            font-size: 0.95rem;
                        }
                        .ds-card-cta {
                            padding: 0.45rem 0.5rem;
                            font-size: 0.68rem;
                        }
                    }
                `}} />
            </main>
        </>
    );
}
