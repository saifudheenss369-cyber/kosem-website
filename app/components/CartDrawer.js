'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CartDrawer() {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            {isCartOpen && <div 
                onClick={() => setIsCartOpen(false)} 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1999 }} 
            />}
            
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '100vw', maxWidth: '420px',
                background: 'var(--color-bg-main)', zIndex: 2000,
                boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column',
                transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderLeft: '1px solid var(--color-border)'
            }}>
                <div style={{ padding: '1.8rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-secondary)' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-gold)' }}>Shopping Bag</h2>
                    <button onClick={() => setIsCartOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '0 2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>👜</div>
                            <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Your bag is empty</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>Discover our collection of premium perfumes and find your signature scent.</p>
                            <button onClick={() => setIsCartOpen(false)} className="btn-primary" style={{ marginTop: '2rem', padding: '0.8rem 2rem' }}>Start Shopping</button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', marginBottom: '1.5rem', gap: '1.2rem', padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: '80px', height: '90px', background: 'var(--color-black)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                    {item.images && <img src={item.images} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ marginBottom: '0.3rem', fontSize: '1rem', color: 'var(--color-text-main)' }}>{item.name}</h4>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--color-gold)', fontWeight: '700', marginBottom: '0.8rem' }}>₹{item.price}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '2px' }}>
                                            <button onClick={() => updateQuantity(item.id, -1)} style={qtyBtnStyle}>-</button>
                                            <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} style={qtyBtnStyle}>+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', boxShadow: '0 -10px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                            <span style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Subtotal</span>
                            <span style={{ fontWeight: '800', color: 'var(--color-gold)', fontSize: '1.3rem' }}>₹{cartTotal}</span>
                        </div>
                        <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '1.1rem', fontSize: '1.1rem', letterSpacing: '2px' }}>
                            Proceed to Checkout
                        </Link>
                        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>Shipping & taxes calculated at checkout</p>
                    </div>
                )}
            </div>
            <style jsx>{`
                @media (max-width: 480px) {
                    .cart-drawer {
                        max-width: 100vw !important;
                    }
                }
            `}</style>
        </>
    );
}

const qtyBtnStyle = {
    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'white', fontSize: '1.1rem'
};
