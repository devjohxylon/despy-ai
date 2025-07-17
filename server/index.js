const express = require('express');
const cors = require('cors');
const { Database } = require('@libsql/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5174;

// Initialize database
const db = new Database({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize tables if they don't exist
async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 