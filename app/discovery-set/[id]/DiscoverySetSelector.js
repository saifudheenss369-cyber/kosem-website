'use client';

import { useState } from 'react';

// Same admin number used by WhatsAppFloat
const WHATSAPP_NUMBER = '919656867773';

export default function DiscoverySetSelector({ setName, packs, scents }) {
    const [packIdx, setPackIdx] = useState(0);
    const [qty, setQty] = useState({}); // { scentId: count }

    const pack = packs[packIdx];
    const limit = parseInt(pack?.count, 10) || 0;
    const selected = Object.values(qty).reduce((a, b) => a + b, 0);
    const complete = limit > 0 && selected === limit;

    const choosePack = (idx) => {
        setPackIdx(idx);
        setQty({}); // reset choices when pack size changes
    };

    const change = (id, delta) => {
        setQty(prev => {
            const current = prev[id] || 0;
            const next = current + delta;
            if (next < 0) return prev;
            if (delta > 0 && selected >= limit) return prev;
            return { ...prev, [id]: next };
        });
    };

    const orderLink = () => {
        const lines = scents
            .filter(s => qty[s.id])
            .map(s => `- ${s.name} x${qty[s.id]}`)
            .join('\n');
        const msg = `Hello Kosem, I'd like to order the ${setName} (${pack.label} - ${limit} scents, ₹${pack.price}):\n${lines}`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    };

    if (packs.length === 0) {
        return <p style={{ textAlign: 'center', opacity: 0.7 }}>Packs for this set are coming soon.</p>;
    }

    const btn = { width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff', cursor: 'pointer' };

    return (
        <>
            {/* Pack selector */}
            <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>Select a Pack</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {packs.map((p, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => choosePack(idx)}
                            style={{
                                padding: '1.2rem', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                                background: idx === packIdx ? 'rgba(184,134,11,0.15)' : 'transparent',
                                border: `2px solid ${idx === packIdx ? 'var(--color-gold)' : '#333'}`,
                                color: 'inherit'
                            }}
                        >
                            <p style={{ fontWeight: 600, margin: 0 }}>{p.label}</p>
                            <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: '0.25rem 0' }}>{p.count} Scents</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.5rem 0 0' }}>₹{p.price}</p>
                            {p.originalPrice > 0 && <p style={{ textDecoration: 'line-through', fontSize: '0.85rem', opacity: 0.6, margin: 0 }}>₹{p.originalPrice}</p>}
                            {p.badge && <span style={{ display: 'inline-block', background: 'var(--color-gold)', color: '#000', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', marginTop: '0.5rem' }}>{p.badge}</span>}
                        </button>
                    ))}
                </div>
            </section>

            {/* Scent chooser */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>
                    Choose Your Scents <span style={{ fontSize: '1rem', color: 'var(--color-gold)' }}>({selected}/{limit})</span>
                </h2>
                {scents.length === 0 ? (
                    <p style={{ opacity: 0.7 }}>No scents added to this set yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                        {scents.map(s => (
                            <div key={s.id} style={{ background: '#1a1a1a', padding: '0.8rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {s.image && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={s.image} alt={s.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }} />
                                )}
                                <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem', textAlign: 'center' }}>{s.name}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <button type="button" style={btn} onClick={() => change(s.id, -1)} disabled={!qty[s.id]}>-</button>
                                    <span style={{ minWidth: '1rem', textAlign: 'center' }}>{qty[s.id] || 0}</span>
                                    <button type="button" style={btn} onClick={() => change(s.id, 1)} disabled={selected >= limit}>+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Order bar */}
            <section style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(17,17,17,0.97)', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', zIndex: 900, borderTop: '1px solid #333' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.85 }}>
                    {complete ? `${pack.label} · ₹${pack.price}` : `Pick ${limit - selected} more scent${limit - selected === 1 ? '' : 's'}`}
                </span>
                <a
                    href={complete ? orderLink() : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    aria-disabled={!complete}
                    style={{ padding: '0.8rem 2rem', opacity: complete ? 1 : 0.5, pointerEvents: complete ? 'auto' : 'none' }}
                >
                    Order on WhatsApp
                </a>
            </section>
        </>
    );
}
