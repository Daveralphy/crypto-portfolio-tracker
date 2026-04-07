import { loadHeaderFooter, initBottomNav, updateActiveSidebarItem, showConfirmModal, showAlertModal } from './utils.js';

/**
 * Initialize settings page
 */
async function initSettings() {
  // Load header and sidebar
  await loadHeaderFooter();

  // Update active sidebar item
  updateActiveSidebarItem();

  // Initialize mobile bottom navigation
  initBottomNav();

  // Setup settings controls
  setupThemeSelect();
  setupCurrencySelector();
  setupResetPortfolio();
}

/**
 * Setup theme selector dropdown
 */
function setupThemeSelect() {
  const themeSelect = document.getElementById('theme-select');

  if (!themeSelect) return;

  // Get current theme
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  themeSelect.value = currentTheme;

  // Handle theme change
  themeSelect.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    
    // Update document theme
    document.documentElement.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    
    // Dispatch custom event that all pages listen to
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: selectedTheme } }));
  });

  // Listen for theme changes from other pages
  window.addEventListener('themeChanged', (e) => {
    const newTheme = e.detail.theme;
    themeSelect.value = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
  });

  // Also listen for storage changes for cross-tab synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme' && e.newValue) {
      const newTheme = e.newValue;
      themeSelect.value = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    }
  });
}

/**
 * Setup currency selector
 */
function setupCurrencySelector() {
  const currencySelect = document.getElementById('settings-currency-select');

  if (!currencySelect) return;

  // Load saved currency preference
  const savedCurrency = localStorage.getItem('preferred_currency') || 'USD';
  currencySelect.value = savedCurrency;

  // Handle currency change
  currencySelect.addEventListener('change', (e) => {
    const selectedCurrency = e.target.value;
    localStorage.setItem('preferred_currency', selectedCurrency);
    
    // Notify other pages that currency has changed
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: selectedCurrency } }));
  });

  // Listen for currency changes from other pages
  window.addEventListener('currencyChanged', (e) => {
    const newCurrency = e.detail.currency;
    currencySelect.value = newCurrency;
  });

  // Also listen for storage changes for cross-tab synchronization
  window.addEventListener('storage', (e) => {
    if (e.key === 'preferred_currency' && e.newValue) {
      const newCurrency = e.newValue;
      currencySelect.value = newCurrency;
      window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: newCurrency } }));
    }
  });
}

/**
 * Setup reset portfolio button
 */
function setupResetPortfolio() {
  const resetBtn = document.getElementById('reset-portfolio-btn');

  if (!resetBtn) return;

  resetBtn.addEventListener('click', async () => {
    // First confirmation
    const firstConfirm = await showConfirmModal('Are you sure you want to reset your portfolio? This will remove all coins.');
    
    if (firstConfirm) {
      // Second confirmation to prevent accidental clicks
      const secondConfirm = await showConfirmModal('This action cannot be undone. Reset portfolio?');
      
      if (secondConfirm) {
        try {
          // Clear portfolio data
          localStorage.removeItem('portfolio');
          localStorage.removeItem('portfolio_history');
          
          // Dispatch event to notify other pages
          window.dispatchEvent(new CustomEvent('portfolioReset'));
          
          // Show success message
          await showAlertModal('Portfolio has been reset successfully!');
          
          // Redirect to portfolio page
          window.location.href = './portfolio.html';
        } catch (error) {
          console.error('Error resetting portfolio:', error);
          await showAlertModal('Error resetting portfolio. Please try again.');
        }
      }
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initSettings();
});
