'use client';
import { useState, useEffect } from 'react';

export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // We need an API endpoint to fetch logs, let's assume we create one.
        // For now, I'll mock it or we can create the API route next.
        fetch('/api/audit')
            .then(res => res.json())
            .then(data => setLogs(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Audit Logs</h1>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                            <th style={{ padding: '0.8rem' }}>Time</th>
                            <th style={{ padding: '0.8rem' }}>Admin</th>
                            <th style={{ padding: '0.8rem' }}>Action</th>
                            <th style={{ padding: '0.8rem' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.8rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                <td style={{ padding: '0.8rem' }}>{log.admin?.name || log.adminId}</td>
                                <td style={{ padding: '0.8rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        background: log.action.includes('DELETE') ? '#fee2e2' : '#dcfce7',
                                        color: log.action.includes('DELETE') ? '#991b1b' : '#166534',
                                        fontSize: '0.8rem'
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ padding: '0.8rem' }}>{log.details}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>No logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
