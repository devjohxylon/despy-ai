import { Database } from '@libsql/client';

const db = new Database({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await db.execute('SELECT COUNT(*) as total FROM waitlist');
    res.status(200).json({ total: result.rows[0].total });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
} 