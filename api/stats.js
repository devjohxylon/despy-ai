import { createClient } from '@libsql/client';
import * as Sentry from '@sentry/node';

// --- Sentry setup ---
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'production',
});
// --- End Sentry setup ---

// Create database client with proper error handling
function createDbClient() {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const dbToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!dbUrl || !dbToken) {
    throw new Error('Database environment variables not configured');
  }
  
  try {
    return createClient({
      url: dbUrl,
      authToken: dbToken,
      timeout: 5000
    });
  } catch (error) {
    throw new Error(`Failed to create database client: ${error.message}`);
  }
}

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const db = createDbClient();
    
    // Create table if it doesn't exist
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
    
    const result = await db.execute('SELECT COUNT(*) as total FROM waitlist');
    
    return new Response(JSON.stringify({
      total: result.rows[0].total,
      message: 'Current waitlist count'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    Sentry.captureException(error);
    // Check for environment variable issues
    if (error.message.includes('environment variables not configured')) {
      return new Response(JSON.stringify({ 
        error: 'Server configuration error. Please contact support.',
        details: 'Database not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check for database connection issues
    if (error.message.includes('Failed to create database client') || 
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        error.message.includes('connection')) {
      return new Response(JSON.stringify({ 
        error: 'Database temporarily unavailable. Please try again later.',
        details: 'Connection error'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For any other unexpected error
    return new Response(JSON.stringify({ 
      error: 'Internal server error. Please try again later.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 