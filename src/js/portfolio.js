import { loadHeaderFooter, initBottomNav, getPortfolio, removeCoinFromPortfolio, updateCoinAmount, updateActiveSidebarItem } from './utils.js';
import { fetchCoins, formatCoinData } from './api.js';
import { addHistoryEntry } from './history.js';

let allCoins = [];
let currentCurrency = 'USD';
const currencySymbols = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'AUD': 'A$',
  'CAD': 'C$',
  'NGN': '₦'
};

/**
 * Initialize portfolio page
 */
async function initPortfolio() {
  // Load header and sidebar
  await loadHeaderFooter();

  // Update active sidebar item
  updateActiveSidebarItem();

  // Initialize mobile bottom navigation
  initBottomNav();

  // Load preferred currency from localStorage
  currentCurrency = localStorage.getItem('preferred_currency') || 'USD';

  // Fetch live coin data to get current prices
  const rawCoins = await fetchCoins(250);
  allCoins = formatCoinData(rawCoins);

  // Load portfolio from localStorage
  const portfolio = getPortfolio();

  // Render portfolio
  renderPortfolio(portfolio);

  // Setup event listeners
  setupEventListeners(portfolio);

  // Setup back button
  setupBackButton();

  // Listen for currency changes from settings page
  window.addEventListener('currencyChanged', (e) => {
    const newCurrency = e.detail.currency;
    currentCurrency = newCurrency;
    
    // Update the currency selector
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
      currencySelect.value = newCurrency;
    }
    
    // Refresh portfolio display with new currency
    const currentPortfolio = getPortfolio();
    if (currentPortfolio && currentPortfolio.length > 0) {
      const totalValue = currentPortfolio.reduce((sum, item) => {
        const currentCoin = allCoins.find(c => c.id === item.coinId);
        const currentPrice = currentCoin ? currentCoin.price : item.price;
        return sum + (item.amount * currentPrice);
      }, 0);
      
      updatePortfolioDisplay(totalValue);
    }
  });
}

/**
 * Render portfolio items to the page and update total value
 * @param {Array} portfolio - Portfolio items
 */
async function renderPortfolio(portfolio) {
  const portfolioList = document.getElementById('portfolio-list');
  if (!portfolioList) return;

  if (!portfolio || portfolio.length === 0) {
    portfolioList.innerHTML = `<tr class="no-data">
      <td colspan="5">No coins in your portfolio yet. <a href="./index.html">Start adding coins from the market!</a></td>
    </tr>`;
    // Update portfolio value to 0
    await updatePortfolioDisplay(0);
    return;
  }

  // Get current prices from API data
  const portfolioHTML = portfolio.map(item => {
    const currentCoin = allCoins.find(c => c.id === item.coinId);
    const currentPrice = currentCoin ? currentCoin.price : item.price;
    const totalValue = item.amount * currentPrice;

    return `
      <tr class="portfolio-item" data-coin-id="${item.coinId}">
        <td class="asset">
          <div class="asset-info">
            ${currentCoin ? `<img src="${currentCoin.image}" alt="${item.name}" class="coin-image">` : ''}
            <div>
              <div class="coin-symbol">${item.symbol}</div>
              <div class="coin-name">${item.name}</div>
            </div>
          </div>
        </td>
        <td class="price">$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="amount">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 }).replace(/\.?0+$/, '')}</td>
        <td class="total">$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="action">
          <button class="remove-portfolio-btn" data-coin-id="${item.coinId}" title="Remove from Portfolio">Remove</button>
        </td>
      </tr>
    `;
  }).join('');

  portfolioList.innerHTML = portfolioHTML;

  // Calculate total portfolio value
  const totalValue = portfolio.reduce((sum, item) => {
    const currentCoin = allCoins.find(c => c.id === item.coinId);
    const currentPrice = currentCoin ? currentCoin.price : item.price;
    return sum + (item.amount * currentPrice);
  }, 0);

  await updatePortfolioDisplay(totalValue);
}

/**
 * Update portfolio value display
 * @param {number} totalValue - Total portfolio value in USD
 */
async function updatePortfolioDisplay(totalValue) {
  const totalValueElement = document.getElementById('total-portfolio-value');
  if (totalValueElement) {
    let displayValue = totalValue;
    let symbol = '$';

    if (currentCurrency !== 'USD') {
      const convertedValue = await convertCurrency(totalValue, 'USD', currentCurrency);
      displayValue = convertedValue;
      symbol = currencySymbols[currentCurrency];
    }

    totalValueElement.textContent = symbol + displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

/**
 * Convert currency using ExchangeRate API
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - From currency code
 * @param {string} toCurrency - To currency code
 * @returns {Promise<number>} Converted amount
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    if (!response.ok) throw new Error('Failed to fetch exchange rates');
    
    const data = await response.json();
    const rate = data.rates[toCurrency];
    
    if (!rate) throw new Error(`Currency ${toCurrency} not found`);
    
    return amount * rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    // Return original amount if conversion fails
    return amount;
  }
}

/**
 * Setup event listeners for portfolio actions
 * @param {Array} portfolio - Portfolio items
 */
function setupEventListeners(portfolio) {
  // Remove button listeners
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('remove-portfolio-btn')) {
      const coinId = e.target.getAttribute('data-coin-id');
      
      if (confirm('Are you sure you want to remove this coin from your portfolio?')) {
        // Find the coin being removed to get its details for history
        const coinToRemove = portfolio.find(item => item.coinId === coinId);
        if (coinToRemove) {
          // Add history entry
          addHistoryEntry({
            action: 'removed',
            coinId: coinToRemove.coinId,
            coinName: coinToRemove.name,
            coinSymbol: coinToRemove.symbol,
            amount: coinToRemove.amount,
            price: coinToRemove.price
          });
        }
        
        removeCoinFromPortfolio(coinId);
        const updatedPortfolio = getPortfolio();
        await renderPortfolio(updatedPortfolio);
      }
    }
  });

  // Currency selector
  const currencySelect = document.getElementById('currency-select');
  if (currencySelect) {
    // Set current currency in selector
    currencySelect.value = currentCurrency;

    currencySelect.addEventListener('change', async (e) => {
      currentCurrency = e.target.value;
      
      // Save to localStorage
      localStorage.setItem('preferred_currency', currentCurrency);
      
      // Dispatch event for settings page to sync
      window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: currentCurrency } }));
      
      const currentPortfolio = getPortfolio();
      
      if (currentPortfolio && currentPortfolio.length > 0) {
        const totalValue = currentPortfolio.reduce((sum, item) => {
          const currentCoin = allCoins.find(c => c.id === item.coinId);
          const currentPrice = currentCoin ? currentCoin.price : item.price;
          return sum + (item.amount * currentPrice);
        }, 0);
        
        await updatePortfolioDisplay(totalValue);
      }
    });
  }
}

/**
 * Setup back button
 */
function setupBackButton() {
  const backBtn = document.getElementById('back-to-market-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = './index.html';
    });
  }
}

/**
 * Update price in table when currency changes
 */
async function updatePricesForCurrency() {
  const portfolio = getPortfolio();
  const totalValue = portfolio.reduce((sum, item) => {
    const currentCoin = allCoins.find(c => c.id === item.coinId);
    const currentPrice = currentCoin ? currentCoin.price : item.price;
    return sum + (item.amount * currentPrice);
  }, 0);

  await updatePortfolioDisplay(totalValue);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initPortfolio();
});
