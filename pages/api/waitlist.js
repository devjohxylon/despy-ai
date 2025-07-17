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
  if (req.method === 'POST') {
    try {
      const { email, name, referralCode } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // For now, just simulate success until database is properly configured
      console.log('Waitlist signup:', { email, name, referralCode });
      
      // Generate a mock referral code
      const mockReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      res.status(200).json({ 
        success: true, 
        message: 'Successfully joined waitlist',
        referralCode: mockReferralCode
      });
    } catch (error) {
      console.error('Waitlist error:', error);
      res.status(500).json({ error: 'Failed to join waitlist' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 