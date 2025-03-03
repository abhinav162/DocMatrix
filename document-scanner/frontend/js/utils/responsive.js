/**
 * Responsive design utilities
 */
class ResponsiveUtil {
  // Breakpoints matching CSS media queries
  static BREAKPOINTS = {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200
  };
  
  /**
   * Check if viewport is at least a specific size
   * @param {string} breakpoint - Breakpoint name (sm, md, lg, xl)
   * @returns {boolean} True if viewport width is at least the breakpoint
   */
  static isMin(breakpoint) {
    const minWidth = this.BREAKPOINTS[breakpoint];
    if (!minWidth) return false;
    
    return window.innerWidth >= minWidth;
  }
  
  /**
   * Check if viewport is smaller than a specific size
   * @param {string} breakpoint - Breakpoint name (sm, md, lg, xl)
   * @returns {boolean} True if viewport width is smaller than the breakpoint
   */
  static isMax(breakpoint) {
    const maxWidth = this.BREAKPOINTS[breakpoint];
    if (!maxWidth) return false;
    
    return window.innerWidth < maxWidth;
  }
  
  /**
   * Get current active breakpoint
   * @returns {string} Current breakpoint name
   */
  static getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width < this.BREAKPOINTS.sm) return 'xs';
    if (width < this.BREAKPOINTS.md) return 'sm';
    if (width < this.BREAKPOINTS.lg) return 'md';
    if (width < this.BREAKPOINTS.xl) return 'lg';
    return 'xl';
  }
  
  /**
   * Add a listener for breakpoint changes
   * @param {Function} callback - Callback function(newBreakpoint, oldBreakpoint)
   * @returns {Function} Function to remove the listener
   */
  static addBreakpointListener(callback) {
    let currentBreakpoint = this.getCurrentBreakpoint();
    
    const handler = () => {
      const newBreakpoint = this.getCurrentBreakpoint();
      if (newBreakpoint !== currentBreakpoint) {
        const oldBreakpoint = currentBreakpoint;
        currentBreakpoint = newBreakpoint;
        callback(newBreakpoint, oldBreakpoint);
      }
    };
    
    window.addEventListener('resize', handler);
    
    // Return function to remove listener
    return () => window.removeEventListener('resize', handler);
  }
  
  /**
   * Execute a callback when breakpoint changes to/from mobile
   * @param {Function} enterMobile - Callback when entering mobile view
   * @param {Function} exitMobile - Callback when exiting mobile view
   * @returns {Function} Function to remove the listener
   */
  static onMobileBreakpoint(enterMobile, exitMobile) {
    const isMobile = () => this.isMax('md');
    let wasMobile = isMobile();
    
    const handler = () => {
      const nowMobile = isMobile();
      if (nowMobile !== wasMobile) {
        if (nowMobile && enterMobile) enterMobile();
        if (!nowMobile && exitMobile) exitMobile();
        wasMobile = nowMobile;
      }
    };
    
    window.addEventListener('resize', handler);
    
    // Return function to remove listener
    return () => window.removeEventListener('resize', handler);
  }
}

export default ResponsiveUtil;
