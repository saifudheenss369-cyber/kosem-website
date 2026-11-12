import { transporter } from '@/lib/nodemailer';
import prisma from '@/lib/prisma';

export async function sendInvoiceEmail(order) {
    const emailUser = (process.env.EMAIL_USER || '').trim();
    const customerEmail = (order.shippingEmail || order.user?.email || '').trim();
    if (!emailUser) {
        console.log('[EMAIL MOCK] Would send invoice to:', customerEmail);
        return;
    }

    // 1. Send Customer Receipt (only if valid customer email)
    if (customerEmail && !customerEmail.endsWith('@attarstore.local')) {
        try {
            await transporter.sendMail({
                from: `"Kosem Perfumes" <${emailUser}>`,
                to: customerEmail,
                subject: `Order Confirmation #${order.trackingId || order.id} - Kosem`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src="https://kosemperfumes.com/logo.png" alt="Kosem Logo" style="max-width: 150px;">
                        </div>
                        <h1 style="color: #000;">Order Confirmed!</h1>
                        <p>Hi ${order.shippingName || order.user?.name || 'Customer'},</p>
                        <p>Thank you for your order. Your Tracking ID is: <strong>${order.trackingId || 'KS' + order.id}</strong></p>
                        <p>Here is your receipt.</p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <tr style="background: #f4f4f4;">
                                <th style="padding: 10px; text-align: left;">Item</th>
                                <th style="padding: 10px; text-align: center;">Qty</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                            </tr>
                            ${order.items.map(item => `
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title || item.product?.name || 'Product'}${item.details ? `<br/><small>${item.details}</small>` : ''}</td>
                                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">₹${item.price}</td>
                                </tr>
                            `).join('')}
                        </table>
                        
                        <h3 style="text-align: right;">Total: ₹${order.total}</h3>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://kosemperfumes.com/track-order?id=${order.id}" 
                               style="background: #D4AF37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                               Track Your Order
                            </a>
                        </div>
                        <p>We will notify you when your order ships.</p>
                    </div>
                `
            });
            console.log('Invoice email sent to:', customerEmail);
        } catch (error) {
            console.error('Failed to send customer invoice email:', error?.message);
        }
    }

    // 2. Send Admin Notification (always runs independently even if customer email fails)
    try {
        const recipients = new Set([emailUser]);
        if (process.env.ADMIN_EMAIL) {
            process.env.ADMIN_EMAIL.split(',').forEach(e => {
                if (e.trim()) recipients.add(e.trim());
            });
        }
        try {
            const adminEmailSetting = await prisma.setting.findUnique({ where: { key: 'adminNotificationEmail' } });
            if (adminEmailSetting?.value) {
                adminEmailSetting.value.split(',').forEach(e => {
                    if (e.trim()) recipients.add(e.trim());
                });
            }
        } catch (dbErr) {
            console.error('Could not fetch adminNotificationEmail setting:', dbErr?.message);
        }

        const adminToList = Array.from(recipients).join(', ');
        await transporter.sendMail({
            from: `"Kosem Order Alert" <${emailUser}>`,
            to: adminToList,
            subject: `🔔 New Order #${order.trackingId || order.id} (₹${order.total}) - ${order.shippingName || order.user?.name || 'Customer'}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #222; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #b8860b; margin-top: 0;">🔔 New Order Received</h2>
                    <p><strong>Order ID:</strong> ${order.trackingId || order.id}</p>
                    <p><strong>Payment:</strong> ${order.paymentMethod || 'ONLINE'} (${order.status})</p>
                    <p><strong>Amount:</strong> ₹${order.total}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
                    <p><strong>Customer:</strong> ${order.shippingName || order.user?.name || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${order.shippingPhone || order.user?.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> ${customerEmail || 'N/A'}</p>
                    <p><strong>Address:</strong> ${[order.shippingAddress, order.shippingCity, order.shippingState, order.shippingPincode].filter(Boolean).join(', ')}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
                    <p><strong>Items:</strong></p>
                    <ul>
                        ${order.items.map(item => `<li><strong>${item.title || item.product?.name || 'Product'}</strong> x ${item.quantity} (₹${item.price})${item.details ? `<br/><small style="color:#555;">${item.details}</small>` : ''}</li>`).join('')}
                    </ul>
                    <div style="margin-top: 20px;">
                        <a href="https://kosemperfumes.com/admin/orders"
                           style="background: #D4AF37; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                           View in Admin Panel
                        </a>
                    </div>
                </div>
            `
        });
        console.log('Admin notification sent to:', adminToList);
    } catch (error) {
        console.error('Failed to send admin notification email:', error?.message, error?.stack);
    }
}

export async function sendCancellationEmail(order) {
    const customerEmail = order.shippingEmail || order.user?.email;
    if (!process.env.EMAIL_USER) {
        console.log('[EMAIL MOCK] Would send cancellation email to:', customerEmail);
        return;
    }

    try {
        await transporter.sendMail({
            from: `"Kosem Perfumes" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Order Cancelled #${order.trackingId || order.id} - Kosem`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://kosemperfumes.com/logo.png" alt="Kosem Logo" style="max-width: 150px;">
                    </div>
                    <h1 style="color: #c62828; text-align: center;">Order Cancelled</h1>
                    <p>Hi ${order.shippingName || order.user?.name || 'Customer'},</p>
                    <p>We regret to inform you that your order <strong>#${order.trackingId || 'KS' + order.id}</strong> has been cancelled.</p>
                    
                    <p>Here are the details of the cancelled order:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background: #f4f4f4;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                        </tr>
                        ${order.items.map(item => `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title || item.product?.name || 'Product'}${item.details ? `<br/><small>${item.details}</small>` : ''}</td>
                                <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">₹${item.price}</td>
                            </tr>
                        `).join('')}
                    </table>
                    
                    <h3 style="text-align: right;">Total Amount: ₹${order.total}</h3>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    
                    <p style="font-size: 0.9rem; color: #666;">
                        If you have already paid for this order online, your refund will be processed automatically to the original payment method.
                        If you have any questions, please contact us at <a href="mailto:info@kosemperfumes.com" style="color: #D4AF37;">info@kosemperfumes.com</a> or WhatsApp us at +91-9656867773.
                    </p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="font-style: italic; color: #888;">"Every scent has a story, and we hope to assist you in finding your next signature fragrance."</p>
                        <p style="font-weight: bold; margin-top: 10px; color: #000;">Team Kosem 🕊️</p>
                    </div>
                </div>
            `
        });
        console.log('Cancellation email sent to:', customerEmail);
    } catch (error) {
        console.error('Failed to send cancellation email:', error);
        console.error('Detailed Cancellation Email Error:', error?.message, error?.stack);
    }
}
