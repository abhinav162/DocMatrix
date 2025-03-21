import { apiService } from './api.js';
import { checkAdmin, checkAuth } from './authCheck.js';
import ErrorHandler from './errorHandler.js';
// import Chart from '../../../node_modules/chart.js/auto'; 

/**
 * Admin Dashboard Module
 */
class AdminDashboard {
  constructor() {
    this.userTable = document.getElementById('user-table').querySelector('tbody');
    this.creditRequestsTable = document.getElementById('credit-requests-table').querySelector('tbody');
    this.analyticsChart = document.getElementById('analytics-chart').getContext('2d');
    this.adminDashboardContainer = document.querySelector('.admin-dashboard');
    this.loadingIndicator = document.getElementById('loading-indicator');
    this.overviewTotalUsers = document.getElementById(`total-users`);
    this.overviewTotalDocuments = document.getElementById(`total-documents`);
    this.overviewTotalCreditRequests = document.getElementById(`total-credit-requests`);
    this.overviewTotalDocumentScans = document.getElementById(`total-document-scans`);
    this.overviewTotalPendingCreditRequests = document.getElementById(`total-pending-credit-requests`);
    this.editUserModal = document.getElementById('edit-user-modal');
    this.editUserForm = document.getElementById('edit-user-form');
    this.editUserUsername = document.getElementById('username');
    this.editUserId = document.getElementById('user-id');
    this.editUserRole = document.getElementById('role');
    this.closeModalBtn = document.querySelector('.close-modal');
    this.cancelEditBtn = document.getElementById('cancel-edit-btn');
    this.confirmEditBtn = document.getElementById('confirm-edit-btn');
  }

  /**
   * Initialize the admin dashboard
   */
  async init() {
    try {
      await this.fetchAndDisplayAdminData();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing admin dashboard:', error);
      ErrorHandler.showError('Failed to initialize admin dashboard. Please try refreshing the page.', document.querySelector('main'), 0);
    }
  }

  async makeAllAdminApiCalls() {
    try {
      const [users, creditRequests, analytics] = await Promise.all([
        apiService.get('/admin/users'),
        apiService.get('/admin/credits/requests'),
        apiService.get('/admin/analytics')
      ]);

      return { users, creditRequests, analytics };
    } catch (error) {
      console.error('Error making admin API calls:', error);
      ErrorHandler.showError('Failed to fetch admin data. Please try again later.', document.querySelector('main'), 0);
      return { users: null, creditRequests: null, analytics: null };
    }
  }

  /**
   * Fetch and display admin data
   */
  async fetchAndDisplayAdminData() {
    try {
      this.showLoading(true);
      await checkAuth();
      await checkAdmin();
      const { users, creditRequests, analytics } = await this.makeAllAdminApiCalls();

      this.showLoading(false);
      this.adminDashboardContainer.classList.remove('hidden');

      this.displayUsers(users);
      this.displayCreditRequests(creditRequests);
      this.displayAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      ErrorHandler.showError('Failed to fetch admin data. Please try again later.222', document.querySelector('main'), 0);
    }
  }

