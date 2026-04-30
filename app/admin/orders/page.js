'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getSmartId } from '@/app/utils/smartId';

const getWhatsAppMessage = (order) => {
    const smartId = getSmartId(order);
    const customerName = order.shippingName || order.user?.name || 'Customer';
    
    let titleLine = `📦 Order Update: ${smartId} >`;
    let quoteLine = `"Every scent has a story, and we’re sorry this chapter had a little delay." ✨`;
    let body = `We’re reaching out to let you know that your order ${smartId} has been CANCELLED 🚫. We truly regret any disappointment this may cause to your fragrance journey with us.`;
    let refundInfo = `💰 Refund: Processed automatically (if paid) 💳`;
    let closingQuote = `"Don't let the essence fade away!" 🌿`;
    let closingBody = `We’d love to help you find your next signature scent. Explore our curated collections again and let’s find something special for you! 🛍️`;
    
    if (order.status !== 'CANCELLED') {
        quoteLine = `"Experience the essence of luxury." ✨`;
        body = `We’re reaching out to let you know that your order ${smartId} is currently ${order.status}.`;
        refundInfo = `🚚 Details will be updated as they progress.`;
        closingQuote = `"Scent that speaks for you!" 🌿`;
        closingBody = `Thank you for choosing Kosem! Let’s find more signature scents for you! 🛍️`;
    }

    return `${titleLine}

${quoteLine}

Hi ${customerName},
${body}

Quick Summary:
📍 Order: ${smartId}
🏷️ Status: ${order.status}
${refundInfo}

${closingQuote}
${closingBody}

👉 Visit Kosem Perfume (https://kosemperfume.in)

Stay Fragrant,
Team Kosem 🕊️`;
};

