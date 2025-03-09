import { authService } from '../auth/authService.js';

/**
 * Check if user is authenticated and redirect if not
 * Use this at the top of protected pages
 */
export async function checkAuth() {
  if (!authService.isAuthenticated) {
    try {
      const isAuthenticated = await authService.checkAuthStatus();
      if (!isAuthenticated) {
        window.location.href = './login.html';
        return false;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      window.location.href = './login.html';
      return false;
    }
  }
  return true;
}

/**
 * Check if user is admin and redirect if not
 * Use this at the top of admin-only pages
 */
export async function checkAdmin() {
  if (!await checkAuth()) {
    return false;
  }
  
  if (!authService.user || authService.user.role !== 'admin') {
    alert('You do not have permission to access this page');
    window.location.href = './profile.html';
    return false;
  }
  
  return true;
}
