export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // For now, just log analytics events and return success
      console.log('Analytics event:', req.body);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to track analytics' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 