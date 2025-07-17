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

  if (req.method === 'POST') {
    try {
      const { action, ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No IDs provided' });
      }

      const placeholders = ids.map(() => '?').join(',');

      switch (action) {
        case 'approve':
          await db.execute(
            `UPDATE waitlist_entries SET status = 'approved' WHERE id IN (${placeholders})`,
            ids
          );
          break;

        case 'reject':
          await db.execute(
            `UPDATE waitlist_entries SET status = 'rejected' WHERE id IN (${placeholders})`,
            ids
          );
          break;

        case 'delete':
          await db.execute(
            `DELETE FROM waitlist_entries WHERE id IN (${placeholders})`,
            ids
          );
          break;

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Bulk action error:', error);
      res.status(500).json({ error: 'Failed to perform bulk action' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 