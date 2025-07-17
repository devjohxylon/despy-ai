export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Log the raw request for debugging
      console.log('Analytics request received:', {
        hasBody: !!req.body,
        bodyType: typeof req.body,
        bodyKeys: req.body ? Object.keys(req.body) : [],
        rawBody: req.body
      });

      const { events, sessionId, timestamp, userAgent, screenSize } = req.body;

      // Validate the request structure
      if (!events || !Array.isArray(events)) {
        console.log('Analytics validation failed:', { events, eventsType: typeof events, isArray: Array.isArray(events) });
        return res.status(400).json({ error: 'Invalid events data - events must be an array' });
      }

      // Validate events array is not empty
      if (events.length === 0) {
        console.log('Analytics validation failed: empty events array');
        return res.status(400).json({ error: 'Events array cannot be empty' });
      }

      // Validate each event has required fields
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (!event.event) {
          console.log(`Analytics validation failed: event ${i} missing event name`, {
            eventIndex: i,
            eventData: event,
            eventKeys: Object.keys(event),
            hasEvent: 'event' in event,
            eventValue: event.event,
            allEvents: events.map((e, idx) => ({ 
              index: idx, 
              hasEvent: !!e.event, 
              eventName: e.event,
              keys: Object.keys(e)
            }))
          });
          return res.status(400).json({ error: `Event ${i} missing event name` });
        }
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