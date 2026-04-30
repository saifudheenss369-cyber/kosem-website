'use client';

import { useState, useEffect } from 'react';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', originalPrice: '', stock: '', category: '', occasions: '', images: '', rating: '5.0', fakeRatingCount: 0, isBestSeller: false, isInCarousel: false, showStockCount: true, size: '', variantGroupId: '', similarProductIds: '', gallery: '', isMainVariant: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    const uniqueVariantGroups = Array.from(new Set(products.map(p => p.variantGroupId).filter(Boolean)));

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await fetch('/api/categories');
        if (res.ok) setCategories(await res.json());
    };

    const fetchProducts = async () => {
        const res = await fetch('/api/products');
        if (res.ok) {
            const data = await res.json();
            setProducts(data);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            originalPrice: product.originalPrice || '',
            stock: product.stock,
            category: product.category,
            occasions: product.occasions || '',
            images: product.images || '',
            rating: product.rating,
            fakeRatingCount: product.fakeRatingCount || 0,
            isBestSeller: product.isBestSeller,
            isInCarousel: product.isInCarousel || false,
            showStockCount: product.showStockCount !== false,
            size: product.size || '',
            variantGroupId: product.variantGroupId || '',
            similarProductIds: product.similarProductIds || '',
            gallery: product.gallery || '',
            isMainVariant: Boolean(product.isMainVariant)
        });
        setEditingId(product.id);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setFormData({ name: '', description: '', price: '', originalPrice: '', stock: '', category: 'Attar', occasions: '', images: '', rating: '5.0', fakeRatingCount: 0, isBestSeller: false, isInCarousel: false, showStockCount: true, size: '', variantGroupId: '', similarProductIds: '', gallery: '', isMainVariant: false });
        setEditingId(null);
        setIsEditing(true);
    };

    const occasionOptions = [
        "12 Hours", "Daily Wear", "Date Night", "Home Fragrance",
        "Luxury Gifting", "Office", "Summer", "Wedding", "Winter"
    ];

    const handleOccasionChange = (occ) => {
        let currentOccasions = formData.occasions ? formData.occasions.split(',').map(s => s.trim()).filter(Boolean) : [];
        if (currentOccasions.includes(occ)) {
            currentOccasions = currentOccasions.filter(o => o !== occ);
        } else {
            currentOccasions.push(occ);
        }
        setFormData({ ...formData, occasions: currentOccasions.join(', ') });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = editingId ? `/api/products?id=${editingId}` : '/api/products';
            const method = editingId ? 'PUT' : 'POST';

            // Include ID in body for PUT
            const body = { ...formData };
            if (editingId) body.id = editingId;

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                alert(editingId ? 'Product Updated' : 'Product Created');
                setIsEditing(false);
                fetchProducts();
            } else {
                alert('Operation Failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        setDeletingId(id);
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        if (res.ok) fetchProducts();
        setDeletingId(null);
    };

    const processImage = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const TARGET_SIZE = 800; // Perfect Square
                canvas.width = TARGET_SIZE;
                canvas.height = TARGET_SIZE;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
                const scale = Math.max(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
                const x = (TARGET_SIZE / scale - img.width) / 2;
                const y = (TARGET_SIZE / scale - img.height) / 2;
                ctx.drawImage(img, x, y, img.width, img.height, 0, 0, TARGET_SIZE, TARGET_SIZE);
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
        setFormData(prev => ({ ...prev, images: b64 }));
    };

    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        
        let currentGallery = [];
        try { if (formData.gallery) currentGallery = JSON.parse(formData.gallery); } 
        catch { if (formData.gallery) currentGallery = [formData.gallery]; }

        for (const file of files) {
            const b64 = await processImage(file);
            currentGallery.push(b64);
        }
        setFormData(prev => ({ ...prev, gallery: JSON.stringify(currentGallery) }));
    };

    const removeGalleryImage = (index) => {
        try {
            let currentGallery = JSON.parse(formData.gallery);
            currentGallery.splice(index, 1);
            setFormData(prev => ({ ...prev, gallery: JSON.stringify(currentGallery) }));
        } catch (err) {
            setFormData(prev => ({ ...prev, gallery: '' }));
        }
    };

    // Filter logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-black)', margin: 0 }}>Product Inventory</h1>
                <button
                    onClick={handleCreate}
                    className="btn-primary"
                    style={{ padding: '0.8rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    + Add New Product
                </button>
            </div>

            {/* QUICK FILTERS */}
            <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <input
                    type="text"
                    placeholder="Search products by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '1rem' }}
                />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '1rem', minWidth: '200px' }}
                >
                    <option value="ALL">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* PRODUCT TABLE */}
            <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold' }}>Product Name</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold' }}>Category</th>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold' }}>Price</th>
                            <th style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 'bold' }}>Stock</th>
                            <th style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 'bold' }}>Social Proof</th>
                            <th style={{ padding: '1.2rem', textAlign: 'right', fontWeight: 'bold' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No products match your filters.
                                </td>
                            </tr>
                        ) : filteredProducts.map((p, idx) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                                <td style={{ padding: '1.2rem', fontWeight: '500' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {p.images ? (
                                            <img src={p.images} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', background: '#eee', borderRadius: '4px' }}></div>
                                        )}
                                        {p.name}
                                        {p.isBestSeller && <span style={{ fontSize: '0.6rem', background: 'var(--color-gold)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>BEST</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '1.2rem', color: 'var(--color-text-muted)' }}>{p.category}</td>
                                <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>₹{p.price}</td>
                                <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        background: p.stock > 10 ? '#e8f5e9' : p.stock > 0 ? '#fff3e0' : '#ffebee',
                                        color: p.stock > 10 ? '#2e7d32' : p.stock > 0 ? '#ef6c00' : '#c62828',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {p.stock} units
                                    </span>
                                </td>
                                <td style={{ padding: '1.2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                    ⭐ {p.rating} ({p.fakeRatingCount})
                                </td>
                                <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                    <button onClick={() => handleEdit(p)} style={{ marginRight: '1rem', color: 'var(--color-black)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        disabled={deletingId === p.id}
                                        style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: deletingId === p.id ? 'wait' : 'pointer', opacity: deletingId === p.id ? 0.5 : 1 }}
                                    >
                                        {deletingId === p.id ? '⏳' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PREMIUM EDIT MODAL */}
            {isEditing && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="animate-fade-up" style={{
                        background: 'var(--color-bg-secondary)', width: '900px', maxWidth: '95%', maxHeight: '90vh',
                        borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                    }}>
                        {/* Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0 }}>
                                {editingId ? 'Edit Product Details' : 'Add New Product'}
                            </h2>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', lineHeight: '1', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* Form Body - Scrollable */}
                        <div style={{ padding: '2rem', overflowY: 'auto' }}>
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                                {/* LEFT COLUMN */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Product Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="5" />
                                    </div>
                                    <div className="form-group">
                                        <label>Main Product Image</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ flex: 1, padding: '0.4rem' }} />
                                        </div>
                                        {formData.images && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <img src={formData.images} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                                            </div>
                                        )}
                                        <small style={{ color: 'var(--color-text-muted)' }}>Main thumbnail image shown on shop page.</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Additional Gallery Images</label>
                                        <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} style={{ padding: '0.4rem' }} />
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                            {(() => {
                                                try {
                                                    const gal = JSON.parse(formData.gallery);
                                                    return Array.isArray(gal) ? gal.map((img, idx) => (
                                                        <div key={idx} style={{ position: 'relative' }}>
                                                            <img src={img} alt={`Gallery ${idx}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
                                                            <button type="button" onClick={() => removeGalleryImage(idx)} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>X</button>
                                                        </div>
                                                    )) : null;
                                                } catch { return null; }
                                            })()}
                                        </div>
                                        <small style={{ color: 'var(--color-text-muted)' }}>Upload multiple photos for the product page carousel.</small>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" checked={formData.isBestSeller} onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })} id="bestSeller" style={{ width: '20px', height: '20px' }} />
                                        <label htmlFor="bestSeller" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Mark as Best Seller</label>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" checked={formData.isInCarousel} onChange={e => setFormData({ ...formData, isInCarousel: e.target.checked })} id="inCarousel" style={{ width: '20px', height: '20px' }} />
                                        <label htmlFor="inCarousel" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Show in Moving Carousel</label>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" checked={formData.isInHero} onChange={e => setFormData({ ...formData, isInHero: e.target.checked })} id="inHero" style={{ width: '20px', height: '20px' }} />
                                        <label htmlFor="inHero" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Show in Main Hero Slider</label>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" checked={formData.showStockCount} onChange={e => setFormData({ ...formData, showStockCount: e.target.checked })} id="showStock" style={{ width: '20px', height: '20px' }} />
                                        <label htmlFor="showStock" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Show Exact Stock Count on Product Page</label>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Price (₹)</label>
                                            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Original Price (Strike)</label>
                                            <input type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label>Inventory Stock</label>
                                            <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                <option value="">Select...</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Occasions</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                            {occasionOptions.map(occ => {
                                                const currentOccs = formData.occasions ? formData.occasions.split(',').map(s => s.trim()) : [];
                                                const isChecked = currentOccs.includes(occ);
                                                return (
                                                    <label key={occ} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleOccasionChange(occ)}
                                                            style={{ width: 'auto' }}
                                                        />
                                                        {occ}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <small style={{ color: 'var(--color-text-muted)' }}>Select all that apply.</small>
                                    </div>

                                    <div style={{ padding: '1.5rem', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-gold)' }}>Variations & Links</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div className="form-group">
                                                <label>Size / Variant Name</label>
                                                <input type="text" placeholder="e.g., 6ml, 12ml" value={formData.size || ''} onChange={e => setFormData({ ...formData, size: e.target.value })} />
                                                <small style={{ color: 'var(--color-text-muted)' }}>The label for this variant. Leave blank if standard product.</small>
                                            </div>
                                            <div className="form-group">
                                                <label>Variant Group ID</label>
                                                <input type="text" list="variant-group-list" placeholder="e.g., rose-attar-group" value={formData.variantGroupId || ''} onChange={e => setFormData({ ...formData, variantGroupId: e.target.value })} autocomplete="off" />
                                                <datalist id="variant-group-list">
                                                    {uniqueVariantGroups.map(vg => <option key={vg} value={vg} />)}
                                                </datalist>
                                                <small style={{ color: 'var(--color-text-muted)' }}>Products with the exact same ID here will show as size options on the product page. Or type a new one.</small>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input type="checkbox" checked={formData.isMainVariant} onChange={e => setFormData({ ...formData, isMainVariant: e.target.checked })} id="isMainVariant" style={{ width: '20px', height: '20px' }} />
                                                <label htmlFor="isMainVariant" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Mark as Main Variant (Default on Home Page)</label>
                                            </div>
                                            <div className="form-group">
                                                <label>Similar Products</label>
                                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e0e0e0', padding: '10px', borderRadius: '6px', background: 'var(--color-bg-secondary)' }}>
                                                    {products.filter(p => p.id !== editingId).map(p => {
                                                        const currentSimilars = formData.similarProductIds ? formData.similarProductIds.split(',').filter(Boolean) : [];
                                                        const isLinked = currentSimilars.includes(p.id.toString());
                                                        return (
                                                            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' }}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isLinked} 
                                                                    onChange={() => {
                                                                        let newSimilars = [...currentSimilars];
                                                                        if (isLinked) newSimilars = newSimilars.filter(id => id !== p.id.toString());
                                                                        else newSimilars.push(p.id.toString());
                                                                        setFormData({ ...formData, similarProductIds: newSimilars.join(',') });
                                                                    }}
                                                                />
                                                                {p.name} {p.size ? `(${p.size})` : ''} - ₹{p.price}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                                <small style={{ color: 'var(--color-text-muted)' }}>Select products to show in "Similar Products".</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.5rem', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-gold)' }}>Social Proof Engineering</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="form-group">
                                                <label>Real Rating (Select)</label>
                                                <div style={{ display: 'flex', gap: '5px', cursor: 'pointer' }}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span
                                                            key={star}
                                                            onClick={() => setFormData({ ...formData, rating: star })}
                                                            style={{
                                                                fontSize: '1.5rem',
                                                                color: star <= Number(formData.rating) ? '#FFD700' : '#e0e0e0',
                                                                transition: 'color 0.2s'
                                                            }}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <small style={{ color: 'var(--color-text-muted)' }}>Current: {formData.rating} Stars</small>
                                            </div>
                                            <div className="form-group">
                                                <label>Fake Review Count</label>
                                                <input type="number" value={formData.fakeRatingCount} onChange={e => setFormData({ ...formData, fakeRatingCount: parseInt(e.target.value) })} />
                                                <small style={{ color: 'var(--color-text-muted)' }}>Shows as "(123 reviews)"</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                    <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.8 : 1 }}>
                                        {isSubmitting ? '⏳ Processing...' : editingId ? 'Save Changes' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <style>{`
                        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; color: #333; }
                        .form-group input, .form-group textarea, .form-group select {
                            width: 100%; padding: 0.8rem; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 1rem; transition: all 0.2s;
                        }
                    `}</style>
                </div >
            )
            }
        </div >
    );
}
