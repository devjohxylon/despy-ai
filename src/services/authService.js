import axios from 'axios';

class AuthService {
  constructor() {
    this.baseURL = '/api';
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
      const response = await axios.post(`${this.baseURL}/auth/login`, { email, password });
      this.setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      localStorage.removeItem('token');
      this.setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async getUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.setUser(null);
        return null;
      }

      const response = await axios.get(`${this.baseURL}/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      this.setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get user:', error);
      this.setUser(null);
      return null;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();
export default authService; 