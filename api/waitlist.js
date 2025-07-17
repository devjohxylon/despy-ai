import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(request) {
  console.log('Waitlist API called:', request.method, request.url);
  
  if (request.method !== 'POST') {
    console.log('Method not allowed:', request.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers:{'Content-Type': 'application/json'}
    });
  }

  try {
    const body = await request.json();
    const { email } = body;

    console.log('Received email:', email);

    if (!email) {
      console.log('Email is required');
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers:{'Content-Type': 'application/json'}
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers:{'Content-Type': 'application/json'}
      });
    }

    console.log('Attempting database insert...');

    // Try to insert into database, fallback to mock if not configured
    try {
      await db.execute({
        sql: 'INSERT INTO waitlist (email) VALUES (?)',
        args: [email]
      });
      console.log('Database insert successful');
    } catch (dbError) {
      console.warn('Database error (using mock response):', dbError);
      
      // Check for unique constraint violation
      if (dbError.message && dbError.message.includes('UNIQUE constraint failed')) {
        console.log('Email already exists:', email);
        return new Response(JSON.stringify({ 
          error: 'This email is already on our waitlist!',
          code: 'EMAIL_EXISTS'
        }), {
          status: 400,
          headers:{'Content-Type': 'application/json'}
        });
      }
      
      // Return mock success response if database fails
      console.log('Returning mock response');
      return new Response(JSON.stringify({
        success: true,
        message: 'Successfully joined waitlist (mock)',
        referralCode: 'MOCK123'
      }), {
        status: 200,
        headers:{'Content-Type': 'application/json'}
      });
    }

    console.log('Returning success response');
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
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers:{'Content-Type': 'application/json'}
    });
  }
} 