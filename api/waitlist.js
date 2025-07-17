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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source = 'direct', referralCode = null } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required', code: 'INVALID_INPUT' });
  }

  try {
    // Initialize database if needed
    await initDb();

    // Track signup attempt
    posthog.capture('waitlist_signup_attempt', {
      email,
      source,
      referralCode,
      timestamp: new Date().toISOString()
    });

    // Insert email into waitlist
    await db.execute({
      sql: 'INSERT INTO waitlist (email, source, referral_code) VALUES (?, ?, ?)',
      args: [email, source, referralCode]
    });
    
    // Send welcome email
    try {
      const template = getWelcomeEmailTemplate(email);
      await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html
      });
      
      // Mark welcome email as sent
      await db.execute({
        sql: 'UPDATE waitlist SET welcome_email_sent = TRUE WHERE email = ?',
        args: [email]
      });

      // Track successful email send
      posthog.capture('welcome_email_sent', {
        email,
        timestamp: new Date().toISOString()
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Track failed email send
      posthog.capture('welcome_email_failed', {
        email,
        error: emailError.message,
        timestamp: new Date().toISOString()
      });
      // Don't fail the request if email fails
    }
    
    // Track successful signup
    posthog.capture('waitlist_signup_success', {
      email,
      source,
      referralCode,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ 
      message: 'Successfully joined waitlist',
      status: 'success'
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    
    // Track error
    posthog.capture('waitlist_signup_error', {
      email,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
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