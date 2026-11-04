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
                {/* Compact Luxury Header */}
                <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <span style={{
                        display: 'inline-block',
                        color: 'var(--color-gold)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '2.5px',
                        textTransform: 'uppercase',
                        padding: '0.3rem 0.9rem',
                        borderRadius: '999px',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        background: 'rgba(212, 175, 55, 0.08)',
                        marginBottom: '0.75rem'
                    }}>
                        ✦ Curated Fragrance Box
                    </span>
                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.65rem, 3vw, 2.25rem)',
                        margin: '0 0 0.4rem 0',
                        lineHeight: 1.2
                    }}>
                        Discovery <span className="text-gradient-gold">Sets</span>
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
                        Handpick your favourite signature scents in a custom trial or gift box.
                    </p>
                    <div style={{ width: '42px', height: '2.5px', borderRadius: '99px', background: 'linear-gradient(90deg, #f5d77f, #b8860b)', margin: '0.9rem auto 0' }} />
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
                            const badge = packs.find(p => p.badge)?.badge || 'Customizable';
                            const img = set.image || safeParse(set.gallery)[0];
                            const scentCount = set.scents?.length || 0;

                            return (
                                <Link key={set.id} href={`/discovery-set/${set.id}`} className="ds-set-card">
                                    <div className="ds-card-img-wrap">
                                        {img ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={img} alt={set.name} className="ds-card-img" />
                                        ) : (
                                            <div className="ds-card-placeholder">✨</div>
                                        )}
                                        <div className="ds-card-img-gradient" />
                                        <span className="ds-card-badge">{badge}</span>
                                        {scentCount > 0 && (
                                            <span className="ds-card-scent-pill">{scentCount} Scents</span>
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
                                            <div>
                                                <span className="ds-price-label">Starts from</span>
                                                <div className="ds-price-row">
                                                    {from !== null && <span className="ds-price-main">₹{from}</span>}
                                                    {orig !== null && <span className="ds-price-orig">₹{orig}</span>}
                                                </div>
                                            </div>
                                            <span className="ds-card-cta">
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
                        grid-template-columns: repeat(auto-fill, minmax(220px, 245px));
                        gap: 1.4rem;
                        justify-content: flex-start;
                    }
                    .ds-set-card {
                        display: flex;
                        flex-direction: column;
                        background: linear-gradient(165deg, rgba(22, 27, 38, 0.96) 0%, rgba(11, 14, 21, 0.98) 100%);
                        border: 1px solid rgba(212, 175, 55, 0.3);
                        border-radius: 16px;
                        overflow: hidden;
                        text-decoration: none;
                        color: inherit;
                        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
                        transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                    }
                    .ds-set-card:hover {
                        transform: translateY(-5px);
                        border-color: rgba(242, 204, 96, 0.8);
                        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.65), 0 0 22px rgba(212, 175, 55, 0.16);
                    }
                    .ds-card-img-wrap {
                        position: relative;
                        aspect-ratio: 4 / 3.6;
                        background: #0d1017;
                        overflow: hidden;
                    }
                    .ds-card-img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.5s ease;
                    }
                    .ds-set-card:hover .ds-card-img {
                        transform: scale(1.06);
                    }
                    .ds-card-placeholder {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2rem;
                    }
                    .ds-card-img-gradient {
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(to top, rgba(11, 14, 21, 0.85) 0%, transparent 45%);
                        pointer-events: none;
                    }
                    .ds-card-badge {
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        padding: 0.22rem 0.65rem;
                        border-radius: 999px;
                        background: rgba(12, 15, 22, 0.82);
                        backdrop-filter: blur(6px);
                        border: 1px solid rgba(212, 175, 55, 0.55);
                        color: #f3d27a;
                        font-size: 0.65rem;
                        font-weight: 700;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                    }
                    .ds-card-scent-pill {
                        position: absolute;
                        bottom: 8px;
                        right: 10px;
                        padding: 0.18rem 0.55rem;
                        border-radius: 6px;
                        background: rgba(0, 0, 0, 0.65);
                        color: #e5e7eb;
                        font-size: 0.68rem;
                        font-weight: 500;
                    }
                    .ds-card-body {
                        padding: 0.95rem 1.05rem 1.05rem;
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                    }
                    .ds-card-title {
                        font-family: var(--font-serif);
                        font-size: 1.12rem;
                        font-weight: 700;
                        color: #ffffff;
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
                        margin-bottom: 0.8rem;
                    }
                    .ds-mini-pack-chip {
                        font-size: 0.66rem;
                        padding: 0.15rem 0.5rem;
                        border-radius: 5px;
                        background: rgba(212, 175, 55, 0.1);
                        border: 1px solid rgba(212, 175, 55, 0.25);
                        color: #e6c66e;
                    }
                    .ds-card-footer {
                        margin-top: auto;
                        padding-top: 0.7rem;
                        border-top: 1px solid rgba(255, 255, 255, 0.07);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 0.5rem;
                    }
                    .ds-price-label {
                        display: block;
                        font-size: 0.62rem;
                        text-transform: uppercase;
                        letter-spacing: 0.8px;
                        color: var(--color-text-muted);
                    }
                    .ds-price-row {
                        display: flex;
                        align-items: baseline;
                        gap: 0.35rem;
                    }
                    .ds-price-main {
                        font-size: 1.05rem;
                        font-weight: 800;
                        color: #f3d27a;
                    }
                    .ds-price-orig {
                        font-size: 0.75rem;
                        color: var(--color-text-muted);
                        text-decoration: line-through;
                        opacity: 0.7;
                    }
                    .ds-card-cta {
                        padding: 0.42rem 0.85rem;
                        border-radius: 999px;
                        background: linear-gradient(180deg, #f7df94 0%, #d4a238 100%);
                        color: #111;
                        font-size: 0.72rem;
                        font-weight: 800;
                        letter-spacing: 0.5px;
                        white-space: nowrap;
                        transition: transform 0.2s ease, box-shadow 0.2s ease;
                    }
                    .ds-set-card:hover .ds-card-cta {
                        transform: scale(1.04);
                        box-shadow: 0 4px 14px rgba(212, 175, 55, 0.4);
                    }
                    @media (max-width: 600px) {
                        .ds-cards-grid {
                            grid-template-columns: repeat(2, 1fr);
                            gap: 0.85rem;
                        }
                        .ds-card-body {
                            padding: 0.75rem;
                        }
                        .ds-card-title {
                            font-size: 0.98rem;
                        }
                        .ds-card-cta {
                            padding: 0.35rem 0.65rem;
                            font-size: 0.66rem;
                        }
                    }
                `}} />
            </main>
        </>
    );
}
