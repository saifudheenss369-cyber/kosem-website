'use client';
import { useRouter } from 'next/navigation';

export default function AdminLayoutClient({ children }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };
    return (
        <div className="admin-panel" style={{ background: '#f5f5f5', color: '#1a1a1a', minHeight: '100vh' }}>
            <div style={{ padding: '2rem' }}>
                <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <h2 style={{ marginRight: 'auto', color: '#000' }}>Admin Panel</h2>
                    <a href="/admin" style={{ color: '#333' }}>Dashboard</a>
                    <a href="/admin/products" style={{ color: '#333' }}>Products</a>
                    <a href="/admin/categories" style={{ color: '#333' }}>Categories</a>
                    <a href="/admin/orders" style={{ color: '#333' }}>Orders</a>
                    <a href="/admin/expenses" style={{ color: '#333' }}>Expenses</a>
                    <a href="/admin/banners" style={{ color: '#333' }}>Banners</a>
                    <a href="/admin/customers" style={{ color: '#333' }}>Customers</a>
                    <a href="/admin/coupons" style={{ color: '#333' }}>Coupons</a>
                    <a href="/admin/audit" style={{ color: '#333' }}>Audit Logs</a>
                    <a href="/" style={{ color: '#888' }}>Back to Shop</a>
                    <button onClick={handleLogout} style={{ marginLeft: 'auto', background: '#c00', color: 'white', border: 'none', padding: '0.3rem 0.9rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Logout</button>
                </nav>
                {children}
            </div>
            {/* Force override styles for this subtree */}
            <style>{`
                body {
                   background: #f5f5f5 !important;
                   color: #1a1a1a !important;
                }
                h1, h2, h3, h4, Link, a {
                   color: #1a1a1a;
                }
                .admin-panel a:hover {
                   color: #D4AF37;
                }
            `}</style>
        </div>
    );
}
