import { apiService } from '../utils/api.js';
import { checkAuth } from '../utils/authCheck.js';
import { documentService } from './documentService.js';
import { scanService } from './scanService.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  if (!await checkAuth()) {
    return;
  }
  
  // Element references
  const loadingIndicator = document.getElementById('loading-indicator');
  const scanResults = document.getElementById('scan-results');
  const sourceDocumentTitle = document.getElementById('source-document-title');
  const scanDate = document.getElementById('scan-date');
  const scanAlgorithm = document.getElementById('scan-algorithm');
  const scanThreshold = document.getElementById('scan-threshold');
  const exportResultsBtn = document.getElementById('export-results-btn');
  const matchesCount = document.getElementById('matches-count');
  const noMatches = document.getElementById('no-matches');
  const matchesGrid = document.getElementById('matches-grid');
  
  // Element references - Comparison
  const comparisonView = document.getElementById('comparison-view');
  const sourceDocumentPanelTitle = document.getElementById('source-document-panel-title');
  const sourceDocumentContent = document.getElementById('source-document-content');
  const matchDocumentPanelTitle = document.getElementById('match-document-panel-title');
  const matchDocumentContent = document.getElementById('match-document-content');
  const backToResultsBtn = document.getElementById('back-to-results-btn');
  
  // Element references - Templates
  const matchCardTemplate = document.getElementById('match-card-template');
  
  // Element references - Messages
  const statusMessage = document.getElementById('status-message');
  
  // State
  let scanId = null;
  let sourceDocumentId = null;
  let scanResultData = null;
  
  // Initialize
  init();
  
  // Event listeners
  exportResultsBtn.addEventListener('click', exportResults);
  backToResultsBtn.addEventListener('click', () => {
    // Show results, hide comparison
    comparisonView.style.display = 'none';
    scanResults.style.display = 'block';
  });
  
  /**
   * Initialize the page
   */
  async function init() {
    try {
      // Check if we have a scan ID in localStorage
      const viewScanId = localStorage.getItem('viewScanId');
      if (!viewScanId) {
        showError('No scan specified');
        return;
      }
      
      // Clear it from localStorage
      localStorage.removeItem('viewScanId');
      scanId = parseInt(viewScanId);
      
      // Load scan results
      await loadScanResults(scanId);
    } catch (error) {
      console.error('Error initializing scan results page:', error);
      showError('Failed to initialize scan results page. Please try again later.');
    }
  }
  
  /**
   * Load scan results
   * @param {number} id - Scan ID
   */
  async function loadScanResults(id) {
    try {
      // Show loading
      loadingIndicator.style.display = 'flex';
      scanResults.style.display = 'none';
      
      // Get scan data
      scanResultData = await apiService.get(`/scan/${id}`);
      
      // Set source document ID
      sourceDocumentId = scanResultData.sourceDocumentId;
      
      // Populate results
      populateScanResults(scanResultData);
      
      // Hide loading, show results
      loadingIndicator.style.display = 'none';
      scanResults.style.display = 'block';
    } catch (error) {
      console.error('Error loading scan results:', error);
      loadingIndicator.style.display = 'none';
      showError('Failed to load scan results. Please try again later.');
    }
  }
  
  /**
   * Populate scan results
   * @param {Object} results - Scan results
   */
  function populateScanResults(results) {
    // Set source document title
    sourceDocumentTitle.textContent = results.sourceDocumentTitle || 'Unknown Document';
    
    // Set scan metadata
    const date = new Date(results.scanDate);
    scanDate.textContent = date.toLocaleString();
    scanAlgorithm.textContent = results.algorithm || 'Unknown';
    scanThreshold.textContent = `${results.threshold || 70}%`;
    
    // Set matches count
    const count = results.matches.length;
    matchesCount.textContent = count;
    
    // Show no matches or populate matches grid
    if (count === 0) {
      noMatches.style.display = 'block';
      matchesGrid.style.display = 'none';
    } else {
      noMatches.style.display = 'none';
      matchesGrid.style.display = 'grid';
      
      // Clear existing matches
      matchesGrid.innerHTML = '';
      
      // Sort matches by similarity score (descending)
      const sortedMatches = [...results.matches].sort((a, b) => b.similarityScore - a.similarityScore);
      
      // Create match cards
      sortedMatches.forEach(match => {
        const card = createMatchCard(match);
        matchesGrid.appendChild(card);
      });
    }
  }
  
  /**
   * Create a match card
   * @param {Object} match - Match data
   * @returns {HTMLElement} Match card element
   */
  function createMatchCard(match) {
    // Clone the template
    const template = matchCardTemplate.content.cloneNode(true);
    const card = template.querySelector('.match-card');
    
    // Set match ID as data attribute
    card.dataset.id = match.documentId;
    
    // Set title
    card.querySelector('.match-title').textContent = match.title;
    
    // Set score
    card.querySelector('.match-score').textContent = `${Math.round(match.similarityScore)}%`;
    
    // Set owner
    const ownerSpan = card.querySelector('.owner');
    if (match.isUserDocument) {
      ownerSpan.textContent = 'Owner: You';
    } else {
      ownerSpan.textContent = 'Owner: Other User';
    }
    
    // Format date if available
    const dateSpan = card.querySelector('.date');
    if (match.uploadDate) {
      const date = new Date(match.uploadDate);
      dateSpan.textContent = `Uploaded on ${date.toLocaleDateString()}`;
    } else {
      dateSpan.style.display = 'none';
    }
    
    // Set content preview if available
    const contentDiv = card.querySelector('.match-content');
    if (match.contentPreview) {
      contentDiv.textContent = match.contentPreview;
    } else {
      contentDiv.textContent = 'Content preview not available.';
    }
    
    // Add event listeners
    card.querySelector('.compare-btn').addEventListener('click', () => compareDocuments(match.documentId));
    card.querySelector('.view-btn').addEventListener('click', () => viewDocument(match.documentId));
    
    return card;
  }
  
  /**
   * Compare documents
   * @param {number} matchDocId - Matched document ID
   */
  async function compareDocuments(matchDocId) {
    try {
      // Show loading message
      showInfo('Loading documents for comparison...');
      
      // Hide results, show comparison (will be populated asynchronously)
      scanResults.style.display = 'none';
      comparisonView.style.display = 'grid';
      
      // Clear content areas
      sourceDocumentContent.textContent = 'Loading...';
      matchDocumentContent.textContent = 'Loading...';
      
      // Get source document
      const sourceDoc = await scanService.getDocumentContent(sourceDocumentId);
      
      // Get matched document
      const matchDoc = await scanService.getDocumentContent(matchDocId);
      
      // Set source document
      sourceDocumentPanelTitle.textContent = sourceDoc.title;
      sourceDocumentContent.textContent = sourceDoc.content;
      
      // Set matched document
      matchDocumentPanelTitle.textContent = matchDoc.title;
      matchDocumentContent.textContent = matchDoc.content;
      
      // Hide status message
      statusMessage.style.display = 'none';
    } catch (error) {
      console.error('Error comparing documents:', error);
      
      // Show results, hide comparison
      comparisonView.style.display = 'none';
      scanResults.style.display = 'block';
      
      showError('Failed to load documents for comparison.');
    }
  }
  
  /**
   * View document
   * @param {number} id - Document ID
   */
  function viewDocument(id) {
    // TODO: Implement document viewer
    console.log('View document:', id);
    alert('Document viewer not implemented yet.');
  }
  
  /**
   * Export scan results
   */
  async function exportResults() {
    try {
      if (!sourceDocumentId) {
        showError('No document selected for export');
        return;
      }
      
      // Show loading message
      showInfo('Exporting scan results...');
      
      // Export as CSV
      const blob = await scanService.exportScanResults(sourceDocumentId, 'csv');
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan_results_${sourceDocumentId}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      // Show success message
      showSuccess('Scan results exported successfully');
    } catch (error) {
      console.error('Error exporting results:', error);
      showError('Failed to export scan results');
    }
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
   * Show info message
   * @param {string} message - Info message
   */
  function showInfo(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message info';
    statusMessage.style.display = 'block';
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
