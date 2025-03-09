import { authService } from '../auth/authService.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Load navigation component
  const navElement = document.getElementById('main-nav');
  
  if (navElement) {
    try {
      // Determine the correct path for navigation.html
      let navigationPath = '../components/navigation.html';
      
      // If we're in a page inside the pages directory, adjust the path
      if (window.location.pathname.includes('/pages/')) {
        navigationPath = '../components/navigation.html';
      } else if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        navigationPath = './components/navigation.html';
      }
      
      const response = await fetch(navigationPath);
      const html = await response.text();
      navElement.innerHTML = html;
      
      // Set up mobile menu toggle
      const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
      const navLinks = document.getElementById('nav-links');
      
      if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
          navLinks.classList.toggle('active');
          mobileMenuToggle.classList.toggle('active');
        });
      }
      
      // Fix navigation links based on current location
      updateNavigationLinks();
      
      // Set up auth-related UI
      updateAuthUI();
      
      // Set up logout functionality
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            await authService.logout();
            window.location.href = '../index.html';
          } catch (error) {
            console.error('Logout error:', error);
          }
        });
      }
      
      // Listen for auth state changes
      authService.addAuthListener(updateAuthUI);
    } catch (error) {
      console.error('Error loading navigation:', error);
    }
  }
});

/**
 * Update navigation links based on current location
 */
function updateNavigationLinks() {
  const currentPath = window.location.pathname;
  const isInPagesDir = currentPath.includes('/pages/');
  
  // Fix links based on current directory
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    
    if (href && href.startsWith('./pages/')) {
      if (isInPagesDir) {
        // If we're already in /pages/, change ./pages/ to ./
        link.setAttribute('href', href.replace('./pages/', './'));
      }
    } else if (href === '../index.html' && !isInPagesDir) {
      // If we're in the root and link points to ../index.html, change to ./index.html
      link.setAttribute('href', './index.html');
    }
  });
}

/**
 * Update auth-related UI based on authentication state
 */
function updateAuthUI(isAuthenticated, user) {
  // If arguments not provided, use values from service
  if (isAuthenticated === undefined) {
    isAuthenticated = authService.isAuthenticated;
    user = authService.user;
  }
  
  const loginLink = document.querySelector('.login-link');
  const registerLink = document.querySelector('.register-link');
  const profileLink = document.querySelector('.profile-link');
  const logoutLink = document.querySelector('.logout-link');
  const adminDashboardLink = document.querySelector('.admin-dashboard-link');
  
  if (loginLink && registerLink && profileLink && logoutLink) {
    if (isAuthenticated) {
      loginLink.style.display = 'none';
      registerLink.style.display = 'none';
      profileLink.style.display = 'block';
      logoutLink.style.display = 'block';
    } else {
      loginLink.style.display = 'block';
      registerLink.style.display = 'block';
      profileLink.style.display = 'none';
      logoutLink.style.display = 'none';
    }
  }

  if (adminDashboardLink) {
    if (user && user.role === 'admin') {
      adminDashboardLink.style.display = 'block';
    } else {
      adminDashboardLink.style.display = 'none';
    }
  }
}
