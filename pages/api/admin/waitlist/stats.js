import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Admin authentication middleware
function requireAdminAuth(req, res) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.VITE_ADMIN_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (!requireAdminAuth(req, res)) return;

  if (req.method === 'GET') {
    try {
      // Get basic stats
      const totalResult = await db.execute('SELECT COUNT(*) as count FROM waitlist_entries');
      const verifiedResult = await db.execute('SELECT COUNT(*) as count FROM waitlist_entries WHERE verified = 1');
      const weeklyResult = await db.execute(`
        SELECT COUNT(*) as count 
        FROM waitlist_entries 
        WHERE created_at >= datetime('now', '-7 days')
      `);
      const referralResult = await db.execute(`
        SELECT COUNT(*) as count 
        FROM waitlist_entries 
        WHERE referral_code IS NOT NULL AND referral_code != ''
      `);

      const total = totalResult.rows[0].count;
      const verified = verifiedResult.rows[0].count;
      const weeklySignups = weeklyResult.rows[0].count;
      const referrals = referralResult.rows[0].count;

      // Calculate conversion rate
      const conversionRate = total > 0 ? Math.round((verified / total) * 100) : 0;

      // Get signup trend for last 7 days
      const trendResult = await db.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM waitlist_entries
        WHERE created_at >= datetime('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY date
      `);

      // Get status breakdown
      const statusResult = await db.execute(`
        SELECT 
          COALESCE(status, 'pending') as status,
          COUNT(*) as count
        FROM waitlist_entries
        GROUP BY status
      `);

      // Calculate growth (mock data for now - you'd compare with previous period)
      const growth = {
        total: 12.5,
        verified: 8.3,
        weekly: 15.7,
        conversion: 2.1,
        referrals: 23.4
      };

      res.status(200).json({
        total,
        verified,
        weeklySignups,
        referrals,
        conversionRate,
        growth,
        signupTrend: trendResult.rows,
        statusBreakdown: statusResult.rows
      });

    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 