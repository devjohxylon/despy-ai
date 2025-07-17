import { Database } from '@libsql/client';
import { getWelcomeEmailTemplate } from '../server/utils/emailTemplates/welcome.js';
import { sendEmail } from '../server/utils/emailService.js';
import posthog from 'posthog-js';

const db = new Database({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});

// Initialize tables if they don't exist
async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        welcome_email_sent BOOLEAN DEFAULT FALSE,
        source TEXT,
        referral_code TEXT
      )
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  return res.status(200).json({ 
    success: true, 
    message: 'Successfully joined waitlist',
    referralCode: 'MOCK123'
  });
} 