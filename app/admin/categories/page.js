'use client';

import { useState, useEffect } from 'react';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', image: '', showOnHome: false });
    const [isLoading, setIsLoading] = useState(false);

    // Edit modal state
    const [editModal, setEditModal] = useState(false);
    const [editData, setEditData] = useState({ id: null, name: '', image: '', showOnHome: false });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await fetch('/api/categories');
        if (res.ok) {
            const data = await res.json();
            setCategories(data);
        }
    };

    const processImage = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const TARGET_SIZE = 800;
                canvas.width = TARGET_SIZE;
                canvas.height = TARGET_SIZE;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
                const scale = Math.min(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (TARGET_SIZE - w) / 2;
                const y = (TARGET_SIZE - h) / 2;
                ctx.drawImage(img, 0, 0, img.width, img.height, x, y, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const b64 = await processImage(file);
        setFormData(prev => ({ ...prev, image: b64 }));
    };

    const handleEditImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const b64 = await processImage(file);
        setEditData(prev => ({ ...prev, image: b64 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({ name: '', image: '', showOnHome: false });
                fetchCategories();
                alert('Category Added');
            } else {
                alert('Failed to add category');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const openEdit = (cat) => {
        setEditData({ id: cat.id, name: cat.name, image: cat.image || '', showOnHome: cat.showOnHome || false });
        setEditModal(true);
    };

    const handleEditSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });

            if (res.ok) {
                fetchCategories();
                setEditModal(false);
            } else {
                alert('Failed to update category');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleShowOnHome = async (cat) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: cat.id, showOnHome: !cat.showOnHome }),
            });
            if (res.ok) fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This might break products using this category.')) return;

        try {
            const res = await fetch(`/api/categories?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Category Management</h1>

            {/* Add New Category Form */}
            <div style={{ background: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginBottom: '1rem' }}>Add New Category</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. Premium Oudh"
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category Image</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: '#fff' }}
                            />
                            {formData.image && (
                                <img src={formData.image} alt="Preview" style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                            )}
                        </div>
                    </div>
                    <div style={{ paddingBottom: '0.8rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.showOnHome}
                                onChange={e => setFormData({ ...formData, showOnHome: e.target.checked })}
                                style={{ width: '18px', height: '18px' }}
                            />
                            Show on Home
                        </label>
                    </div>
                    <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '0.8rem 2rem', height: '46px' }}>
                        {isLoading ? 'Adding...' : 'Add Category'}
                    </button>
                </form>
            </div>

            {/* Category Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {categories.map(cat => (
                    <div key={cat.id} style={{ background: 'var(--color-bg-secondary)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative' }}>
                        <div style={{ height: '120px', background: 'var(--color-bg-secondary)', position: 'relative' }}>
                            {cat.image ?
                                <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--color-text-muted)', fontSize: '2rem' }}>📦</div>
                            }
                            <div style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
                                <label style={{
                                    background: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: '12px',
                                    fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                                    border: cat.showOnHome ? '1px solid green' : '1px solid #ddd'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={cat.showOnHome || false}
                                        onChange={() => toggleShowOnHome(cat)}
                                    />
                                    Home
                                </label>
                            </div>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.3rem 0' }}>{cat.name}</h4>
                            <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>/{cat.slug}</p>
                            {/* Edit Button */}
                            <button
                                onClick={() => openEdit(cat)}
                                style={{
                                    width: '100%',
                                    padding: '0.4rem',
                                    background: 'var(--color-gold)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                ✏️ Edit
                            </button>
                        </div>
                        {/* Delete Button */}
                        <button
                            onClick={() => handleDelete(cat.id)}
                            style={{
                                position: 'absolute', top: '5px', right: '5px',
                                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,0,0,0.5)', borderRadius: '50%',
                                width: '25px', height: '25px', cursor: 'pointer', color: 'red',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1rem', fontWeight: 'bold'
                            }}
                            title="Delete"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editModal && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setEditModal(false)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)', zIndex: 1000
                        }}
                    />
                    {/* Modal Box */}
                    <div style={{
                        position: 'fixed',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'var(--color-bg-main)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '500px',
                        zIndex: 1001,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>✏️ Edit Category</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600' }}>Category Name</label>
                            <input
                                type="text"
                                value={editData.name}
                                onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'var(--color-bg-secondary)', color: 'var(--color-text-main)' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600' }}>Category Image</label>
                            {editData.image && (
                                <img src={editData.image} alt="Current" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.8rem', border: '1px solid var(--color-border)' }} />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageUpload}
                                style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'var(--color-bg-secondary)', color: 'var(--color-text-main)' }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>New image upload cheythal existing image replace aakum</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={editData.showOnHome}
                                    onChange={e => setEditData(prev => ({ ...prev, showOnHome: e.target.checked }))}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span style={{ fontSize: '0.9rem' }}>Show on Home Page</span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleEditSave}
                                disabled={isSaving}
                                className="btn-primary"
                                style={{ flex: 1, padding: '0.8rem' }}
                            >
                                {isSaving ? 'Saving...' : '✅ Save Changes'}
                            </button>
                            <button
                                onClick={() => setEditModal(false)}
                                style={{
                                    flex: 1, padding: '0.8rem',
                                    background: 'transparent',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
