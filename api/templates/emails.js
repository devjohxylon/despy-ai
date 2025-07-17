// Base template with common styles and layout
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 30px;
      background: white;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 0.875rem;
    }
    .social-links {
      margin: 20px 0;
      text-align: center;
    }
    .social-links a {
      margin: 0 10px;
      color: #3b82f6;
      text-decoration: none;
    }
    .highlight {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
`;

// Welcome email template
export const welcomeEmail = ({ name = '', referralCode = '' }) => baseTemplate(`
  <div class="header">
    <h1>Welcome to DeSpy AI! 🚀</h1>
  </div>
  <div class="content">
    <p>Hi ${name || 'there'},</p>
    
    <p>Thanks for joining our waitlist! You're now part of an exclusive group that will be first to experience the future of blockchain analytics.</p>
    
    ${referralCode ? `
    <div class="highlight">
      <h3>🎁 Your Referral Code</h3>
      <p>Share this code with friends: <strong>${referralCode}</strong></p>
      <p>For each friend who joins using your code, you'll get:</p>
      <ul>
        <li>1 month of premium features</li>
        <li>Early access to new features</li>
        <li>Special launch pricing</li>
      </ul>
    </div>
    ` : ''}

    <h3>What's Next?</h3>
    <ul>
      <li>Early access to our platform</li>
      <li>Exclusive updates on our progress</li>
      <li>Special launch pricing</li>
    </ul>

    <div class="social-links">
      <a href="https://twitter.com/DespyAI">Twitter</a> |
      <a href="https://github.com/DespyAI">GitHub</a> |
      <a href="https://discord.gg/despy">Discord</a>
    </div>
  </div>
  <div class="footer">
    <p>© 2024 DeSpy AI. All rights reserved.</p>
    <p>You're receiving this because you joined our waitlist.</p>
  </div>
`);

// Update email template
export const updateEmail = ({ title, content, highlights = [] }) => baseTemplate(`
  <div class="header">
    <h1>${title}</h1>
  </div>
  <div class="content">
    <div style="white-space: pre-line">${content}</div>
    
    ${highlights.length > 0 ? `
    <div class="highlight">
      <h3>🎯 Key Updates</h3>
      <ul>
        ${highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="social-links">
      <a href="https://twitter.com/DespyAI">Twitter</a> |
      <a href="https://github.com/DespyAI">GitHub</a> |
      <a href="https://discord.gg/despy">Discord</a>
    </div>
  </div>
  <div class="footer">
    <p>© 2024 DeSpy AI. All rights reserved.</p>
    <p>You're receiving this because you joined our waitlist.</p>
  </div>
`);

// Referral success email template
export const referralSuccessEmail = ({ referrerName = '', referredName = '', rewardDetails }) => baseTemplate(`
  <div class="header">
    <h1>You've Got a Reward! 🎉</h1>
  </div>
  <div class="content">
    <p>Hi ${referrerName || 'there'},</p>
    
    <p>Great news! ${referredName} just joined DeSpy AI using your referral code.</p>
    
    <div class="highlight">
      <h3>🎁 Your Reward</h3>
      <p>${rewardDetails}</p>
    </div>

    <p>Keep sharing your referral code to earn more rewards!</p>

    <div class="social-links">
      <a href="https://twitter.com/DespyAI">Twitter</a> |
      <a href="https://github.com/DespyAI">GitHub</a> |
      <a href="https://discord.gg/despy">Discord</a>
    </div>
  </div>
  <div class="footer">
    <p>© 2024 DeSpy AI. All rights reserved.</p>
  </div>
`); 