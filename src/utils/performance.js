// Performance monitoring utilities for Core Web Vitals and SEO metrics
import analytics from './analytics';

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
    this.isInitialized = false;
  }

  // Initialize performance monitoring
  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.setupPerformanceObserver();
    this.monitorCoreWebVitals();
    this.trackResourceTimings();
    this.monitorNetworkQuality();

    // Track when page becomes interactive
    if (document.readyState === 'complete') {
      this.onPageLoad();
    } else {
      window.addEventListener('load', () => this.onPageLoad());
    }

    this.isInitialized = true;
  }

  // Monitor Core Web Vitals (LCP, FID, CLS)
  monitorCoreWebVitals() {
    // Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entry) => {
      const lcp = Math.round(entry.startTime);
      this.metrics.lcp = lcp;
      analytics.trackEvent('core_web_vitals', {
        metric: 'lcp',
        value: lcp,
        rating: this.getLCPRating(lcp)
      });
    });

    // First Input Delay
    this.observeMetric('first-input', (entry) => {
      const fid = Math.round(entry.processingStart - entry.startTime);
      this.metrics.fid = fid;
      analytics.trackEvent('core_web_vitals', {
        metric: 'fid',
        value: fid,
        rating: this.getFIDRating(fid)
      });
    });

    // Cumulative Layout Shift
    this.observeLayoutShift();

    // First Contentful Paint
    this.observeMetric('first-contentful-paint', (entry) => {
      const fcp = Math.round(entry.startTime);
      this.metrics.fcp = fcp;
      analytics.trackEvent('core_web_vitals', {
        metric: 'fcp',
        value: fcp,
        rating: this.getFCPRating(fcp)
      });
    });
  }

  // Setup Performance Observer
  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }
  }

  // Observe specific performance metrics
  observeMetric(metricName, callback) {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          callback(entries[entries.length - 1]);
        }
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Could not observe ${metricName}:`, error);
    }
  }

  // Monitor Cumulative Layout Shift
  observeLayoutShift() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const clsEntries = [];

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        }

        this.metrics.cls = clsValue;
        analytics.trackEvent('core_web_vitals', {
          metric: 'cls',
          value: clsValue,
          rating: this.getCLSRating(clsValue)
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Could not observe layout shift:', error);
    }
  }

  // Track resource loading performance
  trackResourceTimings() {
    if (!window.performance || !window.performance.getEntriesByType) return;

    const resources = window.performance.getEntriesByType('resource');
    const resourceMetrics = {
      totalResources: resources.length,
      slowResources: [],
      largeResources: [],
      failedResources: []
    };

    resources.forEach(resource => {
      const loadTime = resource.responseEnd - resource.startTime;
      const size = resource.transferSize || 0;

      // Track slow resources (>1000ms)
      if (loadTime > 1000) {
        resourceMetrics.slowResources.push({
          name: resource.name,
          loadTime: Math.round(loadTime),
          size: size
        });
      }

      // Track large resources (>1MB)
      if (size > 1024 * 1024) {
        resourceMetrics.largeResources.push({
          name: resource.name,
          size: Math.round(size / 1024 / 1024 * 100) / 100, // MB
          loadTime: Math.round(loadTime)
        });
      }

      // Track failed resources
      if (resource.responseStatus >= 400) {
        resourceMetrics.failedResources.push({
          name: resource.name,
          status: resource.responseStatus
        });
      }
    });

    analytics.trackEvent('resource_performance', resourceMetrics);
  }

  // Monitor network quality
  monitorNetworkQuality() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      analytics.trackEvent('network_quality', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });

      // Listen for network changes
      connection.addEventListener('change', () => {
        analytics.trackEvent('network_change', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink
        });
      });
    }
  }

  // Process performance entries
  processPerformanceEntry(entry) {
    if (entry.entryType === 'navigation') {
      this.trackNavigationTiming(entry);
    } else if (entry.entryType === 'resource') {
      this.trackResourceTiming(entry);
    }
  }

  // Track navigation timing
  trackNavigationTiming(entry) {
    const metrics = {
      dns_lookup: Math.round(entry.domainLookupEnd - entry.domainLookupStart),
      tcp_connection: Math.round(entry.connectEnd - entry.connectStart),
      ssl_negotiation: entry.secureConnectionStart ? Math.round(entry.connectEnd - entry.secureConnectionStart) : 0,
      time_to_first_byte: Math.round(entry.responseStart - entry.requestStart),
      dom_content_loaded: Math.round(entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart),
      page_load_complete: Math.round(entry.loadEventEnd - entry.loadEventStart),
      total_page_load: Math.round(entry.loadEventEnd - entry.fetchStart)
    };

    analytics.trackEvent('navigation_timing', metrics);
    this.metrics.navigation = metrics;
  }

  // Track individual resource timing
  trackResourceTiming(entry) {
    const loadTime = entry.responseEnd - entry.startTime;
    
    // Only track resources that took longer than 100ms
    if (loadTime > 100) {
      analytics.trackEvent('slow_resource', {
        resource_name: entry.name.split('/').pop(),
        load_time: Math.round(loadTime),
        resource_type: this.getResourceType(entry.name),
        size: entry.transferSize || 0
      });
    }
  }

  // Get resource type from URL
  getResourceType(url) {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.svg')) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  // Rating functions for Core Web Vitals
  getLCPRating(lcp) {
    if (lcp <= 2500) return 'good';
    if (lcp <= 4000) return 'needs_improvement';
    return 'poor';
  }

  getFIDRating(fid) {
    if (fid <= 100) return 'good';
    if (fid <= 300) return 'needs_improvement';
    return 'poor';
  }

  getCLSRating(cls) {
    if (cls <= 0.1) return 'good';
    if (cls <= 0.25) return 'needs_improvement';
    return 'poor';
  }

  getFCPRating(fcp) {
    if (fcp <= 1800) return 'good';
    if (fcp <= 3000) return 'needs_improvement';
    return 'poor';
  }

  // Called when page is fully loaded
  onPageLoad() {
    // Track overall page performance score
    const score = this.calculatePerformanceScore();
    analytics.trackEvent('page_performance_score', {
      score: score,
      metrics: this.metrics
    });

    // Track page size
    this.trackPageSize();
  }

  // Calculate overall performance score
  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct points based on Core Web Vitals
    if (this.metrics.lcp > 2500) score -= 20;
    if (this.metrics.fid > 100) score -= 20;
    if (this.metrics.cls > 0.1) score -= 20;
    if (this.metrics.fcp > 1800) score -= 20;

    return Math.max(0, score);
  }

  // Track total page size
  trackPageSize() {
    if (!window.performance || !window.performance.getEntriesByType) return;

    const resources = window.performance.getEntriesByType('resource');
    const totalSize = resources.reduce((size, resource) => {
      return size + (resource.transferSize || 0);
    }, 0);

    analytics.trackEvent('page_size', {
      total_size_mb: Math.round(totalSize / 1024 / 1024 * 100) / 100,
      resource_count: resources.length
    });
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting observer:', error);
      }
    });
    this.observers = [];
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}

export default performanceMonitor; 