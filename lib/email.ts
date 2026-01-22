import { Resend } from 'resend';

export interface EmailService {
    send(to: string, subject: string, html: string): Promise<boolean>;
}

export class ConsoleEmailService implements EmailService {
    async send(to: string, subject: string, html: string): Promise<boolean> {
        console.log(`[Email Mock] Sending email to ${to}`);
        console.log(`[Email Mock] Subject: ${subject}`);
        console.log(`[Email Mock] Body Length: ${html.length}`);
        return true;
    }
}

export class ResendEmailService implements EmailService {
    private resend: Resend;

    constructor(apiKey: string) {
        this.resend = new Resend(apiKey);
    }

    async send(to: string, subject: string, html: string): Promise<boolean> {
        try {
            const { error } = await this.resend.emails.send({
                from: 'Landmark Christian University <onboarding@resend.dev>', // Update this with verified domain in production
                to,
                subject,
                html,
            });

            if (error) {
                console.error('Resend error:', error);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Failed to send email:', err);
            return false;
        }
    }
}

// In production, we use Resend if the API key is provided
const apiKey = process.env.RESEND_API_KEY;
export const emailService = apiKey ? new ResendEmailService(apiKey) : new ConsoleEmailService();

export async function sendApplicationReceivedEmail(email: string, name: string, program: string) {
    const subject = `Application Received: ${program}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="color: #261642;">Dear ${name},</h1>
            <p>Thank you for applying to the <strong>${program}</strong> program at Landmark Christian University.</p>
            <p>We have received your application and will review it shortly. You can track your application status in the student portal.</p>
            <p style="margin-top: 30px;">Blessings,<br/><strong>LCU Admissions Team</strong></p>
            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #666; text-align: center;">Landmark Christian University • Equipping the Saints for Global Impact</p>
        </div>
    `;

    return emailService.send(email, subject, html);
}
