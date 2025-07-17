import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 45,
      headers:[object Object]Content-Type': application/json }    });
  }

  try {
    // Try to get count from database, fallback to mock if not configured
    try {
      const result = await db.execute('SELECT COUNT(*) as total FROM waitlist');
      return new Response(JSON.stringify({
        total: result.rows0l,
        message:Current waitlist count'
      }), [object Object]       status: 200,
        headers:[object Object]Content-Type': application/json' }
      });
    } catch (dbError)[object Object]      console.warn('Database error (using mock response):,dbError);
      // Return mock data if database fails
      return new Response(JSON.stringify({
        total: 127,
        message: Mock stats'
      }), [object Object]       status: 200,
        headers:[object Object]Content-Type': application/json' }
      });
    }
  } catch (error) {
    console.error('Stats error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 50,
      headers:[object Object]Content-Type': application/json }
    });
  }
} 