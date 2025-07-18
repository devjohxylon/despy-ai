export const config = {
  runtime: 'edge',
};

export default function handler(request) {
  return new Response(JSON.stringify({
    status: 'ok',
    message: 'Edge function working!',
    timestamp: new Date().toISOString(),
    environment: 'edge'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
} 