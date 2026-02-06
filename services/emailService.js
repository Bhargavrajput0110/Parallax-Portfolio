const nodemailer = require('nodemailer');
class EmailService {
    constructor() {
        this.enabled = !!(process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && process.env.EMAIL_FROM && process.env.ADMIN_EMAIL);

        if (this.enabled) {
            try {
                this.transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
                    secure: process.env.EMAIL_PORT === '465',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });
            } catch (err) {
                console.warn('⚠️ Failed to initialize email transporter, disabling email.', err && err.message);
                this.enabled = false;
            }
        } else {
            console.warn('⚠️ SMTP env vars not configured. Email disabled.');
        }
    }

    async sendAuditConfirmation(auditRequest) {
        if (!this.enabled) return;
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: auditRequest.email,
            subject: 'Digital Audit Request Received - PARALLAX',
            html: `<p>Hi <strong>${auditRequest.name}</strong>,</p><p>Thanks — we've received your request.</p>`
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Confirmation email sent to:', auditRequest.email);
        } catch (error) {
            console.error('Error sending confirmation email:', error && error.message);
        }
    }

    async sendAdminNotification(auditRequest) {
        if (!this.enabled) return;
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: `New Audit Request from ${auditRequest.company}`,
            html: `<p><strong>${auditRequest.name}</strong> submitted an audit request for <strong>${auditRequest.company}</strong>.</p><p>Email: ${auditRequest.email}</p><p>Website: ${auditRequest.website}</p><p>Message: ${auditRequest.message}</p>`
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Admin notification sent');
        } catch (error) {
            console.error('Error sending admin notification:', error && error.message);
        }
    }
}

module.exports = new EmailService();
