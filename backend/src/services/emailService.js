const nodemailer = require('nodemailer');
const crypto = require('crypto-js');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  generateVerificationToken(email) {
    const timestamp = new Date().getTime();
    return crypto.SHA256(`${email}-${timestamp}-${process.env.EMAIL_SECRET}`).toString();
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your DeSpy AI Waitlist Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Welcome to DeSpy AI!</h2>
          <p>Thank you for joining our waitlist. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="
            display: inline-block;
            background-color: #3B82F6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          ">Verify Email Address</a>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't sign up for DeSpy AI, you can safely ignore this email.
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email) {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Welcome to DeSpy AI Waitlist!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Thank you for verifying your email!</h2>
          <p>You're now officially on the DeSpy AI waitlist. We'll keep you updated on our progress and let you know when you can access the platform.</p>
          <p>In the meantime, follow us on social media for updates:</p>
          <div style="margin: 20px 0;">
            <a href="https://twitter.com/despyai" style="color: #3B82F6; margin-right: 20px;">Twitter</a>
            <a href="https://discord.gg/despyai" style="color: #3B82F6;">Discord</a>
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            DeSpy AI - Protecting your assets with AI-powered blockchain analysis
          </p>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendAdminNotification(entry) {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Waitlist Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">New Waitlist Registration</h2>
          <p>A new user has joined the waitlist:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Email:</strong> ${entry.email}</li>
            <li><strong>Time:</strong> ${entry.createdAt}</li>
            <li><strong>Browser:</strong> ${entry.analytics.browser}</li>
            <li><strong>Platform:</strong> ${entry.analytics.platform}</li>
            <li><strong>Referrer:</strong> ${entry.analytics.referrer}</li>
          </ul>
          <a href="${process.env.ADMIN_DASHBOARD_URL}" style="
            display: inline-block;
            background-color: #3B82F6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          ">View in Dashboard</a>
        </div>
      `
    };

    return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService(); 