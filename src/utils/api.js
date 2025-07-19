// API URL utility for consistent backend communication
const getApiUrl = (endpoint = '') => {
  const baseURL = import.meta.env.PROD 
    ? 'https://despy-ai-production.up.railway.app/api'
    : 'http://localhost:3001/api';
  
  // If no endpoint provided, return base URL
  if (!endpoint) {
    return baseURL;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseURL}/${cleanEndpoint}`;
};

// Force cache busting for API calls
export const getApiUrlWithCacheBust = (endpoint = '') => {
  const url = getApiUrl(endpoint);
  const timestamp = Date.now();
  return `${url}?_cb=${timestamp}`;
};

export default getApiUrl; 