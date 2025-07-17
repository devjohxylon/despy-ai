// Simple waitlist API using CommonJS
module.exports = function handler(req, res) {
  // Set headers
  res.setHeader('Content-Type', 'application/json');
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Simple email validation
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Return success
    console.log('Waitlist signup:', email);
    return res.status(200).json({ 
      success: true, 
      message: 'Successfully joined waitlist',
      referralCode: 'MOCK123'
    });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 