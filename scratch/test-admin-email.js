require('dotenv').config();
const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailHost = process.env.EMAIL_HOST || 'smtp.hostinger.com';
const emailPort = Number(process.env.EMAIL_PORT || 465);

async function testAdminEmail() {
    console.log('EMAIL_USER from .env:', emailUser);
    if (!emailUser || !emailPass) {
        console.error('ERROR: EMAIL_USER or EMAIL_PASS not found in .env!');
        return;
    }

    try {
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

        console.log('Sending admin email...');
        const info = await transporter.sendMail({
            from: `"Kosem Perfumes System" <${emailUser}>`,
            to: emailUser, // Sending to yourself
            subject: '🔔 Test Admin Notification - New Order #100',
            html: `
                <h2>Test Admin Notification</h2>
                <p>This is a test notification email sent to the admin email address.</p>
                <p>If you see this email, it means SMTP allows self-sending successfully!</p>
            `
        });

        console.log('Admin email sent successfully!', info.messageId);

    } catch (err) {
        console.error('Error in testAdminEmail:', err);
    }
}

testAdminEmail();
