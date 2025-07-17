import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Try to get count from database, fallback to mock if not configured
    try {
      // First, try to create the table if it doesn't exist
      try {
        await db.execute(`
          CREATE TABLE IF NOT EXISTS waitlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            company TEXT,
            role TEXT,
            interests TEXT,
            referral_code TEXT UNIQUE,
            referred_by TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } catch (tableError) {
        console.warn('Table creation failed:', tableError);
      }
      
      const result = await db.execute('SELECT COUNT(*) as total FROM waitlist');
      return new Response(JSON.stringify({
        total: result.rows[0].total,
        message: 'Current waitlist count'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError) {
      console.warn('Database error (using mock response):', dbError);
      // Return mock data if database fails
      return new Response(JSON.stringify({
        total: 127,
        message: 'Mock stats'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Stats error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 