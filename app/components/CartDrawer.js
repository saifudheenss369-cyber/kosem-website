'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CartDrawer() {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (!isCartOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: '100vw', maxWidth: '400px',
            background: 'white', zIndex: 2000,
            boxShadow: '-4px 0 10px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column',
            transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease'
        }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)' }}>Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {cart.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>Your cart is empty.</p>
                ) : (
                    cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', marginBottom: '1.5rem', gap: '1rem' }}>
                            <div style={{ width: '60px', height: '60px', background: '#f5f5f5', borderRadius: '4px' }}>
                                {item.images && <img src={item.images} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ marginBottom: '0.25rem' }}>{item.name}</h4>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>₹{item.price}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button onClick={() => updateQuantity(item.id, -1)} style={qtyBtnStyle}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} style={qtyBtnStyle}>+</button>
                                    <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 'auto', color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {cart.length > 0 && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span>₹{cartTotal}</span>
                    </div>
                    <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                        Proceed to Checkout
                    </Link>
                </div>
            )}
        </div>
    );
}

const qtyBtnStyle = {
    width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ddd', background: 'white', cursor: 'pointer'
};
