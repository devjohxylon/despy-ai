import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Use verified domain if available, fallback to Resend's domain
const getFromEmail = () => {
  // Domain is verified in Resend - use custom domain
  return 'DeSpy AI <noreply@despy.io>';
};

export const sendWelcomeEmail = async (email) => {
  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [email],
      subject: 'Welcome to DeSpy AI Waitlist! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to DeSpy AI</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #0B0F17; color: #F3F4F6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1F2937; border-radius: 10px; padding: 30px; border: 1px solid #374151;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3B82F6; margin: 0; font-size: 2.5em;">DeSpy AI</h1>
              </div>
              
              <h1 style="color: #3B82F6; text-align: center; margin-bottom: 30px;">Welcome to DeSpy AI!</h1>
              
              <p style="margin-bottom: 20px;">Thank you for joining our waitlist! We're excited to have you on board as we build the future of blockchain security.</p>
              
              <h2 style="color: #60A5FA; margin-top: 30px;">What's Next?</h2>
              <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 15px;">✨ You're now on our priority access list</li>
                <li style="margin-bottom: 15px;">📧 You'll receive updates about our progress</li>
                <li style="margin-bottom: 15px;">🎁 Early access to beta features</li>
                <li style="margin-bottom: 15px;">💎 Special launch offers for waitlist members</li>
              </ul>
              
              <div style="text-align: center; margin-top: 40px;">
                <p style="margin-bottom: 30px;">Follow us for the latest updates:</p>
                <a href="https://twitter.com/DeSpyAI" style="color: #60A5FA; text-decoration: none; margin: 0 10px;">Twitter</a>
                <a href="https://discord.gg/jNTHCjStaS" style="color: #60A5FA; text-decoration: none; margin: 0 10px;">Discord</a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #374151; margin: 30px 0;">
              
              <p style="color: #9CA3AF; text-align: center; font-size: 12px;">
                You're receiving this email because you joined the DeSpy AI waitlist.<br>
                To unsubscribe, <a href="https://despy.io/unsubscribe?email=${email}" style="color: #60A5FA;">click here</a>
              </p>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Welcome email sent via Resend to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email via Resend:', error);
    return false;
  }
};

export const sendUpdateEmail = async (email, title, content) => {
  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: [email],
      subject: `DeSpy AI Update: ${title} 🔥`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DeSpy AI Update</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #0B0F17; color: #F3F4F6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1F2937; border-radius: 10px; padding: 30px; border: 1px solid #374151;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3B82F6; margin: 0; font-size: 2.5em;">DeSpy AI</h1>
              </div>
              
              <h1 style="color: #3B82F6; text-align: center; margin-bottom: 30px;">${title}</h1>
              
              <div style="margin-bottom: 30px;">
                ${content}
              </div>
              
              <div style="text-align: center; margin-top: 40px;">
                <p style="margin-bottom: 30px;">Stay connected:</p>
                <a href="https://twitter.com/DeSpyAI" style="color: #60A5FA; text-decoration: none; margin: 0 10px;">Twitter</a>
                <a href="https://discord.gg/jNTHCjStaS" style="color: #60A5FA; text-decoration: none; margin: 0 10px;">Discord</a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #374151; margin: 30px 0;">
              
              <p style="color: #9CA3AF; text-align: center; font-size: 12px;">
                You're receiving this email because you joined the DeSpy AI waitlist.<br>
                To unsubscribe, <a href="https://despy.io/unsubscribe?email=${email}" style="color: #60A5FA;">click here</a>
              </p>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('Update email sent via Resend to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send update email via Resend:', error);
    return false;
  }
}; 