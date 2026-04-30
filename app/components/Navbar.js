'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiShoppingBag, FiHeart } from 'react-icons/fi';
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
                ⚡ FLAT 5% DISCOUNT ON PREPAID ORDERS
            </div>

            <nav style={{
                position: 'fixed',
                top: '32px',
                left: 0,
                right: 0,
                height: '120px', // Standardized height
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
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        {/* The logo naturally centers in the flex container */}
                        <img
                            src="/logo.png"
                            alt="Kosem Logo"
                            className="navbar-logo logo-breathe"
                            style={{
                                filter: 'none',
                                transition: 'filter 0.3s ease'
                            }}
                        />
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {user && (
                        <span style={{ color: 'var(--color-gold)', fontSize: '0.9rem', fontWeight: '500' }}>Hello, {user.name?.split(' ')[0]}</span>
                    )}

                    <Link href="/" className="nav-link">Home</Link>
                    <Link href="/shop" className="nav-link">Collection</Link>

                    {user ? (
                        <Link href="/profile" className="nav-link">My Account</Link>
                    ) : (
                        <Link href="/login" className="nav-link">Login</Link>
                    )}

                    <Link href="/about" className="nav-link">Our Story</Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginLeft: '1rem', flexShrink: 0 }}>
                        {/* Wishlist Icon */}
                        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }} onClick={() => router.push('/wishlist')}>
                            <FiHeart className="nav-icon" />
                            {wishlistCount > 0 && (
                                <span className="cart-badge">
                                    {wishlistCount}
                                </span>
                            )}
                        </span>

                        {/* Cart Icon */}
                        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative' }} onClick={() => setIsCartOpen(true)}>
                            <FiShoppingBag className="nav-icon" />
                            {cartCount > 0 && (
                                <span className="cart-badge">
                                    {cartCount}
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Mobile Icons (Visible only on mobile) */}
                <div className="mobile-icons">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', marginRight: '1.2rem' }} onClick={() => router.push('/wishlist')}>
                        <FiHeart className="nav-icon" />
                        {wishlistCount > 0 && (
                            <span className="cart-badge">
                                {wishlistCount}
                            </span>
                        )}
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', marginRight: '1rem' }} onClick={() => setIsCartOpen(true)}>
                        <FiShoppingBag className="nav-icon" />
                        {cartCount > 0 && (
                            <span className="cart-badge">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <div className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        ☰
                    </div>
                </div>


                <style dangerouslySetInnerHTML={{ __html: `
        .nav-link {
          text-transform: uppercase;
          font-size: 0.875rem;
          letter-spacing: 1px;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -5px;
          left: 0;
          background-color: var(--color-gold);
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }

        .mobile-icons {
            display: none;
            align-items: center;
        }
        .mobile-toggle {
            font-size: 1.5rem;
            cursor: pointer;
        }
        .mobile-menu {
            display: none;
        }

        @keyframes logoBreathe {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        .logo-breathe {
            animation: logoBreathe 3s ease-in-out infinite;
        }

        .navbar-logo {
            height: 100px;
            width: auto;
            margin-top: 5px;
            transition: height 0.3s ease, filter 0.3s ease;
            position: relative;
            z-index: 1;
        }

        .mobile-only {
            display: none !important;
        }

        .nav-icon {
            font-size: 22px;
        }

        .cart-badge {
            position: absolute;
            top: -8px;
            right: -10px;
            background: var(--color-gold);
            color: var(--color-black);
            font-size: 0.65rem;
            font-weight: bold;
            height: 18px;
            min-width: 18px;
            border-radius: 9px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 4px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        @media (max-width: 1024px) {
            .navbar-logo {
                height: 80px;
            }
        }

        @media (max-width: 768px) {
            .navbar-logo {
                height: 60px;
                top: 0px !important;
            }
            .desktop-menu {
                display: none !important;
            }
            .mobile-only {
                display: flex !important;
            }
            .mobile-icons {
                display: flex;
            }
            .nav-icon {
                font-size: 24px;
            }
            .mobile-menu {
                display: flex;
                flex-direction: column;
                position: fixed;
                top: 0;
                left: 0;
                bottom: 0;
                width: 280px;
                background: var(--color-bg-main);
                z-index: 1002;
                padding: 2rem;
                box-shadow: 2px 0 10px rgba(0,0,0,0.5);
                animation: slideIn 0.3s ease-out;
                overflow-y: auto;
            }
            @keyframes slideIn {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
            .mobile-menu a, .mobile-menu span {
                text-decoration: none;
                color: var(--color-black);
                font-size: 1rem;
                transition: color 0.2s;
            }
            .mobile-menu a:hover {
                color: var(--color-gold);
            }
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-black)' }}>MENU</span>
                                <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: 'var(--color-black)', lineHeight: '1' }}>&times;</button>
                            </div>

                            {/* Welcome Section (Moved to Top) */}
                            <div style={{ marginBottom: '2rem' }}>
                                {user ? (
                                    <div style={{ padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--color-gold)' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Welcome Back</p>
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '1.2rem', fontFamily: 'var(--font-serif)', fontWeight: 'bold', color: 'var(--color-black)' }}>{user.name}</p>
                                    </div>
                                ) : (
                                    <div style={{ padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--color-gold)' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Welcome Guests</p>
                                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-black)', fontWeight: 'bold', textDecoration: 'underline' }}>Login / Register</Link>
                                    </div>
                                )}
                            </div>

                            {/* Main Navigation */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-main-link">Home</Link>
                                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="mobile-main-link">Our Heritage</Link>
                                {user && <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-main-link">My Account</Link>}
                            </div>

                            {/* Category Section in a dedicated box */}
                            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '2px', fontWeight: 'bold', marginTop: 0 }}>Shop Collection</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="mobile-sub-link">All Products</Link>
                                    <Link href="/shop?category=Unisex" onClick={() => setMobileMenuOpen(false)} className="mobile-sub-link">Unisex Blends</Link>
                                    <Link href="/shop?category=Men" onClick={() => setMobileMenuOpen(false)} className="mobile-sub-link">For Him</Link>
                                    <Link href="/shop?category=Women" onClick={() => setMobileMenuOpen(false)} className="mobile-sub-link">For Her</Link>
                                    <Link href="/shop?category=Gift%20Sets" onClick={() => setMobileMenuOpen(false)} className="mobile-sub-link">Luxury Gift Sets</Link>
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
                            color: var(--color-black);
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
                            color: var(--color-black) !important;
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
