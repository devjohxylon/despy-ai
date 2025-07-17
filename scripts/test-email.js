import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('🚀 Testing email delivery...');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'DeSpy AI <waitlist@despy.io>',
      to: process.env.TEST_EMAIL || 'your-email@example.com',
      subject: 'Test Email from DeSpy AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Test Email from DeSpy AI! 🎉</h1>
          
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            This is a test email to verify your email configuration is working correctly.
          </p>

          <div style="background: #1F2937; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #F3F4F6; margin-top: 0;">Email Configuration Test</h2>
            <ul style="color: #D1D5DB;">
              <li>DKIM Signing ✅</li>
              <li>SPF Record ✅</li>
              <li>DMARC Policy ✅</li>
              <li>Custom Domain ✅</li>
            </ul>
          </div>

          <p style="color: #6B7280; font-size: 14px;">
            If you received this email, your email configuration is working correctly!
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px;">
              © 2024 DeSpy AI. All rights reserved.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Failed to send test email:', error);
    } else {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Email ID:', data.id);
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error);
  }
}

testEmail(); 