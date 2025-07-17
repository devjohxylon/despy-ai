import express from 'express';
import { createClient } from '@libsql/client';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for analytics endpoints
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many analytics requests, please try again later.'
});

// Initialize Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Create analytics tables if they don't exist
async function initializeDatabase() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        properties TEXT,
        user_agent TEXT,
        screen_size TEXT,
        timestamp INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_analytics_session 
      ON analytics_events(session_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_analytics_event 
      ON analytics_events(event_name)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_analytics_timestamp 
      ON analytics_events(timestamp)
    `);
  } catch (error) {
    console.error('Failed to initialize analytics tables:', error);
  }
}

// Initialize database tables
initializeDatabase();

// Track analytics events
router.post('/', analyticsLimiter, async (req, res) => {
  try {
    const { events, sessionId, timestamp, userAgent, screenSize } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'Invalid events data' });
    }

    // Batch insert events
    const values = events.map(event => ({
      session_id: sessionId,
      event_name: event.event,
      properties: JSON.stringify(event.properties),
      user_agent: userAgent,
      screen_size: JSON.stringify(screenSize),
      timestamp
    }));

    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const flatValues = values.flatMap(v => [
      v.session_id,
      v.event_name,
      v.properties,
      v.user_agent,
      v.screen_size,
      v.timestamp
    ]);

    await db.execute(`
      INSERT INTO analytics_events (
        session_id, event_name, properties, user_agent, screen_size, timestamp
      ) VALUES ${placeholders}
    `, flatValues);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to track analytics' });
  }
});

// Get analytics data (protected admin route)
router.get('/', async (req, res) => {
  try {
    const { start, end, event } = req.query;
    
    let query = `
      SELECT 
        event_name,
        COUNT(*) as count,
        MIN(timestamp) as first_seen,
        MAX(timestamp) as last_seen
      FROM analytics_events
    `;

    const whereConditions = [];
    const params = [];

    if (start) {
      whereConditions.push('timestamp >= ?');
      params.push(parseInt(start));
    }

    if (end) {
      whereConditions.push('timestamp <= ?');
      params.push(parseInt(end));
    }

    if (event) {
      whereConditions.push('event_name = ?');
      params.push(event);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` 
      GROUP BY event_name
      ORDER BY count DESC
    `;

    const result = await db.execute(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get dashboard analytics data
router.get('/dashboard', async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    // Calculate the start time based on the range
    const now = Date.now();
    const rangeMap = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };
    const startTime = now - (rangeMap[range] || rangeMap['7d']);

    // Get total users (unique session_ids)
    const totalUsersQuery = await db.execute(`
      SELECT COUNT(DISTINCT session_id) as total
      FROM analytics_events
      WHERE timestamp >= ?
    `, [startTime]);
    const totalUsers = totalUsersQuery.rows[0].total;

    // Get active users (users with multiple events)
    const activeUsersQuery = await db.execute(`
      SELECT COUNT(DISTINCT session_id) as active
      FROM analytics_events
      WHERE timestamp >= ?
      GROUP BY session_id
      HAVING COUNT(*) > 1
    `, [startTime]);
    const activeUsers = activeUsersQuery.rows.length;

    // Calculate average session time
    const sessionTimeQuery = await db.execute(`
      WITH session_times AS (
        SELECT 
          session_id,
          MAX(timestamp) - MIN(timestamp) as duration
        FROM analytics_events
        WHERE timestamp >= ?
        GROUP BY session_id
      )
      SELECT AVG(duration) as avg_duration
      FROM session_times
    `, [startTime]);
    const averageSessionTime = sessionTimeQuery.rows[0].avg_duration || 0;

    // Calculate bounce rate (sessions with only one page view)
    const bounceRateQuery = await db.execute(`
      WITH session_counts AS (
        SELECT 
          session_id,
          COUNT(*) as event_count
        FROM analytics_events
        WHERE timestamp >= ?
        GROUP BY session_id
      )
      SELECT 
        ROUND(
          (COUNT(CASE WHEN event_count = 1 THEN 1 END) * 100.0) / 
          COUNT(*), 
          2
        ) as bounce_rate
      FROM session_counts
    `, [startTime]);
    const bounceRate = bounceRateQuery.rows[0].bounce_rate || 0;

    // Get total interactions
    const interactionsQuery = await db.execute(`
      SELECT COUNT(*) as total
      FROM analytics_events
      WHERE event_name IN ('click', 'scroll', 'hover')
      AND timestamp >= ?
    `, [startTime]);
    const interactions = interactionsQuery.rows[0].total;

    // Get social shares
    const sharesQuery = await db.execute(`
      SELECT COUNT(*) as total
      FROM analytics_events
      WHERE event_name = 'social_share'
      AND timestamp >= ?
    `, [startTime]);
    const socialShares = sharesQuery.rows[0].total;

    // Calculate error rate
    const errorRateQuery = await db.execute(`
      SELECT 
        ROUND(
          (COUNT(CASE WHEN event_name = 'error' THEN 1 END) * 100.0) /
          COUNT(*),
          2
        ) as error_rate
      FROM analytics_events
      WHERE timestamp >= ?
    `, [startTime]);
    const errorRate = errorRateQuery.rows[0].error_rate || 0;

    // Calculate conversion rate (waitlist submissions)
    const conversionRateQuery = await db.execute(`
      WITH visitors AS (
        SELECT COUNT(DISTINCT session_id) as total
        FROM analytics_events
        WHERE timestamp >= ?
      ),
      conversions AS (
        SELECT COUNT(DISTINCT session_id) as total
        FROM analytics_events
        WHERE event_name = 'waitlist_success'
        AND timestamp >= ?
      )
      SELECT 
        ROUND(
          (conversions.total * 100.0) / NULLIF(visitors.total, 0),
          2
        ) as conversion_rate
      FROM visitors, conversions
    `, [startTime, startTime]);
    const conversionRate = conversionRateQuery.rows[0].conversion_rate || 0;

    // Get user activity over time
    const userActivityQuery = await db.execute(`
      SELECT 
        strftime('%Y-%m-%d %H:00:00', datetime(timestamp/1000, 'unixepoch')) as date,
        COUNT(DISTINCT session_id) as value
      FROM analytics_events
      WHERE timestamp >= ?
      GROUP BY date
      ORDER BY date
    `, [startTime]);

    // Get page views over time
    const pageViewsQuery = await db.execute(`
      SELECT 
        strftime('%Y-%m-%d %H:00:00', datetime(timestamp/1000, 'unixepoch')) as date,
        COUNT(*) as value
      FROM analytics_events
      WHERE event_name = 'page_view'
      AND timestamp >= ?
      GROUP BY date
      ORDER BY date
    `, [startTime]);

    // Get interaction types
    const interactionTypesQuery = await db.execute(`
      SELECT 
        event_name as type,
        COUNT(*) as value
      FROM analytics_events
      WHERE event_name IN ('click', 'scroll', 'hover', 'form_submit')
      AND timestamp >= ?
      GROUP BY event_name
      ORDER BY value DESC
    `, [startTime]);

    // Get errors over time
    const errorsQuery = await db.execute(`
      SELECT 
        strftime('%Y-%m-%d %H:00:00', datetime(timestamp/1000, 'unixepoch')) as date,
        COUNT(*) as value
      FROM analytics_events
      WHERE event_name = 'error'
      AND timestamp >= ?
      GROUP BY date
      ORDER BY date
    `, [startTime]);

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          activeUsers,
          averageSessionTime,
          bounceRate,
          interactions,
          socialShares,
          errors: errorRate,
          conversionRate
        },
        charts: {
          userActivity: userActivityQuery.rows,
          pageViews: pageViewsQuery.rows,
          interactions: interactionTypesQuery.rows,
          errors: errorsQuery.rows
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router; 