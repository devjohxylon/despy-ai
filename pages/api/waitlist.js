import { Database } from '@libsql/client';

// Initialize database connection
const db = new Database({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Initialize tables if they don't exist
async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        welcome_email_sent BOOLEAN DEFAULT FALSE
      )
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Vercel API route handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required', code: 'INVALID_INPUT' });
  }

  try {
    // Initialize database if needed
    await initDb();

    // Insert email into waitlist
    await db.execute({
      sql: 'INSERT INTO waitlist (email) VALUES (?)',
      args: [email]
    });
    
    // Send welcome email using Resend
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'DeSpy AI <noreply@despy.ai>',
          to: email,
          subject: '🚀 Welcome to DeSpy AI Waitlist!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #3B82F6;">Welcome to DeSpy AI!</h1>
              <p>Thanks for joining our waitlist! You're now part of an exclusive group that will be first to experience the future of blockchain security.</p>
              <p>We're launching on <strong>September 1st, 2025</strong>, and we'll keep you updated on our progress.</p>
              <div style="margin-top: 20px;">
                <p>Follow us:</p>
                <a href="https://twitter.com/DeSpyAI" style="color: #3B82F6; margin-right: 10px;">Twitter</a>
                <a href="https://discord.gg/jNTHCjStaS" style="color: #3B82F6;">Discord</a>
              </div>
            </div>
          `
        })
      });
      
      // Mark welcome email as sent
      await db.execute({
        sql: 'UPDATE waitlist SET welcome_email_sent = TRUE WHERE email = ?',
        args: [email]
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({ message: 'Successfully joined waitlist' });
  } catch (error) {
    console.error('Waitlist error:', error);
    
    // Check for unique constraint violation
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ 
        error: 'This email is already on our waitlist!',
        code: 'EMAIL_EXISTS'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to join waitlist',
      code: 'DB_ERROR'
    });
  }
} 