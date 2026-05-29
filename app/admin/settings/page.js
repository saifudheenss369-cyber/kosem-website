
'use client';
import { useState, useEffect } from 'react';

export default function AdminSettings() {
    const [settings, setSettings] = useState({ announcement: '', onlineDiscountPercentage: '0', heritageMedia: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(prev => ({ ...prev, ...data }));
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    const handleSave = async (key, value) => {
        setMsg('Saving...');
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
            if (res.ok) {
                setMsg('Setting updated successfully!');
                setTimeout(() => setMsg(''), 3000);
            } else {
                setMsg('Failed to update.');
            }
        } catch (e) {
            setMsg('Error saving.');
        }
    };

    const handleMediaUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video/');
        const reader = new FileReader();
        
        if (isVideo) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Video is too large. Please upload a video smaller than 5MB.");
                return;
            }
            reader.onload = (event) => {
                setSettings({ ...settings, heritageMedia: event.target.result });
            };
            reader.readAsDataURL(file);
        } else {
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    setSettings({ ...settings, heritageMedia: canvas.toDataURL('image/jpeg', 0.8) });
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) return <p>Loading settings...</p>;

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Site Settings</h1>
            
            {msg && (
                <div style={{ 
                    padding: '1rem', 
                    background: msg.includes('success') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', 
                    color: msg.includes('success') ? '#4caf50' : '#f44336', 
                    borderRadius: '8px', 
                    marginBottom: '1.5rem',
                    border: msg.includes('success') ? '1px solid #4caf50' : '1px solid #f44336'
                }}>
                    {msg}
                </div>
            )}

            <div style={{ background: '#151515', padding: '2rem', borderRadius: '12px', border: '1px solid #222' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-gold)' }}>Announcement Bar</h3>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Enable/Disable Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#0d0d0d', borderRadius: '8px', border: '1px solid #333' }}>
                        <div>
                            <strong style={{ display: 'block', color: '#fff', marginBottom: '0.25rem' }}>Show Announcement Bar</strong>
                            <small style={{ color: '#888' }}>Toggle to show or hide the announcement banner on all pages.</small>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px', cursor: 'pointer', flexShrink: 0 }}>
                            <input
                                type="checkbox"
                                checked={settings.announcementEnabled !== 'false'}
                                onChange={(e) => {
                                    const val = e.target.checked ? 'true' : 'false';
                                    setSettings({ ...settings, announcementEnabled: val });
                                    handleSave('announcementEnabled', val);
                                }}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                background: settings.announcementEnabled !== 'false' ? 'var(--color-gold)' : '#444',
                                borderRadius: '28px',
                                transition: 'background 0.3s'
                            }} />
                            <span style={{
                                position: 'absolute',
                                top: '3px',
                                left: settings.announcementEnabled !== 'false' ? '27px' : '3px',
                                width: '22px', height: '22px',
                                background: '#fff',
                                borderRadius: '50%',
                                transition: 'left 0.3s',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
                            }} />
                        </label>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Announcement Text</label>
                        <textarea 
                            value={settings.announcement}
                            onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                            placeholder="e.g. ⚡ FLAT 5% DISCOUNT ON PREPAID ORDERS"
                            style={{ width: '100%', minHeight: '100px' }}
                        />
                        <small style={{ display: 'block', marginTop: '0.5rem', color: '#888' }}>
                            This text appears at the very top of every page. Keep it short and impactful.
                        </small>
                    </div>

                    <button 
                        onClick={() => handleSave('announcement', settings.announcement)}
                        className="btn-primary"
                        style={{ padding: '0.8rem 2rem', width: 'fit-content' }}
                    >
                        Save Announcement
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '2rem', background: '#151515', padding: '2rem', borderRadius: '12px', border: '1px solid #222' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-gold)' }}>Online Payment Discount</h3>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Discount Percentage (%)</label>
                        <input 
                            type="number"
                            min="0"
                            max="100"
                            value={settings.onlineDiscountPercentage || ''}
                            onChange={(e) => setSettings({ ...settings, onlineDiscountPercentage: e.target.value })}
                            placeholder="e.g. 5"
                            style={{ width: '100%', padding: '0.8rem', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}
                        />
                        <small style={{ display: 'block', marginTop: '0.5rem', color: '#888' }}>
                            Customers will automatically get this percentage off when they select Online Payment. Set to 0 to disable.
                        </small>
                    </div>

                    <button 
                        onClick={() => handleSave('onlineDiscountPercentage', settings.onlineDiscountPercentage)}
                        className="btn-primary"
                        style={{ padding: '0.8rem 2rem', width: 'fit-content' }}
                    >
                        Save Discount
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '2rem', background: '#151515', padding: '2rem', borderRadius: '12px', border: '1px solid #222' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-gold)' }}>Heritage Section Media</h3>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Photo or Video</label>
                        <input 
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            onChange={handleMediaUpload}
                            style={{ width: '100%', padding: '0.8rem', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}
                        />
                        <small style={{ display: 'block', marginTop: '0.5rem', color: '#888' }}>
                            Upload an image or a short video (max 5MB) for the Heritage section. It will automatically crop to fit the container.
                        </small>
                    </div>

                    {settings.heritageMedia && (
                        <div style={{ marginTop: '1rem', border: '1px solid #333', padding: '1rem', borderRadius: '8px', background: '#0a0a0a' }}>
                            <p style={{ marginBottom: '1rem', color: '#aaa', fontSize: '0.9rem' }}>Preview:</p>
                            {settings.heritageMedia.startsWith('data:video') ? (
                                <video src={settings.heritageMedia} autoPlay loop muted playsInline style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px' }} />
                            ) : (
                                <img src={settings.heritageMedia} alt="Heritage Preview" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px' }} />
                            )}
                        </div>
                    )}

                    <button 
                        onClick={() => handleSave('heritageMedia', settings.heritageMedia)}
                        className="btn-primary"
                        style={{ padding: '0.8rem 2rem', width: 'fit-content' }}
                    >
                        Save Media
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', borderLeft: '4px solid #b8860b', background: '#111' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>
                    Tip: Use emojis like ⚡, 🎁, or 🚚 to make the announcement stand out.
                </p>
            </div>
        </div>
    );
}
