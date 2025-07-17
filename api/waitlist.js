import { createClient } from '@libsql/client';

console.log('Waitlist API module loaded');

// Initialize database client with better error handling
let db;
try {
  db = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN
  });
  console.log('Database client initialized');
} catch (error) {
  console.error('Failed to initialize database client:', error);
}

export default async function handler(request) {
  console.log('Waitlist API called:', request.method, request.url);
  console.log('Environment variables:', {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'SET' : 'NOT SET',
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET' : 'NOT SET'
  });
  
  if (request.method !== 'POST') {
    console.log('Method not allowed:', request.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers:{'Content-Type': 'application/json'}
    });
  }

  try {
    console.log('Parsing request body...');
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

    console.log('Email validation passed, attempting database operation...');

    // Check if database is available
    if (!db) {
      console.log('Database not available, returning mock response');
      return new Response(JSON.stringify({
        success: true,
        message: 'Successfully joined waitlist (mock - no database)',
        referralCode: 'MOCK123'
      }), {
        status: 200,
        headers:{'Content-Type': 'application/json'}
      });
    }

    // Try to insert into database, fallback to mock if not configured
    try {
      console.log('Executing database insert...');
      await db.execute({
        sql: 'INSERT INTO waitlist (email) VALUES (?)',
        args: [email]
      });
      console.log('Database insert successful');
    } catch (dbError) {
      console.warn('Database error (using mock response):', dbError);
      console.warn('Database error details:', {
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack
      });
      
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
      console.log('Returning mock response due to database error');
      return new Response(JSON.stringify({
        success: true,
        message: 'Successfully joined waitlist (mock - database error)',
        referralCode: 'MOCK123',
        error: dbError.message
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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      type: error.name
    }), {
      status: 500,
      headers:{'Content-Type': 'application/json'}
    });
  }
} 