'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTrash, FaPlus, FaCheck, FaTimes, FaEdit, FaGripVertical } from 'react-icons/fa';

export default function BannersAdmin() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [mobileImageUrl, setMobileImageUrl] = useState('');
    const [link, setLink] = useState('');
    const [order, setOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Drag state
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/admin/banners');
            if (!res.ok) throw new Error('Failed to fetch banners');
            const data = await res.json();
            setBanners(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrUpdateBanner = async (e) => {
        e.preventDefault();
        if (!imageUrl) return alert('Image URL/Base64 is required');

        setSubmitting(true);
        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, imageUrl, mobileImageUrl, link, order: parseInt(order), isActive })
            });

            if (!res.ok) throw new Error(`Failed to ${editingId ? 'update' : 'add'} banner`);

            resetForm();
            fetchBanners();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setImageUrl('');
        setMobileImageUrl('');
        setLink('');
        setOrder(banners.length + 1);
        setIsActive(true);
    };

    const handleEditClick = (banner) => {
        setEditingId(banner.id);
        setTitle(banner.title || '');
        setImageUrl(banner.imageUrl || '');
        setMobileImageUrl(banner.mobileImageUrl || '');
        setLink(banner.link || '');
        setOrder(banner.order || 0);
        setIsActive(banner.isActive);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete banner');
            if (editingId === id) resetForm();
            fetchBanners();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/admin/banners/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (!res.ok) throw new Error('Failed to update status');
            fetchBanners();
        } catch (err) {
            alert(err.message);
        }
    };

    const processBannerImage = (file, isMobile = false) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const TARGET_WIDTH = isMobile ? 800 : 1600;
                
                // Calculate dynamic height to maintain aspect ratio perfectly
                const scale = TARGET_WIDTH / img.width;
                canvas.width = TARGET_WIDTH;
                canvas.height = img.height * scale;
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const b64 = await processBannerImage(file, false);
                setImageUrl(b64);
            } catch (err) {
                console.error('Error compressing desktop banner:', err);
                alert('Failed to process image');
            }
        }
    };

    const handleMobileImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const b64 = await processBannerImage(file, true);
                setMobileImageUrl(b64);
            } catch (err) {
                console.error('Error compressing mobile banner:', err);
                alert('Failed to process image');
            }
        }
    };

    // --- Drag and Drop Logic ---
    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: make the drag ghost somewhat transparent
        e.target.style.opacity = '0.5';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, targetIndex) => {
        e.preventDefault();

        if (draggedItemIndex === null || draggedItemIndex === targetIndex) {
            setDraggedItemIndex(null);
            return;
        }

        const newBanners = [...banners];
        const draggedItem = newBanners[draggedItemIndex];

        // Remove item from old position
        newBanners.splice(draggedItemIndex, 1);
        // Insert at new position
        newBanners.splice(targetIndex, 0, draggedItem);

        // Update local state immediately for snappy UI
        setBanners(newBanners);
        setDraggedItemIndex(null);

        // Save new order to backend
        try {
            // Optimistically doing this sequentially; a bulk update API would be better
            // but this works for a small number of banners.
            for (let i = 0; i < newBanners.length; i++) {
                if (newBanners[i].order !== i + 1) {
                    await fetch(`/api/admin/banners/${newBanners[i].id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ order: i + 1 })
                    });
                }
            }
            fetchBanners(); // Re-fetch to guarantee sync
        } catch (error) {
            console.error('Error saving banner order:', error);
            alert('Failed to save the new order. Refreshing...');
            fetchBanners();
        }
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedItemIndex(null);
    };

    if (loading) return <div>Loading banners...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>
                Manage Offer Banners
            </h1>

            {/* Add/Edit Banner Form */}
            <div style={{ background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    {editingId ? 'Edit Banner' : 'Add New Banner'}
                    {editingId && (
                        <button onClick={resetForm} style={{ fontSize: '14px', color: '#0066cc', background: 'none', border: 'none', cursor: 'pointer' }}>
                            Cancel Edit
                        </button>
                    )}
                </h2>
                <form onSubmit={handleAddOrUpdateBanner} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: 'var(--color-gold)' }}>Desktop Banner Image * (16:9 ratio recommended)</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Paste Desktop Image URL or Base64"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                style={{ flex: 1, minWidth: '250px', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                            />
                            <span style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>OR</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ padding: '8px' }}
                            />
                        </div>
                        {imageUrl && (
                            <img src={imageUrl} alt="Desktop Preview" style={{ marginTop: '10px', maxHeight: '100px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        )}
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: 'var(--color-gold)' }}>Mobile Banner Image (Optional - falls back to desktop if empty)</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Paste Mobile Image URL or Base64"
                                value={mobileImageUrl}
                                onChange={(e) => setMobileImageUrl(e.target.value)}
                                style={{ flex: 1, minWidth: '250px', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                            />
                            <span style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>OR</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleMobileImageUpload}
                                style={{ padding: '8px' }}
                            />
                        </div>
                        {mobileImageUrl && (
                            <img src={mobileImageUrl} alt="Mobile Preview" style={{ marginTop: '10px', maxHeight: '100px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Title (Optional)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Link URL (Optional)</label>
                        <input
                            type="text"
                            placeholder="/shop or /product/123"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Display Order</label>
                        <input
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'end', paddingBottom: '10px' }}>
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <label htmlFor="isActive" style={{ fontWeight: '500' }}>Active (Show on Home Page)</label>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <button
                            type="submit"
                            disabled={submitting || !imageUrl}
                            style={{
                                padding: '10px 20px',
                                background: editingId ? '#0066cc' : '#333',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {editingId ? <FaEdit /> : <FaPlus />}
                            {submitting ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Banner' : 'Add Banner')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Banners List */}
            <div style={{ background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Current Banners ({banners.length})</h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '15px' }}>You can drag and drop rows to reorder them.</p>

                {banners.length === 0 ? (
                    <p>No banners found.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '12px', width: '40px' }}></th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Image</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Details</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Order</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banners.map((banner, index) => (
                                    <tr
                                        key={banner.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                        style={{
                                            borderBottom: '1px solid var(--color-border)',
                                            backgroundColor: draggedItemIndex === index ? '#f0f0f0' : 'transparent',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <td style={{ padding: '12px', color: 'var(--color-text-muted)', cursor: 'grab', textAlign: 'center' }}>
                                            <FaGripVertical />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{ fontSize: '10px', display: 'block', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Desktop</span>
                                                    <img src={banner.imageUrl} alt={banner.title || 'Banner'} style={{ width: '100px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                                                </div>
                                                {banner.mobileImageUrl && (
                                                    <div style={{ textAlign: 'center' }}>
                                                        <span style={{ fontSize: '10px', display: 'block', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Mobile</span>
                                                        <img src={banner.mobileImageUrl} alt={banner.title || 'Mobile Banner'} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{banner.title || 'No Title'}</div>
                                            {banner.link && <div style={{ fontSize: '12px', color: '#0066cc', marginTop: '4px' }}>🔗 {banner.link}</div>}
                                            {banner.mobileImageUrl ? (
                                                <div style={{ fontSize: '11px', color: '#28a745', marginTop: '4px' }}>✓ Has Mobile Image</div>
                                            ) : (
                                                <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>⚠️ Using Desktop for Mobile</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>{banner.order}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleToggleActive(banner.id, banner.isActive)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    border: 'none',
                                                    background: banner.isActive ? '#d4edda' : '#f8d7da',
                                                    color: banner.isActive ? '#155724' : '#721c24',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {banner.isActive ? (
                                                    <><FaCheck style={{ marginRight: '4px' }} /> Active</>
                                                ) : (
                                                    <><FaTimes style={{ marginRight: '4px' }} /> Inactive</>
                                                )}
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleEditClick(banner)}
                                                style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', fontSize: '18px', marginRight: '15px' }}
                                                title="Edit Banner"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '18px' }}
                                                title="Delete Banner"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
