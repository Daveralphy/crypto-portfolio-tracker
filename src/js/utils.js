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
  // Load saved theme preference from localStorage first
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Setup theme toggle button if it exists
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) {
    // Button doesn't exist, but we still need to listen for storage events
    setupThemeEventListeners();
    return;
  }

  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Dispatch event for other listeners
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
  });

  // Setup event listeners for cross-page and cross-tab synchronization
  setupThemeEventListeners();
}

/**
 * Setup theme event listeners for cross-page and cross-tab synchronization
 */
function setupThemeEventListeners() {
  // Listen for theme changes from settings page
  window.addEventListener('themeChanged', (e) => {
    const newTheme = e.detail.theme;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Listen for storage changes (cross-tab synchronization)
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme' && e.newValue) {
      document.documentElement.setAttribute('data-theme', e.newValue);
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: e.newValue } }));
    }
  });
}

/**
 * Initialize menu toggle for sidebar collapse
 */
function initMenuToggle() {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (!menuToggle || !sidebar) return;

  // Load collapsed state from localStorage
  const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
  }

  // Toggle on button click
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    
    // Save state to localStorage
    const nowCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebar_collapsed', nowCollapsed);
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

/**
 * Get portfolio from localStorage
 * @returns {Array} Array of portfolio items
 */
export function getPortfolio() {
  try {
    const portfolio = localStorage.getItem('portfolio');
    return portfolio ? JSON.parse(portfolio) : [];
  } catch (error) {
    console.error('Error reading portfolio:', error);
    return [];
  }
}

/**
 * Save portfolio to localStorage
 * @param {Array} portfolio - Array of portfolio items
 */
export function savePortfolio(portfolio) {
  try {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  } catch (error) {
    console.error('Error saving portfolio:', error);
  }
}

/**
 * Add a coin to portfolio
 * @param {Object} portfolioItem - Item to add {coinId, name, symbol, price, amount, addedAt}
 */
export function addCoinToPortfolio(portfolioItem) {
  const portfolio = getPortfolio();
  
  // Check if coin already exists in portfolio
  const existingIndex = portfolio.findIndex(item => item.coinId === portfolioItem.coinId);
  
  if (existingIndex !== -1) {
    // Update existing coin - add to amount
    portfolio[existingIndex].amount += portfolioItem.amount;
    portfolio[existingIndex].price = portfolioItem.price;
  } else {
    // Add new coin
    portfolio.push(portfolioItem);
  }
  
  savePortfolio(portfolio);
}

/**
 * Remove a coin from portfolio
 * @param {string} coinId - The coin ID to remove
 */
export function removeCoinFromPortfolio(coinId) {
  const portfolio = getPortfolio();
  const filtered = portfolio.filter(item => item.coinId !== coinId);
  savePortfolio(filtered);
}

/**
 * Update active sidebar navigation item based on current page
 */
export function updateActiveSidebarItem() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const currentPage = window.location.pathname;

  sidebarItems.forEach(item => {
    item.classList.remove('active');
    
    const href = item.getAttribute('href');
    if (href === './index.html' && (currentPage.includes('index.html') || currentPage.endsWith('/'))) {
      item.classList.add('active');
    } else if (href === './portfolio.html' && currentPage.includes('portfolio.html')) {
      item.classList.add('active');
    } else if (href === './alerts.html' && currentPage.includes('alerts.html')) {
      item.classList.add('active');
    } else if (href === './history.html' && currentPage.includes('history.html')) {
      item.classList.add('active');
    } else if (href === './settings.html' && currentPage.includes('settings.html')) {
      item.classList.add('active');
    }
  });
}

/**
 * Update a coin in portfolio
 * @param {string} coinId - The coin ID to update
 * @param {number} newAmount - New amount for the coin
 */
export function updateCoinAmount(coinId, newAmount) {
  const portfolio = getPortfolio();
  const item = portfolio.find(item => item.coinId === coinId);
  
  if (item) {
    if (newAmount <= 0) {
      removeCoinFromPortfolio(coinId);
    } else {
      item.amount = newAmount;
      savePortfolio(portfolio);
    }
  }
}



