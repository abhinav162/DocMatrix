import { apiService } from '../utils/api.js';
import { checkAuth } from '../utils/authCheck.js';
import { documentService } from './documentService.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  if (!await checkAuth()) {
    return;
  }
  
  // Element references
  const documentGrid = document.getElementById('document-grid');
  const loadingIndicator = document.getElementById('loading-indicator');
  const noDocuments = document.getElementById('no-documents');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const visibilityFilter = document.getElementById('visibility-filter');
  const sortOption = document.getElementById('sort-option');
  const statusMessage = document.getElementById('status-message');
  const documentCardTemplate = document.getElementById('document-card-template');

  // Delete modal elements
  const deleteModal = document.getElementById('delete-confirmation-modal');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

  // Document viewer modal elements
  const viewerModal = document.getElementById('document-viewer-modal');
  const viewerTitle = document.getElementById('document-viewer-title');
  const viewerContent = document.getElementById('document-content');
  const viewerLoading = document.getElementById('document-loading');
  const viewerError = document.getElementById('document-error');
  const closeViewerBtn = document.getElementById('close-viewer-btn');
  const closeViewerModalBtn = document.getElementById('close-viewer-modal');

  // Get all close modal buttons
  const closeModalBtns = document.querySelectorAll('.close-modal');

  // State
  let documents = [];
  let filteredDocuments = [];
  let currentFilters = {
    search: '',
    visibility: 'all',
    sort: 'newest'
  };
  let documentToDelete = null;
  let currentViewingDocument = null;
  
  // Initialize
  loadDocuments();
  
  // Event listeners
  searchBtn.addEventListener('click', filterDocuments);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      filterDocuments();
    }
  });
  
  visibilityFilter.addEventListener('change', filterDocuments);
  sortOption.addEventListener('change', filterDocuments);
  
  // Delete modal event listeners
  confirmDeleteBtn.addEventListener('click', confirmDelete);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  // Document viewer modal event listeners
  closeViewerBtn.addEventListener('click', closeViewerModal);
  closeViewerModalBtn.addEventListener('click', closeViewerModal);

  // Add event listeners to all close modal buttons
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Find the parent modal
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Close modals if clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
    if (e.target === viewerModal) {
      closeViewerModal();
    }
  });
  
  /**
   * Load documents from the server
   */
  async function loadDocuments() {
    try {
      showLoading(true);
      
      documents = await documentService.getUserDocuments();
      
      showLoading(false);
      
      if (documents.length === 0) {
        showNoDocuments(true);
      } else {
        showNoDocuments(false);
        filterDocuments();
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      showLoading(false);
      showError('Failed to load documents. Please try again later.');
    }
  }
  
  /**
   * Filter and sort documents based on current filters
   */
  function filterDocuments() {
    // Update current filters
    currentFilters.search = searchInput.value.trim().toLowerCase();
    currentFilters.visibility = visibilityFilter.value;
    currentFilters.sort = sortOption.value;
    
    // Filter documents
    filteredDocuments = documents.filter(doc => {
      // Search filter
      const matchesSearch = currentFilters.search === '' ||
        doc.title.toLowerCase().includes(currentFilters.search);
      
      // Visibility filter
      const matchesVisibility = currentFilters.visibility === 'all' ||
        (currentFilters.visibility === 'private' && doc.is_private) ||
        (currentFilters.visibility === 'public' && !doc.is_private);
      
      return matchesSearch && matchesVisibility;
    });
    
    // Sort documents
    filteredDocuments.sort((a, b) => {
      switch (currentFilters.sort) {
        case 'newest':
          return new Date(b.uploaded_at) - new Date(a.uploaded_at);
        case 'oldest':
          return new Date(a.uploaded_at) - new Date(b.uploaded_at);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    // Show results
    renderDocuments();
  }
  
  /**
   * Render filtered documents to the grid
   */
  function renderDocuments() {
    // Clear the grid
    documentGrid.innerHTML = '';
    
    if (filteredDocuments.length === 0) {
      // No results from filter
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.innerHTML = `
        <p>No documents found matching your filters.</p>
        <button id="clear-filters-btn" class="btn secondary">Clear Filters</button>
      `;

      documentGrid.style.display = 'flex';
      documentGrid.style.justifyContent = 'center';
      documentGrid.appendChild(noResults);
      
      document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);
    } else {
      documentGrid.style.display = 'grid';
      
      // Create document cards
      filteredDocuments.forEach(doc => {
        const card = createDocumentCard(doc);
        documentGrid.appendChild(card);
      });
      
      // Initialize dropdown toggles
      initializeDropdowns();
    }
  }
  
  /**
   * Create a document card from template
   * @param {Object} document - Document data
   * @returns {HTMLElement} Document card element
   */
  function createDocumentCard(document) {
    // Clone the template
    const template = documentCardTemplate.content.cloneNode(true);
    const card = template.querySelector('.document-card');
    
    // Set document ID as data attribute
    card.dataset.id = document.id;
    
    // Fill in document info
    card.querySelector('.document-title').textContent = document.title;
    
    // Format date
    const uploadDate = new Date(document.uploaded_at);
    card.querySelector('.date-value').textContent = uploadDate.toLocaleDateString();
    
    // Set visibility badge
    const visibilityBadge = card.querySelector('.visibility-badge');
    if (document.is_private) {
      visibilityBadge.textContent = 'Private';
      visibilityBadge.classList.add('private');
    } else {
      visibilityBadge.textContent = 'Public';
      visibilityBadge.classList.add('public');
    }
    
    // Set visibility toggle text
    const toggleVisibilityBtn = card.querySelector('.toggle-visibility-btn');
    toggleVisibilityBtn.textContent = document.is_private ? 'Make Public' : 'Make Private';
    
    // Add event listeners
    card.querySelector('.view-btn').addEventListener('click', () => viewDocument(document.id));
    card.querySelector('.scan-btn').addEventListener('click', () => scanDocument(document.id));
    toggleVisibilityBtn.addEventListener('click', () => toggleVisibility(document.id, document.is_private));
    card.querySelector('.delete-btn').addEventListener('click', () => showDeleteModal(document.id));
    
    return card;
  }
  
  /**
   * Initialize dropdown toggles
   */
  function initializeDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close all other dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          if (menu !== toggle.nextElementSibling) {
            menu.classList.remove('show');
          }
        });
        
        // Toggle this dropdown
        toggle.nextElementSibling.classList.toggle('show');
      });
    });
    
    // Close dropdowns when clicking elsewhere
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
      });
    });
  }
  
  /**
   * Clear all filters and reset to defaults
   */
  function clearFilters() {
    searchInput.value = '';
    visibilityFilter.value = 'all';
    sortOption.value = 'newest';
    
    filterDocuments();
  }
  
  /**
   * View document details
   * @param {number} id - Document ID
   */
  async function viewDocument(id) {
    try {
      // Store current document ID
      currentViewingDocument = id;

      // Reset modal state
      viewerContent.innerHTML = '';
      viewerError.style.display = 'none';
      viewerLoading.style.display = 'flex';

      // Find document in our local data to get the title
      const document = documents.find(doc => doc.id === id);
      if (document) {
        viewerTitle.textContent = document.title;
      } else {
        viewerTitle.textContent = 'Document';
      }

      // Show the modal
      viewerModal.style.display = 'flex';

      // Fetch document content
      const documentData = await documentService.getDocumentDetails(id);

      // Make sure we're still viewing the same document (user might have closed modal)
      if (currentViewingDocument !== id) {
        return;
      }

      // Hide loading indicator
      viewerLoading.style.display = 'none';

      // Display document content
      if (documentData && documentData.content) {
        // Escape HTML to prevent XSS
        const safeContent = escapeHtml(documentData.content);
        viewerContent.innerHTML = safeContent;
      } else {
        // Show error if no content
        viewerError.style.display = 'block';
      }
    } catch (error) {
      console.error('Error viewing document:', error);

      // Hide loading and show error
      viewerLoading.style.display = 'none';
      viewerError.style.display = 'block';
    }
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
  
  /**
   * Navigate to scan page for this document
   * @param {number} id - Document ID
   */
  function scanDocument(id) {
    // Store document ID in localStorage
    localStorage.setItem('scanDocumentId', id);
    
    // Navigate to scan page
    window.location.href = './scan.html';
  }
  
  /**
   * Toggle document visibility
   * @param {number} id - Document ID
   * @param {boolean} isCurrentlyPrivate - Current visibility state
   */
  async function toggleVisibility(id, isCurrentlyPrivate) {
    try {
      // Close all dropdowns
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
      });
      
      const newState = !isCurrentlyPrivate;
      
      // Find the document card
      const card = document.querySelector(`.document-card[data-id="${id}"]`);
      if (!card) return;
      
      // Disable all buttons in the card during operation
      const buttons = card.querySelectorAll('button');
      buttons.forEach(btn => btn.disabled = true);
      
      // Update document visibility
      await documentService.toggleDocumentVisibility(id, newState);
      
      // Update local document data
      const docIndex = documents.findIndex(d => d.id === id);
      if (docIndex !== -1) {
        documents[docIndex].is_private = newState;
      }
      
      // Show success message
      showSuccess(`Document is now ${newState ? 'private' : 'public'}`);
      
      // Re-filter and render documents
      filterDocuments();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showError('Failed to update document visibility.');
    }
  }
  
  /**
   * Show delete confirmation modal
   * @param {number} id - Document ID
   */
  function showDeleteModal(id) {
    // Close all dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('show');
    });
    
    // Store the document ID to delete
    documentToDelete = id;
    
    // Show the modal
    deleteModal.style.display = 'flex';
  }
  
  /**
   * Confirm document deletion
   */
  async function confirmDelete() {
    if (!documentToDelete) {
      closeDeleteModal();
      return;
    }

    try {
      // Disable modal buttons
      confirmDeleteBtn.disabled = true;
      cancelDeleteBtn.disabled = true;

      // Delete the document
      await documentService.deleteDocument(documentToDelete);

      // Remove from local data
      documents = documents.filter(d => d.id !== documentToDelete);

      // Close modal and reset
      closeDeleteModal();
      documentToDelete = null;
      
      // Show success message
      showSuccess('Document successfully deleted');
      
      // Re-filter and render documents
      filterDocuments();
      
      if (documents.length === 0) {
        showNoDocuments(true);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showError('Failed to delete document.');
      
      // Re-enable modal buttons
      confirmDeleteBtn.disabled = false;
      cancelDeleteBtn.disabled = false;
    }
  }
  
  /**
   * Close delete confirmation modal
   */
  function closeDeleteModal() {
    deleteModal.style.display = 'none';
    documentToDelete = null;
  }

  /**
   * Close document viewer modal
   */
  function closeViewerModal() {
    viewerModal.style.display = 'none';
    currentViewingDocument = null;
    viewerContent.innerHTML = '';
  }
  
  /**
   * Show or hide loading indicator
   * @param {boolean} show - Whether to show loading
   */
  function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
    documentGrid.style.display = show ? 'none' : 'grid';
  }
  
  /**
   * Show or hide no documents message
   * @param {boolean} show - Whether to show message
   */
  function showNoDocuments(show) {
    noDocuments.style.display = show ? 'block' : 'none';
    documentGrid.style.display = show ? 'none' : 'grid';
  }
  
  /**
   * Show success message
   * @param {string} message - Success message
   */
  function showSuccess(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message success';
    statusMessage.style.display = 'block';
    
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 3000);
  }
  
  /**
   * Show error message
   * @param {string} message - Error message
   */
  function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message error';
    statusMessage.style.display = 'block';
    
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }
});
