'use client';
import { useRouter } from 'next/navigation';

export default function AdminLayoutClient({ children }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };
    return (
        <div className="admin-panel" style={{ background: 'var(--color-bg-secondary)', color: '#1a1a1a', minHeight: '100vh' }}>
            <div style={{ padding: '2rem' }}>
                <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <h2 style={{ marginRight: 'auto', color: 'var(--color-text-main)' }}>Admin Panel</h2>
                    <a href="/admin" style={{ color: 'var(--color-text-main)' }}>Dashboard</a>
                    <a href="/admin/products" style={{ color: 'var(--color-text-main)' }}>Products</a>
                    <a href="/admin/categories" style={{ color: 'var(--color-text-main)' }}>Categories</a>
                    <a href="/admin/orders" style={{ color: 'var(--color-text-main)' }}>Orders</a>
                    <a href="/admin/expenses" style={{ color: 'var(--color-text-main)' }}>Expenses</a>
                    <a href="/admin/banners" style={{ color: 'var(--color-text-main)' }}>Banners</a>
                    <a href="/admin/customers" style={{ color: 'var(--color-text-main)' }}>Customers</a>
                    <a href="/admin/coupons" style={{ color: 'var(--color-text-main)' }}>Coupons</a>
                    <a href="/admin/audit" style={{ color: 'var(--color-text-main)' }}>Audit Logs</a>
                    <a href="/" style={{ color: 'var(--color-text-muted)' }}>Back to Shop</a>
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
