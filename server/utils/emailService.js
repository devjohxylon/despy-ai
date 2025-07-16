import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EMAIL_DIR = './emails';

// Create emails directory if it doesn't exist
if (!fs.existsSync(EMAIL_DIR)) {
  fs.mkdirSync(EMAIL_DIR, { recursive: true });
  console.log('Created emails directory for storing email files');
}

export const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

const saveEmailToFile = async (email, subject, htmlContent) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}_${email.replace('@', '_at_')}.html`;
  const filepath = path.join(EMAIL_DIR, filename);
  
  const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .email-header { background: #f4f4f4; padding: 20px; border-bottom: 2px solid #007cba; }
        .email-body { padding: 20px; }
        .email-footer { background: #f4f4f4; padding: 10px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="email-header">
        <h2>📧 Email Saved to File</h2>
        <p><strong>To:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <div class="email-body">
        ${htmlContent}
    </div>
    <div class="email-footer">
        <p>This email was saved to: ${filepath}</p>
        <p>In production, this would be sent via SMTP service (SendGrid, Mailgun, etc.)</p>
    </div>
</body>
</html>`;

  fs.writeFileSync(filepath, emailContent);
  console.log(`📧 Email saved to file: ${filename}`);
  return filepath;
};

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;
  
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #007cba; text-align: center;">Welcome to DeSpy AI!</h1>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin: 20px 0;">
        <h2>🚀 You're Almost In!</h2>
        <p style="font-size: 18px; margin: 20px 0;">Thank you for joining our exclusive waitlist. We're building the future of decentralized AI analytics.</p>
      </div>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>🔐 Verify Your Email</h3>
        <p>To complete your registration, please click the button below to verify your email address:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background: #007cba; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            ✅ Verify Email Address
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationLink}">${verificationLink}</a>
        </p>
      </div>

      <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4>🎯 What's Next?</h4>
        <ul style="margin: 10px 0;">
          <li>Get early access to DeSpy AI platform</li>
          <li>Exclusive updates on development progress</li>
          <li>Special launch pricing and features</li>
          <li>Direct feedback channel with our team</li>
        </ul>
      </div>

      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>© 2025 DeSpy AI. All rights reserved.</p>
        <p>Building the future of decentralized intelligence.</p>
      </div>
    </div>
  `;

  await saveEmailToFile(email, 'Verify your email for DeSpy AI Waitlist', htmlContent);
};

export const sendSuccessEmail = async (email) => {
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #28a745; text-align: center;">🎉 Welcome to DeSpy AI!</h1>
      
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin: 20px 0;">
        <h2>✅ Email Verified Successfully!</h2>
        <p style="font-size: 18px; margin: 20px 0;">You're now officially part of our exclusive waitlist. Get ready for the future of AI!</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>🚀 You're In!</h3>
        <p>Congratulations! Your email has been verified and you're now on our exclusive waitlist for DeSpy AI.</p>
        
        <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745;">
          <h4 style="margin-top: 0; color: #28a745;">🎁 Exclusive Benefits</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Early Access:</strong> Be among the first to try DeSpy AI</li>
            <li><strong>Special Pricing:</strong> Get founder pricing when we launch</li>
            <li><strong>VIP Updates:</strong> Regular progress updates and sneak peeks</li>
            <li><strong>Direct Line:</strong> Influence features with your feedback</li>
          </ul>
        </div>
      </div>

      <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4>📱 Stay Connected</h4>
        <p>Follow us for the latest updates:</p>
        <div style="text-align: center; margin: 15px 0;">
          <a href="#" style="margin: 0 10px; color: #1da1f2; text-decoration: none;">🐦 Twitter</a>
          <a href="#" style="margin: 0 10px; color: #0077b5; text-decoration: none;">💼 LinkedIn</a>
          <a href="#" style="margin: 0 10px; color: #333; text-decoration: none;">🌐 Website</a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>© 2025 DeSpy AI. All rights reserved.</p>
        <p>The future of decentralized AI analytics is coming soon!</p>
      </div>
    </div>
  `;

  await saveEmailToFile(email, '🎉 Welcome to DeSpy AI - Email Verified!', htmlContent);
}; 