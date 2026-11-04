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
                            padding: '0.4rem 0.95rem',
                            borderRadius: '999px',
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid rgba(184, 134, 11, 0.25)',
                            color: 'var(--color-gold)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                        }}
                    >
                        <span>&larr;</span> All Discovery Sets
                    </Link>
                </div>

                {/* Minimal Header Matched to Site Theme */}
                <header
                    style={{
                        textAlign: 'center',
                        padding: '1.6rem 1.25rem',
                        marginBottom: '2rem',
                        borderRadius: '14px',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid rgba(184, 134, 11, 0.22)',
                        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    <span
                        style={{
                            display: 'block',
                            color: 'var(--color-gold)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '2.5px',
                            textTransform: 'uppercase',
                            marginBottom: '0.4rem'
                        }}
                    >
                        Customize Your Fragrance Box
                    </span>

                    <h1
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(1.55rem, 3vw, 2.1rem)',
                            margin: 0,
                            color: 'var(--color-text-main)'
                        }}
                    >
                        {set.name}
                    </h1>

                    {set.tagline && (
                        <p style={{ fontSize: '0.88rem', color: 'var(--color-gold)', margin: '0.3rem 0 0', fontWeight: 500 }}>
                            {set.tagline}
                        </p>
                    )}

                    <div
                        style={{
                            width: '38px',
                            height: '2px',
                            background: 'var(--color-gold)',
                            margin: '0.7rem auto'
                        }}
                    />

                    {set.description && (
                        <p
                            style={{
                                maxWidth: '620px',
                                margin: '0 auto',
                                fontSize: '0.84rem',
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
