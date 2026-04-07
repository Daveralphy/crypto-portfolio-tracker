import { loadHeaderFooter, initBottomNav, updateActiveSidebarItem } from './utils.js';
import { fetchCoins, formatCoinData, fetchGlobalData } from './api.js';
import { renderCoins, setupSearch, setupPortfolioModal } from './ui.js';
import { renderVolatilityChart } from './chart.js';

let allCoins = [];
let currentCurrency = 'USD';

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
function getCurrencySymbol(currency) {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
    'NGN': '₦'
  };
  return symbols[currency] || '$';
}

/**
 * Convert currency using ExchangeRate API
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - From currency code
 * @param {string} toCurrency - To currency code
 * @returns {Promise<number>} Converted amount
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    const data = await response.json();
    const rate = data.rates[toCurrency];
    if (!rate) throw new Error(`Currency ${toCurrency} not found`);
    return amount * rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount;
  }
}

/**
 * Format large numbers for display (T = trillions, B = billions, M = millions)
 * @param {number} value - The value to format
 * @returns {string} Formatted value with currency symbol
 */
function formatLargeNumber(value) {
  const symbol = getCurrencySymbol(currentCurrency);
  if (value >= 1e12) return symbol + (value / 1e12).toFixed(2) + 'T';
  if (value >= 1e9) return symbol + (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return symbol + (value / 1e6).toFixed(2) + 'M';
  return symbol + value.toFixed(2);
}

/**
 * Initialize the application
 */
async function init() {
  // Load header and sidebar
  await loadHeaderFooter();

  // Update active sidebar item
  updateActiveSidebarItem();

  // Initialize mobile bottom navigation
  initBottomNav();

  // Fetch cryptocurrency data
  const rawCoins = await fetchCoins(50);
  allCoins = formatCoinData(rawCoins);

  // Render coins to the table
  renderCoins(allCoins);

  // Setup search functionality
  setupSearch(allCoins);

  // Setup portfolio modal for adding coins
  setupPortfolioModal(allCoins);

  // Update market overview stats from actual global API data
  await updateMarketStats();

  // Load saved currency preference
  currentCurrency = localStorage.getItem('preferred_currency') || 'USD';

  // Listen for theme changes
  window.addEventListener('themeChanged', () => {
    // Page will automatically update because CSS uses CSS custom properties
    console.log('Theme changed globally');
  });

  // Listen for portfolio reset
  window.addEventListener('portfolioReset', () => {
    console.log('Portfolio reset from settings');
  });

  // Listen for currency changes
  window.addEventListener('currencyChanged', async (e) => {
    currentCurrency = e.detail.currency;
    // Re-render coins with new currency
    renderCoins(allCoins);
    // Re-render market stats with new currency
    await updateMarketStats();
  });
}

/**
 * Update market stats from real CoinGecko global API data
 */
async function updateMarketStats() {
  try {
    const globalData = await fetchGlobalData();
    
    // Update Global Market Cap
    const marketCapElement = document.getElementById('global-market-cap');
    if (marketCapElement) {
      marketCapElement.textContent = formatLargeNumber(globalData.totalMarketCap);
    }

    // Update Global Market Cap Change
    const marketCapChangeElement = document.getElementById('global-market-cap-change');
    if (marketCapChangeElement) {
      const changeValue = globalData.marketCapChange24h || 0;
      marketCapChangeElement.textContent = changeValue >= 0 ? '+' + changeValue.toFixed(2) + '%' : changeValue.toFixed(2) + '%';
      marketCapChangeElement.className = 'stat-change ' + (changeValue >= 0 ? 'positive' : 'negative');
    }

    // Update BTC Dominance
    const btcDominanceElement = document.getElementById('btc-dominance');
    if (btcDominanceElement) {
      btcDominanceElement.textContent = globalData.btcDominance.toFixed(2) + '%';
    }

    // Update BTC Dominance Change (set to - as it doesn't change dramatically)
    const btcDominanceChangeElement = document.getElementById('btc-dominance-change');
    if (btcDominanceChangeElement) {
      btcDominanceChangeElement.textContent = '-';
    }

    // Update 24h Volume
    const volumeElement = document.getElementById('volume-24h');
    if (volumeElement) {
      volumeElement.textContent = formatLargeNumber(globalData.total24hVolume);
    }

    // Update 24h Volume Change
    const volumeChangeElement = document.getElementById('volume-24h-change');
    if (volumeChangeElement) {
      volumeChangeElement.textContent = '-';
    }

    // Update Total Cryptocurrency Market Cap (alternative label)
    const totalMarketElement = document.getElementById('total-volume');
    if (totalMarketElement) {
      totalMarketElement.textContent = formatLargeNumber(globalData.totalMarketCap);
    }

    // Update Total Volume Change
    const totalVolumeChangeElement = document.getElementById('total-volume-change');
    if (totalVolumeChangeElement) {
      const changeValue = globalData.marketCapChange24h || 0;
      totalVolumeChangeElement.textContent = changeValue >= 0 ? '+' + changeValue.toFixed(2) + '%' : changeValue.toFixed(2) + '%';
      totalVolumeChangeElement.className = 'stat-change ' + (changeValue >= 0 ? 'positive' : 'negative');
    }

    // Update last refresh timestamp
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
      lastUpdateElement.textContent = timestamp;
    }
  } catch (error) {
    console.error('Failed to update market stats:', error);
  }
}

/**
 * Setup View More button handler
 */
function setupViewMoreButton() {
  const viewMoreBtn = document.getElementById('view-more-btn');
  if (!viewMoreBtn) return;

  viewMoreBtn.addEventListener('click', () => {
    const container = document.getElementById('coins-list');
    if (!container) return;

    // Check if we're showing all or just 5
    const isShowAll = viewMoreBtn.dataset.showAll === 'true';
    
    if (isShowAll) {
      // Collapse back to 5 rows
      renderCoins(allCoins, 'coins-list', 5);
      viewMoreBtn.dataset.showAll = 'false';
      viewMoreBtn.textContent = 'VIEW MORE';
      // Need to re-attach event listener after re-rendering
      setupViewMoreButton();
    } else {
      // Expand to show all rows
      renderCoins(allCoins, 'coins-list', allCoins.length);
      viewMoreBtn.data.showAll = 'true';
      viewMoreBtn.textContent = 'VIEW LESS';
      // Need to re-attach event listener after re-rendering
      setupViewMoreButton();
    }
  });
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  init();
  // Setup View More button after coins are rendered
  setTimeout(() => setupViewMoreButton(), 100);
});