const firebaseConfig = {
    apiKey: "AIzaSyDkab-90ZJK6OdgD64JcCrdH9KGgLoCUW0",
    authDomain: "aljuman-a1a29.firebaseapp.com",
    projectId: "aljuman-a1a29",
    storageBucket: "aljuman-a1a29.firebasestorage.app",
    messagingSenderId: "810420529037",
    appId: "1:810420529037:web:384834839fd467b435bfc4"
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        q: '',
        datePreset: 'ALL',
        status: 'ALL',
        page: 1
    });
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [walletBalance, setWalletBalance] = useState(null);
    const [printingId, setPrintingId] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [srLoading, setSrLoading] = useState({});
    const [srStatus, setSrStatus] = useState({});
    const [notifStatus, setNotifStatus] = useState('idle'); // idle | loading | enabled | denied

    useEffect(() => {
        fetchOrders();
        fetchWallet();

        // Restore notification status on mount
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted' && localStorage.getItem('admin_fcm_enabled') === 'true') {
                setNotifStatus('enabled');
                setupNotifications(); // Initialize messaging listener
            }
        }

        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [filters]);

    const fetchWallet = async () => {
        try {
            const res = await fetch('/api/admin/shiprocket');
            if (res.ok) {
                const data = await res.json();
                setWalletBalance(data.balance);
            }
        } catch (e) { /* silent */ }
    };

    const setupNotifications = async () => {
        setNotifStatus('loading');
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setNotifStatus('denied');
                return;
            }
            const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            const messaging = getMessaging(app);
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            const token = await getToken(messaging, { vapidKey });
            if (token) {
                await fetch('/api/admin/fcm-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                setNotifStatus('enabled');
                localStorage.setItem('admin_fcm_enabled', 'true');
                // Listen for foreground messages
                onMessage(messaging, (payload) => {
                    const { title, body } = payload.notification || {};
                    if (title && Notification.permission === 'granted') {
                        new Notification(title, { body, icon: '/logo.png' });
                    }
                });
            }
        } catch (err) {
            console.error('Notification setup error:', err);
            setNotifStatus('idle');
        }
    }; // Re-fetch when filters (including page) change

    const fetchOrders = () => {
        let query = new URLSearchParams();
        if (filters.startDate) query.append('startDate', filters.startDate);
        if (filters.endDate) query.append('endDate', filters.endDate);
        if (filters.q) query.append('q', filters.q);
        if (filters.status && filters.status !== 'ALL') query.append('status', filters.status);

        query.append('page', filters.page || 1);
        query.append('limit', 20);
        query.append('_t', Date.now()); // Cache buster for live view polling

        fetch(`/api/orders?${query.toString()}`, { cache: 'no-store' })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    window.location.href = '/admin/login';
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (!data) return; // Handled by redirect

                if (data.orders) {
                    setOrders(data.orders);
                    setPagination(data.pagination);
                } else {
                    setOrders([]);
                }
                setLastUpdated(new Date());
            })
            .catch(err => console.error(err));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleDatePreset = (preset) => {
        const today = new Date();
        let start = '', end = '';

        if (preset === 'TODAY') {
            const tzOffset = today.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
            start = localISOTime;
            end = localISOTime;
        } else if (preset === '7DAYS') {
            const last7 = new Date(today);
            last7.setDate(today.getDate() - 7);
            start = last7.toISOString().split('T')[0];
            end = today.toISOString().split('T')[0];
        } else if (preset === '30DAYS') {
            const last30 = new Date(today);
            last30.setDate(today.getDate() - 30);
            start = last30.toISOString().split('T')[0];
            end = today.toISOString().split('T')[0];
        }

        setFilters(prev => ({ ...prev, datePreset: preset, startDate: start, endDate: end, page: 1 }));
    };

    const updateStatus = async (id, newStatus) => {
        setUpdatingStatusId(id);
        try {
            const res = await fetch(`/api/orders?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchOrders();
            } else {
                alert('Failed to update status');
            }
        } catch (e) {
            alert('Error updating status');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // Shiprocket admin action handler
    const handleSrAction = async (key, body, openUrl) => {
        setSrLoading(prev => ({ ...prev, [key]: true }));
        setSrStatus(prev => ({ ...prev, [key]: null }));
        try {
            const res = await fetch('/api/admin/shiprocket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSrStatus(prev => ({ ...prev, [key]: { ok: true, msg: data.message || 'Done!' } }));
                if (openUrl) {
                    const url = data.labelUrl || data.invoiceUrl;
                    if (url) window.open(url, '_blank');
                }
                fetchOrders(); // Refresh
            } else {
                setSrStatus(prev => ({ ...prev, [key]: { ok: false, msg: data.error || 'Failed' } }));
            }
        } catch (e) {
            setSrStatus(prev => ({ ...prev, [key]: { ok: false, msg: 'Network error' } }));
        } finally {
            setSrLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const printInvoice = (order) => {
        setPrintingId(order.id);
        setTimeout(() => setPrintingId(null), 1500);

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.write(`
            <html>
                <head>
                    <title>Bill #${order.id}</title>
                    <style>
                        @page { 
                            margin: 0; 
                            size: 80mm auto !important; 
                        }
                        body { 
                            font-family: 'Courier New', Courier, monospace; 
                            width: 72mm; 
                            margin: 0; 
                            padding: 2mm; 
                            color: #000; 
                            font-size: 13px; 
                            line-height: 1.3;
                            background: white;
                        }
                        .header { text-align: center; margin-bottom: 3mm; }
                        .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; font-weight: 900; }
                        .header p { margin: 1px 0; font-size: 13px; font-weight: bold; }
                        
                        .title { text-align: center; font-weight: 900; font-size: 15px; margin: 4mm 0; }
                        
                        .meta { margin-bottom: 2mm; }
                        .meta p { margin: 1px 0; display: block; font-size: 13px; font-weight: bold; }
                        
                        .divider { border-top: 1px dashed #000; margin: 3mm 0; }
                        
                        table { width: 100%; border-collapse: collapse; margin-bottom: 2mm; }
                        th { text-align: left; padding: 1mm 0; font-size: 13px; font-weight: 900; border-bottom: 1px dashed #000; }
                        td { padding: 1.5mm 0; font-size: 13px; vertical-align: top; }
                        .item-name { max-width: 40mm; overflow-wrap: break-word; font-weight: 600; }
                        
                        .totals { width: 100%; font-weight: bold; font-size: 13px; margin-top: 2mm; }
                        .totals .row { display: flex; justify-content: space-between; margin-bottom: 1mm; }
                        .totals .big-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; padding: 2mm 0; }
                        
                        .footer { text-align: right; margin-top: 4mm; font-size: 11px; font-weight: bold; }
                        
                        /* Ensure specific styles for thermal printing */
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>KOSEM</h1>
                        <p>PREMIUM ATTAR & OUDH</p>
                        <p>KERALA, INDIA.</p>
                        <p>PHONE : 9074678278</p>
                    </div>
                    
                    <div class="title">Retail Invoice</div>
                    
                    <div class="meta">
                        <p>Date : ${new Date(order.createdAt).toLocaleDateString('en-GB')} ${new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p style="margin-top: 3mm; font-size: 14px;">${order.shippingName || order.user?.name || 'Guest'}</p>
                        <p style="font-weight: normal;">${order.shippingPhone || order.user?.phone || order.phone || ''}</p>
                        <p style="margin-top: 3mm;">Bill No: ${getSmartId(order)}</p>
                        <p>Payment Mode: ${order.paymentMethod === 'COD' ? 'Cash' : 'Online'}</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: right; width: 15%;">Qty</th>
                                <th style="text-align: right; width: 25%;">Amt</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td class="item-name">${item.product?.name || 'Product'} ${item.product?.size ? '('+item.product.size+')' : ''}</td>
                                    <td style="text-align: right">${item.quantity}</td>
                                    <td style="text-align: right">${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="divider"></div>
                    
                    <div class="totals">
                        <div class="row">
                            <span>Sub Total</span>
                            <span>${order.items.reduce((a, b) => a + b.quantity, 0)}</span>
                            <span>${order.items.reduce((a, b) => a + (b.price * b.quantity), 0).toFixed(2)}</span>
                        </div>
                        ${order.shippingFee ? `
                        <div class="row">
                            <span style="margin-left: auto; margin-right: 4mm;">Shipping </span>
                            <span>${order.shippingFee.toFixed(2)}</span>
                        </div>` : ''}
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="totals">
                        <div class="big-row">
                            <span>TOTAL</span>
                            <span>Rs ${(order.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="totals">
                        <div class="row">
                            <span>${order.paymentMethod === 'COD' ? 'Cash To Collect' : 'Prepaid'} :</span>
                            <span>Rs ${(order.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>E & O.E</p>
                    </div>
                    <script>
                        window.print();
                    </script>
                </body>
            </html>
        `);
        doc.close();

        // The script inside doc handles printing once logo is loaded
        // We just need to cleanup the iframe eventually
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                // document.body.removeChild(iframe); // Keep it briefly for print dialog
            }
        }, 10000);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', margin: 0 }}>Order Management</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {walletBalance !== null && (
                        <div style={{ background: '#1a7a1a', color: 'white', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            💰 SR Wallet: ₹{walletBalance}
                        </div>
                    )}
                    <button
                        onClick={setupNotifications}
                        disabled={notifStatus === 'loading' || notifStatus === 'enabled'}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            border: 'none',
                            whiteSpace: 'nowrap',
                            cursor: notifStatus === 'enabled' ? 'default' : 'pointer',
                            background: notifStatus === 'enabled' ? '#2e7d32' : notifStatus === 'denied' ? '#c62828' : '#1565C0',
                            color: 'white'
                        }}
                    >
                        {notifStatus === 'enabled' ? '🔔 Notifications ON' :
                            notifStatus === 'denied' ? '🔕 Denied' :
                                notifStatus === 'loading' ? '⏳ Enabling...' :
                                    '🔔 Enable Notifications'}
                    </button>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Live Updates: {lastUpdated.toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                background: 'var(--color-bg-secondary)',
                padding: '1.2rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                alignItems: 'flex-end',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Search Customer / Order ID</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <input
                            type="text"
                            placeholder="e.g. Faizy or 1234"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && setFilters({ ...filters, q: searchText, page: 1 })}
                            style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                        />
                        <button onClick={() => setFilters({ ...filters, q: searchText, page: 1 })} style={{ padding: '0.6rem 1rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Date Range</label>
                    <select
                        value={filters.datePreset}
                        onChange={handleDatePreset}
                        style={{ padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                    >
                        <option value="ALL">All Time</option>
                        <option value="TODAY">Today</option>
                        <option value="YESTERDAY">Yesterday</option>
                        <option value="WEEK">Last 7 Days</option>
                        <option value="MONTH">This Month</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Order Status</label>
                    <select
                        value={filters.status}
                        onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        style={{ padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: '4px', minWidth: '150px' }}
                    >
                        <option value="ALL">All States</option>
                        <option value="PENDING">Pending</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                <button
                    onClick={() => {
                        setSearchText('');
                        setFilters({ startDate: '', endDate: '', status: 'ALL', q: '', datePreset: 'ALL', page: 1 });
                    }}
                    style={{ padding: '0.6rem 1.2rem', background: '#e0e0e0', color: 'var(--color-text-main)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Clear Filter
                </button>
            </div>

            {orders.length === 0 ? (
                <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>No orders found matching filters.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {orders.map(order => (
                        // ... (keep order item content same, tricky to replace without full block)
                        // Actually, I should just append the pagination controls AFTER the list.
                        // I'll replace the closing `</div>` of the list container?
                        // No, unsafe.
                        // I'll replace the closing `)}` with pagination controls inside.
                        <div key={order.id} style={{ background: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--color-gold)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                {/* ... Header ... */}
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--color-black)' }}>
                                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Tracking ID:</span> {getSmartId(order)}
                                    </h4>
                                    <small style={{ color: 'var(--color-text-muted)' }}>Placed: {new Date(order.createdAt).toLocaleString()}</small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', display: 'block' }}>₹{order.total}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>
                                        {order.paymentMethod || 'COD'}
                                    </span>
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        disabled={updatingStatusId === order.id}
                                        style={{ padding: '0.25rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', opacity: updatingStatusId === order.id ? 0.6 : 1, cursor: updatingStatusId === order.id ? 'wait' : 'pointer' }}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                    <button
                                        onClick={() => printInvoice(order)}
                                        disabled={printingId === order.id}
                                        style={{ display: 'block', marginTop: '0.5rem', width: '100%', padding: '0.25rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: printingId === order.id ? 'wait' : 'pointer', fontSize: '0.8rem', opacity: printingId === order.id ? 0.7 : 1 }}
                                    >
                                        {printingId === order.id ? '⏳' : 'Print Invoice'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem', background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '4px' }}>
                                <strong>Customer Delivery Details:</strong>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem 0' }}><strong>Name:</strong> {order.shippingName || order.user?.name || 'N/A'}</p>
                                        <p style={{ margin: '0 0 0.25rem 0' }}><strong>Email:</strong> <a href={`mailto:${order.user?.email}`}>{order.user?.email || 'N/A'}</a></p>
                                        <p style={{ margin: 0 }}><strong>User ID:</strong> {order.userId}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <strong>Phone:</strong>
                                            {order.shippingPhone || order.user?.phone || order.phone ? (
                                                <>
                                                    {order.shippingPhone || order.user?.phone || order.phone}
                                                    <a
                                                        href={`https://wa.me/${(order.shippingPhone || order.user?.phone || order.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getWhatsAppMessage(order))}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#25D366', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}
                                                        title="Chat on WhatsApp"
                                                    >
                                                        <FaWhatsapp />
                                                    </a>
                                                </>
                                            ) : (
                                                <span style={{ color: 'red' }}>Not Provided</span>
                                            )}
                                        </p>
                                        <p style={{ margin: 0 }}><strong>Address:</strong> {order.shippingAddress ?
                                            `${order.shippingAddress}, ${order.shippingCity || ''}, ${order.shippingState || ''} ${order.shippingPincode || ''}`
                                            : order.user?.address ? 
                                            `${order.user.address}, ${order.user.city || ''}, ${order.user.state || ''} ${order.user.zip || ''}`
                                            : <span style={{ color: 'red' }}>No Address on File</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <details>
                                <summary style={{ cursor: 'pointer', color: 'var(--color-gold)' }}>View Items ({order.items.length})</summary>
                                <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid #eee' }}>
                                    {order.items.map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                            <span>{item.product?.name || 'Unknown Item'} x {item.quantity}</span>
                                            <span>₹{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </details>

                            {/* Shiprocket Admin Actions */}
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <span>Shiprocket Actions</span>
                                    {order.shiprocketOrderId && <span style={{ color: 'var(--color-text-muted)' }}>SR ID: {order.shiprocketOrderId}</span>}
                                </div>
                                
                                <div className="sr-actions-container">
                                    {!order.shiprocketShipmentId && (
                                        <button
                                            onClick={() => handleSrAction(`sync-${order.id}`, { action: 'create-order', orderId: order.id }, false)}
                                            disabled={srLoading[`sync-${order.id}`]}
                                            style={{ background: '#333', color: 'white' }}
                                        >
                                            {srLoading[`sync-${order.id}`] ? '⏳ Syncing...' : '🔄 Sync to Shiprocket'}
                                        </button>
                                    )}

                                    {order.shiprocketShipmentId && (
                                        <>
                                            {/* Step 1: Assign Courier/AWB */}
                                            <button
                                                onClick={() => handleSrAction(`courier-${order.id}`, { action: 'assign-courier', shipmentId: order.shiprocketShipmentId, orderId: order.id }, false)}
                                                disabled={srLoading[`courier-${order.id}`]}
                                                style={{ background: '#009688', color: 'white' }}
                                            >
                                                {srLoading[`courier-${order.id}`] ? '...' : '1️⃣ Assign Courier'}
                                            </button>

                                            {/* Step 2: Schedule Pickup */}
                                            <button
                                                onClick={() => handleSrAction(`pickup-${order.id}`, { action: 'request-pickup', shipmentId: order.shiprocketShipmentId }, false)}
                                                disabled={srLoading[`pickup-${order.id}`]}
                                                style={{ background: '#2196F3', color: 'white' }}
                                            >
                                                {srLoading[`pickup-${order.id}`] ? '...' : '2️⃣ Schedule Pickup'}
                                            </button>

                                            {/* Download Label */}
                                            <button
                                                onClick={() => handleSrAction(`label-${order.id}`, { action: 'generate-label', shipmentId: order.shiprocketShipmentId }, true)}
                                                disabled={srLoading[`label-${order.id}`]}
                                                style={{ background: '#9C27B0', color: 'white' }}
                                            >
                                                {srLoading[`label-${order.id}`] ? '...' : '🏷️ Label'}
                                            </button>

                                            {/* Download SR Invoice */}
                                            <button
                                                onClick={() => handleSrAction(`invoice-${order.id}`, { action: 'generate-invoice', orderId: order.shiprocketOrderId }, true)}
                                                disabled={srLoading[`invoice-${order.id}`]}
                                                style={{ background: '#FF9800', color: 'white' }}
                                            >
                                                {srLoading[`invoice-${order.id}`] ? '...' : '📄 Invoice'}
                                            </button>

                                            {/* Cancel on Shiprocket */}
                                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Cancel this order on Shiprocket?')) {
                                                            handleSrAction(`cancel-${order.id}`, { action: 'cancel-order', shiprocketOrderId: order.shiprocketOrderId, orderId: order.id }, false);
                                                        }
                                                    }}
                                                    disabled={srLoading[`cancel-${order.id}`]}
                                                    style={{ background: '#f44336', color: 'white' }}
                                                >
                                                    {srLoading[`cancel-${order.id}`] ? '...' : '❌ Cancel'}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Status feedback */}
                                {Object.entries(srStatus).filter(([k]) => k.endsWith(`-${order.id}`)).map(([k, v]) => v && (
                                    <div key={k} style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: v.ok ? 'green' : 'red', fontWeight: 'bold' }}>
                                        {v.ok ? '✓' : '✗'} {v.msg}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', padding: '1rem', marginTop: '1rem' }}>
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            style={{ padding: '0.5rem 1rem', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1 }}
                        >
                            Previous
                        </button>
                        <span>Page {pagination.page} of {pagination.pages} (Total: {pagination.total})</span>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            style={{ padding: '0.5rem 1rem', cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.pages ? 0.5 : 1 }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
            <style jsx>{`
                .sr-actions-container {
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                    scrollbar-width: none; /* Hide scrollbar Firefox */
                    -ms-overflow-style: none;  /* Hide scrollbar IE/Edge */
                }
                .sr-actions-container::-webkit-scrollbar {
                    display: none; /* Hide scrollbar Chrome/Safari */
                }
                .sr-actions-container button {
                    padding: 0.4rem 0.8rem;
                    font-size: 0.8rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    white-space: nowrap;
                    font-weight: bold;
                    min-width: 100px;
                }
                .sr-actions-container button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                @media (max-width: 600px) {
                    .sr-actions-container {
                        gap: 0.4rem;
                    }
                    .sr-actions-container button {
                        padding: 0.3rem 0.6rem;
                        font-size: 0.75rem;
                        min-width: 80px;
                    }
                }
            `}</style>
        </div>
    );
}
