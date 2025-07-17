import { createClient } from '@libsql/client';

// Initialize database connection
const db = createClient({
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
  // Set JSON content type header immediately
  res.setHeader('Content-Type', 'application/json');
  
  try {
    if (req.method === 'POST') {
      console.log('Waitlist API called:', {
        method: req.method,
        hasBody: !!req.body,
        bodyType: typeof req.body,
        body: req.body
      });

      const { email, name, referralCode } = req.body || {};

      if (!email) {
        console.log('Validation failed: email required');
        return res.status(400).json({ error: 'Email is required' });
      }

      // Email validation
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
        console.log('Validation failed: invalid email format');
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // For now, just simulate success until database is properly configured
      console.log('Waitlist signup success:', { email, name, referralCode });
      
      // Generate a mock referral code
      const mockReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Successfully joined waitlist',
        referralCode: mockReferralCode
      });
    } else {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ 
        error: `Method ${req.method} Not Allowed`,
        success: false
      });
    }
  } catch (error) {
    console.error('Waitlist error:', error);
    return res.status(500).json({ 
      error: 'Failed to join waitlist',
      message: error.message,
      success: false
    });
  }
} 