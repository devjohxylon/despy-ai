export const getWelcomeEmailTemplate = (email) => ({
  subject: '🚀 Welcome to DeSpy AI - Your Journey to Secure Blockchain Analytics Begins!',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DeSpy AI</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0B0F17; color: #F3F4F6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <img src="https://despy.ai/logo.png" alt="DeSpy AI Logo" style="width: 120px; margin-bottom: 20px;">
            <h1 style="color: #3B82F6; margin: 0; font-size: 28px;">Welcome to DeSpy AI!</h1>
          </div>

          <!-- Main Content -->
          <div style="background: rgba(30, 41, 59, 0.5); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid rgba(59, 130, 246, 0.1);">
            <p style="margin-bottom: 20px; line-height: 1.6;">
              Thank you for joining our waitlist! You're now part of an exclusive group that will be first to experience the future of blockchain security and analytics.
            </p>

            <h2 style="color: #3B82F6; font-size: 20px; margin: 30px 0 20px;">What's Next?</h2>
            <ul style="list-style: none; padding: 0; margin: 0 0 30px;">
              <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
                <span style="color: #3B82F6; position: absolute; left: 0;">✓</span>
                You're now on our priority access list
              </li>
              <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
                <span style="color: #3B82F6; position: absolute; left: 0;">✓</span>
                You'll receive exclusive updates about our progress
              </li>
              <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
                <span style="color: #3B82F6; position: absolute; left: 0;">✓</span>
                Early access to beta features
              </li>
              <li style="padding-left: 25px; position: relative;">
                <span style="color: #3B82F6; position: absolute; left: 0;">✓</span>
                Special launch offers for waitlist members
              </li>
            </ul>

            <p style="margin-bottom: 30px; line-height: 1.6;">
              We're launching on <strong style="color: #3B82F6;">September 1st, 2025</strong>, and we'll keep you updated on our progress.
            </p>
          </div>

          <!-- Social Links -->
          <div style="text-align: center; margin-bottom: 40px;">
            <p style="margin-bottom: 20px; color: #9CA3AF;">Follow us for the latest updates:</p>
            <div>
              <a href="https://twitter.com/DeSpyAI" style="color: #3B82F6; text-decoration: none; margin: 0 15px;">Twitter</a>
              <a href="https://discord.gg/jNTHCjStaS" style="color: #3B82F6; text-decoration: none; margin: 0 15px;">Discord</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; color: #6B7280; font-size: 12px;">
            <p style="margin-bottom: 10px;">
              You're receiving this email because you joined the DeSpy AI waitlist.
            </p>
            <p style="margin: 0;">
              <a href="https://despy.ai/unsubscribe?email=${encodeURIComponent(email)}" style="color: #3B82F6; text-decoration: none;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}); 