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
            from: `"Kosem Store" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Order Confirmation #${order.id} - Kosem`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://kosemperfume.com/logo.png" alt="Kosem Logo" style="max-width: 150px;">
                    </div>
                    <h1 style="color: #000;">Order Confirmed!</h1>
                    <p>Hi ${order.shippingName || order.user?.name || 'Customer'},</p>
                    <p>Thank you for your order. Here is your receipt.</p>
                    
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
                    <p>We will notify you when your order ships.</p>
                </div>
            `
        });

        // 2. Send Admin Notification
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        await transporter.sendMail({
            from: `"System Alert" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `🔔 New Order #${order.id} (₹${order.total})`,
            html: `
                <h2>New Order Received</h2>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Customer:</strong> ${order.shippingName || order.user?.name} (${order.shippingPhone || order.user?.phone})</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Amount:</strong> ₹${order.total}</p>
                <p><strong>Items:</strong></p>
                <ul>
                    ${order.items.map(item => `<li>${item.product?.name} x ${item.quantity}</li>`).join('')}
                </ul>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders">View in Admin Panel</a>
            `
        });

        console.log('Invoice email sent to:', customerEmail);
        console.log('Admin notification sent to:', adminEmail);
    } catch (error) {
        console.error('Failed to send email:', error);
        console.error('Detailed Invoice Email Error:', error?.message, error?.stack);
    }
}
