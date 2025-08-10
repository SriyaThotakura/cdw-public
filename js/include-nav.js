// Include navigation in all pages
function includeNavigation() {
  const navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) {
    fetch('/includes/navigation.html')
      .then(response => response.text())
      .then(html => {
        navPlaceholder.outerHTML = html;
      })
      .catch(error => {
        console.error('Error loading navigation:', error);
      });
  }
}

// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', includeNavigation);
