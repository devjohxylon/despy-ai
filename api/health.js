export default async function handler(request) {
  console.log('Health check API called:', request.method, request.url);
  
  try {
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      message: 'API is working correctly'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(JSON.stringify({ 
      status: 'error',
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 