export default async function handler(request) {
  console.log('Simple test API called');
  
  return new Response(JSON.stringify({
    status: 'ok',
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: {
      hasDatabaseUrl: !!process.env.TURSO_DATABASE_URL,
      hasDatabaseToken: !!process.env.TURSO_AUTH_TOKEN,
      nodeVersion: process.version
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
} 