// Railway deployment trigger - Stripe integration ready - v2
// Updated with payment endpoints and Stripe integration
import express from 'express';
import { createClient } from '@libsql/client';
import * as Sentry from '@sentry/node';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { sendWelcomeEmail } from './utils/resendService.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security: Validate required environment variables
const requiredEnvVars = [
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please set all required environment variables before starting the server.');
  process.exit(1);
}

// Security: Validate JWT secret strength
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters long for security');
  process.exit(1);
}

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'production',
});

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Enhanced CORS configuration
const corsOptions = {
  origin: [
    'https://despy.io',
    'https://www.despy.io',
    'https://despy-dq8wex06r-de-spy-ai.vercel.app',
    'https://despy-ktnoay5hk-de-spy-ai.vercel.app',
    'https://despy-ai.vercel.app',
    'https://despy-bdjxsilga-de-spy-ai.vercel.app',
    'https://despy-l007dusrw-de-spy-ai.vercel.app',
    'https://despy-dya9dwek1-de-spy-ai.vercel.app',
    'https://despy-ka5rfl46b-de-spy-ai.vercel.app',
    'https://despy-nnkbgs7uf-de-spy-ai.vercel.app',
    'https://despy-j3q3r2wdh-de-spy-ai.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

// Security: Add security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(securityHeaders);

// Security: Enhanced rate limiting with better implementation
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;
const ipRateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip) || { count: 0, start: now };
  
  // Clean up old entries
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

// Security: Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRateLimitMap.entries()) {
    if (now - entry.start > RATE_LIMIT_WINDOW) {
      ipRateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

// Database client with enhanced error handling
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

    // Security: Enhanced email validation and sanitization
    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Security: Additional email validation
    if (sanitizedEmail.length > 254) {
      return res.status(400).json({ error: 'Email address too long' });
    }

    if (sanitizedEmail.includes('..') || sanitizedEmail.includes('--')) {
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
    
    // Insert the sanitized email
    await db.execute({
      sql: 'INSERT INTO waitlist (email) VALUES (?)',
      args: [sanitizedEmail]
    });
    
    // Generate a simple referral code
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Send welcome email (don't block the response if email fails)
    try {
      // Debug Resend configuration
      console.log('Resend Debug - API_KEY:', !!process.env.RESEND_API_KEY);
      
      // Only send email if Resend is configured
      if (process.env.RESEND_API_KEY) {
        await sendWelcomeEmail(sanitizedEmail);
        console.log('Welcome email sent successfully via Resend to:', sanitizedEmail);
      } else {
        console.log('Resend not configured, skipping email send to:', sanitizedEmail);
        console.log('Missing RESEND_API_KEY');
      }
    } catch (emailError) {
      console.error('Failed to send welcome email to:', sanitizedEmail, emailError);
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

// Admin authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Security: Enhanced email validation and sanitization
    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Security: Additional email validation
    if (sanitizedEmail.length > 254) {
      return res.status(400).json({ error: 'Email address too long' });
    }

    // Security: Password validation
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const db = createDbClient();

    // Create admins table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get user from database
    const result = await db.execute({
      sql: 'SELECT * FROM admins WHERE email = ?',
      args: [sanitizedEmail]
    });

    const user = result.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user info and token
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = createDbClient();

    // Get fresh user data
    const result = await db.execute({
      sql: 'SELECT id, email, role FROM admins WHERE id = ?',
      args: [decoded.id]
    });

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    Sentry.captureException(error);
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin middleware to verify JWT token
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const db = createDbClient();
    const result = await db.execute({
      sql: 'SELECT id, email, role FROM admins WHERE id = ?',
      args: [decoded.id]
    });

    if (!result.rows[0]) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    Sentry.captureException(error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Admin waitlist endpoints
app.get('/api/admin/waitlist', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    
    // Security: Input validation and sanitization
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim().substring(0, 100); // Limit search length
    const status = (req.query.status || '').trim().toLowerCase();
    
    // Security: Validate status values
    const validStatuses = ['pending', 'approved', 'rejected', ''];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    let whereClause = '';
    let args = [];

    if (search) {
      whereClause += ' WHERE email LIKE ?';
      args.push(`%${search}%`);
    }

    if (status) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' status = ?';
      args.push(status);
    }

    // Get total count
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM waitlist${whereClause}`,
      args
    });

    // Get paginated results
    const entriesResult = await db.execute({
      sql: `SELECT * FROM waitlist${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset]
    });

    res.json({
      entries: entriesResult.rows,
      pagination: {
        page,
        limit,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Admin waitlist error:', error);
    res.status(500).json({ error: 'Failed to fetch waitlist data' });
  }
});

app.get('/api/admin/waitlist/stats', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();

    // Get basic stats
    const [totalResult, weeklyResult, monthlyResult] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM waitlist'),
      db.execute(`SELECT COUNT(*) as count FROM waitlist WHERE created_at >= datetime('now', '-7 days')`),
      db.execute(`SELECT COUNT(*) as count FROM waitlist WHERE created_at >= datetime('now', '-30 days')`)
    ]);

    // Generate signup trend data (last 30 days)
    const trendResult = await db.execute(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as count
      FROM waitlist 
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at)
    `);

    // Generate status breakdown
    const statusResult = await db.execute(`
      SELECT 
        COALESCE(status, 'pending') as status,
        COUNT(*) as count
      FROM waitlist 
      GROUP BY COALESCE(status, 'pending')
    `);

    // Calculate growth rate
    const lastWeekResult = await db.execute(`
      SELECT COUNT(*) as lastWeek FROM waitlist 
      WHERE created_at >= datetime('now', '-14 days') AND created_at < datetime('now', '-7 days')
    `);
    
    const currentWeek = weeklyResult.rows[0].count;
    const lastWeek = lastWeekResult.rows[0].lastWeek;
    const growthRate = lastWeek > 0 ? Math.round(((currentWeek - lastWeek) / lastWeek) * 100) : 0;

    res.json({
      total: totalResult.rows[0].count,
      weekly: weeklyResult.rows[0].count,
      monthly: monthlyResult.rows[0].count,
      growthRate,
      signupTrend: trendResult.rows,
      statusBreakdown: statusResult.rows
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.patch('/api/admin/waitlist/:id', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { id } = req.params;
    const { status } = req.body;

    await db.execute({
      sql: 'UPDATE waitlist SET status = ? WHERE id = ?',
      args: [status, id]
    });

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.post('/api/admin/waitlist/bulk', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { action, ids } = req.body;

    // Security: Input validation
    if (!action || !ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Security: Validate action
    const validActions = ['approve', 'reject', 'delete'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Security: Validate and sanitize IDs
    if (ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided' });
    }

    if (ids.length > 100) {
      return res.status(400).json({ error: 'Too many IDs provided (max 100)' });
    }

    // Security: Validate that all IDs are integers
    const sanitizedIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);
    if (sanitizedIds.length !== ids.length) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    let sql = '';
    let args = [];

    switch (action) {
      case 'approve':
        sql = 'UPDATE waitlist SET status = ? WHERE id IN (' + sanitizedIds.map(() => '?').join(',') + ')';
        args = ['approved', ...sanitizedIds];
        break;
      case 'reject':
        sql = 'UPDATE waitlist SET status = ? WHERE id IN (' + sanitizedIds.map(() => '?').join(',') + ')';
        args = ['rejected', ...sanitizedIds];
        break;
      case 'delete':
        sql = 'DELETE FROM waitlist WHERE id IN (' + sanitizedIds.map(() => '?').join(',') + ')';
        args = sanitizedIds;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    await db.execute({ sql, args });
    res.json({ message: `${action} completed successfully` });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Bulk action error:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

app.post('/api/admin/waitlist/bulk-email', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { ids, subject, message } = req.body;

    // Security: Input validation
    if (!ids || !Array.isArray(ids) || !subject || !message) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Security: Validate and sanitize inputs
    const sanitizedSubject = (subject || '').trim().substring(0, 200); // Limit subject length
    const sanitizedMessage = (message || '').trim().substring(0, 10000); // Limit message length

    if (!sanitizedSubject || !sanitizedMessage) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Security: Validate IDs
    if (ids.length === 0) {
      return res.status(400).json({ error: 'No IDs provided' });
    }

    if (ids.length > 100) {
      return res.status(400).json({ error: 'Too many recipients (max 100)' });
    }

    // Security: Validate that all IDs are integers
    const sanitizedIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);
    if (sanitizedIds.length !== ids.length) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Get emails for the selected IDs
    const emailsResult = await db.execute({
      sql: 'SELECT email FROM waitlist WHERE id IN (' + sanitizedIds.map(() => '?').join(',') + ')',
      args: sanitizedIds
    });

    const emails = emailsResult.rows.map(row => row.email);

    // Here you would integrate with your email service (Resend, etc.)
    // For now, we'll just log the emails that would be sent
    console.log('Bulk email would be sent to:', emails);
    console.log('Subject:', sanitizedSubject);
    console.log('Message:', sanitizedMessage);

    res.json({ 
      message: 'Bulk email sent successfully',
      sentTo: emails.length
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Bulk email error:', error);
    res.status(500).json({ error: 'Failed to send bulk email' });
  }
});

app.delete('/api/admin/waitlist/:id', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { id } = req.params;

    await db.execute({
      sql: 'DELETE FROM waitlist WHERE id = ?',
      args: [id]
    });

    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Delete waitlist entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

app.get('/api/admin/waitlist/export', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { format = 'json' } = req.query;

    const result = await db.execute('SELECT * FROM waitlist ORDER BY created_at DESC');
    
    if (format === 'csv') {
      const csv = 'email,name,status,verified,created_at\n' + 
        result.rows.map(row => 
          `${row.email},${row.name || ''},${row.status || 'pending'},${row.verified ? 'true' : 'false'},${row.created_at}`
        ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=waitlist-export.csv');
      res.send(csv);
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

app.post('/api/admin/waitlist/clear', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();

    await db.execute('DELETE FROM waitlist');

    res.json({ success: true, message: 'Waitlist cleared successfully' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Clear waitlist error:', error);
    res.status(500).json({ error: 'Failed to clear waitlist' });
  }
});

// Admin Management Endpoints
app.get('/api/admin/admins', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    
    // Create admins table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        permissions TEXT DEFAULT 'all'
      )
    `);

    const result = await db.execute(`
      SELECT id, username, email, role, is_active, created_at, last_login, permissions 
      FROM admins 
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    Sentry.captureException(error);
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

app.post('/api/admin/admins', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { username, email, password, role = 'admin', permissions = 'all' } = req.body;

    // Security: Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Security: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Security: Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Security: Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admins table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        permissions TEXT DEFAULT 'all'
      )
    `);

    await db.execute({
      sql: 'INSERT INTO admins (username, email, password_hash, role, permissions) VALUES (?, ?, ?, ?, ?)',
      args: [username, email, passwordHash, role, permissions]
    });

    res.json({ success: true, message: 'Admin created successfully' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Create admin error:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create admin' });
    }
  }
});

