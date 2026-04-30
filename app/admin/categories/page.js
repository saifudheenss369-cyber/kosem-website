'use client';

import { useState, useEffect } from 'react';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', image: '', showOnHome: false });
    const [isLoading, setIsLoading] = useState(false);

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
            if (res.ok) fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Category Management</h1>

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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Image URL (Optional)</label>
                        <input
                            type="text"
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://..."
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                        />
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
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{cat.name}</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>/{cat.slug}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(cat.id)}
                            style={{
                                position: 'absolute', top: '5px', right: '5px',
                                background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '50%',
                                width: '25px', height: '25px', cursor: 'pointer', color: 'red',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Delete"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
