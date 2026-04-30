'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState } from 'react';

export default function Contact() {
    const [msg, setMsg] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setMsg('Thank you for contacting us. We will get back to you shortly.');
        e.target.reset();
    };

    return (
        <>
            <Navbar />
            <main className="container" style={{ paddingTop: '120px', paddingBottom: '4rem', maxWidth: '800px' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '2rem', textAlign: 'center' }}>Contact Us</h1>

                {msg && <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--color-gold)', padding: '1rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--color-gold)' }}>{msg}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

                    {/* Info */}
                    <div>
                        <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>Get in Touch</h3>
                        <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                            Have questions about our premium Attars? Need help with an order? We are here to assist you.
                        </p>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <strong style={{ color: '#fff' }}>Email:</strong>
                            <p style={{ color: 'var(--color-text-muted)' }}>support@kosemperfume.com</p>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <strong style={{ color: '#fff' }}>Phone:</strong>
                            <p style={{ color: 'var(--color-text-muted)' }}>+91 90746 78278</p>
                        </div>
                        <div>
                            <strong style={{ color: '#fff' }}>Address:</strong>
                            <p style={{ color: 'var(--color-text-muted)' }}>Kosem Perfume, Kottayam, Kerala - 686016</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ background: 'var(--color-bg-secondary)', border: '1px solid #eaeaea', padding: '2rem', borderRadius: '8px' }}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ color: '#111', fontWeight: 'bold' }}>Name</label>
                            <input type="text" placeholder="Enter your name" required style={{ width: '100%', padding: '0.8rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: '#111', borderRadius: '4px', marginTop: '0.5rem' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ color: '#111', fontWeight: 'bold' }}>Email</label>
                            <input type="email" placeholder="Enter your email address" required style={{ width: '100%', padding: '0.8rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: '#111', borderRadius: '4px', marginTop: '0.5rem' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ color: '#111', fontWeight: 'bold' }}>Message</label>
                            <textarea placeholder="How can we help you?" required rows="4" style={{ width: '100%', padding: '0.8rem', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: '#111', borderRadius: '4px', marginTop: '0.5rem' }}></textarea>
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>Send Message</button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
