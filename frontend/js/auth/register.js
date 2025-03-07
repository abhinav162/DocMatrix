import { authService } from './authService.js';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const errorMessage = document.getElementById('error-message');
  
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Clear previous error messages
      errorMessage.textContent = '';
      errorMessage.style.display = 'none';
      
      // Get form values
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Validate form
      if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.style.display = 'block';
        return;
      }
      
      if (username.length < 3) {
        errorMessage.textContent = 'Username must be at least 3 characters long';
        errorMessage.style.display = 'block';
        return;
      }
      
      if (password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters long';
        errorMessage.style.display = 'block';
        return;
      }
      
      try {
        // Disable form during submission
        disableForm(true);
        
        // Register user
        await authService.register(username, password);
        
        // Redirect to profile page
        window.location.href = './profile.html';
      } catch (error) {
        // Show error message
        errorMessage.textContent = error.message || 'Registration failed';
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
    const inputs = registerForm.querySelectorAll('input, button');
    inputs.forEach(input => {
      input.disabled = disabled;
    });
    
    const submitButton = registerForm.querySelector('button[type="submit"]');
    if (submitButton) {
      if (disabled) {
        submitButton.textContent = 'Registering...';
      } else {
        submitButton.textContent = 'Register';
      }
    }
  }
});
