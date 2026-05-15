
'use client';
import { useState, useEffect } from 'react';

export default function AdminSettings() {
    const [settings, setSettings] = useState({ announcement: '' });
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

            <div style={{ marginTop: '2rem', padding: '1rem', borderLeft: '4px solid #b8860b', background: '#111' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>
                    Tip: Use emojis like ⚡, 🎁, or 🚚 to make the announcement stand out.
                </p>
            </div>
        </div>
    );
}
