'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { getSmartId } from '@/app/utils/smartId';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In real app, fetch with auth token or checks session
        // For demo, we might need a dedicated endpoint that uses the cookie.
        // Assuming /api/orders/mine endpoint exists or we use filtering on client (not secure but okay for demo)
        // Let's create a dedicated secured endpoint /api/orders/mine
        fetch('/api/orders/mine')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Unauthorized');
            })
            .then(data => setOrders(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Navbar />
            <main className="container" style={{ paddingTop: '120px' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>My Orders</h1>

                {loading ? <p>Loading...</p> : (
                    orders.length === 0 ? (
                        <p>You haven't placed any orders yet. <Link href="/shop" style={{ color: 'var(--color-gold)' }}>Start Shopping</Link></p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {orders.map(order => (
                                <div key={order.id} style={{ background: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                                        <strong>Order #{getSmartId(order)}</strong>
                                        <span style={{ color: 'var(--color-gold)' }}>{order.status}</span>
                                    </div>
                                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p>Total: ₹{order.total}</p>
                                    <div style={{ marginTop: '1rem' }}>
                                        {order.items.map(item => (
                                            <div key={item.id} style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                                {item.product?.name} x {item.quantity}
                                            </div>
                                        ))}
                                    </div>
                                    {/* If order has Shipment ID, show the direct live tracking link */}
                                    {order.shiprocketShipmentId ? (
                                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Courier: <strong>{order.courierName || 'Assigned'}</strong></span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>Shipment ID: <strong>{order.shiprocketShipmentId}</strong></span>
                                            </div>
                                            <Link
                                                href={`/track-order?id=${order.id}`}
                                                className="btn-primary"
                                                style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem', color: 'var(--color-text-main)', textDecoration: 'none', display: 'inline-block' }}
                                            >
                                                Track Live Order
                                            </Link>
                                        </div>
                                    ) : (
                                        /* If order is NOT completed and NO shipment is assigned yet, show a general Track Order button */
                                        order.status !== 'COMPLETED' && order.status !== 'DELIVERED' && (
                                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eaeaea', textAlign: 'right' }}>
                                                <Link
                                                    href={`/track-order?id=${order.id}`}
                                                    className="btn-outline"
                                                    style={{ display: 'inline-block', padding: '0.4rem 1.2rem', fontSize: '0.9rem', color: 'var(--color-gold)', borderColor: 'var(--color-gold)' }}
                                                >
                                                    Track Order
                                                </Link>
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main >
        </>
    );
}
