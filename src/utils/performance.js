// Performance optimization utilities

// Debounce function to limit API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling helper
export const createVirtualScroller = (items, itemHeight, containerHeight) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  
  return {
    getVisibleItems: (scrollTop) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, items.length);
      return {
        items: items.slice(startIndex, endIndex),
        startIndex,
        endIndex,
        totalHeight
      };
    }
  };
};

// Memory management for large datasets
export const createDataManager = (maxItems = 1000) => {
  let cache = new Map();
  let accessOrder = [];
  
  return {
    get: (key) => {
      if (cache.has(key)) {
        // Move to end of access order
        accessOrder = accessOrder.filter(k => k !== key);
        accessOrder.push(key);
        return cache.get(key);
      }
      return null;
    },
    
    set: (key, value) => {
      if (cache.size >= maxItems) {
        // Remove least recently used item
        const oldestKey = accessOrder.shift();
        if (oldestKey) {
          cache.delete(oldestKey);
        }
      }
      
      cache.set(key, value);
      accessOrder.push(key);
    },
    
    clear: () => {
      cache.clear();
      accessOrder = [];
    }
  };
};

// Component memoization helper
export const memoizeComponent = (Component, propsAreEqual) => {
  return React.memo(Component, propsAreEqual);
};

// Lazy loading helper
export const createLazyLoader = (loadFunction, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    fallback = null
  } = options;
  
  return {
    observe: (element, callback) => {
      if (!element) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadFunction().then(callback);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold, rootMargin }
      );
      
      observer.observe(element);
      return observer;
    }
  };
};

// Animation performance optimization
export const optimizeAnimations = () => {
  // Enable hardware acceleration for animations
  const style = document.createElement('style');
  style.textContent = `
    .animate-optimized {
      will-change: transform, opacity;
      transform: translateZ(0);
    }
    
    .reduce-motion {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `;
  document.head.appendChild(style);
  
  // Respect user's motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduce-motion');
  }
};

// Bundle size optimization
export const preloadCriticalResources = () => {
  // Preload critical CSS and JS
  const criticalResources = [
    '/src/components/DashboardPage.jsx',
    '/src/components/TokenSystem.jsx'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = 'script';
    document.head.appendChild(link);
  });
};

// Network optimization
export const createRequestQueue = (maxConcurrent = 3) => {
  let running = 0;
  const queue = [];
  
  const processQueue = () => {
    if (queue.length === 0 || running >= maxConcurrent) return;
    
    running++;
    const { request, resolve, reject } = queue.shift();
    
    request()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        running--;
        processQueue();
      });
  };
  
  return {
    add: (request) => {
      return new Promise((resolve, reject) => {
        queue.push({ request, resolve, reject });
        processQueue();
      });
    }
  };
};

// Memory leak prevention
export const createCleanupManager = () => {
  const cleanupTasks = [];
  
  return {
    add: (task) => {
      cleanupTasks.push(task);
    },
    
    cleanup: () => {
      cleanupTasks.forEach(task => {
        try {
          task();
        } catch (error) {
          console.error('Cleanup task failed:', error);
        }
      });
      cleanupTasks.length = 0;
    }
  };
};

// Performance monitoring
export const createPerformanceMonitor = () => {
  const metrics = {
    renderTime: [],
    memoryUsage: [],
    networkRequests: []
  };
  
  return {
    startTimer: (name) => {
      const start = performance.now();
      return () => {
        const duration = performance.now() - start;
        metrics[name] = metrics[name] || [];
        metrics[name].push(duration);
        
        // Keep only last 100 measurements
        if (metrics[name].length > 100) {
          metrics[name].shift();
        }
      };
    },
    
    getMetrics: () => {
      return Object.keys(metrics).reduce((acc, key) => {
        const values = metrics[key];
        if (values.length === 0) return acc;
        
        acc[key] = {
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
        return acc;
      }, {});
    },
    
    logMetrics: () => {
      const currentMetrics = this.getMetrics();
      console.log('Performance Metrics:', currentMetrics);
    }
  };
}; 