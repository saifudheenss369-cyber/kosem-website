'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { getSmartId } from '@/app/utils/smartId';

export default function TrackOrder() {
    const searchParams = useSearchParams();
    const initialOrderId = searchParams.get('id') || '';

    const [orderId, setOrderId] = useState(initialOrderId);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);



    useEffect(() => {
        if (initialOrderId) {
            fetchOrderById(initialOrderId);
        }
    }, [initialOrderId]);

    const fetchOrderById = async (id) => {
        setLoading(true);
        setError(null);
        setOrder(null);
        try {
            const res = await fetch(`/api/orders/track?id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                setError('Order not found or invalid ID');
            }
        } catch (err) {
            setError('Something went wrong checking the order.');
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        fetchOrderById(orderId);
    };



    return (
        <>
            <Navbar />
            <main className="container" style={{ paddingTop: '120px', minHeight: '60vh', paddingBottom: '4rem' }}>
                {!order && (
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        {/* Track Order Section */}
                        <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                            <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem', textAlign: 'center' }}>Track Your Order</h2>
                            <form onSubmit={handleTrack} style={{ margin: '0 auto' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter Order ID (e.g. 35)"
                                        value={orderId}
                                        onChange={e => setOrderId(e.target.value)}
                                        required
                                        style={{ flex: 1, padding: '0.8rem', border: '1px solid #444', background: '#111', color: 'white', borderRadius: '4px' }}
                                    />
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? '...' : 'Track'}
                                    </button>
                                </div>
                            </form>
                            {error && <p style={{ color: '#ff4444', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
                        </div>
                    </div>
                )}

                {order && (
                    <div style={{ maxWidth: '1000px', margin: '3rem auto', textAlign: 'left', background: '#121212', padding: '2.5rem', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                        <div style={{ borderBottom: '1px solid #333', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Order #{getSmartId(order)}</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {order.shiprocketShipmentId && order.trackingData?.track_url && (
                                    <a
                                        href={order.trackingData.track_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-outline"
                                        style={{ textDecoration: 'none', padding: '0.6rem 1.2rem', fontSize: '0.9rem', color: 'var(--color-gold)', borderColor: 'var(--color-gold)' }}
                                    >
                                        Tracking Portal
                                    </a>
                                )}
                                <span style={{
                                    color: 'var(--color-gold)',
                                    fontWeight: 'bold',
                                    border: '1px solid var(--color-gold)',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '4px'
                                }}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        {/* Timeline Visualization */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', position: 'relative', marginTop: '2rem' }}>
                            {/* Progress Bar Line */}
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                left: '0',
                                right: '0',
                                height: '2px',
                                background: '#333',
                                zIndex: 0
                            }}>
                                <div style={{
                                    width: order.status === 'DELIVERED' ? '100%' : order.status === 'SHIPPED' ? '50%' : '0%',
                                    height: '100%',
                                    background: 'var(--color-gold)',
                                    transition: 'width 1s ease'
                                }}></div>
                            </div>

                            {/* Steps */}
                            {['PENDING', 'SHIPPED', 'DELIVERED'].map((step, index) => {
                                const isCompleted =
                                    (step === 'PENDING') ||
                                    (step === 'SHIPPED' && (order.status === 'SHIPPED' || order.status === 'DELIVERED')) ||
                                    (step === 'DELIVERED' && order.status === 'DELIVERED');

                                return (
                                    <div key={step} style={{ position: 'relative', zIndex: 1, textAlign: 'center', flex: 1 }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: isCompleted ? 'var(--color-gold)' : '#111',
                                            border: `2px solid ${isCompleted ? 'var(--color-gold)' : '#444'}`,
                                            borderRadius: '50%',
                                            margin: '0 auto 1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isCompleted ? 'black' : '#888',
                                            fontWeight: 'bold',
                                            transition: 'all 0.5s ease',
                                            boxShadow: isCompleted ? '0 0 15px rgba(212, 175, 55, 0.4)' : 'none'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <span style={{
                                            color: isCompleted ? 'var(--color-white)' : '#666',
                                            fontSize: '0.9rem',
                                            fontWeight: isCompleted ? 'bold' : 'normal',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            {step === 'PENDING' ? 'Ordered' : step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Detailed Internal Tracking Timeline */}
                        {order.trackingData && order.trackingData.shipment_track_activities && order.trackingData.shipment_track_activities.length > 0 && (
                            <div style={{ marginBottom: '4rem', padding: '2rem', background: '#161616', borderRadius: '8px', border: '1px solid #222' }}>
                                <h4 style={{ color: 'var(--color-gold)', marginBottom: '2rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>
                                    Live Tracking Journey
                                </h4>
                                <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                                    {/* Vertical Line */}
                                    <div style={{ position: 'absolute', left: '7px', top: '0', bottom: '0', width: '2px', background: '#333' }}></div>

                                    {order.trackingData.shipment_track_activities.map((activity, index) => (
                                        <div key={index} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                            {/* Dot */}
                                            <div style={{
                                                position: 'absolute',
                                                left: '-2rem',
                                                top: '4px',
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: index === 0 ? 'var(--color-gold)' : '#333',
                                                border: index === 0 ? '2px solid #111' : 'none',
                                                boxShadow: index === 0 ? '0 0 8px rgba(212, 175, 55, 0.5)' : 'none'
                                            }}></div>

                                            <div style={{ color: index === 0 ? '#fff' : '#aaa', fontSize: '1rem', fontWeight: index === 0 ? 'bold' : 'normal', marginBottom: '4px' }}>
                                                {activity.activity}
                                            </div>
                                            <div style={{ color: '#777', fontSize: '0.85rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                <span>{new Date(activity.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                {activity.location && <span>📍 {activity.location}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            <div>
                                <h4 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Items Summary</h4>
                                {order.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                                        <span style={{ color: '#eee' }}>{item.product?.name || 'Product'} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9em', marginLeft: '0.5rem' }}>x {item.quantity}</span></span>
                                        <span style={{ color: '#ddd' }}>₹{item.price}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #444', fontWeight: 'bold' }}>
                                    <span style={{ color: 'var(--color-white)', fontSize: '1.1rem' }}>Total Amount</span>
                                    <span style={{ color: 'var(--color-gold)', fontSize: '1.4rem' }}>₹{order.total}</span>
                                </div>
                            </div>

                            <div style={{ background: '#161616', padding: '1.5rem', borderRadius: '8px', border: '1px solid #222' }}>
                                <h4 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Delivery Details</h4>
                                <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', fontSize: '0.95rem' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Customer Name</div>
                                        <div style={{ color: '#fff' }}>{order.shippingName || order.user?.name || 'Customer'}</div>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Shipping Address</div>
                                        <div style={{ color: '#fff' }}>
                                            {order.shippingAddress}<br />
                                            {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Contact Info</div>
                                        <div style={{ color: '#fff' }}>{order.shippingPhone || order.user?.phone}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
