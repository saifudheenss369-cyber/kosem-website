import { NextResponse } from 'next/server';
import { transporter } from '@/lib/nodemailer';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const emailHost = process.env.EMAIL_HOST;
        const emailPort = process.env.EMAIL_PORT;

        if (!emailUser || !emailPass) {
            return NextResponse.json({
                success: false,
                error: 'Missing EMAIL_USER or EMAIL_PASS in environment variables on Vercel. Please check Vercel Dashboard > Settings > Environment Variables.',
                envChecked: {
                    EMAIL_USER: emailUser ? 'Present' : 'Missing',
                    EMAIL_PASS: emailPass ? 'Present' : 'Missing',
                    EMAIL_HOST: emailHost || 'Default (smtp.hostinger.com)',
                    EMAIL_PORT: emailPort || 'Default (465)'
                }
            });
        }

        // Send a test mail to the admin/sender address (self-sending diagnostic)
        const info = await transporter.sendMail({
            from: `"Kosem Perfumes Diagnostic" <${emailUser}>`,
            to: emailUser,
            subject: '⚡ Live SMTP Diagnostic Success!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 2px solid #D4AF37; border-radius: 8px;">
                    <h2 style="color: #D4AF37;">⚡ Live SMTP Connection Successful!</h2>
                    <p>Congratulations! Your live Vercel environment variables and Hostinger SMTP connection are working 100% perfectly!</p>
                    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Sender Address:</strong> ${emailUser}</p>
                    <p><strong>SMTP Host:</strong> ${emailHost || 'smtp.hostinger.com'}</p>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            details: 'Diagnostic email sent successfully to ' + emailUser,
            configUsed: {
                host: emailHost || 'smtp.hostinger.com',
                port: emailPort || '465',
                user: emailUser
            }
        });

    } catch (err) {
        console.error('Diagnostic Test Email Error:', err);
        return NextResponse.json({
            success: false,
            error: err.message,
            code: err.code,
            command: err.command,
            stack: err.stack
        }, { status: 500 });
    }
}
