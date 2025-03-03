/**
 * Loading state manager utility
 */
class LoadingManager {
  /**
   * Show loading spinner in container
   * @param {HTMLElement} container - Container to show loading spinner in
   * @param {string} message - Optional loading message
   * @param {boolean} fullscreen - Whether to cover the entire container
   * @returns {HTMLElement} Loading element (for later removal)
   */
  static showLoading(container, message = 'Loading...', fullscreen = false) {
    // Create loading element
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-overlay';
    
    if (fullscreen) {
      loadingElement.classList.add('fullscreen');
    }
    
    // Create loading content
    loadingElement.innerHTML = `
      <div class="loading-content">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
    
    // Set container position if not already set
    const containerPosition = window.getComputedStyle(container).position;
    if (containerPosition === 'static') {
      container.style.position = 'relative';
    }
    
    // Add to container
    container.appendChild(loadingElement);
    
    // Return for later removal
    return loadingElement;
  }
  
  /**
   * Hide loading spinner
   * @param {HTMLElement} loadingElement - Loading element to remove
   */
  static hideLoading(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
      loadingElement.parentNode.removeChild(loadingElement);
    }
  }
  
  /**
   * Show loading for an async operation
   * @param {HTMLElement} container - Container to show loading in
   * @param {Function} asyncOperation - Async function to execute
   * @param {string} message - Optional loading message
   * @param {boolean} fullscreen - Whether to cover the entire container
   * @returns {Promise} Result of async operation
   */
  static async withLoading(container, asyncOperation, message = 'Loading...', fullscreen = false) {
    const loadingElement = this.showLoading(container, message, fullscreen);
    
    try {
      const result = await asyncOperation();
      return result;
    } finally {
      this.hideLoading(loadingElement);
    }
  }
  
  /**
   * Create a button with loading state
   * @param {HTMLButtonElement} button - Button element
   * @param {Function} onClick - Click handler (async)
   * @param {string} loadingText - Text to show during loading
   */
  static setupLoadingButton(button, onClick, loadingText = 'Loading...') {
    const originalText = button.textContent;
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Prevent double clicks
      if (button.disabled) return;
      
      // Set loading state
      button.disabled = true;
      button.textContent = loadingText;
      
      try {
        await onClick(e);
      } finally {
        // Reset button
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }
}

export default LoadingManager;
