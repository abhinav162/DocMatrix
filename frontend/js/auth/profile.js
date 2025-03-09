import { authService } from './authService.js';
import { apiService } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  if (!authService.isAuthenticated) {
    try {
      const isAuthenticated = await authService.checkAuthStatus();
      console.log('User authenticated:', isAuthenticated);
      if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        window.location.href = './login.html';
        return;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      window.location.href = './login.html';
      return;
    }
  }
  
  // Load user profile
  loadUserProfile();
  
  // Load credit information
  loadCreditInfo();
  
  // Set up credit request form
  const requestCreditsBtn = document.getElementById('request-credits-btn');
  const requestCreditsForm = document.getElementById('request-credits-form');
  const submitCreditsRequest = document.getElementById('submit-credits-request');
  const cancelCreditsRequest = document.getElementById('cancel-credits-request');
  
  if (requestCreditsBtn && requestCreditsForm) {
    requestCreditsBtn.addEventListener('click', () => {
      requestCreditsForm.style.display = 'block';
      requestCreditsBtn.style.display = 'none';
    });
    
    cancelCreditsRequest.addEventListener('click', () => {
      requestCreditsForm.style.display = 'none';
      requestCreditsBtn.style.display = 'block';
    });
    
    submitCreditsRequest.addEventListener('click', async () => {
      const amount = document.getElementById('credits-amount').value;
      const reason = document.getElementById('credits-reason').value;
      
      try {
        await requestCredits(amount, reason);
        
        // Show success message
        showStatusMessage('Credit request submitted successfully', 'success');
        
        // Hide form and show button
        requestCreditsForm.style.display = 'none';
        requestCreditsBtn.style.display = 'block';
        
        // Reset form
        document.getElementById('credits-amount').value = '50';
        document.getElementById('credits-reason').value = '';
      } catch (error) {
        showStatusMessage(error.message || 'Failed to submit credit request', 'error');
      }
    });
  }
});

/**
 * Load user profile information
 */
async function loadUserProfile() {
  try {
    const profile = await authService.getProfile();
    
    // Update user info
    document.getElementById('username').textContent = profile.user.username;
    document.getElementById('role').textContent = profile.user.role === 'admin' ? 'Administrator' : 'Regular User';

    // Update Activity summery
    document.getElementById('docs-uploaded').textContent = profile.activitySummary.totalDocumentsUploaded;
    document.getElementById('scans-performed').textContent = profile.activitySummary.totalScansPerformed;
    
    // Format created_at date if available
    if (profile.user.created_at) {
      const date = new Date(profile.user.created_at);
      document.getElementById('created-at').textContent = date.toLocaleDateString();
    } else {
      document.getElementById('created-at').textContent = 'N/A';
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    showStatusMessage('Failed to load profile information', 'error');
  }
}

/**
 * Load credit information
 */
async function loadCreditInfo() {
  try {
    const response = await apiService.get('/credits');
    const { credits } = response;
    
    // Update credit info
    document.getElementById('available-credits').textContent = credits.remainingCredits;
    document.getElementById('credits-used').textContent = credits.dailyCreditsUsed;
    
    // Format reset date
    const resetDate = new Date(credits.lastResetDate);
    document.getElementById('last-reset').textContent = resetDate.toLocaleDateString();
  } catch (error) {
    console.error('Error loading credit info:', error);
    showStatusMessage('Failed to load credit information', 'error');
  }
}

/**
 * Request additional credits
 * @param {number} amount - Amount of credits
 * @param {string} reason - Reason for request
 */
async function requestCredits(amount, reason) {
  try {
    await apiService.post('/credits/request', {
      amount,
      reason
    });
  } catch (error) {
    console.error('Error requesting credits:', error);
    throw error;
  }
}

/**
 * Show status message
 * @param {string} message - Message to show
 * @param {string} type - Message type (success, error)
 */
function showStatusMessage(message, type) {
  const statusMessage = document.getElementById('status-message');
  if (statusMessage) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    statusMessage.classList.add(type);
    statusMessage.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }
}
