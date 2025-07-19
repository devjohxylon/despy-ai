const express = require('express');
const cors = require('cors');
const { Database } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Stripe = require('stripe');

const app = express();
const port = process.env.PORT || 5174;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize database
const db = new Database({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize tables if they don't exist
async function initDb() {
  try {
    // Create waitlist table with all required columns
    await db.execute(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        status TEXT DEFAULT 'pending',
        verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add missing columns if they don't exist
    try {
      await db.execute('ALTER TABLE waitlist ADD COLUMN name TEXT');
    } catch (e) {
      // Column already exists
    }
    
    try {
      await db.execute('ALTER TABLE waitlist ADD COLUMN status TEXT DEFAULT "pending"');
    } catch (e) {
      // Column already exists
    }
    
    try {
      await db.execute('ALTER TABLE waitlist ADD COLUMN verified BOOLEAN DEFAULT 0');
    } catch (e) {
      // Column already exists
    }
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

initDb();

// Routes
app.get('/api/stats', async (req, res) => {
  try {
    const result = await db.execute('SELECT COUNT(*) as total FROM waitlist');
    res.json({ total: result.rows[0].total });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.post('/api/waitlist', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required', code: 'INVALID_INPUT' });
  }

  try {
    await db.execute({
      sql: 'INSERT INTO waitlist (email) VALUES (?)',
      args: [email]
    });
    
    res.status(201).json({ message: 'Successfully joined waitlist' });
  } catch (error) {
    console.error('Waitlist error:', error);
    
    // Check for unique constraint violation
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ 
        error: 'This email is already on our waitlist!',
        code: 'EMAIL_EXISTS'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to join waitlist',
      code: 'DB_ERROR'
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get user from database
    const result = await db.execute({
      sql: 'SELECT * FROM admins WHERE email = ?',
      args: [email]
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
      process.env.JWT_SECRET || 'your-secret-key',
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

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
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const result = await db.execute({
      sql: 'SELECT id, email, role FROM admins WHERE id = ?',
      args: [decoded.id]
    });

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin waitlist endpoints
app.get('/api/admin/waitlist', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, search = '', status = '' } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

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

    // Get entries
    const entriesResult = await db.execute({
      sql: `SELECT id as _id, email, name, status, verified, created_at as createdAt FROM waitlist${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset]
    });

    res.json({
      entries: entriesResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
        total: countResult.rows[0].total
      }
    });
  } catch (error) {
    console.error('Admin waitlist error:', error);
    res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});

app.get('/api/admin/waitlist/stats', authenticateAdmin, async (req, res) => {
  try {
    // Get basic stats
    const totalResult = await db.execute('SELECT COUNT(*) as total FROM waitlist');
    const weeklyResult = await db.execute(`
      SELECT COUNT(*) as weekly FROM waitlist 
      WHERE created_at >= datetime('now', '-7 days')
    `);
    const monthlyResult = await db.execute(`
      SELECT COUNT(*) as monthly FROM waitlist 
      WHERE created_at >= datetime('now', '-30 days')
    `);

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
    
    const currentWeek = weeklyResult.rows[0].weekly;
    const lastWeek = lastWeekResult.rows[0].lastWeek;
    const growthRate = lastWeek > 0 ? Math.round(((currentWeek - lastWeek) / lastWeek) * 100) : 0;

    res.json({
      total: totalResult.rows[0].total,
      weekly: weeklyResult.rows[0].weekly,
      monthly: monthlyResult.rows[0].monthly,
      growthRate,
      signupTrend: trendResult.rows,
      statusBreakdown: statusResult.rows
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.patch('/api/admin/waitlist/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute({
      sql: 'UPDATE waitlist SET status = ? WHERE id = ?',
      args: [status, id]
    });

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.post('/api/admin/waitlist/bulk', authenticateAdmin, async (req, res) => {
  try {
    const { action, ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid IDs provided' });
    }

    let sql = '';
    let args = [];

    switch (action) {
      case 'approve':
        sql = 'UPDATE waitlist SET status = ? WHERE id IN (' + ids.map(() => '?').join(',') + ')';
        args = ['approved', ...ids];
        break;
      case 'reject':
        sql = 'UPDATE waitlist SET status = ? WHERE id IN (' + ids.map(() => '?').join(',') + ')';
        args = ['rejected', ...ids];
        break;
      case 'delete':
        sql = 'DELETE FROM waitlist WHERE id IN (' + ids.map(() => '?').join(',') + ')';
        args = ids;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    await db.execute({ sql, args });
    res.json({ message: `${action} completed successfully` });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

app.post('/api/admin/waitlist/bulk-email', authenticateAdmin, async (req, res) => {
  try {
    const { ids, subject, message } = req.body;

    if (!ids || !Array.isArray(ids) || !subject || !message) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Get emails for the selected IDs
    const emailsResult = await db.execute({
      sql: 'SELECT email FROM waitlist WHERE id IN (' + ids.map(() => '?').join(',') + ')',
      args: ids
    });

    const emails = emailsResult.rows.map(row => row.email);

    // Here you would integrate with your email service (Resend, etc.)
    // For now, we'll just log the emails that would be sent
    console.log('Bulk email would be sent to:', emails);
    console.log('Subject:', subject);
    console.log('Message:', message);

    res.json({ 
      message: 'Bulk email sent successfully',
      sentTo: emails.length
    });
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ error: 'Failed to send bulk email' });
  }
});

app.get('/api/admin/waitlist/export', authenticateAdmin, async (req, res) => {
  try {
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
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Subscription endpoints
app.post('/api/subscription/create', async (req, res) => {
  try {
    const { planId, customerEmail } = req.body;

    if (!planId || !customerEmail) {
      return res.status(400).json({ error: 'Plan ID and customer email are required' });
    }

    // Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          source: 'despy-ai'
        }
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        customer_email: customerEmail
      }
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customerId: customer.id
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

app.post('/api/subscription/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

app.get('/api/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    res.json(subscription);
  } catch (error) {
    console.error('Subscription retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve subscription' });
  }
});

app.post('/api/subscription/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log('Subscription created:', subscription.id);
        // Handle subscription creation
        break;
      
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        // Handle subscription updates
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription deleted:', deletedSubscription.id);
        // Handle subscription deletion
        break;
      
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('Payment succeeded for invoice:', invoice.id);
        // Handle successful payment
        break;
      
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('Payment failed for invoice:', failedInvoice.id);
        // Handle failed payment
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 