'use client';
import { useRouter } from 'next/navigation';

export default function AdminLayoutClient({ children }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin/login');
    };
    return (
        <div className="admin-panel" style={{ background: '#0a0a0a', color: '#e0e0e0', minHeight: '100vh' }}>
            <div style={{ padding: '2rem' }}>
                <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', borderBottom: '1px solid #222', paddingBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <h2 style={{ marginRight: 'auto', color: '#b8860b', fontFamily: 'var(--font-serif)', margin: 0 }}>Admin Dashboard</h2>
                    <a href="/admin" className="admin-nav-link">Dashboard</a>
                    <a href="/admin/products" className="admin-nav-link">Products</a>
                    <a href="/admin/categories" className="admin-nav-link">Categories</a>
                    <a href="/admin/occasions" className="admin-nav-link">Occasions</a>
                    <a href="/admin/orders" className="admin-nav-link">Orders</a>
                    <a href="/admin/expenses" className="admin-nav-link">Expenses</a>
                    <a href="/admin/banners" className="admin-nav-link">Banners</a>
                    <a href="/admin/customers" className="admin-nav-link">Customers</a>
                    <a href="/admin/coupons" className="admin-nav-link">Coupons</a>
                    <a href="/admin/settings" className="admin-nav-link">Settings</a>
                    <a href="/admin/audit" className="admin-nav-link">Audit</a>
                    <a href="/" style={{ color: '#888', fontSize: '0.85rem' }}>View Shop</a>
                    <button onClick={handleLogout} style={{ marginLeft: 'auto', background: '#c00', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
                </nav>
                <div className="admin-content-area">
                    {children}
                </div>
            </div>
            {/* Force override styles for this subtree */}
            <style>{`
                body {
                   background: #0a0a0a !important;
                   color: #e0e0e0 !important;
                }
                .admin-nav-link {
                   color: #aaa;
                   text-decoration: none;
                   font-weight: 500;
                   font-size: 0.95rem;
                   transition: all 0.3s ease;
                }
                .admin-nav-link:hover {
                   color: #b8860b;
                }
                h1, h2, h3, h4, h5 {
                   color: #b8860b !important;
                }
                .stat-card {
                   background: #151515 !important;
                   border: 1px solid #222 !important;
                   color: #e0e0e0 !important;
                }
                .stat-card p, .stat-card span {
                   color: #888 !important;
                }
                .stat-card h2 {
                   color: #fff !important;
                }
                table {
                    color: #e0e0e0 !important;
                }
                th {
                    background: #111 !important;
                    color: #b8860b !important;
                    border-bottom: 2px solid #222 !important;
                }
                td {
                    background: #151515 !important;
                    border-bottom: 1px solid #222 !important;
                    color: #e0e0e0 !important;
                }
                input, select, textarea {
                   background: #1a1a1a !important;
                   color: #ffffff !important;
                   border: 1px solid #333 !important;
                   padding: 0.8rem !important;
                   border-radius: 6px !important;
                }
                input:focus, select:focus, textarea:focus {
                    border-color: #b8860b !important;
                    outline: none !important;
                }
                label {
                    color: #ccc !important;
                    font-weight: 600 !important;
                }
                button.btn-primary {
                    background: #b8860b !important;
                    color: black !important;
                    font-weight: bold !important;
                }
                .animate-fade-up {
                    background: #151515 !important;
                    color: #e0e0e0 !important;
                }
                small {
                    color: #888 !important;
                }
                strong {
                    color: #fff !important;
                }
            `}</style>
        </div>
    );
}
