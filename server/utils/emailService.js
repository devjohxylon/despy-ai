import nodemailer from 'nodemailer';
import { welcomeEmailTemplate, updateEmailTemplate } from './emailTemplates.js';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendWelcomeEmail = async (email) => {
  try {
    const template = welcomeEmailTemplate(email);
    
    await transporter.sendMail({
      from: '"DeSpy AI" <noreply@despy.ai>',
      to: email,
      subject: template.subject,
      html: template.html
    });

    console.log('Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
};

export const sendUpdateEmail = async (email, title, content) => {
  try {
    const template = updateEmailTemplate(email, title, content);
    
    await transporter.sendMail({
      from: '"DeSpy AI" <noreply@despy.ai>',
      to: email,
      subject: template.subject,
      html: template.html
    });

    console.log('Update email sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send update email:', error);
    return false;
  }
};

// Bulk send update emails to all waitlist subscribers
export const sendBulkUpdateEmail = async (subscribers, title, content) => {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const email of subscribers) {
    try {
      const template = updateEmailTemplate(email, title, content);
      
      await transporter.sendMail({
        from: '"DeSpy AI" <noreply@despy.ai>',
        to: email,
        subject: template.subject,
        html: template.html
      });

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({ email, error: error.message });
    }
  }

  return results;
}; 