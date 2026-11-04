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
            <section style={{ marginBottom: '2.2rem' }}>
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
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
                        <div className="ds-step-header" style={{ marginBottom: '0.2rem' }}>
                            <span className="ds-step-num">STEP 2</span>
                            <h2 className="ds-step-title">Choose Your Scents</h2>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Select {limit} scents to complete your {pack?.label} box
                        </p>
                    </div>

                    <div className="ds-progress-box">
                        <div className="ds-progress-labels">
                            <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{selected} / {limit} Selected</span>
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
                        className={`btn-primary ds-add-cart-btn ${complete ? 'ready' : ''}`}
                    >
                        {added ? 'Added ✓' : 'Add to Cart →'}
                    </button>
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
                .ds-step-header {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    margin-bottom: 0.9rem;
                }
                .ds-step-num {
                    padding: 0.2rem 0.6rem;
                    border-radius: 4px;
                    background: rgba(184, 134, 11, 0.12);
                    border: 1px solid rgba(184, 134, 11, 0.35);
                    color: var(--color-gold);
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                }
                .ds-step-title {
                    font-family: var(--font-serif);
                    font-size: 1.25rem;
                    margin: 0;
                    color: var(--color-text-main);
                }
                .ds-packs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(195px, 230px));
                    gap: 0.9rem;
                }
                .ds-pack-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    padding: 0.95rem 1rem;
                    border-radius: 12px;
                    text-align: left;
                    cursor: pointer;
                    background: var(--color-bg-secondary);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    color: var(--color-text-main);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                    transition: all 0.25s ease;
                }
                .ds-pack-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(184, 134, 11, 0.45);
                }
                .ds-pack-card.active {
                    border: 1.5px solid var(--color-gold);
                    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
                }
                .ds-pack-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.65rem;
                }
                .ds-pack-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 7px;
                    border: 1px solid rgba(184, 134, 11, 0.35);
                    background: rgba(184, 134, 11, 0.08);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-gold);
                }
                .ds-pack-icon svg {
                    width: 16px;
                    height: 16px;
                }
                .ds-pack-badges {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .ds-pack-badge {
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                    background: rgba(184, 134, 11, 0.15);
                    border: 1px solid rgba(184, 134, 11, 0.35);
                    color: var(--color-gold);
                    font-size: 0.6rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                .ds-pack-radio {
                    width: 19px;
                    height: 19px;
                    border-radius: 50%;
                    border: 1.5px solid rgba(184, 134, 11, 0.45);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.68rem;
                    font-weight: 900;
                    color: var(--color-black);
                }
                .ds-pack-radio.checked {
                    background: var(--color-gold);
                    border-color: var(--color-gold);
                }
                .ds-pack-label {
                    font-family: var(--font-serif);
                    font-size: 1.02rem;
                    font-weight: 600;
                    margin: 0 0 0.15rem 0;
                    color: var(--color-text-main);
                }
                .ds-pack-count {
                    font-size: 0.74rem;
                    color: var(--color-text-muted);
                    margin: 0 0 0.6rem 0;
                }
                .ds-pack-price-row {
                    margin-top: auto;
                    padding-top: 0.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    display: flex;
                    align-items: baseline;
                    gap: 0.4rem;
                }
                .ds-pack-price {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--color-gold);
                }
                .ds-pack-orig {
                    font-size: 0.75rem;
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
                    gap: 0.9rem;
                    margin-bottom: 1.15rem;
                }
                .ds-progress-box {
                    min-width: 210px;
                    background: var(--color-bg-secondary);
                    border: 1px solid rgba(184, 134, 11, 0.25);
                    padding: 0.55rem 0.85rem;
                    border-radius: 10px;
                }
                .ds-progress-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.73rem;
                    color: var(--color-text-muted);
                    margin-bottom: 0.35rem;
                }
                .ds-progress-track {
                    width: 100%;
                    height: 5px;
                    border-radius: 99px;
                    background: rgba(255, 255, 255, 0.08);
                    overflow: hidden;
                }
                .ds-progress-fill {
                    height: 100%;
                    border-radius: 99px;
                    background: var(--color-gold);
                    transition: width 0.25s ease;
                }

                .ds-scents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(145px, 170px));
                    gap: 0.9rem;
                }
                .ds-scent-card {
                    display: flex;
                    flex-direction: column;
                    background: var(--color-bg-secondary);
                    border: 1px solid rgba(184, 134, 11, 0.2);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
                    transition: transform 0.25s ease, border-color 0.25s ease;
                }
                .ds-scent-card:hover {
                    transform: translateY(-3px);
                    border-color: rgba(184, 134, 11, 0.45);
                }
                .ds-scent-card.selected {
                    border: 1.5px solid var(--color-gold);
                }
                .ds-scent-img-wrap {
                    position: relative;
                    aspect-ratio: 1 / 1;
                    background: var(--color-bg-main);
                    overflow: hidden;
                }
                .ds-scent-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.4s ease;
                }
                .ds-scent-card:hover .ds-scent-img {
                    transform: scale(1.04);
                }
                .ds-scent-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                .ds-scent-qty-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    padding: 0.15rem 0.5rem;
                    border-radius: 999px;
                    background: var(--color-gold);
                    color: var(--color-black);
                    font-size: 0.68rem;
                    font-weight: 800;
                }
                .ds-scent-body {
                    padding: 0.7rem 0.75rem 0.8rem;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }
                .ds-scent-name {
                    font-family: var(--font-serif);
                    font-size: 0.92rem;
                    font-weight: 600;
                    color: var(--color-text-main);
                    margin: 0 0 0.6rem 0;
                    text-align: center;
                    line-height: 1.3;
                }
                .ds-scent-controls {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: var(--color-bg-main);
                    border: 1px solid rgba(184, 134, 11, 0.25);
                    border-radius: 6px;
                    padding: 0.18rem;
                }
                .ds-qty-btn {
                    width: 26px;
                    height: 26px;
                    border-radius: 4px;
                    border: none;
                    background: rgba(184, 134, 11, 0.12);
                    color: var(--color-gold);
                    font-size: 0.95rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .ds-qty-btn.plus {
                    background: var(--color-gold);
                    color: var(--color-black);
                }
                .ds-qty-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .ds-qty-val {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--color-text-main);
                    min-width: 1.3rem;
                    text-align: center;
                }

                /* Bottom Sticky Order Bar */
                .ds-bottom-bar {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 900;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid rgba(184, 134, 11, 0.3);
                    padding: 0.75rem 1.2rem;
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
                    font-size: 0.98rem;
                    font-weight: 600;
                    color: var(--color-gold);
                }
                .ds-bottom-status {
                    font-size: 0.76rem;
                    color: var(--color-text-muted);
                }
                .ds-add-cart-btn {
                    padding: 0.7rem 1.8rem;
                    border-radius: 6px;
                    font-size: 0.78rem;
                    opacity: 0.45;
                    cursor: not-allowed;
                    white-space: nowrap;
                }
                .ds-add-cart-btn.ready {
                    opacity: 1;
                    cursor: pointer;
                }
                @media (max-width: 600px) {
                    .ds-packs-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.7rem;
                    }
                    .ds-scents-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.7rem;
                    }
                    .ds-progress-box {
                        width: 100%;
                    }
                    .ds-add-cart-btn {
                        padding: 0.65rem 1.2rem;
                        font-size: 0.72rem;
                    }
                }
            `}} />
        </>
    );
}
