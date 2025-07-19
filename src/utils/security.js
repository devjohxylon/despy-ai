// Frontend Security Utilities

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate email format securely
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const sanitizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Additional security checks
  if (sanitizedEmail.length > 254) return false;
  if (sanitizedEmail.includes('..') || sanitizedEmail.includes('--')) return false;
  
  return emailRegex.test(sanitizedEmail);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with score and feedback
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, score: 0, feedback: 'Password is required' };
  }

  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let score = 0;
  let feedback = [];

  if (password.length >= minLength) score += 1;
  else feedback.push(`At least ${minLength} characters`);

  if (hasUpperCase) score += 1;
  else feedback.push('At least one uppercase letter');

  if (hasLowerCase) score += 1;
  else feedback.push('At least one lowercase letter');

  if (hasNumbers) score += 1;
  else feedback.push('At least one number');

  if (hasSpecialChar) score += 1;
  else feedback.push('At least one special character');

  const isValid = score >= 4;

  return {
    isValid,
    score,
    feedback: feedback.length > 0 ? feedback.join(', ') : 'Strong password'
  };
};

/**
 * Secure token storage with expiration check
 * @param {string} token - JWT token to store
 * @param {number} expiresIn - Expiration time in hours
 */
export const secureTokenStorage = {
  setToken: (token, expiresIn = 24) => {
    try {
      const expiresAt = Date.now() + (expiresIn * 60 * 60 * 1000);
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  },

  getToken: () => {
    try {
      const token = localStorage.getItem('token');
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      
      if (!token || !expiresAt) return null;
      
      if (Date.now() > parseInt(expiresAt)) {
        secureTokenStorage.removeToken();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  },

  removeToken: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiresAt');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },

  isTokenValid: () => {
    return secureTokenStorage.getToken() !== null;
  }
};

/**
 * Rate limiting for frontend API calls
 */
export const rateLimiter = {
  requests: new Map(),
  
  canMakeRequest: (endpoint, maxRequests = 5, windowMs = 60000) => {
    const now = Date.now();
    const key = `${endpoint}_${Math.floor(now / windowMs)}`;
    
    const currentCount = rateLimiter.requests.get(key) || 0;
    
    if (currentCount >= maxRequests) {
      return false;
    }
    
    rateLimiter.requests.set(key, currentCount + 1);
    
    // Clean up old entries
    setTimeout(() => {
      rateLimiter.requests.delete(key);
    }, windowMs);
    
    return true;
  },
  
  reset: () => {
    rateLimiter.requests.clear();
  }
};

/**
 * Secure error handling without exposing sensitive data
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {string} - User-friendly error message
 */
export const handleErrorSecurely = (error, context = 'operation') => {
  console.error(`Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Return user-friendly message without sensitive data
  if (error.response?.status === 401) {
    return 'Authentication required. Please log in again.';
  }
  
  if (error.response?.status === 403) {
    return 'Access denied. You do not have permission for this action.';
  }
  
  if (error.response?.status === 429) {
    return 'Too many requests. Please try again later.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return 'An error occurred. Please try again.';
};

/**
 * CSRF protection for forms
 * @returns {string} - CSRF token
 */
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Input length validation
 * @param {string} input - Input to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} - Whether input is within length limit
 */
export const validateInputLength = (input, maxLength = 1000) => {
  if (!input || typeof input !== 'string') return false;
  return input.length <= maxLength;
};

/**
 * Secure URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is secure
 */
export const validateSecureURL = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}; 