  /**
   * Display users in the user management table
   * @param {Array} users - List of users
   */
  displayUsers(users) {
    this.userTable.innerHTML = '';
    users?.users?.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.username}</td>
        <!-- <td>${user.email}</td> -->
        <td>${user.role}</td>
        <td>
          <button class="btn primary small" data-action="edit" data-user-id="${user.id}" data-username="${user.username}" data-role="${user.role}">Edit</button>
          <!-- <button class="btn danger small" data-action="delete" data-user-id="${user.id}">Delete</button> -->
        </td>
      `;
      this.userTable.appendChild(row);
    });
  }

  /**
   * Display credit requests in the credit requests table
   * @param {Array} creditRequests - List of credit requests
   */
  displayCreditRequests(creditRequests) {
    this.creditRequestsTable.innerHTML = '';

    if (!creditRequests?.requests?.length) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6">No credit requests found</td>';
      this.creditRequestsTable.appendChild(row);
      return;
    }

    creditRequests?.requests?.forEach(request => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${request.user_id}</td>
        <td>${request.username}</td>
        <td>${request.requested_amount}</td>
        <td>${request.reason}</td>
        <td>${request.status}</td>
        <td>
          <button class="btn primary small" data-action="approve" data-request-id="${request.id}">Approve</button>
          <button class="btn danger small" data-action="deny" data-request-id="${request.id}">Deny</button>
        </td>
      `;
      this.creditRequestsTable.appendChild(row);
    });
  }

  /**
   * Display analytics data in the chart
   * @param {Object} analytics - Analytics data
   */
  displayAnalytics(analytics) {
    analytics = analytics?.analytics || {};

    this.overviewTotalUsers.textContent = analytics.totalUsers || 0;
    this.overviewTotalDocuments.textContent = analytics.totalDocuments || 0;
    this.overviewTotalCreditRequests.textContent = analytics.totalCreditRequests || 0;
    this.overviewTotalDocumentScans.textContent = analytics.totalDocumentScans || 0;
    this.overviewTotalPendingCreditRequests.textContent = analytics.totalPendingCreditRequests || 0;
    
    // Destroy the existing chart instance if it exists
    if (this.chartInstance) {
        this.chartInstance.destroy();
    }

    // Create new chart instance and store it
    this.chartInstance = new Chart(this.analyticsChart, {
      type: 'bar',
      data: {
        labels: ['Total Users', 'Total Documents', 'Total Document Scans', 'Total Credit Requests', 'Total Pending Credit Requests'],
        datasets: [{
          label: 'Count',
          data: [analytics.totalUsers, analytics.totalDocuments, analytics.totalDocumentScans, analytics.totalCreditRequests, analytics.totalPendingCreditRequests],
          backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Setup event listeners for user actions
   */
  setupEventListeners() {
    this.closeModalBtn.addEventListener('click', () => {
      this.hideEditUserModal();
    });
    
    this.userTable.addEventListener('click', async (event) => {
      const target = event.target;
      if (target.tagName === 'BUTTON') {
        const userId = target.getAttribute('data-user-id');
        const username = target.getAttribute('data-username');
        const role = target.getAttribute('data-role');
        const action = target.getAttribute('data-action');
        if (action === 'edit') {
          await this.handleEditUser(userId, username, role);
        } else if (action === 'delete') {
          await this.handleDeleteUser(userId);
        } else if (action === 'delete') {
          await this.handleDeleteUser(userId);
        }
      }
    });

    this.creditRequestsTable.addEventListener('click', async (event) => {
      const target = event.target;
      if (target.tagName === 'BUTTON') {
        const requestId = target.getAttribute('data-request-id');
        const action = target.getAttribute('data-action');
        if (action === 'approve') {
          await this.handleCreditRequestApproval(requestId);
        } else if (action === 'deny') {
          await this.handleCreditRequestDenial(requestId);
        }
      }
    });

    this.editUserModal.addEventListener('click', (event) => {
      event.preventDefault();
      const target = event.target;
      const userId = this.editUserId.value;
      const username = this.editUserUsername.value;
      const role = this.editUserRole.value;
      if (target.tagName === 'BUTTON') {
        const action = target.getAttribute('data-action');
        if (action === 'update') {
          this.handleUpdateUser(userId, username, role);
        } else if (action === 'cancel') {
          this.hideEditUserModal();
        }
      }
    });
  }

  /**
   * Handle update user
   * @param {number} userId - User ID
   * @param {string} username - Username
   * @param {string} role - Role
   */
  async handleUpdateUser(userId, username, role) {
    try {
      await apiService.patch(`/admin/users/${userId}/role`, { role: role });
      await this.fetchAndDisplayAdminData();
      this.hideEditUserModal();
    } catch (error) {
      console.error('Error updating user:', error);
      ErrorHandler.showError('Failed to update user. Please try again later.', document.querySelector('main'), 0);
    }
  }

  /**
   * Handle edit user
   * @param {number} userId - User ID
   */
  async handleEditUser(userId, username, role) {
    this.showEditUserModal(userId, username, role);
  }

  /**
   * Handle delete user
   * @param {number} userId - User ID
   */
  async handleDeleteUser(userId) {
    console.log('Delete user:', userId);
    // Implement delete user functionality
  }

  /**
   * Handle credit request approval
   * @param {number} requestId - Credit request ID
   */
  async handleCreditRequestApproval(requestId) {
    try {
      await apiService.post(`/credits/approve/${requestId}`);
      await this.fetchAndDisplayAdminData();
    } catch (error) {
      console.error('Error approving credit request:', error);
      ErrorHandler.showError('Failed to approve credit request. Please try again later.', document.querySelector('main'), 0);
    }
  }

  /**
   * Handle credit request denial
   * @param {number} requestId - Credit request ID
   */
  async handleCreditRequestDenial(requestId) {
    try {
      await apiService.post(`/credits/deny/${requestId}`);
      await this.fetchAndDisplayAdminData();
    } catch (error) {
      console.error('Error denying credit request:', error);
      ErrorHandler.showError('Failed to deny credit request. Please try again later.', document.querySelector('main'), 0);
    }
  }

  /**
   * Show or hide loading indicator
   * @param {boolean} show - Whether to show loading
   */
  showLoading(show) {
    this.loadingIndicator.style.display = show ? 'flex' : 'none';
  }

  /**
   * Show edit user modal
   * @param {number} userId - User ID
   */
  showEditUserModal(userId, username, role) {
    this.editUserModal.style.display = 'flex';
    this.editUserUsername.value = username;
    this.editUserRole.value = role;
    this.editUserId.value = userId;
  }

  /**
   * Hide edit user modal
   */
  hideEditUserModal() {
    this.editUserModal.style.display = 'none';
  }

  /**
   * Export reports in CSV format
   */
  exportReports() {
    // Implement CSV export functionality
  }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const adminDashboard = new AdminDashboard();
  adminDashboard.init().catch(error => {
    console.error('Error during admin dashboard initialization:', error);
  });
});
