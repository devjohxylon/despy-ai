// Vercel API route handler for stats
export default async function handler(req, res) {
  // Set CORS headers and Content-Type
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  try {
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Return mock stats for now (until database is connected)
    const mockStats = {
      total: Math.floor(Math.random() * 100) + 50, // Random number between 50-150
      timestamp: new Date().toISOString()
    };

    console.log('Stats API called, returning:', mockStats);
    return res.status(200).json(mockStats);
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch stats',
      message: error.message 
    });
  }
} 