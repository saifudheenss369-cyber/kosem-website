'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0, categoryData: [], topItems: [] });
    const [timeframe, setTimeframe] = useState('all'); // 'today', 'week', 'month', 'all'
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/stats?timeframe=${timeframe}`)
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [timeframe]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-black)' }}>Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', fontWeight: 'bold', background: 'white', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                    >
                        <option value="today">Today &apos;s Sales</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="all">All Time History</option>
                    </select>
                    <div style={{ background: '#fff', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.9rem', color: '#666', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>

                {/* Revenue Card */}
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #111, #333)', padding: '2rem', borderRadius: '12px', color: 'white', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '0.5rem' }}>Total Revenue</p>
                            <h2 style={{ fontSize: '2rem', color: 'var(--color-gold)' }}>₹{(stats?.revenue || 0).toLocaleString()}</h2>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px' }}>💰</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                        <span style={{ color: '#4caf50' }}>▲ 12%</span> vs last month
                    </div>
                </div>

                {/* Orders Card */}
                <div className="stat-card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '0.5rem' }}>Total Orders</p>
                            <h2 style={{ fontSize: '2rem', color: 'var(--color-black)' }}>{stats.orders}</h2>
                        </div>
                        <div style={{ background: '#f9f9f9', padding: '0.5rem', borderRadius: '8px' }}>📦</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        Avg. Value: <strong>₹{stats.orders > 0 ? Math.round(stats.revenue / stats.orders).toLocaleString() : 0}</strong>
                    </div>
                </div>

                {/* Customers Card */}
                <div className="stat-card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '0.5rem' }}>Total Customers</p>
                            <h2 style={{ fontSize: '2rem', color: 'var(--color-black)' }}>{stats.customers || 0}</h2>
                        </div>
                        <div style={{ background: '#f9f9f9', padding: '0.5rem', borderRadius: '8px' }}>👥</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        Total registered accounts
                    </div>
                </div>

                {/* Products Card */}
                <div className="stat-card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'start', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '0.5rem' }}>Products</p>
                            <h2 style={{ fontSize: '2rem', color: 'var(--color-black)' }}>{stats.products}</h2>
                        </div>
                        <div style={{ background: '#f9f9f9', padding: '0.5rem', borderRadius: '8px' }}>✨</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        <Link href="/admin/products" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: 'bold' }}>Manage Inventory →</Link>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ position: 'relative', opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                    {/* Top Selling Items (Replacing mock visual chart) */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            Best Selling Products
                            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal', fontFamily: 'sans-serif' }}>By Quantity</span>
                        </h3>
                        {stats.topItems && stats.topItems.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {stats.topItems.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: i !== stats.topItems.length - 1 ? '1px solid #f5f5f5' : 'none', paddingBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: i === 0 ? 'var(--color-gold)' : '#f0f0f0', color: i === 0 ? 'white' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                {i + 1}
                                            </div>
                                            <strong style={{ color: '#333', fontSize: '0.95rem' }}>{item.name}</strong>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: 'var(--color-black)' }}>{item.quantity} units</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>₹{(item.revenue || 0).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#999', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ fontSize: '2rem', opacity: 0.3 }}>🏷️</div>
                                <p>No sales data for this period.</p>
                            </div>
                        )}
                    </div>

                    {/* Category Distribution */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        <h3 style={{ marginBottom: '2rem', fontFamily: 'var(--font-serif)', fontSize: '1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            Top Categories
                            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal', fontFamily: 'sans-serif' }}>By Revenue</span>
                        </h3>
                        {stats.categoryData && stats.categoryData.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {stats.categoryData.map((cat, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                            <strong style={{ color: '#444' }}>{cat.name}</strong>
                                            <span style={{ color: '#888', fontWeight: 'bold' }}>₹{cat.value.toLocaleString()}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${stats.revenue > 0 ? (cat.value / stats.revenue) * 100 : 0}%`,
                                                height: '100%',
                                                background: i === 0 ? 'var(--color-gold)' : i === 1 ? '#333' : '#888',
                                                borderRadius: '10px',
                                                transition: 'width 1s ease-out'
                                            }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#999', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ fontSize: '2rem', opacity: 0.3 }}>📊</div>
                                <p>No sales data for this period.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .stat-card:hover {
                    transform: translateY(-2px);
                    transition: transform 0.3s ease;
                }
            `}</style>
        </div >
    );
}
