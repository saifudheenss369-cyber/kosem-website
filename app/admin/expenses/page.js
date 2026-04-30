'use client';

import { useState, useEffect } from 'react';

export default function AdminExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [formData, setFormData] = useState({ amount: '', investorName: '', reason: '', date: new Date().toISOString().split('T')[0] });
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        const res = await fetch('/api/expenses');
        if (res.ok) {
            const data = await res.json();
            setExpenses(data);
            setTotal(data.reduce((acc, curr) => acc + curr.amount, 0));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            setFormData({ amount: '', investorName: '', reason: '', date: new Date().toISOString().split('T')[0] });
            fetchExpenses();
        } else {
            alert('Failed');
        }
    };

    return (
        <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Expense Tracker</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Form */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Log New Expense</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>Amount</label>
                            <input type="number" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>Investor / Payer</label>
                            <input type="text" required value={formData.investorName} onChange={e => setFormData({ ...formData, investorName: e.target.value })} placeholder="e.g. Faizy, Store Account" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>Reason / Item</label>
                            <input type="text" required value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="e.g. Server Cost, Packaging" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>Date</label>
                            <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }} />
                        </div>
                        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Log Expense</button>
                    </form>
                </div>

                {/* Summary & Recent List */}
                <div>
                    <div style={{ background: 'var(--color-black)', color: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <h4 style={{ color: '#aaa', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '0.8rem' }}>Total Expenses</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--color-gold)' }}>₹{total.toLocaleString()}</p>
                    </div>

                    <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <h4 style={{ padding: '1rem', margin: 0, borderBottom: '1px solid #eee' }}>Recent Logs</h4>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {expenses.map(exp => (
                                <div key={exp.id} style={{ padding: '1rem', borderBottom: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>{exp.reason}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{new Date(exp.date).toLocaleDateString()} • {exp.investorName}</p>
                                    </div>
                                    <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>-₹{exp.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
