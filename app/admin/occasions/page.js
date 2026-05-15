'use client';
import { useState, useEffect } from 'react';

export default function AdminOccasions() {
    const [occasions, setOccasions] = useState([]);
    const [newName, setNewName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchOccasions();
    }, []);

    const fetchOccasions = async () => {
        setIsLoading(true);
        const res = await fetch('/api/occasions');
        if (res.ok) setOccasions(await res.json());
        setIsLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/occasions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim() }),
            });
            if (res.ok) {
                setNewName('');
                fetchOccasions();
            } else {
                alert('Failed to add occasion. Name might already exist.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this filter keyword? Products already tagged with this will keep the name in their data, but this option will no longer be available for new selections.')) return;
        try {
            const res = await fetch(`/api/occasions?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchOccasions();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>Manage Filter Keywords (Occasions)</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                These keywords appear as filter options on the Shop page. You can add new ones like "Monsoon Special" or "Luxury Oud" here.
            </p>

            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', background: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <input
                    type="text"
                    placeholder="Enter new keyword (e.g. Party Wear)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                />
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{ padding: '0.8rem 2rem', cursor: isSubmitting ? 'wait' : 'pointer' }}
                >
                    {isSubmitting ? 'Adding...' : 'Add Keyword'}
                </button>
            </form>

            <div style={{ background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '1.2rem', textAlign: 'left' }}>Keyword Name</th>
                            <th style={{ padding: '1.2rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="2" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : occasions.length === 0 ? (
                            <tr><td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No keywords added yet.</td></tr>
                        ) : occasions.map((occ) => (
                            <tr key={occ.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{occ.name}</td>
                                <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                    <button 
                                        onClick={() => handleDelete(occ.id)} 
                                        style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
