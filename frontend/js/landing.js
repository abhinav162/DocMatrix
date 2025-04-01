/**
 * Landing page animations and interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize document animations
  initDocumentAnimation();
  // Set a flag to indicate the animation has been initialized
  window.documentAnimationInitialized = true;
});

/**
 * Initialize the floating document animation
 */
function initDocumentAnimation() {
  const animationContainer = document.querySelector('.document-animation');
  if (!animationContainer) return;
  
  // Create floating documents
  const numDocs = 8;
  for (let i = 0; i < numDocs; i++) {
    createFloatingDocument(animationContainer, i);
  }
  
  // Create connection lines between some documents
  createConnectionLines(animationContainer);
  
  // Create scanning effect
  createScanningEffect(animationContainer);
}

/**
 * Create a floating document element
 * @param {HTMLElement} container - The container element
 * @param {number} index - Document index
 */
function createFloatingDocument(container, index) {
  const doc = document.createElement('div');
  doc.className = 'floating-doc';
  doc.id = `doc-${index}`;
  
  // Add document lines
  for (let i = 0; i < 4; i++) {
    const line = document.createElement('div');
    line.className = 'doc-line';
    doc.appendChild(line);
  }
  
  // Set random position
  const x = Math.random() * 80 + 10; // 10% to 90% of container width
  const y = Math.random() * 80 + 10; // 10% to 90% of container height
  
  doc.style.left = `${x}%`;
  doc.style.top = `${y}%`;
  
  // Add animation
  const duration = 20 + Math.random() * 20; // 20-40s
  const delay = Math.random() * 10; // 0-10s
  
  doc.style.animation = `float ${duration}s ${delay}s infinite ease-in-out`;
  
  // Add to container
  container.appendChild(doc);
  
  // Create floating animation keyframes
  const keyframes = `
    @keyframes float {
      0% {
        transform: translate(0, 0) rotate(0deg);
      }
      25% {
        transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 10 - 5}deg);
      }
      50% {
        transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 10 - 5}deg);
      }
      75% {
        transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 10 - 5}deg);
      }
      100% {
        transform: translate(0, 0) rotate(0deg);
      }
    }
  `;
  
  // Add keyframes to document
  const style = document.createElement('style');
  style.textContent = keyframes;
  document.head.appendChild(style);
}

/**
 * Create connection lines between documents
 * @param {HTMLElement} container - The container element
 */
function createConnectionLines(container) {
  // Create some random connections between documents
  const numConnections = 6;
  const docs = document.querySelectorAll('.floating-doc');
  
  if (docs.length < 2) return;
  
  for (let i = 0; i < numConnections; i++) {
    // Get two random documents
    const docIndex1 = Math.floor(Math.random() * docs.length);
    let docIndex2 = Math.floor(Math.random() * docs.length);
    
    // Make sure we don't connect a document to itself
    while (docIndex1 === docIndex2) {
      docIndex2 = Math.floor(Math.random() * docs.length);
    }
    
    const doc1 = docs[docIndex1];
    const doc2 = docs[docIndex2];
    
    // Create connection line
    const line = document.createElement('div');
    line.className = 'connection-line';
    
    // Position and animate the line
    updateConnectionLine(line, doc1, doc2);
    
    // Add to container
    container.appendChild(line);
    
    // Update line position on animation frames
    setInterval(() => {
      updateConnectionLine(line, doc1, doc2);
    }, 100);
  }
}

/**
 * Update connection line position and rotation
 * @param {HTMLElement} line - The line element
 * @param {HTMLElement} doc1 - First document element
 * @param {HTMLElement} doc2 - Second document element
 */
function updateConnectionLine(line, doc1, doc2) {
  // Get document positions
  const rect1 = doc1.getBoundingClientRect();
  const rect2 = doc2.getBoundingClientRect();
  
  // Calculate center points
  const x1 = rect1.left + rect1.width / 2;
  const y1 = rect1.top + rect1.height / 2;
  const x2 = rect2.left + rect2.width / 2;
  const y2 = rect2.top + rect2.height / 2;
  
  // Calculate distance and angle
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  // Position line
  line.style.width = `${distance}px`;
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;
  line.style.transform = `rotate(${angle}deg)`;
}

/**
 * Create scanning effect
 * @param {HTMLElement} container - The container element
 */
function createScanningEffect(container) {
  const scanLine = document.createElement('div');
  scanLine.className = 'scan-line';
  container.appendChild(scanLine);
}