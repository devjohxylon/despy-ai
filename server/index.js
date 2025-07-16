import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import mongoose from 'mongoose'; // Commented out for in-memory storage
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { auth, generateToken } from './middleware/auth.js';
// import Admin from './models/admin.js'; // Commented out for in-memory storage
// import Waitlist from './models/waitlist.js'; // Commented out for in-memory storage
// import Analytics from './models/analytics.js'; // Commented out for in-memory storage
import { generateVerificationToken, sendVerificationEmail, sendSuccessEmail } from './utils/emailService.js';
// import { trackEvent, getDashboardStats } from './utils/analytics.js'; // Commented out for in-memory storage
import memoryStorage from './utils/memoryStorage.js';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

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

// Analytics Routes
app.get('/api/analytics/dashboard', auth, async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.post('/api/analytics/track', [
  body('event').isIn(['page_view', 'waitlist_signup', 'email_verified', 'form_submit', 'button_click']).withMessage('Invalid event type')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await trackEvent({
      ...req.body,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Admin Routes with Validation
app.post('/api/admin/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(admin._id);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/setup', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;
    const adminExists = await Admin.findOne({});
    if (adminExists) {
      return res.status(400).json({ error: 'Admin already exists' });
    }
    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/create', auth, [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/list', auth, async (req, res) => {
  try {
    const admins = await Admin.find({}, { username: 1, createdAt: 1 }).lean();
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/:id', auth, [
  param('id').isMongoId().withMessage('Invalid admin ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const adminCount = await Admin.countDocuments();
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin' });
    }
    const result = await Admin.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Admin deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Waitlist Routes with Analytics
app.post('/api/waitlist', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    
    // Track signup attempt
    await trackEvent({
      event: 'waitlist_signup',
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      source: req.body.source || 'direct'
    });

    const existingEntry = await Waitlist.findOne({ email });
    if (existingEntry) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    const verificationToken = generateVerificationToken();
    const waitlistEntry = new Waitlist({ email, verificationToken });
    await waitlistEntry.save();
    
    const emailSent = await sendVerificationEmail(email, verificationToken);
    if (!emailSent) {
      return res.status(201).json({ message: 'Added to waitlist but verification email failed. Please contact support.', status: 'pending_verification' });
    }
    res.status(201).json({ message: 'Please check your email to verify your address', status: 'pending_verification' });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/verify-email/:token', [
  param('token').trim().notEmpty().withMessage('Verification token is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token } = req.params;
    const entry = await Waitlist.findOne({ verificationToken: token, verified: false, tokenExpiry: { $gt: new Date() } });
    if (!entry) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }
    
    entry.verified = true;
    entry.verifiedAt = new Date();
    entry.verificationToken = undefined;
    await entry.save();
    
    // Track email verification
    await trackEvent({
      event: 'email_verified',
      email: entry.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    await sendSuccessEmail(entry.email);
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const entry = await Waitlist.findOne({ email, verified: false });
    if (!entry) {
      return res.status(404).json({ error: 'Email not found or already verified' });
    }
    const verificationToken = generateVerificationToken();
    entry.verificationToken = verificationToken;
    entry.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await entry.save();
    const emailSent = await sendVerificationEmail(email, verificationToken);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    res.json({ message: 'Verification email resent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/waitlist', auth, async (req, res) => {
  try {
    const entries = await Waitlist.find().sort({ createdAt: -1 }).lean();
    res.json({ total: entries.length, entries });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/verify-email', auth, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const entry = await Waitlist.findOne({ email });
    if (!entry) {
      return res.status(404).json({ error: 'Email not found' });
    }
    if (entry.verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    entry.verified = true;
    entry.verifiedAt = new Date();
    entry.verificationToken = undefined;
    await entry.save();
    await sendSuccessEmail(entry.email);
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Manual verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DeSPY-AI';
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    setTimeout(connectWithRetry, 5000);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectWithRetry();
});

// Start server and connect to MongoDB
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectWithRetry();
}); 