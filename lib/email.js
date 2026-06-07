import { transporter } from '@/lib/nodemailer';

// Remove the local transporter definition since we are importing it


export async function sendInvoiceEmail(order) {
    const customerEmail = order.shippingEmail || order.user?.email;
    if (!process.env.EMAIL_USER) {
        console.log('[EMAIL MOCK] Would send invoice to:', customerEmail);
        return;
    }

    try {
        // 1. Send Customer Receipt
        await transporter.sendMail({
            from: `"Kosem Perfumes" <${process.env.EMAIL_USER}>`,
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
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product?.name || 'Product'}</td>
                                <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">₹${item.price}</td>
                            </tr>
                        `).join('')}
                    </table>
                    
                    <h3 style="text-align: right;">Total: ₹${order.total}</h3>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kosemperfumes.com'}/track-order?id=${order.id}" 
                           style="background: #D4AF37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                           Track Your Order
                        </a>
                    </div>
                    <p>We will notify you when your order ships.</p>
                </div>
            `
        });

        // 2. Send Admin Notification
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        await transporter.sendMail({
            from: `"System Alert" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `🔔 New Order #${order.trackingId || order.id} (₹${order.total})`,
            html: `
                <h2>New Order Received</h2>
                <p><strong>Order ID:</strong> ${order.trackingId || order.id}</p>
                <p><strong>Customer:</strong> ${order.shippingName || order.user?.name} (${order.shippingPhone || order.user?.phone})</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Amount:</strong> ₹${order.total}</p>
                <p><strong>Items:</strong></p>
                <ul>
                    ${order.items.map(item => `<li>${item.product?.name} x ${item.quantity}</li>`).join('')}
                </ul>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kosemperfumes.com'}/admin/orders">View in Admin Panel</a>
            `
        });

        console.log('Invoice email sent to:', customerEmail);
        console.log('Admin notification sent to:', adminEmail);
    } catch (error) {
        console.error('Failed to send email:', error);
        console.error('Detailed Invoice Email Error:', error?.message, error?.stack);
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
                                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product?.name || 'Product'}</td>
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
