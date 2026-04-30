import nodemailer from 'nodemailer';

const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').trim();
// Fallback to commonly used timing if env var is messed up, but try to trim host too
const emailHost = (process.env.EMAIL_HOST || 'smtp.hostinger.com').trim();
const emailPort = Number(process.env.EMAIL_PORT?.trim() || 465);

export const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for 587
    auth: {
        user: emailUser,
        pass: emailPass,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    // 5 seconds
});

export const mailOptions = {
    from: emailUser,
};

export const sendEmail = async (to, subject, html) => {
    if (!emailUser || !emailPass) {
        console.log(`[MAIL MOCK] To: ${to}, Subject: ${subject}, Content: ${html}`);
        return { success: true, message: 'Email logged (Mock)' };
    }

    try {
        await transporter.sendMail({
            from: emailUser,
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        console.error('Detailed Error:', error?.message, error?.stack);
        return { success: false, error: error.message };
    }
};
