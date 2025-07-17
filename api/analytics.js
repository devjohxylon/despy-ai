export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Just return success for now - analytics is disabled anyway
  return res.status(200).json({ success: true });
} 