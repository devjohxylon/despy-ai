// Analytics Service for DeSpy AI
// Handles Google Analytics integration and custom event tracking

class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.gaId = 'GA_MEASUREMENT_ID'; // Replace with actual GA4 ID
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  // Initialize Google Analytics
  init() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    // Load gtag if not already loaded
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', this.gaId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true
      });
    }

    this.isInitialized = true;
    this.log('Analytics initialized');
  }

  // Track page views
  trackPageView(path, title) {
    if (!this.isInitialized) this.init();
    
    if (window.gtag) {
      window.gtag('config', this.gaId, {
        page_path: path,
        page_title: title,
        page_location: window.location.href
      });
    }
    
    this.log('Page view tracked:', { path, title });
  }

  // Track custom events
  trackEvent(eventName, parameters = {}) {
    if (!this.isInitialized) this.init();
    
    const eventData = {
      event_category: parameters.category || 'engagement',
      event_label: parameters.label,
      value: parameters.value,
      custom_parameter_1: 'blockchain_analytics',
      ...parameters
    };

    if (window.gtag) {
      window.gtag('event', eventName, eventData);
    }
    
    this.log('Event tracked:', eventName, eventData);
  }

  // Track user engagement events
  trackEngagement(action, details = {}) {
    this.trackEvent('engagement', {
      category: 'user_engagement',
      action: action,
      ...details
    });
  }

  // Track form submissions
  trackFormSubmission(formName, success = true, details = {}) {
    this.trackEvent('form_submit', {
      category: 'form',
      form_name: formName,
      success: success,
      ...details
    });
  }

  // Track button clicks
  trackButtonClick(buttonName, location = '') {
    this.trackEvent('click', {
      category: 'button',
      button_name: buttonName,
      location: location
    });
  }

  // Track waitlist signups
  trackWaitlistSignup(email, source = 'direct') {
    this.trackEvent('waitlist_signup', {
      category: 'conversion',
      source: source,
      email_domain: email.split('@')[1] || 'unknown'
    });
  }

  // Track performance metrics
  trackPerformance() {
    if (!window.performance) return;

    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
      this.trackEvent('performance', {
        category: 'performance',
        page_load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
        dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
        first_contentful_paint: this.getFirstContentfulPaint()
      });
    }
  }

  // Get First Contentful Paint metric
  getFirstContentfulPaint() {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? Math.round(fcpEntry.startTime) : null;
  }

  // Track scroll depth
  trackScrollDepth() {
    let maxScrollDepth = 0;
    let scrollDepthMarkers = [25, 50, 75, 90, 100];
    let trackedMarkers = [];

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;

        scrollDepthMarkers.forEach(marker => {
          if (scrollPercent >= marker && !trackedMarkers.includes(marker)) {
            trackedMarkers.push(marker);
            this.trackEvent('scroll', {
              category: 'engagement',
              scroll_depth: marker,
              page: window.location.pathname
            });
          }
        });
      }
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
  }

  // Track time on page
  trackTimeOnPage() {
    const startTime = Date.now();
    
    const sendTimeOnPage = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      this.trackEvent('time_on_page', {
        category: 'engagement',
        time_seconds: timeOnPage,
        page: window.location.pathname
      });
    };

    // Track when user leaves page
    window.addEventListener('beforeunload', sendTimeOnPage);
    
    // Also track at intervals for active users
    const intervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    intervals.forEach(seconds => {
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          this.trackEvent('time_milestone', {
            category: 'engagement',
            milestone: seconds,
            page: window.location.pathname
          });
        }
      }, seconds * 1000);
    });
  }

  // Track errors
  trackError(error, context = '') {
    this.trackEvent('error', {
      category: 'error',
      error_message: error.message || 'Unknown error',
      error_stack: error.stack || '',
      context: context,
      page: window.location.pathname
    });
  }

  // Enhanced logging for development
  log(...args) {
    if (this.debugMode) {
      console.log('[Analytics]', ...args);
    }
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  analytics.init();
  
  // Track initial page load
  window.addEventListener('load', () => {
    analytics.trackPerformance();
    analytics.trackScrollDepth();
    analytics.trackTimeOnPage();
  });

  // Track errors
  window.addEventListener('error', (event) => {
    analytics.trackError(event.error, 'global_error_handler');
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(new Error(event.reason), 'unhandled_promise_rejection');
  });
}

export default analytics; 