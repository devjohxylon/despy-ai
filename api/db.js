import { createClient } from '@libsql/client';
import { customAlphabet } from 'nanoid';

// Create database client with fallback
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Generate referral codes
const generateReferralCode = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

// Test database connection
async function testConnection() {
  try {
    await client.execute('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function initDb() {
  try {
    // Test connection first
    await testConnection();

    // Create tables in a transaction
    await client.transaction(async (tx) => {
      // Admin users table
      await tx.execute(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Waitlist table
      await tx.execute(`
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

      // Email campaigns table
      await tx.execute(`
        CREATE TABLE IF NOT EXISTS email_campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          subject TEXT NOT NULL,
          content TEXT NOT NULL,
          status TEXT DEFAULT 'draft',
          sent_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Email events table
      await tx.execute(`
        CREATE TABLE IF NOT EXISTS email_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          campaign_id INTEGER,
          email TEXT NOT NULL,
          event_type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id)
        )
      `);

      // Enhanced analytics table
      await tx.execute(`
        CREATE TABLE IF NOT EXISTS analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event TEXT NOT NULL,
          user_id TEXT,
          session_id TEXT,
          page_url TEXT,
          referrer TEXT,
          user_agent TEXT,
          properties TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Referral analytics table
      await tx.execute(`
        CREATE TABLE IF NOT EXISTS referral_analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          referral_code TEXT NOT NULL,
          referred_email TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          conversion_date DATETIME,
          reward_status TEXT DEFAULT 'pending',
          reward_sent_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (referral_code) REFERENCES waitlist(referral_code)
        )
      `);

      // User engagement metrics table
      await tx.execute(`
        CREATE TABLE IF NOT EXISTS user_engagement (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          event_type TEXT NOT NULL,
          page_path TEXT,
          time_spent INTEGER,
          scroll_depth INTEGER,
          interaction_count INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw new Error('Failed to initialize database');
  }
}

export async function addToWaitlist(data) {
  const { email, name, company, role, interests, referredBy } = data;
  
  try {
    // Generate unique referral code
    let referralCode;
    let attempts = 0;
    const maxAttempts = 5;

    // Keep trying until we get a unique code or max attempts reached
    while (attempts < maxAttempts) {
      referralCode = generateReferralCode();
      
      // Check if code exists
      const existing = await client.execute({
        sql: 'SELECT 1 FROM waitlist WHERE referral_code = ?',
        args: [referralCode]
      });

      if (!existing.rows.length) {
        break;
      }

      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error('Failed to generate unique referral code');
    }

    const result = await client.execute({
      sql: `
        INSERT INTO waitlist (
          email, name, company, role, interests, 
          referral_code, referred_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [email, name || null, company || null, role || null, 
             interests ? JSON.stringify(interests) : null, 
             referralCode, referredBy || null]
    });

    return { 
      success: true, 
      id: result.lastInsertId,
      referralCode 
    };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Email already registered');
    }
    throw error;
  }
}

export async function getWaitlistStats() {
  try {
    const result = await client.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN referred_by IS NOT NULL THEN 1 ELSE 0 END) as referred,
        COUNT(DISTINCT referred_by) as referrers
      FROM waitlist
    `);

    const stats = result.rows[0];
    return {
      total: stats.total || 0,
      verified: stats.verified || 0,
      referred: stats.referred || 0,
      referrers: stats.referrers || 0,
      conversionRate: stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0
    };
  } catch (error) {
    console.error('Failed to fetch waitlist stats:', error);
    throw new Error('Failed to fetch waitlist statistics');
  }
}

export async function createEmailCampaign(campaign) {
  const { name, subject, content } = campaign;
  
  const result = await client.execute({
    sql: `
      INSERT INTO email_campaigns (name, subject, content)
      VALUES (?, ?, ?)
    `,
    args: [name, subject, content]
  });

  return { id: result.lastInsertId };
}

export async function trackEmailEvent(event) {
  const { campaignId, email, eventType } = event;
  
  await client.execute({
    sql: `
      INSERT INTO email_events (campaign_id, email, event_type)
      VALUES (?, ?, ?)
    `,
    args: [campaignId, email, eventType]
  });
}

export async function getReferralLeaderboard() {
  return client.execute(`
    SELECT 
      w1.email,
      w1.referral_code,
      COUNT(w2.id) as referral_count
    FROM waitlist w1
    LEFT JOIN waitlist w2 ON w2.referred_by = w1.referral_code
    GROUP BY w1.id
    HAVING referral_count > 0
    ORDER BY referral_count DESC
    LIMIT 10
  `);
}

export default client; 