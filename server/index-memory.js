import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { auth, generateToken } from './middleware/auth.js';
import { generateVerificationToken, sendVerificationEmail, sendSuccessEmail } from './utils/emailService.js';
import memoryStorage from './utils/memoryStorage.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Analytics tracking function
const trackEvent = async (eventData) => {
  try {
    await memoryStorage.createAnalyticsEvent({
      eventType: eventData.event,
      metadata: {
        ip: eventData.ip,
        userAgent: eventData.userAgent,
        referrer: eventData.referrer,
        page: eventData.page,
        utm_source: eventData.source,
        utm_medium: eventData.medium,
        utm_campaign: eventData.campaign,
        sessionId: eventData.sessionId
      }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Analytics tracking middleware
const trackPageView = async (req, res, next) => {
  try {
    await trackEvent({
      event: 'page_view',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      page: req.path,
      source: req.query.utm_source || 'direct',
      medium: req.query.utm_medium,
      campaign: req.query.utm_campaign,
      sessionId: req.sessionID || req.ip + Date.now()
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
  next();
};

// Apply analytics tracking to all requests
app.use(trackPageView);

// Explicit CORS preflight handling with logging
app.options('*', (req, res) => {
  console.log('OPTIONS request received from:', req.headers.origin);
  console.log('Request headers:', req.headers);
  
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Add middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.headers.origin || 'unknown'}`);
  next();
});

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Admin Authentication Routes
app.post('/api/admin/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await memoryStorage.findAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin.id);
    res.json({ 
      token, 
      admin: { 
        id: admin.id, 
        username: admin.username 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected admin routes
app.get('/api/admin/verify', auth, async (req, res) => {
  try {
    const admin = await memoryStorage.findAdminByUsername(req.admin.username);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json({ admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Waitlist Routes
app.post('/api/waitlist/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if email already exists
    const existingEntry = await memoryStorage.findWaitlistByEmail(email);
    if (existingEntry) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    
    // Create waitlist entry
    const entry = await memoryStorage.createWaitlistEntry({
      email,
      verificationToken,
      isVerified: false
    });

    // Track signup event
    await trackEvent({
      event: 'waitlist_signup',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      source: req.query.utm_source || 'direct',
      medium: req.query.utm_medium,
      campaign: req.query.utm_campaign,
      sessionId: req.sessionID || req.ip + Date.now()
    });

    // Send verification email (will fail if email not configured, but that's OK for development)
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.log('Email sending failed (expected in development):', emailError.message);
    }

    res.status(201).json({ 
      message: 'Successfully signed up! Please check your email for verification.',
      entry: { id: entry.id, email: entry.email, isVerified: entry.isVerified }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/waitlist/verify/:token', [
  param('token').notEmpty().withMessage('Token is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find entry by verification token
    const entries = await memoryStorage.getAllWaitlistEntries();
    const entry = entries.find(e => e.verificationToken === token);
    
    if (!entry) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    if (entry.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Update entry
    await memoryStorage.updateWaitlistEntry(entry.email, {
      isVerified: true,
      verifiedAt: new Date(),
      verificationToken: undefined
    });

    // Track verification event
    await trackEvent({
      event: 'email_verified',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      sessionId: req.sessionID || req.ip + Date.now()
    });

    try {
      await sendSuccessEmail(entry.email);
    } catch (emailError) {
      console.log('Success email sending failed (expected in development):', emailError.message);
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected waitlist routes
app.get('/api/waitlist', auth, async (req, res) => {
  try {
    const entries = await memoryStorage.getAllWaitlistEntries();
    res.json(entries);
  } catch (error) {
    console.error('Get waitlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public waitlist stats endpoint
app.get('/api/waitlist/stats', async (req, res) => {
  try {
    const stats = await memoryStorage.getWaitlistStats();
    res.json(stats);
  } catch (error) {
    console.error('Waitlist stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics Routes
app.get('/api/analytics/dashboard', auth, async (req, res) => {
  try {
    const stats = await memoryStorage.getAnalyticsStats();
    res.json(stats);
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/events', auth, async (req, res) => {
  try {
    const { eventType, since, limit = 100 } = req.query;
    const query = {};
    
    if (eventType) query.eventType = eventType;
    if (since) query.since = since;
    
    const events = await memoryStorage.getAnalyticsEvents(query);
    res.json(events.slice(0, limit));
  } catch (error) {
    console.error('Analytics events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Management Routes
app.get('/api/admin/list', auth, async (req, res) => {
  try {
    const admins = await memoryStorage.getAllAdmins();
    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/create', [
  auth,
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existingAdmin = await memoryStorage.findAdminByUsername(username);
    if (existingAdmin) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await memoryStorage.createAdmin({
      username,
      password: hashedPassword
    });

    res.status(201).json({ 
      message: 'Admin created successfully',
      admin: { id: admin.id, username: admin.username, createdAt: admin.createdAt }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/:username', [
  auth,
  param('username').trim().notEmpty().withMessage('Username is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { username } = req.params;
    
    if (username === 'admin') {
      return res.status(400).json({ error: 'Cannot delete default admin account' });
    }

    const deleted = await memoryStorage.deleteAdmin(username);
    if (!deleted) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    storage: 'in-memory',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using in-memory storage for development');
  console.log('Default admin: username="admin", password="admin123"');
}); 