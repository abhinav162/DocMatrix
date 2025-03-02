/**
 * Document Scanner - Main JavaScript Module
 */

// API configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const getStartedBtn = document.getElementById('get-started-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');
const loginLink = document.getElementById('login-link');
const registerLink = document.getElementById('register-link');
const homeLink = document.getElementById('home-link');
const uploadLink = document.getElementById('upload-link');
const scansLink = document.getElementById('scans-link');

// Utility functions
const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'ok') {
      console.log('API is healthy:', data);
      return true;
    } else {
      console.error('API health check failed:', data);
      return false;
    }
  } catch (error) {
    console.error('API health check error:', error);
    return false;
  }
};

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Document Scanner application initialized');
  
  const isApiHealthy = await checkApiHealth();
  if (!isApiHealthy) {
    alert('Warning: API server is not reachable. Some features may not work correctly.');
  }
  
  // Add event listeners to buttons
  getStartedBtn?.addEventListener('click', () => {
    // Will be implemented with authentication flow
    alert('Get started clicked! Authentication will be implemented in future steps.');
  });
  
  learnMoreBtn?.addEventListener('click', () => {
    const featuresSection = document.getElementById('features-section');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  });
});

// Placeholder for future authentication state management
const authState = {
  isAuthenticated: false,
  user: null,
  
  login(username, user) {
    this.isAuthenticated = true;
    this.user = user;
    // Will be implemented with actual authentication
  },
  
  logout() {
    this.isAuthenticated = false;
    this.user = null;
    // Will be implemented with actual authentication
  }
};

// Export for other modules to use
export default {
  authState,
  API_BASE_URL
};
