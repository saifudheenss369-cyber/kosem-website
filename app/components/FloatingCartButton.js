'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingCartButton() {
    const { cart, cartTotal } = useCart();
    const pathname = usePathname();

    // Don't show on checkout page, admin pages, or if cart is empty
    if (cart.length === 0 || pathname === '/checkout' || pathname.startsWith('/admin')) return null;

    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div style={{
            display: 'block', // Forces active display if logic allows it to render
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            zIndex: 1500,
            animation: 'slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}>
            <style jsx global>{`
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (min-width: 769px) {
                    .mobile-cart-btn-wrapper { display: none !important; }
                }
            `}</style>
            
            <Link href="/checkout" className="mobile-cart-btn-wrapper" style={{
                background: '#111',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8rem 1.5rem',
                borderRadius: '100px',
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{cartTotal}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
                    <span>Checkout</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </div>
            </Link>
        </div>
    );
}
