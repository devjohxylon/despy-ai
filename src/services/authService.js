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
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      this.setUser(data.user);
      localStorage.setItem('token', data.token);
      return data;
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