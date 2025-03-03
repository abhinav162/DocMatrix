import { apiService } from '../utils/api.js';
import { checkAuth } from '../utils/authCheck.js';
import { documentService } from './documentService.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  if (!await checkAuth()) {
    return;
  }
  
  // Element references
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const uploadProgress = document.getElementById('upload-progress');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const fileName = document.getElementById('file-name');
  const cancelUpload = document.getElementById('cancel-upload');
  const uploadForm = document.getElementById('upload-form');
  const documentTitle = document.getElementById('document-title');
  const documentVisibility = document.getElementById('document-visibility');
  const uploadSubmit = document.getElementById('upload-submit');
  const uploadCancel = document.getElementById('upload-cancel');
  const uploadSuccess = document.getElementById('upload-success');
  const uploadError = document.getElementById('upload-error');
  const errorMessage = document.getElementById('error-message');
  const scanNow = document.getElementById('scan-now');
  const viewDocument = document.getElementById('view-document');
  const uploadAnother = document.getElementById('upload-another');
  const tryAgain = document.getElementById('try-again');
  
  // File to be uploaded
  let selectedFile = null;
  let uploadController = null;
  
  // Initialize drag and drop
  initDragAndDrop();
  
  // Initialize file input
  fileInput.addEventListener('change', handleFileSelection);
  
  // Initialize buttons
  cancelUpload.addEventListener('click', cancelUploadProcess);
  uploadSubmit.addEventListener('click', submitUpload);
  uploadCancel.addEventListener('click', resetUploadForm);
  scanNow.addEventListener('click', () => {
    // Navigate to scan page
    window.location.href = './scan.html';
  });
  viewDocument.addEventListener('click', () => {
    // Navigate to documents page
    window.location.href = './documents.html';
  });
  uploadAnother.addEventListener('click', resetUploadForm);
  tryAgain.addEventListener('click', resetUploadForm);
  
  /**
   * Initialize drag and drop functionality
   */
  function initDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
      uploadArea.classList.add('highlight');
    }
    
    function unhighlight() {
      uploadArea.classList.remove('highlight');
    }
    
    uploadArea.addEventListener('drop', handleDrop, false);
  }
  
  /**
   * Handle file drop
   * @param {DragEvent} e - Drop event
   */
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length === 1) {
      handleFileSelection({ target: { files } });
    } else {
      showError('Please drop only one file');
    }
  }
  
  /**
   * Handle file selection from input or drop
   * @param {Event} e - Event containing files
   */
  function handleFileSelection(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      showError('Only .txt files are allowed');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showError('File size must be less than 10MB');
      return;
    }
    
    // Store selected file
    selectedFile = file;
    
    // Update UI
    uploadArea.style.display = 'none';
    uploadError.style.display = 'none';
    uploadForm.style.display = 'block';
    
    // Auto-fill title with file name (without extension)
    const titleWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    documentTitle.value = titleWithoutExtension;
  }
  
  /**
   * Submit the upload
   */
  async function submitUpload() {
    if (!selectedFile) {
      showError('No file selected');
      return;
    }
    
    const title = documentTitle.value.trim() || selectedFile.name;
    const isPrivate = documentVisibility.value === 'private';
    
    // Show progress UI
    uploadForm.style.display = 'none';
    uploadProgress.style.display = 'block';
    fileName.textContent = selectedFile.name;
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    
    try {
      // Create upload controller for cancellation
      uploadController = new AbortController();
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('isPrivate', isPrivate);
      
      // Upload file with progress tracking
      const response = await fetch(`${apiService.baseUrl}/documents/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        signal: uploadController.signal,
        // Use XHR for progress tracking
        xhr: function() {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              progressBar.style.width = percentComplete + '%';
              progressText.textContent = percentComplete + '%';
            }
          });
          return xhr;
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Upload failed');
      }
      
      const data = await response.json();
      
      // Show success UI
      uploadProgress.style.display = 'none';
      uploadSuccess.style.display = 'block';
      
      // Store the uploaded document ID for scan
      localStorage.setItem('lastUploadedDocumentId', data.document.id);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Show error UI
      uploadProgress.style.display = 'none';
      uploadError.style.display = 'block';
      errorMessage.textContent = error.message || 'An error occurred during upload';
    } finally {
      // Reset controller
      uploadController = null;
    }
  }
  
  /**
   * Cancel the upload process
   */
  function cancelUploadProcess() {
    if (uploadController) {
      uploadController.abort();
      uploadController = null;
    }
    
    resetUploadForm();
  }
  
  /**
   * Reset the upload form
   */
  function resetUploadForm() {
    // Reset file
    selectedFile = null;
    fileInput.value = '';
    
    // Reset UI
    uploadArea.style.display = 'block';
    uploadProgress.style.display = 'none';
    uploadForm.style.display = 'none';
    uploadSuccess.style.display = 'none';
    uploadError.style.display = 'none';
    
    // Reset form fields
    documentTitle.value = '';
    documentVisibility.value = 'private';
  }
  
  /**
   * Show error message
   * @param {string} message - Error message
   */
  function showError(message) {
    uploadError.style.display = 'block';
    errorMessage.textContent = message;
    uploadArea.style.display = 'none';
    uploadForm.style.display = 'none';
    uploadProgress.style.display = 'none';
    uploadSuccess.style.display = 'none';
  }
});
