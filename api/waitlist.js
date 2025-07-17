import { createClient } from '@libsql/client';
import * as Sentry from '@sentry/node';

// --- Sentry setup ---
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'production',
});
// --- End Sentry setup ---

// --- Simple in-memory rate limiter (per IP, 5 requests per 10 min) ---
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;
const ipRateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW) {
    // Reset window
    ipRateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }
  entry.count += 1;
  ipRateLimitMap.set(ip, entry);
  return false;
}
// --- End rate limiter ---

// Create database client with optimized settings
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
      timeout: 5000 // Increased timeout for better reliability
    });
  } catch (error) {
    throw new Error(`Failed to create database client: ${error.message}`);
  }
}

export default async function handler(request) {
  // --- Rate limiting ---
  const ip = request.headers?.['x-forwarded-for']?.split(',')[0] || 
             request.headers?.['x-real-ip'] || 
             'unknown';
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // --- End rate limiting ---

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse request body
    let body;
    try {
      if (typeof request.json === 'function') {
        body = await request.json();
      } else if (request.body) {
        body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      } else {
        const text = await request.text();
        body = JSON.parse(text);
      }
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { email } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create database client - this will throw if env vars are missing
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
    
    // Insert the email
    const result = await db.execute({
      sql: 'INSERT INTO waitlist (email) VALUES (?)',
      args: [email]
    });
    
    // Generate a simple referral code
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Successfully joined waitlist',
      referralCode
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    Sentry.captureException(error);
    // Check for unique constraint violation
    if (error.message && (
      error.message.includes('UNIQUE constraint failed') ||
      error.message.includes('SQLite error: UNIQUE constraint failed') ||
      error.message.includes('SQLITE_CONSTRAINT')
    )) {
      return new Response(JSON.stringify({ 
        error: 'This email is already on our waitlist!',
        code: 'EMAIL_EXISTS'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
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