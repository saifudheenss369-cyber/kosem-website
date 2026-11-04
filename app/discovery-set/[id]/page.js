import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../components/Navbar';
import DiscoverySetSelector from './DiscoverySetSelector';

export const dynamic = 'force-dynamic';

const safeParse = (str) => {
    try {
        const v = JSON.parse(str);
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
};

async function getSet(rawId) {
    const id = parseInt(rawId, 10);
    if (isNaN(id)) return null;
    try {
        return await prisma.discoverySet.findUnique({
            where: { id },
            include: { scents: { orderBy: { createdAt: 'asc' } } }
        });
    } catch (e) {
        console.error('Discovery set fetch error:', e);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const set = await getSet(params.id);
    if (!set) return { title: 'Discovery Set Not Found' };
    return {
        title: `${set.name} - Kosem`,
        description: (set.tagline || set.description || '').substring(0, 160),
    };
}

export default async function DiscoverySetPage({ params }) {
    const set = await getSet(params.id);
    if (!set || !set.isActive) notFound();

    const packs = safeParse(set.packs);
    const gallery = safeParse(set.gallery);
    const heroImage = gallery[0] || set.image;

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '110px', paddingBottom: '8rem', minHeight: '90vh' }} className="container">
                {/* Back button */}
                <div style={{ marginBottom: '1.2rem' }}>
                    <Link
                        href="/discovery-set"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.42rem 1rem',
                            borderRadius: '999px',
                            background: 'rgba(15, 19, 28, 0.85)',
                            border: '1px solid rgba(212, 175, 55, 0.35)',
                            color: '#e8c468',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <span>&larr;</span> All Discovery Sets
                    </Link>
                </div>

                {/* Luxury Header Card */}
                <header
                    style={{
                        position: 'relative',
                        textAlign: 'center',
                        padding: '1.8rem 1.5rem',
                        marginBottom: '2.2rem',
                        borderRadius: '18px',
                        background: 'linear-gradient(145deg, rgba(20, 25, 36, 0.95) 0%, rgba(9, 12, 18, 0.98) 100%)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        boxShadow: '0 18px 45px rgba(0, 0, 0, 0.5), inset 0 0 25px rgba(212, 175, 55, 0.05)',
                        overflow: 'hidden'
                    }}
                >
                    <span
                        style={{
                            display: 'inline-block',
                            padding: '0.28rem 0.9rem',
                            borderRadius: '999px',
                            background: 'rgba(212, 175, 55, 0.1)',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            color: '#f3d27a',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            marginBottom: '0.6rem'
                        }}
                    >
                        ✦ Customize Your Fragrance Box
                    </span>

                    <h1
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                            margin: 0,
                            background: 'linear-gradient(180deg, #ffffff 0%, #f5d77f 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        {set.name}
                    </h1>

                    {set.tagline && (
                        <p style={{ fontSize: '0.92rem', color: '#e8c468', margin: '0.35rem 0 0', fontWeight: 500 }}>
                            {set.tagline}
                        </p>
                    )}

                    <div
                        style={{
                            width: '44px',
                            height: '2.5px',
                            borderRadius: '99px',
                            background: 'linear-gradient(90deg, #f7df94, #b8860b)',
                            margin: '0.75rem auto'
                        }}
                    />

                    {set.description && (
                        <p
                            style={{
                                maxWidth: '640px',
                                margin: '0 auto',
                                fontSize: '0.85rem',
                                lineHeight: 1.6,
                                color: 'var(--color-text-muted)',
                                whiteSpace: 'pre-line'
                            }}
                        >
                            {set.description}
                        </p>
                    )}
                </header>

                <DiscoverySetSelector
                    setId={set.id}
                    setName={set.name}
                    image={set.image || heroImage}
                    packs={packs}
                    scents={set.scents.map(s => ({ id: s.id, name: s.name, image: s.image }))}
                />
            </main>
        </>
    );
}
