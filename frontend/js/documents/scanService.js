import { apiService } from '../utils/api.js';

/**
 * Service for document scanning operations
 */
class ScanService {
  /**
   * Scan a document
   * @param {number} documentId - Document ID to scan
   * @param {number} threshold - Minimum similarity threshold (0-100)
   * @returns {Promise<Object>} Scan results
   */
  async scanDocument(documentId, threshold) {
    try {
      const response = await apiService.post('/scan', {
        documentId,
        minSimilarityThreshold: threshold
      });
      
      return response.scan;
    } catch (error) {
      console.error('Error scanning document:', error);
      throw error;
    }
  }
  
  /**
   * Get previous scan results
   * @param {number} documentId - Document ID
   * @param {number} threshold - Minimum similarity threshold (0-100)
   * @returns {Promise<Object>} Scan results
   */
  async getPreviousScanResults(documentId, threshold) {
    try {
      const response = await apiService.get(`/scan/matches/${documentId}?threshold=${threshold}`);
      return response.scan;
    } catch (error) {
      console.error('Error getting scan results:', error);
      throw error;
    }
  }
  
  /**
   * Get document content
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} Document details with content
   */
  async getDocumentContent(documentId) {
    try {
      const response = await apiService.get(`/documents/${documentId}`);
      return response.document;
    } catch (error) {
      console.error('Error getting document content:', error);
      throw error;
    }
  }
  
  /**
   * Get scan history
   * @returns {Promise<Array>} Array of past scans
   */
  async getScanHistory() {
    try {
      const response = await apiService.get('/scan/history');
      return response.history || [];
    } catch (error) {
      console.error('Error getting scan history:', error);
      throw error;
    }
  }
  
  /**
   * Export scan results
   * @param {number} sourceDocumentId - Document ID
   * @param {number} threshold - Minimum similarity threshold (0-100)
   * @returns {Promise<Blob>} Export data as blob
   */
  async exportScanResults(sourceDocumentId, threshold) {
    try {
      const response = await fetch(`${apiService.baseUrl}/scan/export/${sourceDocumentId}?threshold=${threshold}`, {
        method: 'GET',
        headers: {
          // Don't set Content-Type header for blob response
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting scan results:', error);
      throw error;
    }
  }
}

// Export as singleton
export const scanService = new ScanService();
