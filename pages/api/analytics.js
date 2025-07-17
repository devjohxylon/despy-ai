export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { events, sessionId, timestamp, userAgent, screenSize } = req.body;

      // Validate the request structure
      if (!events || !Array.isArray(events)) {
        return res.status(400).json({ error: 'Invalid events data' });
      }

      // Log analytics data (in production, you'd store this in a database)
      console.log('Analytics data received:', {
        sessionId,
        timestamp,
        userAgent,
        screenSize,
        eventCount: events.length,
        events: events.map(e => ({ event: e.event, timestamp: e.properties?.timestamp }))
      });

      // Process each event
      events.forEach(event => {
        console.log(`Analytics event: ${event.event}`, {
          properties: event.properties,
          sessionId
        });
      });

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