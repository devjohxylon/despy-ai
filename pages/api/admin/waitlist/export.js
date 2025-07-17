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

function convertToCSV(data) {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma or quote
      if (value && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

export default async function handler(req, res) {
  if (!requireAdminAuth(req, res)) return;

  if (req.method === 'GET') {
    try {
      const { format = 'csv' } = req.query;

      const result = await db.execute(`
        SELECT id, email, name, referral_code, status, verified, created_at
        FROM waitlist_entries
        ORDER BY created_at DESC
      `);

      const data = result.rows;

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="waitlist.json"');
        res.status(200).json(data);
      } else if (format === 'csv') {
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="waitlist.csv"');
        res.status(200).send(csv);
      } else {
        res.status(400).json({ error: 'Invalid format. Use json or csv.' });
      }

    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 