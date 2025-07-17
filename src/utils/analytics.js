// Enhanced analytics service with comprehensive tracking
const ANALYTICS_ENDPOINT = '/api/analytics';

class Analytics {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.sessionId = this.generateSessionId();
    this.init();
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  init() {
    // Track initial page load
    this.pageView(window.location.pathname);

    // Set up navigation tracking
    if (typeof window !== 'undefined') {
      // Track browser back/forward
      window.addEventListener('popstate', () => {
        this.pageView(window.location.pathname);
      });

      // Track user timing
      this.trackTiming('time_to_first_paint');
      this.trackTiming('time_to_interactive');
    }
  }

  async trackTiming(metric) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.track('performance', {
            metric,
            value: entry.startTime,
            name: entry.name
          });
        });
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    } catch (error) {
      console.error('Performance tracking error:', error);
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const events = [...this.queue];
    this.queue = [];

    try {
      const payload = {
        events,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      // Log the payload being sent for debugging
      console.log('Sending analytics payload:', payload);

      const response = await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analytics request failed:', {
          status: response.status,
          statusText: response.statusText,
          responseText: errorText,
          payload
        });
        throw new Error(`Analytics request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Analytics request successful:', result);
    } catch (error) {
      // Re-queue failed events
      this.queue = [...events, ...this.queue];
      console.error('Failed to send analytics:', error);
      console.error('Failed payload was:', {
        events,
        sessionId: this.sessionId,
        eventCount: events.length
      });
    } finally {
      this.isProcessing = false;
      // Process any new events that came in while processing
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  track(eventName, properties = {}) {
    if (typeof window === 'undefined') return;

    try {
      const event = {
        event: eventName,
        properties: {
          ...properties,
          timestamp: Date.now(),
          path: window.location.pathname,
          referrer: document.referrer,
          language: navigator.language,
        }
      };

      this.queue.push(event);
      this.processQueue();

      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', event);
      }
    } catch (error) {
      console.error('Analytics Error:', error);
    }
  }

  // Page view tracking
  pageView(page) {
    this.track('page_view', {
      page,
      title: document.title,
      loadTime: performance.now()
    });
  }

  // User interaction tracking
  interaction = {
    click: (elementId, properties = {}) => {
      this.track('click', { elementId, ...properties });
    },
    scroll: (depth) => {
      this.track('scroll_depth', { depth });
    },
    hover: (elementId, duration) => {
      this.track('hover', { elementId, duration });
    },
    formSubmit: (formId, success, properties = {}) => {
      this.track('form_submit', { formId, success, ...properties });
    }
  };

  // Waitlist tracking
  waitlist = {
    view: () => this.track('waitlist_view'),
    submit: (email) => this.track('waitlist_submit', { email: this.hashEmail(email) }),
    success: (email) => this.track('waitlist_success', { email: this.hashEmail(email) }),
    error: (email, error) => this.track('waitlist_error', { 
      email: this.hashEmail(email), 
      error: error.message 
    })
  };

  // Social interaction tracking
  social = {
    click: (platform, url) => {
      this.track('social_click', { platform, url });
    },
    share: (platform, content) => {
      this.track('social_share', { platform, content });
    }
  };

  // Feature usage tracking
  feature = {
    use: (featureName, properties = {}) => {
      this.track('feature_use', { feature: featureName, ...properties });
    },
    error: (featureName, error, properties = {}) => {
      this.track('feature_error', {
        feature: featureName,
        error: error.message,
        ...properties
      });
    }
  };

  // Error tracking
  error(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  // Privacy-focused email hashing
  hashEmail(email) {
    // In production, use a proper hashing function
    return email.split('@')[0].substring(0, 2) + '...@' + email.split('@')[1];
  }
}

export default new Analytics(); 