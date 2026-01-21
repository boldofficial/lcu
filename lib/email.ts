
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

// In production, you would swap this for ResendEmailService or similar
export const emailService = new ConsoleEmailService();

export async function sendApplicationReceivedEmail(email: string, name: string, program: string) {
    const subject = `Application Received: ${program}`;
    const html = `
        <h1>Dear ${name},</h1>
        <p>Thank you for applying to the <strong>${program}</strong> program at Landmark Christian University.</p>
        <p>We have received your application and will review it shortly.</p>
        <p>Blessings,<br/>LCU Admissions Team</p>
    `;

    return emailService.send(email, subject, html);
}
