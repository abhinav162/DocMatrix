import { authService } from './authService.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Clear previous error messages
      errorMessage.textContent = '';
      errorMessage.style.display = 'none';
      
      // Get form values
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      try {
        // Disable form during submission
        disableForm(true);
        
        // Login user
        await authService.login(username, password);
        
        // Redirect to profile page
        window.location.href = './profile.html';
      } catch (error) {
        // Show error message
        errorMessage.textContent = error.message || 'Login failed';
        errorMessage.style.display = 'block';
        
        // Re-enable form
        disableForm(false);
      }
    });
  }
  
  /**
   * Disable or enable the form during submission
   * @param {boolean} disabled - Whether to disable the form
   */
  function disableForm(disabled) {
    const inputs = loginForm.querySelectorAll('input, button');
    inputs.forEach(input => {
      input.disabled = disabled;
    });
    
    const submitButton = loginForm.querySelector('button[type="submit"]');
    if (submitButton) {
      if (disabled) {
        submitButton.textContent = 'Logging in...';
      } else {
        submitButton.textContent = 'Log In';
      }
    }
  }
});
