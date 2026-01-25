const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendAuditConfirmation(auditRequest) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: auditRequest.email,
            subject: 'Digital Audit Request Received - PARALLAX',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #FF3B30 0%, #00D4FF 100%); color: white; padding: 30px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
                        .highlight { color: #FF3B30; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>PARALLAX</h1>
                            <p>Digital Reality</p>
                        </div>
                        <div class="content">
                            <h2>Thank you for your interest!</h2>
                            <p>Hi <strong>${auditRequest.name}</strong>,</p>
                            <p>We've received your digital audit request for <strong>${auditRequest.company}</strong>.</p>
                            <p>Our team will analyze your website (<a href="${auditRequest.website}">${auditRequest.website}</a>) and get back to you within 24-48 hours with a comprehensive report.</p>
                            <p><strong>Your Message:</strong><br>${auditRequest.message}</p>
                            <p>If you have any questions in the meantime, feel free to reply to this email.</p>
                            <p>Best regards,<br><span class="highlight">The PARALLAX Team</span></p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 PARALLAX. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Confirmation email sent to:', auditRequest.email);
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            throw error;
        }
    }

    async sendAdminNotification(auditRequest) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: `New Audit Request from ${auditRequest.company}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #333; color: white; padding: 20px; }
                        .content { background: #f9f9f9; padding: 20px; }
                        .field { margin-bottom: 15px; }
                        .label { font-weight: bold; color: #FF3B30; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🔔 New Audit Request</h2>
                        </div>
                        <div class="content">
                            <div class="field">
                                <span class="label">Name:</span> ${auditRequest.name}
                            </div>
                            <div class="field">
                                <span class="label">Email:</span> ${auditRequest.email}
                            </div>
                            <div class="field">
                                <span class="label">Company:</span> ${auditRequest.company}
                            </div>
                            <div class="field">
                                <span class="label">Website:</span> <a href="${auditRequest.website}">${auditRequest.website}</a>
                            </div>
                            <div class="field">
                                <span class="label">Message:</span><br>${auditRequest.message}
                            </div>
                            <div class="field">
                                <span class="label">Submitted:</span> ${new Date(auditRequest.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Admin notification sent');
        } catch (error) {
            console.error('Error sending admin notification:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();
