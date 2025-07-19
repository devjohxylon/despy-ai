import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email) {
  return resend.emails.send({
    from: 'DeSpy AI <noreply@despy.io>',
    to: email,
    subject: 'Welcome to DeSpy AI Waitlist! 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Welcome to DeSpy AI! 🎉</h1>
        
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">
          Thanks for joining our waitlist! You're now part of an exclusive group that will be first to experience the future of blockchain analytics.
        </p>

        <div style="background: #1F2937; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #F3F4F6; margin-top: 0;">What's Next?</h2>
          <ul style="color: #D1D5DB;">
            <li>Early access to our platform</li>
            <li>Exclusive updates on our progress</li>
            <li>Special launch pricing</li>
          </ul>
        </div>

        <p style="color: #6B7280; font-size: 14px;">
          Stay tuned for updates! We'll be in touch soon with more information.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #9CA3AF; font-size: 12px;">
            © 2024 DeSpy AI. All rights reserved.
          </p>
        </div>
      </div>
    `
  });
}

export async function sendReferralEmail(referrerEmail, referredEmail) {
  return resend.emails.send({
    from: 'DeSpy AI <noreply@despy.io>',
    to: referrerEmail,
    subject: 'You\'ve Earned a Reward! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Great News! 🎉</h1>
        
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">
          Someone just joined DeSpy AI using your referral link! As a thank you, we've added the following rewards to your account:
        </p>

        <div style="background: #1F2937; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #F3F4F6; margin-top: 0;">Your Rewards</h2>
          <ul style="color: #D1D5DB;">
            <li>1 month of premium features</li>
            <li>Early access to new features</li>
            <li>Priority support</li>
          </ul>
        </div>

        <p style="color: #6B7280; font-size: 14px;">
          Keep sharing your referral link to earn more rewards!
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #9CA3AF; font-size: 12px;">
            © 2024 DeSpy AI. All rights reserved.
          </p>
        </div>
      </div>
    `
  });
}

export async function sendUpdateEmail(email, update) {
  return resend.emails.send({
    from: 'DeSpy AI <noreply@despy.io>',
    to: email,
    subject: `DeSpy AI Update: ${update.title} 🚀`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">${update.title}</h1>
        
        <p style="font-size: 16px; line-height: 1.5; color: #374151;">
          ${update.content}
        </p>

        <div style="background: #1F2937; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #F3F4F6; margin-top: 0;">Key Updates</h2>
          <ul style="color: #D1D5DB;">
            ${update.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #9CA3AF; font-size: 12px;">
            © 2024 DeSpy AI. All rights reserved.<br>
            You're receiving this because you joined our waitlist.
          </p>
        </div>
      </div>
    `
  });
} 