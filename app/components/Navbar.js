'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiShoppingBag, FiHeart, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { cartCount, setIsCartOpen } = useCart();
    const { wishlistCount } = useWishlist();
    const { user, logout } = useAuth();
    const [categories, setCategories] = useState([]);
    const [announcement, setAnnouncement] = useState('⚡ FLAT 5% DISCOUNT ON PREPAID ORDERS');
    const [announcementEnabled, setAnnouncementEnabled] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.announcement) setAnnouncement(data.announcement);
                    if (data.announcementEnabled === 'false') setAnnouncementEnabled(false);
                    else setAnnouncementEnabled(true);
                }
            } catch (e) {
                console.error("Failed to fetch settings", e);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) setCategories(await res.json());
            } catch (e) {
                console.error("Failed to fetch categories", e);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHome = pathname === '/';

    return (
        <>
            {/* Top Banner */}
            {announcementEnabled && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '32px',
                background: 'var(--color-black)',
                color: 'var(--color-gold)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '0.75rem',
                fontWeight: '600',
                letterSpacing: '1.5px',
                zIndex: 1001,
                textTransform: 'uppercase'
            }}>
                {announcement}
            </div>
            )}

            <nav className="main-nav" style={{
                position: 'fixed',
                top: announcementEnabled ? '32px' : '0px',
                left: 0,
                right: 0,
                height: '120px',
                padding: '0 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1000,
                transition: 'all 0.4s ease',
                backgroundColor: scrolled || !isHome ? 'var(--color-bg-main)' : 'transparent',
                backdropFilter: scrolled || !isHome ? 'blur(10px)' : 'none',
                borderBottom: scrolled || !isHome ? '1px solid var(--color-border)' : 'none',
                color: 'var(--color-text-main)',
                boxShadow: scrolled || !isHome ? '0 4px 6px -1px rgba(0,0,0,0.2)' : 'none'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
                    <Link href="/" className="navbar-logo-container" style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '100px', width: '150px' }}>
                        <Image
                            src="/logo.png"
                            alt="Kosem Logo"
                            fill
                            priority
                            className="navbar-logo logo-breathe"
                            style={{
                                objectFit: 'contain',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', marginLeft: 'auto' }}>
                    {user && (
                        <span style={{ color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginRight: '1rem' }}>
                            Hello, {user.name?.split(' ')[0]}
                        </span>
                    )}

                    <Link href="/" className="nav-link">Home</Link>
                    <Link href="/shop" className="nav-link">Collection</Link>

                    {user ? (
                        <Link href="/profile" className="nav-link">Account</Link>
                    ) : (
                        <Link href="/login" className="nav-link">Login</Link>
                    )}

                    <Link href="/about" className="nav-link">Our Story</Link>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                        {/* Wishlist Icon */}
                        <div className="nav-icon-wrapper" onClick={() => router.push('/wishlist')} style={{ cursor: 'pointer' }}>
                            <FiHeart className="nav-icon" style={{ fontSize: '1.3rem' }} />
                            {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
                        </div>

                        {/* Cart Icon */}
                        <div className="nav-icon-wrapper" onClick={() => setIsCartOpen(true)} style={{ cursor: 'pointer' }}>
                            <FiShoppingBag className="nav-icon" style={{ fontSize: '1.3rem' }} />
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </div>
                    </div>
                </div>

                {/* Mobile Icons (Visible only on mobile) */}
                <div className="mobile-icons" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="nav-icon-wrapper" onClick={() => router.push('/wishlist')}>
                        <FiHeart className="nav-icon" />
                        {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
                    </div>
                    <div className="nav-icon-wrapper" onClick={() => setIsCartOpen(true)}>
                        <FiShoppingBag className="nav-icon" />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </div>
                    <div className="nav-icon-wrapper" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <FiMenu className="nav-icon" style={{ fontSize: '1.6rem' }} />
                    </div>
                </div>


                <style dangerouslySetInnerHTML={{ __html: `
        .nav-link {
          text-transform: uppercase;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 2px;
          position: relative;
          color: var(--color-text-main);
          transition: color 0.3s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -8px;
          left: 50%;
          background-color: var(--color-gold);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          transform: translateX(-50%);
        }
        .nav-link:hover {
          color: var(--color-gold);
        }
        .nav-link:hover::after {
          width: 100%;
        }

        .nav-icon-wrapper {
          transition: all 0.3s ease;
          position: relative;
          padding: 8px;
          border-radius: 50%;
        }
        .nav-icon-wrapper:hover {
          background: rgba(184, 134, 11, 0.1);
          transform: translateY(-2px);
          color: var(--color-gold);
        }

        .cart-badge {
            position: absolute;
            top: 2px;
            right: 2px;
            background: var(--color-gold);
            color: var(--color-black);
            font-size: 0.6rem;
            font-weight: 800;
            height: 16px;
            min-width: 16px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid var(--color-bg-main);
            box-shadow: 0 2px 8px rgba(184, 134, 11, 0.4);
        }

        .navbar-logo {
            height: 100px;
            width: auto;
            transition: all 0.3s ease;
            display: block;
        }

        @keyframes logoBreathe {
            0% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.03); opacity: 1; }
            100% { transform: scale(1); opacity: 0.9; }
        }
        .logo-breathe {
            animation: logoBreathe 4s ease-in-out infinite;
        }

        .navbar-logo:hover {
            transform: scale(1.05);
            filter: drop-shadow(0 0 8px rgba(184, 134, 11, 0.3));
        }

        @media (max-width: 1024px) {
            .navbar-logo { height: 80px; }
        }

        @media (max-width: 768px) {
            .main-nav {
                height: 70px !important;
                padding: 0 1rem !important;
                background-color: var(--color-bg-main) !important;
                backdrop-filter: blur(10px) !important;
                border-bottom: 1px solid var(--color-border) !important;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2) !important;
            }
            .nav-link { font-size: 0.75rem; }
            .desktop-menu { display: none !important; }
            .mobile-icons { display: flex !important; }
            .navbar-logo { height: 45px !important; }
            .navbar-logo-container { height: 60px !important; width: 100px !important; }
        }
      `}} />
            </nav>
            {/* Mobile Menu Dropdown (Side Drawer) - Moved outside nav to fix stacking context */
                mobileMenuOpen && (
                    <>
                        <div
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.5)', zIndex: 2000
                            }}
                        />
                        <div className="mobile-menu-drawer">
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '3px', height: '24px', background: 'var(--color-gold)' }}></div>
                                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-main)', letterSpacing: '1px' }}>EXPLORE</span>
                                </div>
                                <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                                    <FiX size={28} />
                                </button>
                            </div>

                            {/* Welcome Section (Moved to Top) */}
                            <div style={{ marginBottom: '2rem' }}>
                                {user ? (
                                    <div style={{ padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--color-gold)' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Welcome Back</p>
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '1.2rem', fontFamily: 'var(--font-serif)', fontWeight: 'bold', color: 'var(--color-text-main)' }}>{user.name}</p>
                                    </div>
                                ) : (
                                    <div style={{ padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--color-gold)' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Welcome Guests</p>
                                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 'bold', textDecoration: 'underline' }}>Login / Register</Link>
                                    </div>
                                )}
                            </div>

                            {/* Main Navigation */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-main-link">Home</Link>
                                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="mobile-main-link">Our Heritage</Link>
                                <Link href="/track-order" onClick={() => setMobileMenuOpen(false)} className="mobile-main-link">Track Order</Link>
                                {user && <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-main-link">My Account</Link>}
                            </div>

                            {/* Category Section in a dedicated box */}
                            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '2px', fontWeight: 'bold', marginTop: 0 }}>Shop Collection</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="mobile-sub-link">All Products</Link>
                                    {categories.map(cat => (
                                        <Link 
                                            key={cat.id} 
                                            href={`/shop?category=${encodeURIComponent(cat.name)}`} 
                                            onClick={() => setMobileMenuOpen(false)} 
                                            className="mobile-sub-link"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Cart Footer */}
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', paddingBottom: '2rem' }}>
                                <div onClick={() => { router.push('/wishlist'); setMobileMenuOpen(false); }} className="mobile-main-link" style={{ marginBottom: '1rem', cursor: 'pointer' }}>
                                    <span>Wishlist</span>
                                    <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>({wishlistCount})</span>
                                </div>
                                <div onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }} className="mobile-main-link" style={{ marginBottom: '1rem', cursor: 'pointer' }}>
                                    <span>Shopping Cart</span>
                                    <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>({cartCount})</span>
                                </div>
                                {user && (
                                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                        <span onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}>Log Out Securely</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <style dangerouslySetInnerHTML={{ __html: `
                        .mobile-menu-drawer {
                            display: flex;
                            flex-direction: column;
                            position: fixed;
                            top: 0;
                            left: 0;
                            bottom: 0;
                            width: 320px;
                            max-width: 85vw;
                            background: var(--color-bg-main);
                            z-index: 2001;
                            padding: 2rem 1.5rem;
                            box-shadow: 2px 0 10px rgba(0,0,0,0.5);
                            animation: slideIn 0.3s ease-out;
                            overflow-y: auto;
                        }
                        @keyframes slideIn {
                            from { transform: translateX(-100%); }
                            to { transform: translateX(0); }
                        }
                        .mobile-menu-drawer a, .mobile-menu-drawer span {
                            text-decoration: none;
                            color: var(--color-text-main);
                            transition: color 0.2s;
                        }
                        .mobile-main-link {
                            font-size: 1.1rem !important;
                            font-weight: 500;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding-bottom: 0.5rem;
                            border-bottom: 1px dashed var(--color-border);
                        }
                        .mobile-main-link::after {
                            content: '→';
                            color: var(--color-gold);
                            opacity: 0.5;
                            transition: all 0.3s;
                        }
                        .mobile-main-link:hover::after {
                            opacity: 1;
                            transform: translateX(5px);
                        }
                        .mobile-main-link:hover {
                            color: var(--color-gold) !important;
                        }
                        .mobile-sub-link {
                            font-size: 1rem !important;
                            color: var(--color-text-muted) !important;
                            display: block;
                            padding-left: 0.5rem;
                            border-left: 2px solid transparent;
                            transition: all 0.3s;
                        }
                        .mobile-sub-link:hover {
                            color: var(--color-text-main) !important;
                            border-left: 2px solid var(--color-gold);
                            padding-left: 1rem;
                        }
                    `}} />
                    </>
                )
            }
        </>
    );
}
