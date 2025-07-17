// Simple stats API using CommonJS
module.exports = function handler(req, res) {
  // Set headers
  res.setHeader('Content-Type', 'application/json');
  
  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Return simple mock stats
    const stats = {
      total: 127,
      message: 'Mock stats data'
    };

    console.log('Stats API working:', stats);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 