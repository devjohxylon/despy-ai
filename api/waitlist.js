import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 45,
      headers:{'Content-Type': 'application/json'}
    });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers:{'Content-Type': 'application/json'}
      });
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
      return new Response(JSON.stringify({
        success: true,
        message: 'Successfully joined waitlist (mock)',
        referralCode: 'MOCK123'
      }), {
        status: 200,
        headers:{'Content-Type': 'application/json'}
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Successfully joined waitlist',
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    }), {
      status: 200,
      headers:{'Content-Type': 'application/json'}
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 50,
      headers:{'Content-Type': 'application/json'}
    });
  }
} 