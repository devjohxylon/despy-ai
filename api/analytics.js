import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { event, properties = {}, user_id, session_id, page_url, referrer, user_agent } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Event name is required' });
    }

    try {
      // Store event with enhanced tracking
      await client.execute({
        sql: `INSERT INTO analytics 
              (event, user_id, session_id, page_url, referrer, user_agent, properties) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [event, user_id, session_id, page_url, referrer, user_agent, JSON.stringify(properties)]
      });

      // If it's a user engagement event, store additional metrics
      if (event.startsWith('engagement_')) {
        await client.execute({
          sql: `INSERT INTO user_engagement 
                (user_id, event_type, page_path, time_spent, scroll_depth, interaction_count) 
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [
            user_id,
            event.replace('engagement_', ''),
            properties.page_path,
            properties.time_spent || 0,
            properties.scroll_depth || 0,
            properties.interaction_count || 0
          ]
        });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Analytics error:', error);
      return res.status(500).json({ error: 'Failed to track event' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { timeRange = '7d', metric } = req.query;

      // Calculate date range
      const getDateRange = () => {
        const now = new Date();
        switch (timeRange) {
          case '24h':
            return new Date(now - 24 * 60 * 60 * 1000).toISOString();
          case '7d':
            return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
          case '30d':
            return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
          default:
            return new Date(0).toISOString(); // All time
        }
      };

      const startDate = getDateRange();

      // Get event counts by type
      const eventCounts = await client.execute(`
        SELECT 
          event,
          COUNT(*) as count,
          strftime('%Y-%m-%d', created_at) as date
        FROM analytics
        WHERE created_at >= ?
        GROUP BY event, date
        ORDER BY date DESC
      `, [startDate]);

      // Get user engagement metrics
      const engagementMetrics = await client.execute(`
        SELECT 
          event_type,
          AVG(time_spent) as avg_time_spent,
          AVG(scroll_depth) as avg_scroll_depth,
          AVG(interaction_count) as avg_interactions,
          COUNT(DISTINCT user_id) as unique_users,
          strftime('%Y-%m-%d', created_at) as date
        FROM user_engagement
        WHERE created_at >= ?
        GROUP BY event_type, date
        ORDER BY date DESC
      `, [startDate]);

      // Get top pages
      const topPages = await client.execute(`
        SELECT 
          page_url,
          COUNT(*) as views,
          COUNT(DISTINCT user_id) as unique_views
        FROM analytics
        WHERE created_at >= ?
        AND page_url IS NOT NULL
        GROUP BY page_url
        ORDER BY views DESC
        LIMIT 10
      `, [startDate]);

      // Get referrer breakdown
      const referrerBreakdown = await client.execute(`
        SELECT 
          COALESCE(referrer, 'direct') as source,
          COUNT(*) as visits,
          COUNT(DISTINCT user_id) as unique_visits
        FROM analytics
        WHERE created_at >= ?
        GROUP BY COALESCE(referrer, 'direct')
        ORDER BY visits DESC
      `, [startDate]);

      return res.status(200).json({
        eventCounts: eventCounts.rows,
        engagementMetrics: engagementMetrics.rows,
        topPages: topPages.rows,
        referrerBreakdown: referrerBreakdown.rows,
        timeRange
      });
    } catch (error) {
      console.error('Analytics error:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 