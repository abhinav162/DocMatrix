/**
 * Centralized error handling utility
 */
class ErrorHandler {
  /**
   * Display error message to user
   * @param {string} message - Error message
   * @param {HTMLElement} container - Container to show message in
   * @param {number} duration - Duration in ms (0 for no auto-hide)
   */
  static showError(message, container, duration = 5000) {
    // Create or reuse error message element
    let errorElement = container.querySelector('.error-message');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      container.appendChild(errorElement);
    }
    
    // Set message and show
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide after duration (if not 0)
    if (duration > 0) {
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, duration);
    }
  }
  
  /**
   * Log error to console and optionally send to server
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   * @param {boolean} reportToServer - Whether to report to server
   */
  static logError(error, context, reportToServer = false) {
    // Log to console
    console.error(`Error in ${context}:`, error);
    
    // Optionally report to server
    if (reportToServer) {
      try {
        fetch('/api/log-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
          })
        });
      } catch (e) {
        console.error('Failed to report error to server:', e);
      }
    }
  }
  
  /**
   * Handle API error response
   * @param {Response} response - Fetch API response
   * @throws {Error} Error with appropriate message
   */
  static async handleApiError(response) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    } catch (e) {
      // If parsing fails, throw generic error
      if (e.message.includes('API error') || e.message.includes('JSON')) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      throw e;
    }
  }
  
  /**
   * Handle form validation errors
   * @param {HTMLFormElement} form - Form element
   * @param {Object} errors - Object with input names as keys and error messages as values
   */
  static showFormErrors(form, errors) {
    // Clear previous error messages
    form.querySelectorAll('.input-error').forEach(el => el.remove());
    
    // Add error messages for each field
    Object.entries(errors).forEach(([fieldName, message]) => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        // Add error class to input
        field.classList.add('error');
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'input-error';
        errorElement.textContent = message;
        
        // Insert after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        
        // Clear error when field is changed
        field.addEventListener('input', () => {
          field.classList.remove('error');
          errorElement.remove();
        });
      }
    });
  }
}

export default ErrorHandler;
