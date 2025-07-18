import express from 'express';
import { createClient } from '@libsql/client';
import * as Sentry from '@sentry/node';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { sendWelcomeEmail } from './utils/resendService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'production',
});

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: [
    'https://despy.io',
    'https://www.despy.io',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;
const ipRateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW) {
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

// Database client
function createDbClient() {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const dbToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!dbUrl || !dbToken) {
    throw new Error('Database environment variables not configured');
  }
  
  return createClient({
    url: dbUrl,
    authToken: dbToken,
    timeout: 5000
  });
}

// API Routes
app.get('/api/health', async (req, res) => {
  console.log('Health check API called');
  
  try {
    const dbUrl = process.env.TURSO_DATABASE_URL;
    const dbToken = process.env.TURSO_AUTH_TOKEN;
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        hasDatabaseUrl: !!dbUrl,
        hasDatabaseToken: !!dbToken,
        nodeVersion: process.version,
        port: PORT
      },
      database: {
        connected: false,
        error: null
      }
    };
    
    // Only test database if credentials are available
    if (dbUrl && dbToken) {
      try {
        const client = createClient({
          url: dbUrl,
          authToken: dbToken,
          timeout: 3000
        });
        
        await client.execute('SELECT 1 as test');
        health.database.connected = true;
        
      } catch (dbError) {
        health.database.error = dbError.message;
        health.status = 'database_error';
        console.error('Database connection failed:', dbError.message);
      }
    } else {
      health.database.error = 'Database credentials not configured';
      health.status = 'no_database_config';
    }
    
    res.json(health);
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const db = createDbClient();
    
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
    
    res.json({
      total: result.rows[0].total,
      message: 'Current waitlist count'
    });
    
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.',
      details: error.message
    });
  }
});

app.post('/api/waitlist', async (req, res) => {
  // Rate limiting
  const ip = req.ip || req.connection.remoteAddress;
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

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
    await db.execute({
      sql: 'INSERT INTO waitlist (email) VALUES (?)',
      args: [email]
    });
    
    // Generate a simple referral code
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Send welcome email (don't block the response if email fails)
    try {
      // Debug Resend configuration
      console.log('Resend Debug - API_KEY:', !!process.env.RESEND_API_KEY);
      
      // Only send email if Resend is configured
      if (process.env.RESEND_API_KEY) {
        await sendWelcomeEmail(email);
        console.log('Welcome email sent successfully via Resend to:', email);
      } else {
        console.log('Resend not configured, skipping email send to:', email);
        console.log('Missing RESEND_API_KEY');
      }
    } catch (emailError) {
      console.error('Failed to send welcome email to:', email, emailError);
      // Don't fail the request if email fails
    }
    
    res.json({
      success: true,
      message: 'Successfully joined waitlist',
      referralCode
    });
    
  } catch (error) {
    Sentry.captureException(error);
    
    // Check for unique constraint violation
    if (error.message && (
      error.message.includes('UNIQUE constraint failed') ||
      error.message.includes('SQLite error: UNIQUE constraint failed') ||
      error.message.includes('SQLITE_CONSTRAINT')
    )) {
      return res.status(400).json({ 
        error: 'This email is already on our waitlist!',
        code: 'EMAIL_EXISTS'
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.',
      details: error.message
    });
  }
});

// API-only server - no static file serving needed
app.get('/', (req, res) => {
  res.json({
    message: 'DeSpy AI API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      stats: '/api/stats',
      waitlist: '/api/waitlist'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server starting on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Stats API: http://localhost:${PORT}/api/stats`);
  console.log(`📝 Waitlist API: http://localhost:${PORT}/api/waitlist`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Database URL configured: ${!!process.env.TURSO_DATABASE_URL}`);
  console.log(`🔧 Database Token configured: ${!!process.env.TURSO_AUTH_TOKEN}`);
  console.log(`📧 Resend configured: ${!!process.env.RESEND_API_KEY}`);
}); 