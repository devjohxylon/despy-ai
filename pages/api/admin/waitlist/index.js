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
      const { 
        page = 1, 
        search = '', 
        status = '',
        sortField = 'created_at',
        sortOrder = 'desc',
        startDate = '',
        endDate = ''
      } = req.query;

      const limit = 20;
      const offset = (page - 1) * limit;
      
      // Build query conditions
      let whereConditions = [];
      let params = [];
      
      if (search) {
        whereConditions.push('email LIKE ?');
        params.push(`%${search}%`);
      }
      
      if (status) {
        whereConditions.push('status = ?');
        params.push(status);
      }
      
      if (startDate) {
        whereConditions.push('created_at >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        whereConditions.push('created_at <= ?');
        params.push(endDate + ' 23:59:59');
      }

      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Get entries
      const entriesQuery = `
        SELECT id, email, name, referral_code, status, verified, created_at 
        FROM waitlist_entries 
        ${whereClause}
        ORDER BY ${sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      const entries = await db.execute(entriesQuery, [...params, limit, offset]);

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM waitlist_entries ${whereClause}`;
      const totalResult = await db.execute(countQuery, params);
      const total = totalResult.rows[0].total;

      res.status(200).json({
        entries: entries.rows,
        totalPages: Math.ceil(total / limit),
        total
      });

    } catch (error) {
      console.error('Admin waitlist fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch waitlist data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 