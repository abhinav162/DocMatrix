/**
 * Main application initialization
 */
import { authService } from './auth/authService.js';
import ErrorHandler from './utils/errorHandler.js';
import ResponsiveUtil from './utils/responsive.js';

class App {
  constructor() {
    this.initialized = false;
    this.pageModules = {
      '/': () => this.initHomePage(),
      '/index.html': () => this.initHomePage(),
      '/pages/login.html': () => this.initLoginPage(),
      '/pages/register.html': () => this.initRegisterPage(),
      '/pages/profile.html': () => this.initProfilePage(),
      '/pages/upload.html': () => this.initUploadPage(),
      '/pages/documents.html': () => this.initDocumentsPage(),
      '/pages/scan.html': () => this.initScanPage(),
      '/pages/scan-history.html': () => this.initScanHistoryPage(),
      '/pages/scan-results.html': () => this.initScanResultsPage(),
      '/pages/admin-dashboard.html': () => this.initAdminDashboardPage(),
    };
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing application...');
      
      // Register global error handler
      window.addEventListener('error', (event) => {
        ErrorHandler.logError(
          event.error || new Error(event.message),
          'Global error handler',
          true
        );
      });
      
      // Register unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        ErrorHandler.logError(
          event.reason || new Error('Unhandled promise rejection'),
          'Unhandled promise rejection',
          true
        );
      });
      
      // Check authentication status
      await authService.checkAuthStatus();
      
      // Initialize responsive handlers
      // this.initResponsiveHandlers();
      
      // Initialize page-specific modules
      this.initCurrentPage();
      
      this.initialized = true;
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      // Show error message on page
      const mainElement = document.querySelector('main');
      if (mainElement) {
        ErrorHandler.showError(
          'Failed to initialize application. Please try refreshing the page.',
          mainElement,
          0
        );
      }
    }
  }

  /**
   * Initialize the current page based on URL
   */
  initCurrentPage() {
    const pathname = window.location.pathname;
    
    // Find the matching page initializer
    const pageInitializer = Object.entries(this.pageModules).find(([path]) => {
      return pathname.endsWith(path);
    });
    
    if (pageInitializer) {
      console.log(`Initializing page: ${pageInitializer[0]}`);
      pageInitializer[1]();
    } else {
      console.log(`No specific initializer for page: ${pathname}`);
    }
  }

  /**
   * Initialize responsive handlers
   */
  initResponsiveHandlers() {
    // Handle mobile menu
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenuToggle && navLinks) {
      mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
      });
    }
    
    // Handle responsive adjustments on breakpoint changes
    ResponsiveUtil.addBreakpointListener((newBreakpoint, oldBreakpoint) => {
      console.log(`Breakpoint changed from ${oldBreakpoint} to ${newBreakpoint}`);
      
      // Close mobile menu when resizing to larger screens
      if (navLinks && navLinks.classList.contains('active') && 
          ResponsiveUtil.isMin('md')) {
        navLinks.classList.remove('active');
        if (mobileMenuToggle) {
          mobileMenuToggle.classList.remove('active');
        }
      }
    });
  }

  /**
   * Home page initialization
   */
  initHomePage() {
    const getStartedBtn = document.getElementById('get-started-btn');
    const learnMoreBtn = document.querySelector('.hero-btn.secondary');

    if (getStartedBtn) {
      getStartedBtn.addEventListener('click', () => {
        if (authService.isAuthenticated) {
          window.location.href = './pages/upload.html';
        } else {
          window.location.href = './pages/login.html';
        }
      });
    }

    if (learnMoreBtn) {
      learnMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Initialize the document animation
    this.initDocumentAnimation();
  }

  /**
   * Initialize document animation
   * This is a fallback in case the landing.js script doesn't load
   */
  initDocumentAnimation() {
    // Check if the animation has already been initialized by landing.js
    if (window.documentAnimationInitialized) return;

    // Check if the landing.js script is loaded
    const landingScript = document.querySelector('script[src="js/landing.js"]');
    if (!landingScript) {
      console.warn('Landing script not found, initializing animation from app.js');

      // If landing.js is not available, try to initialize a basic animation
      const animationContainer = document.querySelector('.document-animation');
      if (animationContainer) {
        // Create a simple scan line
        const scanLine = document.createElement('div');
        scanLine.className = 'scan-line';
        animationContainer.appendChild(scanLine);
      }
    }
  }

  /**
   * Admin dashboard page initialization
   */
  initAdminDashboardPage() {
    import('./utils/admin-dashboard.js').then((module) => {
      const adminDashboard = new module.default();
      adminDashboard.init().catch((error) => {
        console.error('Error during admin dashboard initialization:', error);
      });
    }).catch((error) => {
      console.error('Failed to load admin dashboard module:', error);
    });
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init().catch(error => {
    console.error('Error during app initialization:', error);
  });
});
