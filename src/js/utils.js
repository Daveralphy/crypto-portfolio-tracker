/**
 * Load HTML partials dynamically
 * @param {string} partial - The name of the partial (e.g., 'header', 'sidebar')
 * @param {string} targetSelector - CSS selector where to insert the partial
 */
export async function loadPartial(partial, targetSelector) {
  try {
    const response = await fetch(`./src/partials/${partial}.html`);
    if (!response.ok) throw new Error(`Failed to load ${partial} partial`);
    const html = await response.text();
    const target = document.querySelector(targetSelector);
    if (target) {
      target.innerHTML = html;
    }
  } catch (error) {
    console.error(`Error loading partial: ${partial}`, error);
  }
}

/**
 * Load header and sidebar partials
 */
export async function loadHeaderFooter() {
  await loadPartial('header', '#header-container');
  await loadPartial('sidebar', '#sidebar-container');
  
  // Initialize theme toggle and menu toggle
  initThemeToggle();
  initMenuToggle();
}

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  // Load saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

/**
 * Initialize menu toggle for sidebar collapse
 */
function initMenuToggle() {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (!menuToggle || !sidebar) return;

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
}

/**
 * Initialize bottom navigation for mobile
 */
export function initBottomNav() {
  const bottomNav = document.getElementById('bottom-nav');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  
  if (!bottomNav) return;

  // Show bottom nav on mobile (screen < 768px)
  const isMobile = () => window.innerWidth < 768;
  
  // Update bottom nav visibility on load and resize
  const updateBottomNav = () => {
    if (isMobile()) {
      bottomNav.classList.add('show');
    } else {
      bottomNav.classList.remove('show');
    }
  };

  // Initial check
  updateBottomNav();

  // Handle window resize
  window.addEventListener('resize', updateBottomNav);

  // Handle bottom nav item clicks
  bottomNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      // Remove active class from all items
      bottomNavItems.forEach(navItem => navItem.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');

      // Optionally handle different tabs here
      const tabName = item.getAttribute('data-tab');
      console.log(`Navigating to tab: ${tabName}`);
    });
  });
}

