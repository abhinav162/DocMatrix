import { apiService } from './api.js';
import LoadingManager from './loadingManager.js';
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

  /**
   * Fetch and display admin data
   */
  async fetchAndDisplayAdminData() {
    try {
      const [users, creditRequests, analytics] = await Promise.all([
        apiService.get('/admin/users'),
        apiService.get('/admin/credits/requests'),
        apiService.get('/admin/analytics')
      ]);

      this.displayUsers(users);
      this.displayCreditRequests(creditRequests);
      // this.displayAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      ErrorHandler.showError('Failed to fetch admin data. Please try again later.', document.querySelector('main'), 0);
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
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>
          <button class="btn primary small" data-action="edit" data-user-id="${user.id}">Edit</button>
          <button class="btn danger small" data-action="delete" data-user-id="${user.id}">Delete</button>
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
  // displayAnalytics(analytics) {
  //   new Chart(this.analyticsChart, {
  //     type: 'bar',
  //     data: {
  //       labels: ['Total Users', 'Total Documents', 'Total Credit Requests', 'Total Document Scans'],
  //       datasets: [{
  //         label: 'Count',
  //         data: [analytics.totalUsers, analytics.totalDocuments, analytics.totalCreditRequests, analytics.totalDocumentScans],
  //         backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336']
  //       }]
  //     },
  //     options: {
  //       responsive: true,
  //       scales: {
  //         y: {
  //           beginAtZero: true
  //         }
  //       }
  //     }
  //   });
  // }

  /**
   * Setup event listeners for user actions
   */
  setupEventListeners() {
    this.userTable.addEventListener('click', async (event) => {
      const target = event.target;
      if (target.tagName === 'BUTTON') {
        const userId = target.getAttribute('data-user-id');
        const action = target.getAttribute('data-action');
        if (action === 'edit') {
          // Handle edit user
        } else if (action === 'delete') {
          // Handle delete user
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
