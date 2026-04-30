'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import CustomPopup from '../components/CustomPopup';

export default function Profile() {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', altPhone: '',
        address: '', city: '', state: '', zip: ''
    });
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();
    const [msg, setMsg] = useState('');
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        fetch('/api/user/profile')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Not logged in');
            })
            .then(data => {
                setFormData(data);
                setLoading(false);
            })
            .catch(() => {
                window.location.href = '/login';
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMsg('');
        const res = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            setMsg('Profile updated successfully!');
        } else {
            setMsg('Failed to update.');
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Geolocation is not supported by your browser', type: 'error' });
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            // Simulated reverse geocoding for demo (or use public API if allowed)
            // For now, we'll just alert exact coords or mock city
            // In real app: fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`)
            setFormData(prev => ({
                ...prev,
                city: 'Auto-Detected City',
                state: 'Auto-Detected State',
                zip: '000000'
            }));
            setPopupConfig({ isOpen: true, title: 'Success', message: 'Location detected! (Mock data filled due to no external API key)', type: 'success' });
        }, () => {
            setPopupConfig({ isOpen: true, title: 'Error', message: 'Unable to retrieve your location', type: 'error' });
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <Navbar />
            <CustomPopup
                isOpen={popupConfig.isOpen}
                onClose={() => setPopupConfig({ ...popupConfig, isOpen: false })}
                title={popupConfig.title}
                message={popupConfig.message}
                type={popupConfig.type}
            />
            <main className="container" style={{ paddingTop: '120px', paddingBottom: '4rem', maxWidth: '600px' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>My Account</h1>

                {msg && <p style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>{msg}</p>}

                <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-gold-dim)' }}>Contact Details</h3>

                        <div className="form-group">
                            <label style={{ color: '#333', fontWeight: '500' }}>Full Name</label>
                            <input type="text" value={formData.name || ''} disabled style={disabledInput} />
                            <small style={{ color: '#888' }}>Cannot change name/email directly.</small>
                        </div>
                        <div className="form-group">
                            <label style={{ color: '#333', fontWeight: '500' }}>Email</label>
                            <input type="email" value={formData.email || ''} disabled style={disabledInput} />
                        </div>

                        <div className="form-group">
                            <label style={{ color: '#333', fontWeight: '500' }}>Phone Number</label>
                            <input name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} style={inputStyle} placeholder="+91..." />
                        </div>
                        <div className="form-group">
                            <label style={{ color: '#333', fontWeight: '500' }}>Alternative Phone (Optional)</label>
                            <input name="altPhone" type="tel" value={formData.altPhone || ''} onChange={handleChange} style={inputStyle} placeholder="Home/Work..." />
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--color-gold-dim)' }}>Address</h3>
                            <button type="button" onClick={detectLocation} style={{ background: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-gold)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                📍 Auto-Detect
                            </button>
                        </div>

                        <div className="form-group">
                            <label style={{ color: '#333', fontWeight: '500' }}>Street Address</label>
                            <textarea name="address" value={formData.address || ''} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px' }} />
                        </div>

                        <div className="form-group">
                            <label style={{ color: '#333', fontWeight: '500' }}>Landmark (Near by)</label>
                            <input name="landmark" type="text" value={formData.landmark || ''} onChange={handleChange} style={inputStyle} placeholder="e.g. Near Grand Mosque" />
                        </div>

                        <div className="address-grid">
                            <div className="form-group">
                                <label style={{ color: '#333', fontWeight: '500' }}>City</label>
                                <input name="city" type="text" value={formData.city || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#333', fontWeight: '500' }}>State</label>
                                <input name="state" type="text" value={formData.state || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div className="form-group">
                                <label style={{ color: '#333', fontWeight: '500' }}>Pincode</label>
                                <input name="zip" type="text" value={formData.zip || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <style>{`
                        .address-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr 1fr;
                            gap: 1rem;
                        }
                        @media (max-width: 600px) {
                            .address-grid {
                                grid-template-columns: 1fr;
                            }
                        }
                    `}</style>

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a href="/my-orders" className="btn-outline" style={{ textAlign: 'center', textDecoration: 'none', color: 'var(--color-gold)', borderColor: 'var(--color-gold)' }}>
                            View My Orders
                        </a>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Save Changes</button>
                        <button type="button" onClick={logout} style={{ ...inputStyle, background: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', cursor: 'pointer', fontWeight: 'bold' }}>
                            Logout
                        </button>
                    </div>
                </form>
            </main >
        </>
    );
}

const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    background: '#fff',
    border: '1px solid #ddd',
    color: '#333',
    borderRadius: '4px',
    marginTop: '0.25rem',
    fontSize: '1rem'
};

const disabledInput = {
    ...inputStyle,
    background: '#f9f9f9',
    color: '#777',
    border: '1px solid #eee',
    cursor: 'not-allowed'
};
