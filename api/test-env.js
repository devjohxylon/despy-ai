export default async function handler(request) {
  console.log('Environment test API called');
  
  const envTest = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      tursoUrlLength: process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.length : 0,
      tursoTokenLength: process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN.length : 0,
      nodeVersion: process.version
    },
    message: 'Environment variables check'
  };
  
  console.log('Environment test result:', envTest);
  
  return new Response(JSON.stringify(envTest), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
} 