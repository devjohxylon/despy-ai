import express from 'express';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { nanoid } from 'nanoid';
import Papa from 'papaparse';
import bcrypt from 'bcryptjs';

dotenv.config();

const router = express.Router();
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Rate limiting for admin endpoints
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.use(adminLimiter);

// Stats endpoint
router.get('/stats', async (req, res) => {
  try {
    const total = await db.execute('SELECT COUNT(*) as count FROM waitlist');
    const verified = await db.execute('SELECT COUNT(*) as count FROM waitlist WHERE verified = 1');
    const weeklySignups = await db.execute(`
      SELECT COUNT(*) as count 
      FROM waitlist 
      WHERE created_at >= datetime('now', '-7 days')
    `);
    const verificationRate = (verified.rows[0].count / total.rows[0].count) * 100;

    res.json({
      total: total.rows[0].count,
      verified: verified.rows[0].count,
      weeklySignups: weeklySignups.rows[0].count,
      verificationRate: Math.round(verificationRate)
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get waitlist entries
router.get('/waitlist', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM waitlist';
    const params = [];
    if (search) {
      query += ' WHERE email LIKE ?';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const entries = await db.execute(query, params);
    const total = await db.execute('SELECT COUNT(*) as count FROM waitlist');

    res.json({
      entries: entries.rows,
      totalPages: Math.ceil(total.rows[0].count / limit)
    });
  } catch (error) {
    console.error('Waitlist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});

// Update status
router.patch('/waitlist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute(
      'UPDATE waitlist SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Export data
router.get('/waitlist/export', async (req, res) => {
  try {
    const { format } = req.query;
    const entries = await db.execute('SELECT * FROM waitlist');

    if (format === 'json') {
      res.json(entries.rows);
    } else if (format === 'csv') {
      const csv = Papa.unparse(entries.rows);
      res.header('Content-Type', 'text/csv');
      res.attachment('waitlist.csv');
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Invalid format' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Create admin user (for initial setup)
router.post('/create', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const token = nanoid();

    await db.execute(
      'INSERT INTO admins (username, password_hash, token) VALUES (?, ?, ?)',
      [username, hashedPassword, token]
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

export default router; 