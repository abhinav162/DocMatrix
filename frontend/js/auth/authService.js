import { apiService } from '../utils/api.js';

/**
 * Authentication service for managing user authentication
 */
class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.authListeners = [];
    
    // Check if user is already authenticated on page load
    this.checkAuthStatus();
  }

  /**
   * Register a new user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<object>} - User data
   */
  async register(username, password) {
    try {
      const response = await apiService.post('/auth/register', {
        username,
        password
      });

      this.user = response.user;
      this.isAuthenticated = true;
      this._notifyListeners();

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Log in an existing user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<object>} - User data
   */
  async login(username, password) {
    try {
      const response = await apiService.post('/auth/login', {
        username,
        password
      });

      this.user = response.user;
      this.isAuthenticated = true;
      this._notifyListeners();

      // Set user in session
      sessionStorage.setItem('user', JSON.stringify(response.user));

      // Set user in local storage
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Log out the current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await apiService.get('/auth/logout');

      this.user = null;
      this.isAuthenticated = false;
      this._notifyListeners();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if user is already authenticated
   * @returns {Promise<boolean>}
   */
  async checkAuthStatus() {
    try {
      const response = await apiService.get('/auth/profile');

      this.user = response.user;
      this.isAuthenticated = true;
      this._notifyListeners();

      return true;
    } catch (error) {
      // User is not authenticated
      this.user = null;
      this.isAuthenticated = false;
      this._notifyListeners();

      return false;
    }
  }

  /**
   * Get current user data
   * @returns {Promise<object>} - User profile data
   */
  async getProfile() {
    if (!this.isAuthenticated) {
      throw new Error('User is not authenticated');
    }

    try {
      const response = await apiService.get('/auth/profile');
      return response.user;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Add auth state change listener
   * @param {Function} listener - Callback function
   */
  addAuthListener(listener) {
    this.authListeners.push(listener);
  }

  /**
   * Remove auth state change listener
   * @param {Function} listener - Callback function
   */
  removeAuthListener(listener) {
    this.authListeners = this.authListeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of auth state change
   * @private
   */
  _notifyListeners() {
    this.authListeners.forEach(listener => {
      listener(this.isAuthenticated, this.user);
    });
  }
}

// Export as singleton
export const authService = new AuthService();
