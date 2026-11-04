'use client';

import { useState } from 'react';
import { useCart } from '../../context/CartContext';

export default function DiscoverySetSelector({ setId, setName, image, packs, scents }) {
    const [packIdx, setPackIdx] = useState(0);
    const [qty, setQty] = useState({}); // { scentId: count }
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

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

    const handleAddToCart = () => {
        if (!complete) return;
        const chosen = scents.filter(s => qty[s.id]).map(s => ({ name: s.name, qty: qty[s.id] }));
        const summary = chosen.map(s => `${s.name} x${s.qty}`).join(', ');
        addToCart({
            id: `ds-${setId}-${pack.label}-${summary}`,
            discoverySetId: setId,
            packLabel: pack.label,
            scents: chosen,
            scentSummary: summary,
            name: `${setName} - ${pack.label}`,
            price: parseFloat(pack.price),
            images: image || ''
        });
        setQty({});
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (packs.length === 0) {
        return <p style={{ textAlign: 'center', opacity: 0.7 }}>Packs for this set are coming soon.</p>;
    }

    const btn = {
        width: '26px',
        height: '26px',
        borderRadius: '6px',
        border: '1px solid rgba(212,175,55,0.4)',
        background: 'rgba(212,175,55,0.1)',
        color: '#f3d27a',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '0.9rem'
    };

    return (
        <>
            {/* Pack selector */}
            <section style={{ marginBottom: '2.2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '0.9rem' }}>
                    1. Select a Pack
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 210px))', gap: '0.9rem' }}>
                    {packs.map((p, idx) => {
                        const active = idx === packIdx;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => choosePack(idx)}
                                style={{
                                    padding: '0.95rem 1rem',
                                    borderRadius: '12px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    background: active
                                        ? 'linear-gradient(145deg, rgba(212,175,55,0.18), rgba(15,18,26,0.95))'
                                        : 'rgba(18, 22, 31, 0.85)',
                                    border: active ? '1.5px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: active ? '0 8px 24px rgba(212,175,55,0.18)' : 'none',
                                    color: 'inherit',
                                    position: 'relative',
                                    transition: 'all 0.25s ease'
                                }}
                            >
                                {p.badge && (
                                    <span style={{
                                        display: 'inline-block',
                                        background: 'linear-gradient(90deg, #f5d77f, #c99722)',
                                        color: '#111',
                                        fontSize: '0.62rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.6px',
                                        padding: '2px 7px',
                                        borderRadius: '99px',
                                        marginBottom: '0.4rem'
                                    }}>
                                        {p.badge}
                                    </span>
                                )}
                                <p style={{ fontWeight: 700, fontSize: '0.98rem', margin: 0, color: '#fff' }}>{p.label}</p>
                                <p style={{ fontSize: '0.78rem', opacity: 0.75, margin: '0.15rem 0 0.5rem' }}>{p.count} Scents Included</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f3d27a' }}>₹{p.price}</span>
                                    {p.originalPrice > 0 && (
                                        <span style={{ textDecoration: 'line-through', fontSize: '0.78rem', opacity: 0.55 }}>₹{p.originalPrice}</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Scent chooser */}
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '0.9rem' }}>
                    2. Choose Your Scents <span style={{ fontSize: '0.95rem', color: 'var(--color-gold)' }}>({selected}/{limit})</span>
                </h2>
                {scents.length === 0 ? (
                    <p style={{ opacity: 0.7 }}>No scents added to this set yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 155px))', gap: '0.9rem' }}>
                        {scents.map(s => {
                            const count = qty[s.id] || 0;
                            return (
                                <div
                                    key={s.id}
                                    style={{
                                        background: count > 0 ? 'rgba(212,175,55,0.1)' : 'rgba(18, 22, 31, 0.85)',
                                        border: count > 0 ? '1px solid rgba(212,175,55,0.65)' : '1px solid rgba(255,255,255,0.08)',
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {s.image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={s.image}
                                            alt={s.name}
                                            style={{ width: '68px', height: '68px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }}
                                        />
                                    )}
                                    <p style={{ fontSize: '0.84rem', fontWeight: 600, margin: '0 0 0.55rem', textAlign: 'center', lineHeight: 1.3 }}>
                                        {s.name}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginTop: 'auto' }}>
                                        <button type="button" style={{ ...btn, opacity: count ? 1 : 0.4 }} onClick={() => change(s.id, -1)} disabled={!count}>-</button>
                                        <span style={{ minWidth: '1.1rem', textAlign: 'center', fontSize: '0.88rem', fontWeight: 700 }}>{count}</span>
                                        <button type="button" style={{ ...btn, opacity: selected >= limit ? 0.4 : 1 }} onClick={() => change(s.id, 1)} disabled={selected >= limit}>+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Order bar */}
            <section style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(12, 15, 22, 0.96)',
                backdropFilter: 'blur(10px)',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                zIndex: 900,
                borderTop: '1px solid rgba(212,175,55,0.3)'
            }}>
                <span style={{ fontSize: '0.88rem', opacity: 0.9 }}>
                    {complete ? `${pack.label} · ₹${pack.price}` : `Pick ${limit - selected} more scent${limit - selected === 1 ? '' : 's'}`}
                </span>
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!complete}
                    className="btn-primary"
                    style={{
                        padding: '0.7rem 1.8rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        opacity: complete ? 1 : 0.5,
                        cursor: complete ? 'pointer' : 'not-allowed'
                    }}
                >
                    {added ? 'Added ✓' : 'Add to Cart'}
                </button>
            </section>
        </>
    );
}