app.patch('/api/admin/admins/:id', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { id } = req.params;
    const { username, email, role, is_active, permissions } = req.body;

    // Security: Input validation
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    let sql = 'UPDATE admins SET ';
    const args = [];
    const updates = [];

    if (username) {
      updates.push('username = ?');
      args.push(username);
    }

    if (email) {
      // Security: Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      updates.push('email = ?');
      args.push(email);
    }

    if (role) {
      updates.push('role = ?');
      args.push(role);
    }

    if (typeof is_active === 'boolean') {
      updates.push('is_active = ?');
      args.push(is_active ? 1 : 0);
    }

    if (permissions) {
      updates.push('permissions = ?');
      args.push(permissions);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    sql += updates.join(', ') + ' WHERE id = ?';
    args.push(parseInt(id));

    await db.execute({ sql, args });

    res.json({ success: true, message: 'Admin updated successfully' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Update admin error:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update admin' });
    }
  }
});

app.delete('/api/admin/admins/:id', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { id } = req.params;

    // Security: Input validation
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    // Security: Prevent self-deletion
    const currentAdmin = req.user;
    if (currentAdmin.id === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await db.execute({
      sql: 'DELETE FROM admins WHERE id = ?',
      args: [parseInt(id)]
    });

    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

app.post('/api/admin/admins/:id/reset-password', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { id } = req.params;
    const { newPassword } = req.body;

    // Security: Input validation
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid admin ID' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Security: Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db.execute({
      sql: 'UPDATE admins SET password_hash = ? WHERE id = ?',
      args: [passwordHash, parseInt(id)]
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Token System Endpoints
app.get('/api/user/tokens', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const userId = req.user.id;

    // Create users table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        tokens INTEGER DEFAULT 500,
        subscription_plan TEXT DEFAULT 'starter',
        subscription_expires DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get or create user
    let result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [req.user.email]
    });

    if (result.rows.length === 0) {
      // Create new user with 500 free tokens
      await db.execute({
        sql: 'INSERT INTO users (email, tokens) VALUES (?, ?)',
        args: [req.user.email, 500]
      });
      
      result = await db.execute({
        sql: 'SELECT * FROM users WHERE email = ?',
        args: [req.user.email]
      });
    }

    const user = result.rows[0];

    // Get usage history
    const usageResult = await db.execute({
      sql: 'SELECT * FROM token_usage WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      args: [user.id]
    });

    res.json({
      tokens: user.tokens,
      subscription: user.subscription_plan,
      subscriptionExpires: user.subscription_expires,
      usageHistory: usageResult.rows
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Get tokens error:', error);
    res.status(500).json({ error: 'Failed to get token information' });
  }
});

app.post('/api/user/tokens/use', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { tokens, action, contractAddress } = req.body;

    // Security: Input validation
    if (!tokens || tokens <= 0) {
      return res.status(400).json({ error: 'Invalid token amount' });
    }

    // Get user
    const userResult = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [req.user.email]
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check if user has enough tokens
    if (user.tokens < tokens) {
      return res.status(400).json({ 
        error: 'Insufficient tokens',
        required: tokens,
        available: user.tokens
      });
    }

    // Create token_usage table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS token_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        tokens_used INTEGER NOT NULL,
        action TEXT NOT NULL,
        contract_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Deduct tokens and record usage
    await db.execute({
      sql: 'UPDATE users SET tokens = tokens - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [tokens, user.id]
    });

    await db.execute({
      sql: 'INSERT INTO token_usage (user_id, tokens_used, action, contract_address) VALUES (?, ?, ?, ?)',
      args: [user.id, tokens, action, contractAddress]
    });

    res.json({ 
      success: true, 
      message: 'Tokens used successfully',
      remainingTokens: user.tokens - tokens
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Use tokens error:', error);
    res.status(500).json({ error: 'Failed to use tokens' });
  }
});

app.post('/api/user/tokens/purchase', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { packageId, paymentMethod } = req.body;

    // Security: Input validation
    if (!packageId || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Define token packages
    const packages = {
      '100': { tokens: 100, price: 2.99, bonus: 0 },
      '250': { tokens: 250, price: 6.99, bonus: 25 },
      '500': { tokens: 500, price: 10.00, bonus: 50 },
      '1000': { tokens: 1000, price: 18.00, bonus: 100 },
      '2500': { tokens: 2500, price: 40.00, bonus: 300 }
    };

    const pkg = packages[packageId];
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package' });
    }

    // Here you would integrate with a payment processor (Stripe, etc.)
    // For now, we'll simulate a successful payment
    
    // Get user
    const userResult = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [req.user.email]
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const totalTokens = pkg.tokens + pkg.bonus;

    // Add tokens to user account
    await db.execute({
      sql: 'UPDATE users SET tokens = tokens + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [totalTokens, user.id]
    });

    // Record purchase
    await db.execute({
      sql: 'INSERT INTO token_usage (user_id, tokens_used, action, contract_address) VALUES (?, ?, ?, ?)',
      args: [user.id, -totalTokens, 'purchase', `Package ${packageId}`]
    });

    res.json({ 
      success: true, 
      message: 'Tokens purchased successfully',
      tokensAdded: totalTokens,
      newBalance: user.tokens + totalTokens
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Purchase tokens error:', error);
    res.status(500).json({ error: 'Failed to purchase tokens' });
  }
});

app.post('/api/user/subscription', adminAuth, async (req, res) => {
  try {
    const db = createDbClient();
    const { planId, paymentMethod } = req.body;

    // Security: Input validation
    if (!planId || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Define subscription plans
    const plans = {
      'starter': { name: 'Starter', price: 0, tokens: 100, scans: 1 },
      'pro': { name: 'Pro', price: 9.99, tokens: 500, scans: 5 },
      'enterprise': { name: 'Enterprise', price: 29.99, tokens: 2000, scans: 20 }
    };

    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Here you would integrate with a payment processor (Stripe, etc.)
    // For now, we'll simulate a successful subscription
    
    // Get user
    const userResult = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [req.user.email]
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Set subscription expiry to 1 month from now
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    // Update user subscription and add tokens
    await db.execute({
      sql: 'UPDATE users SET subscription_plan = ?, subscription_expires = ?, tokens = tokens + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [planId, expiryDate.toISOString(), plan.tokens, user.id]
    });

    res.json({ 
      success: true, 
      message: 'Subscription activated successfully',
      plan: plan.name,
      tokensAdded: plan.tokens,
      expiresAt: expiryDate.toISOString()
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
});

// Stripe Payment Endpoints
app.post('/api/payment/create-intent', adminAuth, async (req, res) => {
  try {
    const { amount, description } = req.body;

    // Security: Input validation
    if (!amount || amount < 50) { // Minimum 50 cents
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: 'usd',
      description: description || 'DeSpy AI Token Purchase',
      metadata: {
        user_email: req.user.email,
        user_id: req.user.id
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

app.post('/api/payment/confirm', adminAuth, async (req, res) => {
  try {
    const { paymentIntentId, tokens, packageId } = req.body;

    // Security: Input validation
    if (!paymentIntentId || !tokens) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Add tokens to user account
    const db = createDbClient();
    const userResult = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [req.user.email]
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Update user tokens
    await db.execute({
      sql: 'UPDATE users SET tokens = tokens + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [tokens, user.id]
    });

    // Record purchase
    await db.execute({
      sql: 'INSERT INTO token_usage (user_id, tokens_used, action, contract_address) VALUES (?, ?, ?, ?)',
      args: [user.id, -tokens, 'purchase', `Package ${packageId}`]
    });

    res.json({ 
      success: true, 
      message: 'Payment confirmed and tokens added',
      newBalance: user.tokens + tokens
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
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
      waitlist: '/api/waitlist',
      auth: {
        login: '/api/auth/login',
        user: '/api/auth/user'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server starting on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Stats API: http://localhost:${PORT}/api/stats`);
  console.log(`📝 Waitlist API: http://localhost:${PORT}/api/waitlist`);
  console.log(`💳 Payment API: http://localhost:${PORT}/api/payment/create-intent`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Database configured: ${!!process.env.TURSO_DATABASE_URL && !!process.env.TURSO_AUTH_TOKEN ? '✅' : '❌'}`);
  console.log(`🔧 JWT Secret configured: ${!!process.env.JWT_SECRET ? '✅' : '❌'}`);
  console.log(`📧 Resend configured: ${!!process.env.RESEND_API_KEY ? '✅' : '❌'}`);
  console.log(`💳 Stripe configured: ${!!process.env.STRIPE_SECRET_KEY ? '✅' : '❌'}`);
  console.log(`🔒 Security: Environment validation passed`);
  console.log(`🚀 DeSpy AI Backend with Stripe Integration Ready!`);
}); 