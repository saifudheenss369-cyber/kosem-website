'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { FaInstagram, FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function Footer() {
    const pathname = usePathname();
    const [year, setYear] = useState(2024);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    if (pathname.startsWith('/admin')) return null;

    return (
        <footer className="main-footer" style={{
            background: 'linear-gradient(to bottom, #050505, #0a0a0a)',
            color: 'var(--color-text-muted)',
            paddingTop: '5rem',
            paddingBottom: '2rem',
            borderTop: '1px solid rgba(184, 134, 11, 0.1)'
        }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>

                {/* Brand & About */}
                <div style={{ maxWidth: '300px' }}>
                    <Link href="/" className="footer-logo-link">
                        <img
                            src="/logo.png"
                            alt="Kosem Logo"
                            style={{
                                height: '120px',
                                width: 'auto',
                                marginBottom: '1.5rem',
                                transition: 'transform 0.5s ease'
                            }}
                        />
                    </Link>
                    <p style={{ lineHeight: '1.8', fontSize: '0.95rem', marginBottom: '2rem' }}>
                        Defining the pinnacle of Indian luxury fragrance. We craft timeless Attars and Oudh for the modern connoisseur.
                    </p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <FaFacebookF size={18} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <FaInstagram size={18} />
                        </a>
                        <a href="https://wa.me/9656867773" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <FaWhatsapp size={18} />
                        </a>
                    </div>
                </div>

                {/* Collections */}
                <div>
                    <h4 className="footer-heading">Collections</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li><Link href="/shop" className="footer-link">All Perfumes</Link></li>
                        <li><Link href="/shop?category=Oudh" className="footer-link">Pure Oudh</Link></li>
                        <li><Link href="/shop?category=Musk" className="footer-link">Royal Musk</Link></li>
                        <li><Link href="/track-order" className="footer-link">Track Your Order</Link></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="footer-heading">Experience</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li><Link href="/about" className="footer-link">Our Heritage</Link></li>
                        <li><Link href="/contact" className="footer-link">Visit Boutique</Link></li>
                        <li><Link href="/shipping-policy" className="footer-link">Shipping & Delivery</Link></li>
                        <li><Link href="/refund-policy" className="footer-link">Returns Policy</Link></li>
                    </ul>
                </div>

                {/* Newsletter/Contact */}
                <div>
                    <h4 className="footer-heading">Contact Us</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a href="mailto:info@kosemperfumes.com" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }} className="footer-contact-link">
                            <span style={{ color: 'var(--color-gold)' }}>✉</span>
                            <span style={{ fontSize: '0.9rem' }}>info@kosemperfumes.com</span>
                        </a>
                        <a href="tel:+919656867773" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }} className="footer-contact-link">
                            <span style={{ color: 'var(--color-gold)' }}>📞</span>
                            <span style={{ fontSize: '0.9rem' }}>+91 96568 67773</span>
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--color-gold)' }}>📍</span>
                            <span style={{ fontSize: '0.9rem' }}>Kottayam, Kerala, India</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-copyright" style={{
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '2.5rem',
                fontSize: '0.8rem',
                letterSpacing: '1px',
                color: 'rgba(255,255,255,0.3)'
            }}>
                <p>&copy; {year} KOSEM LUXURY FRAGRANCES. ALL RIGHTS RESERVED.</p>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .footer-heading {
                    color: #fff;
                    font-family: var(--font-serif);
                    font-size: 1.2rem;
                    margin-bottom: 2rem;
                    position: relative;
                    padding-bottom: 10px;
                }
                .footer-heading::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 30px;
                    height: 2px;
                    background: var(--color-gold);
                }
                
                .footer-link {
                    color: var(--color-text-muted);
                    text-decoration: none;
                    display: inline-block;
                    padding: 0.5rem 0;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                }
                
                .footer-link:hover {
                    color: var(--color-gold);
                    transform: translateX(8px);
                }

                .footer-contact-link {
                    transition: all 0.3s ease;
                }
                .footer-contact-link:hover {
                    color: var(--color-gold) !important;
                    transform: translateX(4px);
                }
                
                .footer-logo-link:hover img {
                    transform: scale(1.05) translateY(-5px);
                }
                
                .social-icon {
                    width: 38px;
                    height: 38px;
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    color: white;
                    text-decoration: none;
                    font-size: 0.75rem;
                    font-weight: bold;
                    transition: all 0.4s ease;
                }
                
                .social-icon:hover {
                    border-color: var(--color-gold);
                    background: var(--color-gold);
                    color: black;
                    box-shadow: 0 0 15px rgba(184, 134, 11, 0.4);
                    transform: translateY(-3px);
                }

                 @media (max-width: 768px) {
                    .main-footer {
                        text-align: left;
                        padding-top: 3rem !important;
                        padding-bottom: 1.5rem !important;
                    }
                    .container {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0rem !important;
                        margin-bottom: 1.5rem !important;
                    }
                    .footer-copyright {
                        padding-top: 1.5rem !important;
                    }
                    .footer-heading {
                        margin-bottom: 0.5rem !important;
                        margin-top: 1rem !important;
                    }
                    .footer-heading::after {
                        left: 0;
                        transform: none;
                    }
                    .social-icon {
                        margin: 0;
                    }
                    .footer-logo-link {
                        margin: 0 0 1.5rem !important;
                        display: block;
                    }
                    /* Ensure bottom copy is also left aligned on mobile */
                    .main-footer > div:last-child {
                        text-align: left !important;
                    }
                }
            `}} />
        </footer>
    );
}

