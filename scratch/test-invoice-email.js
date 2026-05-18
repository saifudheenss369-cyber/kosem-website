require('dotenv').config();
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailHost = process.env.EMAIL_HOST || 'smtp.hostinger.com';
const emailPort = Number(process.env.EMAIL_PORT || 465);

async function testInvoiceEmail() {
    console.log('EMAIL_USER from .env:', emailUser);
    if (!emailUser || !emailPass) {
        console.error('ERROR: EMAIL_USER or EMAIL_PASS not found in .env!');
        return;
    }

    try {
        console.log('Fetching Order #24...');
        const order = await prisma.order.findUnique({
            where: { id: 24 },
            include: {
                items: { include: { product: true } }
            }
        });

        if (!order) {
            console.error('Order not found!');
            return;
        }

        console.log('Setting up SMTP Transporter...');
        const transporter = nodemailer.createTransport({
            host: emailHost,
            port: emailPort,
            secure: emailPort === 465,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
        });

        const customerEmail = order.shippingEmail || 'saifudheenss369@gmail.com';
        console.log('Sending invoice email to:', customerEmail);

        const info = await transporter.sendMail({
            from: `"Kosem Store" <${emailUser}>`,
            to: customerEmail,
            subject: `Order Confirmation #${order.id} - Kosem`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://kosemperfume.com/logo.png" alt="Kosem Logo" style="max-width: 150px;">
                    </div>
                    <h1 style="color: #000;">Order Confirmed!</h1>
                    <p>Hi ${order.shippingName || 'Customer'},</p>
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
                        <a href="https://kosemperfume.com/track-order?id=${order.id}" 
                           style="background: #D4AF37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                           Track Your Order
                        </a>
                    </div>
                    <p>We will notify you when your order ships.</p>
                </div>
            `
        });

        console.log('Invoice email sent successfully to customer!', info.messageId);

        // Send to Admin too
        const adminEmail = emailUser;
        const adminInfo = await transporter.sendMail({
            from: `"System Alert" <${emailUser}>`,
            to: adminEmail,
            subject: `🔔 New Order #${order.id} (₹${order.total})`,
            html: `
                <h2>New Order Received</h2>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Customer:</strong> ${order.shippingName} (${order.shippingPhone})</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Amount:</strong> ₹${order.total}</p>
                <p><strong>Items:</strong></p>
                <ul>
                    ${order.items.map(item => `<li>${item.product?.name} x ${item.quantity}</li>`).join('')}
                </ul>
            `
        });
        console.log('Admin notification email sent successfully!', adminInfo.messageId);

    } catch (err) {
        console.error('Error in testInvoiceEmail:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testInvoiceEmail();
