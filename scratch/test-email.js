const nodemailer = require('nodemailer');

const emailUser = 'info@kosemperfumes.com';
const emailPass = 'Kosem@123';
const emailHost = 'smtp.hostinger.com';
const emailPort = 465;

async function testEmail() {
    console.log('Initializing transporter...');
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

    try {
        console.log('Sending test email to yourself...');
        const info = await transporter.sendMail({
            from: `"Kosem Perfumes Test" <${emailUser}>`,
            to: emailUser,
            subject: 'Test Email from Kosem Perfumes',
            text: 'This is a test email to verify SMTP configuration.',
            html: '<h1>Kosem Perfumes SMTP Test</h1><p>This is a test email to verify SMTP configuration.</p>'
        });
        console.log('Email sent successfully!', info.messageId);
    } catch (err) {
        console.error('Error sending test email:', err);
    }
}

testEmail();
