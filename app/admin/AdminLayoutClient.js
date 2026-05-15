'use client';
import { useRouter } from 'next/navigation';

export default function AdminLayoutClient({ children }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };
    return (
        <div className="admin-panel" style={{ background: 'var(--color-bg-main)', color: 'var(--color-text-main)', minHeight: '100vh' }}>
            <div style={{ padding: '2rem' }}>
                <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <h2 style={{ marginRight: 'auto', color: 'var(--color-gold)', fontFamily: 'var(--font-serif)', margin: 0 }}>Admin Dashboard</h2>
                    <a href="/admin" className="admin-nav-link">Dashboard</a>
                    <a href="/admin/products" className="admin-nav-link">Products</a>
                    <a href="/admin/categories" className="admin-nav-link">Categories</a>
                    <a href="/admin/occasions" className="admin-nav-link">Occasions</a>
                    <a href="/admin/orders" className="admin-nav-link">Orders</a>
                    <a href="/admin/expenses" className="admin-nav-link">Expenses</a>
                    <a href="/admin/banners" className="admin-nav-link">Banners</a>
                    <a href="/admin/customers" className="admin-nav-link">Customers</a>
                    <a href="/admin/coupons" className="admin-nav-link">Coupons</a>
                    <a href="/admin/audit" className="admin-nav-link">Audit</a>
                    <a href="/" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>View Shop</a>
                    <button onClick={handleLogout} style={{ marginLeft: 'auto', background: '#c00', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
                </nav>
                {children}
            </div>
            {/* Force override styles for this subtree */}
            <style>{`
                body {
                   background: var(--color-bg-main) !important;
                   color: var(--color-text-main) !important;
                }
                .admin-nav-link {
                   color: var(--color-text-main);
                   text-decoration: none;
                   font-weight: 500;
                   font-size: 0.95rem;
                   transition: color 0.3s ease;
                }
                .admin-nav-link:hover {
                   color: var(--color-gold);
                }
                h1, h2, h3, h4 {
                   color: var(--color-gold);
                }
                .stat-card {
                   background: var(--color-bg-secondary) !important;
                   border: 1px solid var(--color-border) !important;
                }
                input, select, textarea {
                   background: #111 !important;
                   color: white !important;
                   border: 1px solid #333 !important;
                }
            `}</style>
        </div>
    );
}
