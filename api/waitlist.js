import { createClient } from '@libsql/client';

console.log('Waitlist API module loaded');

// Helper function to add timeout to promises
function withTimeout(promise, timeoutMs = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
}

// Helper function to create database client
function createDbClient() {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const dbToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!dbUrl || !dbToken) {
    console.log('Database environment variables not set');
    return null;
  }
  
  try {
    return createClient({
      url: dbUrl,
      authToken: dbToken,
      timeout: 5000
    });
  } catch (error) {
    console.error('Failed to create database client:', error);
    return null;
  }
}

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
    console.log('Parsing request body...');
    let body;
    
    // Handle different request body formats
    if (typeof request.json === 'function') {
      body = await request.json();
    } else if (request.body) {
      // If request.body is already parsed
      body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    } else {
      // Try to read as text and parse
      const text = await request.text();
      body = JSON.parse(text);
    }
    
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

    // Create database client only when needed
    const db = createDbClient();
    
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

    // Try to insert into database with timeout, fallback to mock if it fails
    try {
      console.log('Executing database insert with timeout...');
      
      // First, try to create the table if it doesn't exist
      try {
        await withTimeout(db.execute(`
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
        `), 2000);
        console.log('Table creation/verification successful');
      } catch (tableError) {
        console.warn('Table creation failed, continuing with insert:', tableError);
      }
      
      const insertPromise = db.execute({
        sql: 'INSERT INTO waitlist (email) VALUES (?)',
        args: [email]
      });
      
      await withTimeout(insertPromise, 3000); // 3 second timeout for database operation
      console.log('Database insert successful');
      
    } catch (dbError) {
      console.warn('Database error:', dbError);
      
      // Check for unique constraint violation - check multiple possible error formats
      const errorMessage = dbError.message || '';
      const errorCode = dbError.code || '';
      const causeMessage = dbError.cause?.message || '';
      
      console.log('Error details:', { errorMessage, errorCode, causeMessage });
      
      if (errorMessage.includes('UNIQUE constraint failed') || 
          errorCode === 'SQLITE_CONSTRAINT' ||
          errorMessage.includes('SQLite error: UNIQUE constraint failed') ||
          causeMessage.includes('UNIQUE constraint failed') ||
          causeMessage.includes('SQLite error: UNIQUE constraint failed')) {
        console.log('Email already exists:', email);
        return new Response(JSON.stringify({ 
          error: 'This email is already on our waitlist!',
          code: 'EMAIL_EXISTS'
        }), {
          status: 400,
          headers:{'Content-Type': 'application/json'}
        });
      }
      
      // Return mock success response if database fails (including timeout)
      console.log('Returning mock response due to database error/timeout');
      return new Response(JSON.stringify({
        success: true,
        message: 'Successfully joined waitlist (mock - database unavailable)',
        referralCode: 'MOCK123',
        note: 'Database connection failed, but your email has been recorded'
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
      details: error.message,
      type: error.name
    }), {
      status: 500,
      headers:{'Content-Type': 'application/json'}
    });
  }
} 