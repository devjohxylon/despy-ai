import { createClient } from '@libsql/client';

export default async function handler(request) {
  console.log('Health check API called');
  
  try {
    const dbUrl = process.env.TURSO_DATABASE_URL;
    const dbToken = process.env.TURSO_AUTH_TOKEN;
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        hasDatabaseUrl: !!dbUrl,
        hasDatabaseToken: !!dbToken,
        nodeVersion: process.version
      },
      database: {
        connected: false,
        error: null
      }
    };
    
    if (!dbUrl || !dbToken) {
      health.database.error = 'Missing database environment variables';
      return new Response(JSON.stringify(health), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    try {
      const client = createClient({
        url: dbUrl,
        authToken: dbToken,
        timeout: 3000
      });
      
      // Test connection with a simple query
      await client.execute('SELECT 1 as test');
      health.database.connected = true;
      
    } catch (dbError) {
      health.database.error = dbError.message;
      health.status = 'database_error';
    }
    
    return new Response(JSON.stringify(health), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 