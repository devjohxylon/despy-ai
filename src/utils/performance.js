// Performance optimization utilities
import React from 'react';

// Debounce function for input handlers
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

// Throttle function for scroll events and animations
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

// RequestAnimationFrame throttle for smooth animations
export const rafThrottle = (func) => {
  let ticking = false;
  return function(...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        func.apply(this, args);
        ticking = false;
      });
      ticking = true;
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
        const lruKey = accessOrder.shift();
        if (lruKey) {
          cache.delete(lruKey);
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

// Lazy loading helper with Intersection Observer
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
      return () => observer.disconnect();
    }
  };
};

// Image optimization helper
export const optimizeImage = (src, options = {}) => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // For now, return the original src
  // In production, you'd integrate with an image optimization service
  return src;
};

// Event listener cleanup helper
export const createEventManager = () => {
  const listeners = [];
  
  return {
    add: (element, event, handler, options = {}) => {
      element.addEventListener(event, handler, options);
      listeners.push({ element, event, handler, options });
    },
    
    remove: (element, event, handler) => {
      element.removeEventListener(event, handler);
      const index = listeners.findIndex(
        l => l.element === element && l.event === event && l.handler === handler
      );
      if (index > -1) {
        listeners.splice(index, 1);
      }
    },
    
    clear: () => {
      listeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      listeners.length = 0;
    }
  };
};

// Performance monitoring
export const createPerformanceMonitor = () => {
  const metrics = {};
  
  return {
    start: (name) => {
      metrics[name] = performance.now();
    },
    
    end: (name) => {
      if (metrics[name]) {
        const duration = performance.now() - metrics[name];
        console.log(`${name}: ${duration.toFixed(2)}ms`);
        delete metrics[name];
        return duration;
      }
    },
    
    measure: async (name, fn) => {
      const start = performance.now();
      const result = await fn();
      const duration = performance.now() - start;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      return result;
    }
  };
}; 