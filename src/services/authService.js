import { secureTokenStorage, handleErrorSecurely } from '../utils/security.js';

class AuthService {
  constructor() {
    // Use Railway backend URL for all environments
    this.baseURL = 'https://despy-ai-production.up.railway.app/api';
    this.user = null;
    this.listeners = new Set();
  }

  setUser(user) {
    this.user = user;
    this.notifyListeners();
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.user));
  }

  async login(email, password) {
    try {
      console.log('Making login request to:', `${this.baseURL}/auth/login`);
      
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Login failed with status:', response.status, 'Response:', errorData);
        
        let error;
        try {
          const jsonError = JSON.parse(errorData);
          error = new Error(jsonError.error || 'Login failed');
          error.response = { status: response.status, data: jsonError };
        } catch {
          error = new Error(`Login failed: ${response.status} ${response.statusText}`);
          error.response = { status: response.status, data: errorData };
        }
        throw error;
      }
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      this.setUser(data.user);
      secureTokenStorage.setToken(data.token, 24); // 24 hours expiration
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(handleErrorSecurely(error, 'login'));
    }
  }

  async logout() {
    try {
      secureTokenStorage.removeToken();
      this.setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async getUser() {
    try {
      const token = secureTokenStorage.getToken();
      if (!token) {
        this.setUser(null);
        return null;
      }

      const response = await fetch(`${this.baseURL}/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to get user');
      
      const data = await response.json();
      this.setUser(data);
      return data;
    } catch (error) {
      console.error('Failed to get user:', error);
      secureTokenStorage.removeToken(); // Clear invalid token
      this.setUser(null);
      return null;
    }
  }

  isAuthenticated() {
    return secureTokenStorage.isTokenValid();
  }

  getAuthHeaders() {
    const token = secureTokenStorage.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();
export default authService; 