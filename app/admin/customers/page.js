'use client';

import { useState, useEffect } from 'react';

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We need a new endpoint for this: /api/customers
        // Since we don't have it yet, I will mock it or we create it.
        // Let's create the endpoint first in the next step. 
        // For now, I'll put the fetch logic assuming the endpoint exists.
        fetch('/api/customers')
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/admin/login';
                    return null;
                }
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                if (!data) return; // Handled by redirect

                if (Array.isArray(data)) {
                    setCustomers(data);
                } else {
                    setCustomers([]); // Fallback
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setCustomers([]);
                setLoading(false);
            });
    }, []);

    const toggleAdmin = async (customer) => {
        const newRole = customer.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
        if (!confirm(`Are you sure you want to make ${customer.name} a ${newRole}?`)) return;

        try {
            const res = await fetch('/api/customers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: customer.id, role: newRole }),
            });

            if (res.ok) {
                // Update local state
                setCustomers(customers.map(c =>
                    c.id === customer.id ? { ...c, role: newRole } : c
                ));
            } else {
                alert('Failed to update role');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating role');
        }
    };

    return (
        <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '2rem' }}>Customers</h1>

            <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Name & Email</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Phone</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Phone</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Role</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Address</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Orders</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Total Spent</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : customers.length === 0 ? (
                            <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>No customers found.</td></tr>
                        ) : (
                            customers.map(customer => (
                                <tr key={customer.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{customer.name || 'Guest'}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{customer.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{customer.phone || '-'}</td>
                                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{customer.phone || '-'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.5rem',
                                            background: customer.role === 'ADMIN' ? '#dcfce7' : '#eee',
                                            color: customer.role === 'ADMIN' ? '#166534' : '#666',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            marginRight: '0.5rem'
                                        }}>
                                            {customer.role}
                                        </span>
                                        <button
                                            onClick={() => toggleAdmin(customer)}
                                            style={{
                                                fontSize: '0.7rem',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                color: 'var(--color-gold)',
                                                border: 'none',
                                                background: 'none'
                                            }}
                                        >
                                            {customer.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '200px' }}>
                                        {customer.address ? `${customer.address}, ${customer.city || ''}` : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{customer._count?.orders || 0}</td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{customer.totalSpent || 0}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{new Date(customer.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
