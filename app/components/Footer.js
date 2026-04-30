'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();
    if (pathname.startsWith('/admin')) return null;

    return (
        <footer style={{ background: '#050505', color: 'var(--color-text-muted)', paddingTop: '3rem', paddingBottom: '2rem', borderTop: '1px solid #222' }}>
            <div className="container footer-grid" style={{ marginBottom: '3rem' }}>

                {/* Brand */}
                <div>
                    <Link href="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                        <img
                            src="/logo.png"
                            alt="Kosem Logo"
                            style={{
                                height: '100px',
                                width: 'auto',
                            }}
                        />
                    </Link>
                    <p style={{ lineHeight: '1.6', fontSize: '0.9rem' }}>
                        Experience the essence of luxury with our premium collection of authentic Attars and Oudh across India.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ color: '#fff', marginBottom: '1.2rem' }}>Shop</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <Link href="/shop" style={{ color: 'var(--color-text-muted)', transition: 'color 0.3s' }}>All Collections</Link>
                        <Link href="/shop?category=Oudh" style={{ color: 'var(--color-text-muted)', transition: 'color 0.3s' }}>Premium Oudh</Link>
                        <Link href="/shop?category=Musk" style={{ color: 'var(--color-text-muted)', transition: 'color 0.3s' }}>Royal Musk</Link>
                        <Link href="/track-order" style={{ color: 'var(--color-text-muted)', transition: 'color 0.3s' }}>Track Order</Link>
                    </div>
                </div>

                {/* Company */}
                <div>
                    <h4 style={{ color: '#fff', marginBottom: '1.2rem' }}>Company</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <Link href="/about" style={{ color: 'var(--color-text-muted)', transition: 'color 0.3s' }}>Our Story</Link>
                        <Link href="/contact" style={{ color: 'var(--color-text-muted)', transition: 'color 0.3s' }}>Contact Us</Link>
                        <Link href="/privacy-policy" style={{ color: 'var(--color-text-muted)', transition: 'color 0.3s' }}>Privacy Policy</Link>
                        <Link href="/terms" style={{ color: 'var(--color-text-muted)', transition: 'color 0.3s' }}>Terms & Conditions</Link>
                        <Link href="/refund-policy" style={{ color: 'var(--color-text-muted)', transition: 'color 0.3s' }}>Refund Policy</Link>
                        <Link href="/shipping-policy" style={{ color: 'var(--color-text-muted)', transition: 'color 0.3s' }}>Shipping Policy</Link>
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <h4 style={{ color: '#fff', marginBottom: '1.2rem' }}>Contact</h4>
                    <p style={{ marginBottom: '0.5rem' }}>support@kosemperfume.com</p>
                    <p style={{ marginBottom: '0.5rem' }}>+91 90746 78278</p>
                    <p>Kottayam, Kerala, India</p>
                </div>
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid #1a1a1a', paddingTop: '2rem', fontSize: '0.85rem' }}>
                <p>&copy; {new Date().getFullYear()} Kosem. All rights reserved.</p>
            </div>
        </footer>
    );
}
