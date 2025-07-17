import { createClient } from '@libsql/client';
import { sendUpdateEmail } from '../email';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Simple auth middleware
const authenticate = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  return token === process.env.ADMIN_SECRET;
};

export default async function handler(req, res) {
  // Check authentication
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { rows } = await client.execute(`
          SELECT * FROM waitlist 
          ORDER BY created_at DESC
          LIMIT 100
        `);
        res.status(200).json(rows);
      } catch (error) {
        console.error('Error fetching waitlist:', error);
        res.status(500).json({ error: 'Failed to fetch waitlist' });
      }
      break;

    case 'POST':
      try {
        const { type, data } = req.body;

        switch (type) {
          case 'send_update':
            const { title, content, highlights } = data;
            
            // Get all waitlist emails
            const { rows } = await client.execute('SELECT email FROM waitlist');
            
            // Send update to each email
            const results = await Promise.allSettled(
              rows.map(row => sendUpdateEmail(row.email, { title, content, highlights }))
            );

            // Count successes and failures
            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            res.status(200).json({
              message: `Update sent to ${succeeded} recipients (${failed} failed)`,
              succeeded,
              failed
            });
            break;

          case 'delete_email':
            const { email } = data;
            await client.execute({
              sql: 'DELETE FROM waitlist WHERE email = ?',
              args: [email]
            });
            res.status(200).json({ message: 'Email removed from waitlist' });
            break;

          default:
            res.status(400).json({ error: 'Invalid action type' });
        }
      } catch (error) {
        console.error('Error processing admin action:', error);
        res.status(500).json({ error: 'Failed to process action' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 