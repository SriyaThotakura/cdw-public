// Include navigation in all pages
function includeNavigation() {
  console.log('includeNavigation function called');
  const navPlaceholder = document.getElementById('nav-placeholder');
  
  if (!navPlaceholder) {
    console.error('Navigation placeholder not found!');
    return;
  }
  
  // Function to determine the correct base path
  function getBasePath() {
    // For local development, always use relative path
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      // Get the current path segments
      const pathSegments = window.location.pathname.split('/');
      // Find the index of 'Relational%20Structures' or other subdirectories
      const subdirs = ['Relational%20Structures', 'Temporal%20Structures', 'Geospatial%20Structures'];
      let basePath = '';
      
      // Find the first matching subdirectory
      for (const subdir of subdirs) {
        const index = pathSegments.indexOf(subdir);
        if (index !== -1) {
          // We're in a subdirectory, need to go up one level
          return '../';
        }
      }
      
      // If we're in the root, no need for base path
      return '';
    }
    
    // For GitHub Pages, use the repository name as base path
    return '/cdw-public';
  }
  
  const basePath = getBasePath();
  const navPath = `${basePath}/includes/navigation.html`;
  console.log('Attempting to load navigation from:', navPath);
  
  // Add a timestamp to prevent caching issues
  const timestamp = new Date().getTime();
  const url = `${navPath}?v=${timestamp}`;
  
  fetch(url, { cache: 'no-cache' })
    .then(response => {
      console.log('Navigation fetch response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      console.log('Successfully loaded navigation HTML');
      navPlaceholder.outerHTML = html;
      console.log('Navigation HTML inserted');
      
      // Initialize mobile menu toggle after navigation is loaded
      initMobileMenu();
    })
    .catch(error => {
      console.error('Error loading navigation:', error);
      // Fallback navigation in case of error
      navPlaceholder.outerHTML = `
        <nav class="fallback-nav">
          <div class="fallback-nav-content">
            <a href="${basePath || '/'}" class="fallback-nav-link">Home</a>
            <a href="${basePath}/Relational%20Structures/" class="fallback-nav-link">Relational</a>
            <a href="${basePath}/Temporal%20Structures/" class="fallback-nav-link">Temporal</a>
            <a href="${basePath}/Geospatial%20Structures/" class="fallback-nav-link">Geospatial</a>
          </div>
        </nav>
      `;
      
      // Add fallback styles
      const style = document.createElement('style');
      style.textContent = `
        .fallback-nav {
          background: rgba(20, 20, 40, 0.95);
          padding: 1rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .fallback-nav-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          gap: 1.5rem;
          justify-content: center;
        }
        .fallback-nav-link {
          color: #fff;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .fallback-nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `;
      document.head.appendChild(style);
    });
}

// Initialize mobile menu functionality
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.header') && !event.target.closest('.menu-toggle')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
    
    // Close menu when a nav link is clicked (for single page navigation)
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
  }
}

// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded, initializing navigation...');
  includeNavigation();
});
