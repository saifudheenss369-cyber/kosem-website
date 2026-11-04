import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../components/Navbar';
import DiscoverySetSelector from './DiscoverySetSelector';

export const dynamic = 'force-dynamic';

// Helper to parse JSON safely (always returns an array)
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
            <main style={{ paddingTop: '120px', paddingBottom: '8rem' }} className="container">
                <Link href="/discovery-set" style={{ textDecoration: 'underline', marginBottom: '2rem', display: 'inline-block' }}>
                    &larr; All Discovery Sets
                </Link>

                {/* Hero */}
                <section style={{ position: 'relative', minHeight: '360px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2.5rem', background: '#111' }}>
                    {heroImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={heroImage} alt={set.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '1.5rem' }}>
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', margin: 0 }}>{set.name}</h1>
                        {set.tagline && <p style={{ fontSize: '1.2rem', color: 'var(--color-gold)', marginTop: '0.5rem' }}>{set.tagline}</p>}
                    </div>
                </section>

                {set.description && (
                    <p style={{ maxWidth: '800px', margin: '0 auto 2.5rem', lineHeight: 1.7, opacity: 0.9, whiteSpace: 'pre-line' }}>{set.description}</p>
                )}

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
