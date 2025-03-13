/**
 * Document Viewer Component
 * 
 * This module provides a reusable document viewer modal functionality
 * that can be used across different pages of the application.
 */

/**
 * Initialize the document viewer
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.modalElement - The modal element
 * @param {HTMLElement} options.titleElement - The title element
 * @param {HTMLElement} options.contentElement - The content element
 * @param {HTMLElement} options.loadingElement - The loading indicator element
 * @param {HTMLElement} options.errorElement - The error message element
 * @param {HTMLElement} options.closeButtonElement - The close button element
 * @param {HTMLElement} options.closeXButtonElement - The X close button element
 * @param {Function} options.fetchDocumentFunction - Function to fetch document content
 * @returns {Object} Document viewer methods
 */
export function initDocumentViewer(options) {
  // Destructure options
  const {
    modalElement,
    titleElement,
    contentElement,
    loadingElement,
    errorElement,
    closeButtonElement,
    closeXButtonElement,
    fetchDocumentFunction
  } = options;

  // State
  let currentDocumentId = null;

  // Event listeners
  closeButtonElement.addEventListener('click', closeViewer);
  closeXButtonElement.addEventListener('click', closeViewer);
  
  // Close modal if clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      closeViewer();
    }
  });

  /**
   * View a document
   * @param {number} documentId - Document ID
   */
  async function viewDocument(documentId) {
    try {
      // Store current document ID
      currentDocumentId = documentId;
      
      // Reset modal state
      contentElement.innerHTML = '';
      errorElement.style.display = 'none';
      loadingElement.style.display = 'flex';
      
      // Show the modal
      modalElement.style.display = 'flex';
      
      // Fetch document content
      const documentData = await fetchDocumentFunction(documentId);
      
      // Make sure we're still viewing the same document (user might have closed modal)
      if (currentDocumentId !== documentId) {
        return;
      }
      
      // Set document title
      titleElement.textContent = documentData.title || 'Document';
      
      // Hide loading indicator
      loadingElement.style.display = 'none';
      
      // Display document content
      if (documentData && documentData.content) {
        // Escape HTML to prevent XSS
        const safeContent = escapeHtml(documentData.content);
        contentElement.innerHTML = safeContent;
      } else {
        // Show error if no content
        errorElement.style.display = 'block';
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      
      // Hide loading and show error
      loadingElement.style.display = 'none';
      errorElement.style.display = 'block';
    }
  }
  
  /**
   * Close the document viewer
   */
  function closeViewer() {
    modalElement.style.display = 'none';
    currentDocumentId = null;
    contentElement.innerHTML = '';
  }
  
  /**
   * Escape HTML to prevent XSS
   * @param {string} html - HTML string to escape
   * @returns {string} Escaped HTML
   */
  function escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // Return public methods
  return {
    viewDocument,
    closeViewer
  };
}