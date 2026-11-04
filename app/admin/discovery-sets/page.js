'use client';

import { useState, useEffect } from 'react';

const emptyForm = {
    id: null,
    name: '',
    tagline: '',
    description: '',
    image: '',
    gallery: [],
    packs: [{ label: '', count: 0, price: 0, originalPrice: 0, badge: '' }],
    features: '',
    isActive: true,
    showOnHome: false,
    scents: []
};

const safeParse = (val, fallback) => {
    if (Array.isArray(val)) return val;
    try {
        const p = JSON.parse(val || '[]');
        return Array.isArray(p) ? p : fallback;
    } catch { return fallback; }
};

// Read + downscale image to keep request payload small
const processImage = (file, maxSize = 1200) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted, #aaa)' };
const inputStyle = { width: '100%', padding: '0.7rem 0.8rem', borderRadius: '6px', marginBottom: '1rem', boxSizing: 'border-box' };
const cardStyle = { border: '1px solid var(--color-border, #333)', background: 'rgba(255,255,255,0.03)', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', position: 'relative' };
const ghostBtn = { padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--color-border, #444)', background: 'transparent', color: '#fff', cursor: 'pointer' };
const dashedBtn = { ...ghostBtn, borderStyle: 'dashed', color: '#b8860b', borderColor: '#b8860b', width: '100%', marginBottom: '1.5rem' };
const removeBtn = { position: 'absolute', top: '8px', right: '8px', background: 'rgba(200,0,0,0.15)', color: '#ff6b6b', border: 'none', borderRadius: '4px', padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' };
const sectionTitle = { fontFamily: 'var(--font-serif)', color: '#b8860b', margin: '0 0 1rem 0', fontSize: '1.2rem' };

export default function AdminDiscoverySets() {
    const [sets, setSets] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    const fetchSets = async () => {
        const res = await fetch('/api/discovery-sets');
        if (res.ok) setSets(await res.json());
    };

    useEffect(() => { fetchSets(); }, []);

    const update = (patch) => setFormData(prev => ({ ...prev, ...patch }));

    const handleEdit = (set) => {
        const packs = safeParse(set.packs, []);
        setFormData({
            id: set.id,
            name: set.name,
            tagline: set.tagline || '',
            description: set.description || '',
            image: set.image || '',
            gallery: safeParse(set.gallery, []),
            packs: packs.length ? packs : emptyForm.packs,
            features: set.features || '',
            isActive: set.isActive,
            showOnHome: set.showOnHome,
            scents: (set.scents || []).map(s => ({ name: s.name, image: s.image || '' }))
        });
        setIsEditing(true);
    };

    const handleCreate = () => {
        setFormData({ ...emptyForm, packs: [{ ...emptyForm.packs[0] }], gallery: [], scents: [] });
        setIsEditing(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        update({ image: await processImage(file) });
        e.target.value = '';
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const added = [];
        for (const f of files) added.push(await processImage(f));
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...added] }));
        e.target.value = '';
    };

    const removeGallery = (i) => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, idx) => idx !== i) }));

    const handlePackChange = (index, field, value) => {
        setFormData(prev => {
            const packs = [...prev.packs];
            packs[index] = { ...packs[index], [field]: value };
            return { ...prev, packs };
        });
    };
    const addPackRow = () => setFormData(prev => ({ ...prev, packs: [...prev.packs, { label: '', count: 0, price: 0, originalPrice: 0, badge: '' }] }));
    const removePack = (i) => setFormData(prev => ({ ...prev, packs: prev.packs.filter((_, idx) => idx !== i) }));

    const handleScentChange = (index, field, value) => {
        setFormData(prev => {
            const scents = [...prev.scents];
            scents[index] = { ...scents[index], [field]: value };
            return { ...prev, scents };
        });
    };
    const addScentRow = () => setFormData(prev => ({ ...prev, scents: [...prev.scents, { name: '', image: '' }] }));
    const removeScent = (i) => setFormData(prev => ({ ...prev, scents: prev.scents.filter((_, idx) => idx !== i) }));
    const handleScentImage = async (e, idx) => {
        const file = e.target.files[0];
        if (!file) return;
        handleScentChange(idx, 'image', await processImage(file, 600));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const packs = formData.packs.filter(p => p.label.trim());
        if (!packs.length) { alert('Add at least one pack with a label.'); return; }
        const scents = formData.scents.filter(s => s.name.trim());

        setSaving(true);
        try {
            const method = formData.id ? 'PUT' : 'POST';
            const res = await fetch('/api/discovery-sets', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    packs: JSON.stringify(packs),
                    gallery: JSON.stringify(formData.gallery),
                    scents
                })
            });
            if (res.ok) {
                setIsEditing(false);
                fetchSets();
            } else {
                let msg = 'unknown';
                try { msg = (await res.json()).error || msg; } catch { msg = `HTTP ${res.status}`; }
                alert('Error: ' + msg);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this set?')) return;
        const res = await fetch(`/api/discovery-sets?id=${id}`, { method: 'DELETE' });
        if (res.ok) fetchSets();
        else alert('Delete failed');
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', margin: 0 }}>Discovery Sets</h1>
                <button onClick={handleCreate} className="btn-primary" style={{ padding: '0.6rem 1.2rem' }}>+ Add New Set</button>
            </div>

            <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#111', color: '#b8860b' }}>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Active</th>
                            <th style={{ padding: '1rem' }}>Home</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sets.length === 0 && (
                            <tr><td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#888' }}>No discovery sets yet.</td></tr>
                        )}
                        {sets.map(set => (
                            <tr key={set.id} style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: '0.8rem' }}>{set.name}</td>
                                <td style={{ padding: '0.8rem', textAlign: 'center' }}>{set.isActive ? '✅' : '❌'}</td>
                                <td style={{ padding: '0.8rem', textAlign: 'center' }}>{set.showOnHome ? '✅' : '❌'}</td>
                                <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                                    <button onClick={() => handleEdit(set)} style={{ ...ghostBtn, padding: '0.35rem 0.9rem', marginRight: '0.5rem' }}>Edit</button>
                                    <button onClick={() => handleDelete(set.id)} style={{ ...ghostBtn, padding: '0.35rem 0.9rem', color: '#ff6b6b', borderColor: '#ff6b6b' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditing && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'var(--color-bg-secondary)', width: '960px', maxWidth: '95%', borderRadius: '12px', padding: '2rem', overflowY: 'auto', maxHeight: '90vh', border: '1px solid var(--color-border, #333)' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#b8860b', marginTop: 0, marginBottom: '1.5rem' }}>
                            {formData.id ? 'Edit Set' : 'Create New Set'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            {/* Left column */}
                            <div>
                                <label style={labelStyle}>Name *</label>
                                <input type="text" style={inputStyle} value={formData.name} onChange={e => update({ name: e.target.value })} required />

                                <label style={labelStyle}>Tagline</label>
                                <input type="text" style={inputStyle} value={formData.tagline} onChange={e => update({ tagline: e.target.value })} />

                                <label style={labelStyle}>Description</label>
                                <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={formData.description} onChange={e => update({ description: e.target.value })} />

                                <label style={labelStyle}>Main Image</label>
                                <input type="file" accept="image/*" style={inputStyle} onChange={handleImageUpload} />
                                {formData.image && (
                                    <div style={{ position: 'relative', width: '100px', marginBottom: '1rem' }}>
                                        <img src={formData.image} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                        <button type="button" onClick={() => update({ image: '' })} style={removeBtn}>✕</button>
                                    </div>
                                )}

                                <label style={labelStyle}>Gallery (multiple)</label>
                                <input type="file" accept="image/*" multiple style={inputStyle} onChange={handleGalleryUpload} />
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {formData.gallery.map((img, i) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <img src={img} alt={`g${i}`} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px' }} />
                                            <button type="button" onClick={() => removeGallery(i)} style={{ ...removeBtn, top: '2px', right: '2px', padding: '0 0.4rem', background: 'rgba(0,0,0,0.7)' }}>✕</button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" style={{ width: '18px', height: '18px', margin: 0 }} checked={formData.isActive} onChange={e => update({ isActive: e.target.checked })} />
                                        Active
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" style={{ width: '18px', height: '18px', margin: 0 }} checked={formData.showOnHome} onChange={e => update({ showOnHome: e.target.checked })} />
                                        Show on Home
                                    </label>
                                </div>
                            </div>

                            {/* Right column */}
                            <div>
                                <h4 style={sectionTitle}>Packs</h4>
                                {formData.packs.map((p, idx) => (
                                    <div key={idx} style={cardStyle}>
                                        {formData.packs.length > 1 && <button type="button" onClick={() => removePack(idx)} style={removeBtn}>Remove</button>}
                                        <label style={labelStyle}>Label *</label>
                                        <input type="text" style={inputStyle} placeholder="e.g. Pack of 5" value={p.label} onChange={e => handlePackChange(idx, 'label', e.target.value)} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                                            <div>
                                                <label style={labelStyle}>Count</label>
                                                <input type="number" min="0" style={{ ...inputStyle, marginBottom: 0 }} value={p.count} onChange={e => handlePackChange(idx, 'count', parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Price</label>
                                                <input type="number" min="0" step="0.01" style={{ ...inputStyle, marginBottom: 0 }} value={p.price} onChange={e => handlePackChange(idx, 'price', parseFloat(e.target.value) || 0)} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Original</label>
                                                <input type="number" min="0" step="0.01" style={{ ...inputStyle, marginBottom: 0 }} value={p.originalPrice} onChange={e => handlePackChange(idx, 'originalPrice', parseFloat(e.target.value) || 0)} />
                                            </div>
                                        </div>
                                        <label style={{ ...labelStyle, marginTop: '1rem' }}>Badge</label>
                                        <input type="text" style={{ ...inputStyle, marginBottom: 0 }} placeholder="e.g. Best Value" value={p.badge} onChange={e => handlePackChange(idx, 'badge', e.target.value)} />
                                    </div>
                                ))}
                                <button type="button" onClick={addPackRow} style={dashedBtn}>+ Add Pack</button>

                                <h4 style={sectionTitle}>Scents</h4>
                                {formData.scents.map((s, idx) => (
                                    <div key={idx} style={cardStyle}>
                                        <button type="button" onClick={() => removeScent(idx)} style={removeBtn}>Remove</button>
                                        <label style={labelStyle}>Name</label>
                                        <input type="text" style={inputStyle} value={s.name} onChange={e => handleScentChange(idx, 'name', e.target.value)} />
                                        <label style={labelStyle}>Image</label>
                                        <input type="file" accept="image/*" style={{ ...inputStyle, marginBottom: '0.5rem' }} onChange={e => handleScentImage(e, idx)} />
                                        {s.image && <img src={s.image} alt="scent" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />}
                                    </div>
                                ))}
                                <button type="button" onClick={addScentRow} style={dashedBtn}>+ Add Scent</button>
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-border, #333)', paddingTop: '1.5rem' }}>
                                <button type="button" onClick={() => setIsEditing(false)} style={ghostBtn} disabled={saving}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '0.6rem 2rem' }}>
                                    {saving ? 'Saving...' : (formData.id ? 'Save Changes' : 'Create Set')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
