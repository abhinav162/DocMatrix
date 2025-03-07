import { apiService } from '../utils/api.js';

/**
 * Service for document-related operations
 */
class DocumentService {
  /**
   * Upload a document with progress tracking
   * @param {File} file - File to upload
   * @param {string} title - Document title
   * @param {boolean} isPrivate - Whether the document is private
   * @param {Function} onProgress - Progress callback
   * @param {AbortSignal} signal - Abort signal for cancellation
   * @returns {Promise<Object>} Uploaded document data
   */
  async uploadDocument(file, title, isPrivate, onProgress, signal) {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('isPrivate', isPrivate);
      
      // Create custom fetch with progress tracking
      const xhr = new XMLHttpRequest();
      
      // Create promise for XHR
      const promise = new Promise((resolve, reject) => {
        xhr.open('POST', `${apiService.baseUrl}/documents/upload`);
        
        // Add credentials for session
        xhr.withCredentials = true;
        
        // Set up upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
        
        // Set up completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || 'Upload failed'));
            } catch (error) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });
        
        // Set up error
        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });
        
        // Set up abort
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });
        
        // Send the form data
        xhr.send(formData);
        
        // Handle abort signal
        if (signal) {
          signal.addEventListener('abort', () => {
            xhr.abort();
          });
        }
      });
      
      return promise;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }
  
  /**
   * Get all documents for the current user
   * @returns {Promise<Array>} Array of documents
   */
  async getUserDocuments() {
    try {
      const response = await apiService.get('/documents');
      return response.documents || [];
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }
  
  /**
   * Toggle document visibility
   * @param {number} documentId - Document ID
   * @param {boolean} isPrivate - New visibility state
   * @returns {Promise<Object>} Updated document
   */
  async toggleDocumentVisibility(documentId, isPrivate) {
    try {
      const response = await apiService.patch(`/documents/${documentId}/privacy`, {
        isPrivate
      });
      return response.document;
    } catch (error) {
      console.error('Error toggling document visibility:', error);
      throw error;
    }
  }
  
  /**
   * Get document details
   * @param {number} documentId - Document ID
   * @returns {Promise<Object>} Document details
   */
  async getDocumentDetails(documentId) {
    try {
      const response = await apiService.get(`/documents/${documentId}`);
      return response.document;
    } catch (error) {
      console.error('Error getting document details:', error);
      throw error;
    }
  }
  
  /**
   * Delete a document
   * @param {number} documentId - Document ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteDocument(documentId) {
    try {
      await apiService.delete(`/documents/${documentId}`);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}

// Export as singleton
export const documentService = new DocumentService();
