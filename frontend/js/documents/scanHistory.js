import { apiService } from '../utils/api.js';
import { checkAuth } from '../utils/authCheck.js';
import { scanService } from './scanService.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  if (!await checkAuth()) {
    return;
  }
  
  // Only execute on the history page
  if (!window.location.pathname.includes('history.html')) {
    return;
  }
  
  // Element references
  const historyList = document.getElementById('history-list');
  const loadingIndicator = document.getElementById('loading-indicator');
  const noHistory = document.getElementById('no-history');
  const historyItemTemplate = document.getElementById('history-item-template');
  const statusMessage = document.getElementById('status-message');
  
  // Initialize
  loadScanHistory();
  
  /**
   * Load scan history
   */
  async function loadScanHistory() {
    try {
      // Show loading
      loadingIndicator.style.display = 'flex';
      historyList.style.display = 'none';
      noHistory.style.display = 'none';
      
      // Get scan history
      const history = await scanService.getScanHistory();
      
      // Hide loading
      loadingIndicator.style.display = 'none';
      
      if (history.length === 0) {
        // Show no history message
        noHistory.style.display = 'block';
      } else {
        // Show history list
        historyList.style.display = 'block';
        
        // Clear existing items
        historyList.innerHTML = '';
        
        // Create history items
        history.forEach(item => {
          const historyItem = createHistoryItem(item);
          historyList.appendChild(historyItem);
        });
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
      loadingIndicator.style.display = 'none';
      showError('Failed to load scan history. Please try again later.');
    }
  }
  
  /**
   * Create a history item
   * @param {Object} item - History item data
   * @returns {HTMLElement} History item element
   */
  function createHistoryItem(item) {
    // Clone the template
    const template = historyItemTemplate.content.cloneNode(true);
    const historyItem = template.querySelector('.history-item');
    
    // Set history item ID as data attribute
    historyItem.dataset.id = item.id;
    
    // Set document title
    historyItem.querySelector('.history-title').textContent = item.documentTitle;
    
    // Format date
    const date = new Date(item.scanDate);
    historyItem.querySelector('.date').textContent = date.toLocaleString();
    
    // Set matches count
    historyItem.querySelector('.matches').textContent = `${item.matchCount} matches found`;
    
    // Add event listener
    historyItem.querySelector('.view-scan-btn').addEventListener('click', () => {
      // Store scan ID in localStorage
      localStorage.setItem('viewScanId', item.id);
      
      // Navigate to scan results page
      window.location.href = './scan-results.html';
    });
    
    return historyItem;
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
