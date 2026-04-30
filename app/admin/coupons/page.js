'use client';
import { useState, useEffect } from 'react';

const gold = '#D4AF37';
const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    padding: '1.5rem',
};
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#555', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' };
const inputStyle = { width: '100%', padding: '0.7rem 0.9rem', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', background: '#fafafa', boxSizing: 'border-box', transition: 'border 0.2s' };

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState('');
    const [minOrderValue, setMinOrderValue] = useState('');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    useEffect(() => { fetchCoupons(); }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/coupons');
            const data = await res.json();
            if (data.success) setCoupons(data.coupons);
            else setError(data.error || 'Failed to load coupons');
        } catch { setError('Error fetching coupons'); }
        finally { setLoading(false); }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        setError(null); setSuccess(null); setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, discountType, discountValue, minOrderValue: minOrderValue || null, maxDiscount: maxDiscount || null, usageLimit: usageLimit || null, expiresAt: expiresAt || null, isActive: true })
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('✅ Coupon created successfully!');
                setCode(''); setDiscountValue(''); setMinOrderValue(''); setMaxDiscount(''); setUsageLimit(''); setExpiresAt('');
                fetchCoupons();
            } else setError(data.error || 'Failed to create coupon');
        } catch { setError('An error occurred.'); }
        finally { setIsSubmitting(false); }
    };

    const handleToggleActive = async (id, currentStatus) => {
        const res = await fetch(`/api/admin/coupons/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !currentStatus }) });
        const data = await res.json();
        if (data.success) setCoupons(coupons.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
    };

    const handleDelete = async (id, code) => {
        if (!window.confirm(`Delete coupon "${code}"?`)) return;
        const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) setCoupons(coupons.filter(c => c.id !== id));
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111', margin: 0 }}>🎟️ Coupons Management</h1>
                <p style={{ color: '#888', marginTop: '0.3rem', fontSize: '0.9rem' }}>Create and manage discount coupons for your customers</p>
            </div>

            {/* Alerts */}
            {error && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', color: '#c00', padding: '0.8rem 1.2rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>❌ {error}</div>}
            {success && <div style={{ background: '#f0fff4', border: '1px solid #b2f5c8', color: '#1a7a1a', padding: '0.8rem 1.2rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{success}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>

                {/* Create Form */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #f5f5f5' }}>
                        <div style={{ width: '32px', height: '32px', background: gold, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✨</div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111' }}>Create New Coupon</h2>
                    </div>

                    <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Coupon Code *</label>
                            <input required type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER10"
                                style={{ ...inputStyle, fontWeight: '700', letterSpacing: '0.08em', color: '#111' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Type *</label>
                                <select value={discountType} onChange={e => setDiscountType(e.target.value)} style={{ ...inputStyle }}>
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Value *</label>
                                <input required type="number" min="1" max={discountType === 'PERCENTAGE' ? '100' : undefined}
                                    value={discountValue} onChange={e => setDiscountValue(e.target.value)}
                                    placeholder={discountType === 'PERCENTAGE' ? '10' : '50'} style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Min Order Value (Optional)</label>
                            <input type="number" min="0" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} placeholder="₹ 500" style={inputStyle} />
                        </div>

                        {discountType === 'PERCENTAGE' && (
                            <div>
                                <label style={labelStyle}>Max Discount Cap (Optional)</label>
                                <input type="number" min="0" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} placeholder="e.g. ₹100 max off" style={inputStyle} />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Usage Limit</label>
                                <input type="number" min="1" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder="e.g. 50" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Expiry Date</label>
                                <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} style={inputStyle} />
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} style={{
                            padding: '0.85rem', background: isSubmitting ? '#ccc' : gold, color: isSubmitting ? '#666' : '#111',
                            border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem',
                            transition: 'background 0.2s', letterSpacing: '0.02em'
                        }}>
                            {isSubmitting ? '⏳ Creating...' : '🎟️ Create Coupon'}
                        </button>
                    </form>
                </div>

                {/* Coupons List */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #f5f5f5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: '32px', height: '32px', background: '#f0f4ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>📋</div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111' }}>Existing Coupons</h2>
                        </div>
                        <span style={{ background: '#f5f5f5', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: '#555' }}>
                            {coupons.length} total
                        </span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>Loading...</div>
                    ) : coupons.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#bbb' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎟️</div>
                            <p>No coupons created yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {coupons.map(coupon => (
                                <div key={coupon.id} style={{
                                    border: `1.5px solid ${coupon.isActive ? '#e8f5e9' : '#fce4ec'}`,
                                    borderRadius: '10px', padding: '1rem 1.2rem',
                                    background: coupon.isActive ? '#fafffe' : '#fff9f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', flexWrap: 'wrap', gap: '0.5rem'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                                            <span style={{ fontWeight: '800', letterSpacing: '0.1em', fontSize: '1rem', color: '#111' }}>{coupon.code}</span>
                                            <span style={{
                                                fontSize: '0.7rem', padding: '0.15rem 0.6rem', borderRadius: '20px', fontWeight: '700',
                                                background: coupon.isActive ? '#e8f5e9' : '#fce4ec',
                                                color: coupon.isActive ? '#2e7d32' : '#c62828'
                                            }}>
                                                {coupon.isActive ? 'ACTIVE' : 'DISABLED'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: '#555', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                            <span>💰 {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}</span>
                                            {coupon.minOrderValue && <span>🛒 Min ₹{coupon.minOrderValue}</span>}
                                            {coupon.maxDiscount && <span>🔝 Max ₹{coupon.maxDiscount}</span>}
                                            <span>📊 {coupon.usedCount}/{coupon.usageLimit || '∞'} used</span>
                                            {coupon.expiresAt && <span>📅 Exp: {new Date(coupon.expiresAt).toLocaleDateString('en-IN')}</span>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleToggleActive(coupon.id, coupon.isActive)} style={{
                                            padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                                            background: coupon.isActive ? '#fff3e0' : '#e8f5e9', color: coupon.isActive ? '#e65100' : '#2e7d32'
                                        }}>
                                            {coupon.isActive ? '⏸ Disable' : '▶ Enable'}
                                        </button>
                                        <button onClick={() => handleDelete(coupon.id, coupon.code)} style={{
                                            padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                                            background: '#fff0f0', color: '#c00'
                                        }}>
                                            🗑 Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
