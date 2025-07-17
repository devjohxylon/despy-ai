import { createClient } from '@libsql/client';
import { sendUpdateEmail } from '../email';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Simple auth middleware
const authenticate = (request) => {
  const token = request.headers.get('authorization')?.split(' ')[1];
  return token === process.env.ADMIN_SECRET;
};

export default async function handler(request) {
  // Check authentication
  if (!authenticate(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  switch (request.method) {
    case 'GET':
      try {
        const { rows } = await client.execute(`
          SELECT * FROM waitlist 
          ORDER BY created_at DESC
          LIMIT 100
        `);
        return new Response(JSON.stringify(rows), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error fetching waitlist:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch waitlist' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      break;

    case 'POST':
      try {
        const body = await request.json();
        const { type, data } = body;

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

            return new Response(JSON.stringify({
              message: `Update sent to ${succeeded} recipients (${failed} failed)`,
              succeeded,
              failed
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });

          case 'delete_email':
            const { email } = data;
            await client.execute({
              sql: 'DELETE FROM waitlist WHERE email = ?',
              args: [email]
            });
            return new Response(JSON.stringify({ message: 'Email removed from waitlist' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });

          default:
            return new Response(JSON.stringify({ error: 'Invalid action type' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
        }
      } catch (error) {
        console.error('Error processing admin action:', error);
        return new Response(JSON.stringify({ error: 'Failed to process action' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      break;

    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
  }
} 