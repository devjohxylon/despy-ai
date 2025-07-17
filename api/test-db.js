import { createClient } from '@libsql/client';

export default async function handler(request) {
  console.log('Database test API called');
  
  try {
    // Check environment variables
    const dbUrl = process.env.TURSO_DATABASE_URL;
    const dbToken = process.env.TURSO_AUTH_TOKEN;
    
    console.log('Environment check:', {
      TURSO_DATABASE_URL: dbUrl ? 'SET' : 'NOT SET',
      TURSO_AUTH_TOKEN: dbToken ? 'SET' : 'NOT SET'
    });

    if (!dbUrl || !dbToken) {
      return new Response(JSON.stringify({
        error: 'Database environment variables not configured',
        missing: {
          TURSO_DATABASE_URL: !dbUrl,
          TURSO_AUTH_TOKEN: !dbToken
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Try to connect to database
    console.log('Attempting database connection...');
    const db = createClient({
      url: dbUrl,
      authToken: dbToken,
      timeout: 5000
    });

    // Test connection with a simple query
    console.log('Testing database connection...');
    const result = await db.execute('SELECT 1 as test');
    
    console.log('Database connection successful');
    
    // Check if waitlist table exists
    console.log('Checking if waitlist table exists...');
    try {
      const tableCheck = await db.execute(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='waitlist'
      `);
      
      const tableExists = tableCheck.rows.length > 0;
      
      return new Response(JSON.stringify({
        status: 'success',
        message: 'Database connection working',
        tableExists: tableExists,
        testResult: result.rows[0]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (tableError) {
      console.error('Table check error:', tableError);
      return new Response(JSON.stringify({
        status: 'partial_success',
        message: 'Database connected but table check failed',
        error: tableError.message,
        testResult: result.rows[0]
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Database test error:', error);
    return new Response(JSON.stringify({
      error: 'Database connection failed',
      details: error.message,
      type: error.name
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 