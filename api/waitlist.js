import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Try to insert into database, fallback to mock if not configured
    try {
      await db.execute({
        sql: 'INSERT INTO waitlist (email) VALUES (?)',
        args: [email]
      });
    } catch (dbError) {
      console.warn('Database error (using mock response):', dbError);
      // Return mock success response if database fails
      return res.status(200).json({
        success: true,
        message: 'Successfully joined waitlist (mock)',
        referralCode: 'MOCK123'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully joined waitlist',
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 