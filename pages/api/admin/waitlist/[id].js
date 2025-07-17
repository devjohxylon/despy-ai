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

  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      await db.execute(
        'UPDATE waitlist_entries SET status = ? WHERE id = ?',
        [status, id]
      );

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Status update error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await db.execute('DELETE FROM waitlist_entries WHERE id = ?', [id]);
      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Failed to delete entry' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 