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
    const progressPct = limit > 0 ? Math.min(100, Math.round((selected / limit) * 100)) : 0;

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

    return (
        <>
            {/* 1. Pack selector */}
            <section style={{ marginBottom: '2.4rem' }}>
                <div className="ds-step-header">
                    <span className="ds-step-num">STEP 1</span>
                    <h2 className="ds-step-title">Select Your Pack</h2>
                </div>

                <div className="ds-packs-grid">
                    {packs.map((p, idx) => {
                        const active = idx === packIdx;
                        const price = Number(p.price) || 0;
                        const orig = Number(p.originalPrice) || 0;
                        const savePct = orig > price && orig > 0 ? Math.round(((orig - price) / orig) * 100) : 0;
                        const badgeText = p.badge || (savePct > 0 ? `Save ${savePct}%` : null);

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => choosePack(idx)}
                                className={`ds-pack-card ${active ? 'active' : ''}`}
                            >
                                <div className="ds-pack-top">
                                    <span className="ds-pack-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="3" width="6" height="3" rx="1" />
                                            <path d="M10 6h4v2l3 3v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8l3-3V6z" />
                                            <circle cx="12" cy="14" r="2" />
                                        </svg>
                                    </span>

                                    <div className="ds-pack-badges">
                                        {badgeText && <span className="ds-pack-badge">{badgeText}</span>}
                                        <span className={`ds-pack-radio ${active ? 'checked' : ''}`}>
                                            {active ? '✓' : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="ds-pack-mid">
                                    <h3 className="ds-pack-label">{p.label}</h3>
                                    <p className="ds-pack-count">Pick any {p.count} Scents</p>
                                </div>

                                <div className="ds-pack-price-row">
                                    <span className="ds-pack-price">₹{p.price}</span>
                                    {orig > price && <span className="ds-pack-orig">₹{p.originalPrice}</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* 2. Scent chooser */}
            <section style={{ marginBottom: '2.5rem' }}>
                <div className="ds-scents-header-row">
                    <div>
                        <div className="ds-step-header" style={{ marginBottom: '0.25rem' }}>
                            <span className="ds-step-num">STEP 2</span>
                            <h2 className="ds-step-title">Choose Your Scents</h2>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Select {limit} scents to complete your {pack?.label} box
                        </p>
                    </div>

                    <div className="ds-progress-box">
                        <div className="ds-progress-labels">
                            <span style={{ color: '#f3d27a', fontWeight: 700 }}>{selected} / {limit} Selected</span>
                            <span>{complete ? 'Box Ready ✓' : `${limit - selected} left`}</span>
                        </div>
                        <div className="ds-progress-track">
                            <div className="ds-progress-fill" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                </div>

                {scents.length === 0 ? (
                    <p style={{ opacity: 0.7 }}>No scents added to this set yet.</p>
                ) : (
                    <div className="ds-scents-grid">
                        {scents.map(s => {
                            const count = qty[s.id] || 0;
                            const isSelected = count > 0;

                            return (
                                <div key={s.id} className={`ds-scent-card ${isSelected ? 'selected' : ''}`}>
                                    <div className="ds-scent-img-wrap">
                                        {s.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={s.image} alt={s.name} className="ds-scent-img" />
                                        ) : (
                                            <div className="ds-scent-placeholder">✨</div>
                                        )}
                                        <div className="ds-scent-img-Shade" />
                                        {isSelected && (
                                            <span className="ds-scent-qty-badge">×{count}</span>
                                        )}
                                    </div>

                                    <div className="ds-scent-body">
                                        <p className="ds-scent-name">{s.name}</p>

                                        <div className="ds-scent-controls">
                                            <button
                                                type="button"
                                                className="ds-qty-btn"
                                                onClick={() => change(s.id, -1)}
                                                disabled={!count}
                                                aria-label="Decrease"
                                            >
                                                &minus;
                                            </button>
                                            <span className="ds-qty-val">{count}</span>
                                            <button
                                                type="button"
                                                className="ds-qty-btn plus"
                                                onClick={() => change(s.id, 1)}
                                                disabled={selected >= limit}
                                                aria-label="Increase"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Bottom Sticky Order Bar */}
            <section className="ds-bottom-bar">
                <div className="ds-bottom-inner">
                    <div className="ds-bottom-info">
                        <span className="ds-bottom-pack">{pack.label} · ₹{pack.price}</span>
                        <span className="ds-bottom-status">
                            {complete
                                ? '✦ Your discovery box is ready!'
                                : `Pick ${limit - selected} more scent${limit - selected === 1 ? '' : 's'} (${selected}/${limit})`}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!complete}
                        className={`ds-add-cart-btn ${complete ? 'ready' : ''}`}
                    >
                        {added ? 'ADDED TO CART ✓' : 'ADD TO CART →'}
                    </button>
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
                .ds-step-header {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    margin-bottom: 1rem;
                }
                .ds-step-num {
                    padding: 0.22rem 0.65rem;
                    border-radius: 999px;
                    background: rgba(212, 175, 55, 0.14);
                    border: 1px solid rgba(212, 175, 55, 0.45);
                    color: #f3d27a;
                    font-size: 0.66rem;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                }
                .ds-step-title {
                    font-family: var(--font-serif);
                    font-size: 1.3rem;
                    margin: 0;
                    color: #ffffff;
                }
                .ds-packs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 235px));
                    gap: 1rem;
                }
                .ds-pack-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    padding: 1rem 1.1rem;
                    border-radius: 14px;
                    text-align: left;
                    cursor: pointer;
                    background: linear-gradient(160deg, rgba(20, 25, 36, 0.92) 0%, rgba(10, 13, 20, 0.96) 100%);
                    border: 1px solid rgba(212, 175, 55, 0.25);
                    color: #fff;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
                    transition: all 0.25s ease;
                }
                .ds-pack-card:hover {
                    transform: translateY(-3px);
                    border-color: rgba(212, 175, 55, 0.6);
                }
                .ds-pack-card.active {
                    background: linear-gradient(155deg, rgba(212, 175, 55, 0.2) 0%, rgba(14, 18, 27, 0.98) 70%);
                    border: 1.5px solid #e5bd52;
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 22px rgba(212, 175, 55, 0.22);
                }
                .ds-pack-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.7rem;
                }
                .ds-pack-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    border: 1px solid rgba(212, 175, 55, 0.5);
                    background: rgba(212, 175, 55, 0.12);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #f3d27a;
                }
                .ds-pack-icon svg {
                    width: 17px;
                    height: 17px;
                }
                .ds-pack-badges {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                }
                .ds-pack-badge {
                    padding: 0.18rem 0.55rem;
                    border-radius: 999px;
                    background: linear-gradient(90deg, #f7df94, #c99722);
                    color: #111;
                    font-size: 0.62rem;
                    font-weight: 800;
                    letter-spacing: 0.6px;
                    text-transform: uppercase;
                }
                .ds-pack-radio {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 1.5px solid rgba(212, 175, 55, 0.5);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    font-weight: 900;
                    color: #111;
                }
                .ds-pack-radio.checked {
                    background: linear-gradient(180deg, #f7df94, #d4a238);
                    border-color: #f7df94;
                }
                .ds-pack-label {
                    font-family: var(--font-serif);
                    font-size: 1.08rem;
                    font-weight: 700;
                    margin: 0 0 0.15rem 0;
                    color: #fff;
                }
                .ds-pack-count {
                    font-size: 0.76rem;
                    color: var(--color-text-muted);
                    margin: 0 0 0.65rem 0;
                }
                .ds-pack-price-row {
                    margin-top: auto;
                    padding-top: 0.55rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.07);
                    display: flex;
                    align-items: baseline;
                    gap: 0.45rem;
                }
                .ds-pack-price {
                    font-size: 1.18rem;
                    font-weight: 800;
                    color: #f3d27a;
                }
                .ds-pack-orig {
                    font-size: 0.78rem;
                    color: var(--color-text-muted);
                    text-decoration: line-through;
                    opacity: 0.65;
                }

                /* Scents section */
                .ds-scents-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }
                .ds-progress-box {
                    min-width: 220px;
                    background: rgba(16, 20, 30, 0.9);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    padding: 0.6rem 0.9rem;
                    border-radius: 12px;
                }
                .ds-progress-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    margin-bottom: 0.35rem;
                }
                .ds-progress-track {
                    width: 100%;
                    height: 6px;
                    border-radius: 99px;
                    background: rgba(255, 255, 255, 0.08);
                    overflow: hidden;
                }
                .ds-progress-fill {
                    height: 100%;
                    border-radius: 99px;
                    background: linear-gradient(90deg, #f7df94, #c99722);
                    transition: width 0.25s ease;
                }

                .ds-scents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 175px));
                    gap: 1rem;
                }
                .ds-scent-card {
                    display: flex;
                    flex-direction: column;
                    background: linear-gradient(165deg, rgba(20, 25, 36, 0.94) 0%, rgba(10, 13, 20, 0.98) 100%);
                    border: 1px solid rgba(212, 175, 55, 0.25);
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
                    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
                }
                .ds-scent-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(212, 175, 55, 0.55);
                }
                .ds-scent-card.selected {
                    border: 1.5px solid #e5bd52;
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.2);
                }
                .ds-scent-img-wrap {
                    position: relative;
                    aspect-ratio: 1 / 0.92;
                    background: #0c0f16;
                    overflow: hidden;
                }
                .ds-scent-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.45s ease;
                }
                .ds-scent-card:hover .ds-scent-img {
                    transform: scale(1.06);
                }
                .ds-scent-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                }
                .ds-scent-img-Shade {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(10, 13, 20, 0.85) 0%, transparent 50%);
                    pointer-events: none;
                }
                .ds-scent-qty-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    padding: 0.18rem 0.55rem;
                    border-radius: 999px;
                    background: linear-gradient(180deg, #f7df94 0%, #d4a238 100%);
                    color: #111;
                    font-size: 0.7rem;
                    font-weight: 800;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);
                }
                .ds-scent-body {
                    padding: 0.75rem 0.85rem 0.85rem;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }
                .ds-scent-name {
                    font-family: var(--font-serif);
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #fff;
                    margin: 0 0 0.65rem 0;
                    text-align: center;
                    line-height: 1.3;
                }
                .ds-scent-controls {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    border-radius: 999px;
                    padding: 0.2rem;
                }
                .ds-qty-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(212, 175, 55, 0.14);
                    color: #f3d27a;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .ds-qty-btn.plus {
                    background: linear-gradient(180deg, #f7df94 0%, #d4a238 100%);
                    color: #111;
                }
                .ds-qty-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .ds-qty-val {
                    font-size: 0.88rem;
                    font-weight: 800;
                    color: #fff;
                    min-width: 1.4rem;
                    text-align: center;
                }

                /* Bottom Sticky Order Bar */
                .ds-bottom-bar {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 900;
                    background: rgba(10, 13, 20, 0.94);
                    backdrop-filter: blur(12px);
                    border-top: 1px solid rgba(212, 175, 55, 0.4);
                    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.6);
                    padding: 0.8rem 1.25rem;
                }
                .ds-bottom-inner {
                    max-width: 900px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }
                .ds-bottom-info {
                    display: flex;
                    flex-direction: column;
                }
                .ds-bottom-pack {
                    font-family: var(--font-serif);
                    font-size: 1rem;
                    font-weight: 700;
                    color: #f3d27a;
                }
                .ds-bottom-status {
                    font-size: 0.78rem;
                    color: #d1d5db;
                }
                .ds-add-cart-btn {
                    padding: 0.78rem 2rem;
                    border-radius: 999px;
                    border: 1px solid rgba(212, 175, 55, 0.4);
                    background: rgba(212, 175, 55, 0.18);
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.82rem;
                    font-weight: 800;
                    letter-spacing: 1.2px;
                    cursor: not-allowed;
                    transition: all 0.25s ease;
                    white-space: nowrap;
                }
                .ds-add-cart-btn.ready {
                    background: linear-gradient(180deg, #f9e195 0%, #deb041 55%, #bd8819 100%);
                    color: #111111;
                    border-color: #f9e195;
                    cursor: pointer;
                    box-shadow: 0 6px 22px rgba(218, 175, 72, 0.45);
                }
                .ds-add-cart-btn.ready:hover {
                    transform: scale(1.03);
                }
                @media (max-width: 600px) {
                    .ds-packs-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.75rem;
                    }
                    .ds-scents-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.75rem;
                    }
                    .ds-progress-box {
                        width: 100%;
                    }
                    .ds-add-cart-btn {
                        padding: 0.7rem 1.3rem;
                        font-size: 0.75rem;
                    }
                }
            `}} />
        </>
    );
}
