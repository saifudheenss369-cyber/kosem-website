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
            <main style={{ paddingTop: '120px', paddingBottom: '4rem' }} className="container">
                <h1 style={{ fontFamily: 'var(--font-serif)', textAlign: 'center', marginBottom: '2.5rem' }}>Discovery Sets</h1>

                {sets.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.7 }}>No discovery sets available right now. Please check back soon.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                        {sets.map(set => {
                            const packs = safeParse(set.packs);
                            const prices = packs.map(p => Number(p.price)).filter(n => n > 0);
                            const from = prices.length ? Math.min(...prices) : null;
                            const img = set.image || safeParse(set.gallery)[0];
                            return (
                                <Link key={set.id} href={`/discovery-set/${set.id}`} style={{ display: 'block', background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
                                    <div style={{ aspectRatio: '1 / 1', background: '#111' }}>
                                        {img && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={img} alt={set.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                    <div style={{ padding: '1rem' }}>
                                        <h3 style={{ fontFamily: 'var(--font-serif)', margin: 0 }}>{set.name}</h3>
                                        {set.tagline && <p style={{ fontSize: '0.85rem', opacity: 0.75, margin: '0.3rem 0 0' }}>{set.tagline}</p>}
                                        {from !== null && <p style={{ color: 'var(--color-gold)', fontWeight: 600, margin: '0.6rem 0 0' }}>From ₹{from}</p>}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </>
    );
}
