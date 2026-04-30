'use client';
import { useState } from 'react';
import Navbar from '../../components/Navbar';

export default function ApiTester() {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState({});

    const runTest = async (testName, endpoint, method = 'GET', body = null) => {
        setLoading(prev => ({ ...prev, [testName]: true }));
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' },
            };
            if (body) options.body = JSON.stringify(body);

            const res = await fetch(endpoint, options);
            let data;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                data = await res.text();
            }

            setResults(prev => ({
                ...prev,
                [testName]: {
                    status: res.status,
                    ok: res.ok,
                    data: typeof data === 'string' ? data : JSON.stringify(data, null, 2)
                }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                [testName]: {
                    status: 'ERROR',
                    ok: false,
                    data: error.message
                }
            }));
        } finally {
            setLoading(prev => ({ ...prev, [testName]: false }));
        }
    };

    const tests = [
        {
            name: "Shiprocket Integration (Serviceability Check)",
            desc: "Tests the token generator by checking serviceability for a demo pincode.",
            action: () => runTest("Shiprocket Integration (Serviceability Check)", "/api/shipping/check-pincode", "POST", { pincode: "110001" })
        },
        {
            name: "Public Products Endpoint",
            desc: "Fetches the list of all products currently active in the database.",
            action: () => runTest("Public Products Endpoint", "/api/products", "GET")
        },
        {
            name: "Public Categories Endpoint",
            desc: "Fetches all categories configured in the store.",
            action: () => runTest("Public Categories Endpoint", "/api/categories", "GET")
        },
        {
            name: "Verify OTP System (Fake Test)",
            desc: "Attempts to verify a randomly generated fake OTP to test the Firebase admin connection.",
            action: () => runTest("Verify OTP System (Fake Test)", "/api/auth/verify-otp", "POST", { email: "test@example.com", otp: "000000" })
        }
    ];

    return (
        <>
            <Navbar />
            <main className="container" style={{ paddingTop: '120px', paddingBottom: '4rem' }}>
                <h1 style={{ marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>API Diagnostic Dashboard</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>Run these tests to verify that your integrations (Shiprocket, Firebase, Database) are configured correctly.</p>

                <div style={{ display: 'grid', gap: '2rem' }}>
                    {tests.map((test, index) => (
                        <div key={index} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--color-black)' }}>{test.name}</h3>
                                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '600px' }}>{test.desc}</p>
                                </div>
                                <button
                                    onClick={test.action}
                                    disabled={loading[test.name]}
                                    className="btn-primary"
                                    style={{ whiteSpace: 'nowrap', opacity: loading[test.name] ? 0.7 : 1 }}
                                >
                                    {loading[test.name] ? 'Running...' : '▶ Run Test'}
                                </button>
                            </div>

                            {results[test.name] && (
                                <div style={{ marginTop: '1.5rem', background: '#2d2d2d', color: '#a6e22e', padding: '1rem', borderRadius: '6px', overflowX: 'auto' }}>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
                                        <span style={{ color: results[test.name].ok ? '#a6e22e' : '#f92672', fontWeight: 'bold' }}>
                                            Status Code: {results[test.name].status}
                                        </span>
                                    </div>
                                    <pre style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                        {results[test.name].data}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
