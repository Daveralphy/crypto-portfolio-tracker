// Global currency state
let currentCurrency = localStorage.getItem('preferred_currency') || 'USD';

// Listen for currency changes from other pages
window.addEventListener('currencyChanged', (e) => {
  currentCurrency = e.detail.currency;
});

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
 * Render a list of coins to the DOM in table format
 * @param {Array} coins - Array of coin objects
 * @param {string} containerId - ID of the container element
 * @param {number} limit - Maximum number of rows to show (default 5)
 */
export function renderCoins(coins, containerId = 'coins-list', limit = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (coins.length === 0) {
    container.innerHTML = '<tr class="no-data"><td colspan="5">No coins found</td></tr>';
    document.getElementById('view-more-btn').classList.add('hidden');
    return;
  }

  // Show only limited rows initially
  const displayCoins = coins.slice(0, limit);
  container.innerHTML = displayCoins.map((coin, index) => createCoinTableRow(coin, index + 1)).join('');
  
  // Format prices for all coins with current currency
  displayCoins.forEach((coin, index) => {
    formatPrice(coin.price).then(formattedPrice => {
      const rows = container.querySelectorAll('.coin-row');
      if (rows[index]) {
        const priceCell = rows[index].querySelector('.price');
        if (priceCell) {
          priceCell.textContent = formattedPrice;
        }
      }
    });
  });
  
  // Show/hide View More button
  const viewMoreBtn = document.getElementById('view-more-btn');
  if (viewMoreBtn) {
    if (coins.length > limit) {
      viewMoreBtn.classList.remove('hidden');
      viewMoreBtn.style.display = 'block';
      // Store full coin list for expansion
      viewMoreBtn.dataset.fullCoins = JSON.stringify(coins);
      viewMoreBtn.dataset.showAll = 'false';
    } else {
      viewMoreBtn.classList.add('hidden');
      viewMoreBtn.style.display = 'none';
    }
  }
}

/**
 * Create HTML table row for a single coin
 * @param {Object} coin - Coin object with price, symbol, etc.
 * @param {number} rank - Rank of the coin
 * @returns {string} HTML string for the table row
 */
function createCoinTableRow(coin, rank) {
  const priceChange = coin.priceChange24h || 0;
  const changeClass = priceChange >= 0 ? 'positive' : 'negative';
  const changeSymbol = priceChange >= 0 ? '+' : '';
  const marketCap = coin.marketCap ? formatMarketCap(coin.marketCap) : 'N/A';

  return `
    <tr class="coin-row" data-coin-id="${coin.id}" data-coin-name="${coin.name}" data-coin-price="${coin.price}" data-coin-symbol="${coin.symbol}">
      <td class="rank">${rank}</td>
      <td class="asset">
        <div class="asset-info">
          <img src="${coin.image}" alt="${coin.name}" class="coin-image">
          <div>
            <div class="coin-symbol">${coin.symbol}</div>
            <div class="coin-name">${coin.name}</div>
          </div>
        </div>
      </td>
      <td class="price">-</td>
      <td class="change ${changeClass}">${changeSymbol}${priceChange.toFixed(2)}%</td>
      <td class="market-cap">
        <div class="market-cap-content">
          <span>${marketCap}</span>
          <button class="add-portfolio-btn" data-coin-id="${coin.id}" title="Add to Portfolio">+ Add</button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Format price for display with current currency
 * @param {number} price - Price value in USD
 * @returns {Promise<string>} Formatted price string
 */
async function formatPrice(price) {
  let displayPrice = price;
  
  // Convert if not USD
  if (currentCurrency !== 'USD') {
    displayPrice = await convertCurrency(price, 'USD', currentCurrency);
  }
  
  const symbol = getCurrencySymbol(currentCurrency);
  
  if (displayPrice >= 1) {
    return symbol + displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return symbol + displayPrice.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

/**
 * Format market cap for display
 * @param {number} marketCap - Market cap value
 * @returns {string} Formatted market cap string
 */
function formatMarketCap(marketCap) {
  if (marketCap >= 1e9) {
    return '$' + (marketCap / 1e9).toFixed(1) + 'B';
  }
  if (marketCap >= 1e6) {
    return '$' + (marketCap / 1e6).toFixed(1) + 'M';
  }
  return '$' + marketCap.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Setup search functionality
 * @param {Array} allCoins - Original array of all coins
 * @param {Function} renderFunction - Function to render the coins
 */
export function setupSearch(allCoins, renderFunction = renderCoins) {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
      renderFunction(allCoins);
      return;
    }

    const filtered = allCoins.filter(coin =>
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query) ||
      coin.id.toLowerCase().includes(query)
    );

    renderFunction(filtered);
  });
}

/**
 * Setup add to portfolio modal and event listeners
 * @param {Array} coins - Array of all coin objects
 */
export function setupPortfolioModal(coins) {
  const modal = document.getElementById('add-portfolio-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');
  const amountInput = document.getElementById('portfolio-amount');
  const modalCoinName = document.getElementById('modal-coin-name');
  const modalPriceInfo = document.getElementById('modal-price-info');

  if (!modal) return;

  let currentCoinData = null;

  // Setup add to portfolio buttons on all coin rows
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-portfolio-btn')) {
      const coinId = e.target.getAttribute('data-coin-id');
      const coin = coins.find(c => c.id === coinId);
      
      if (coin) {
        currentCoinData = coin;
        modalCoinName.textContent = `Add ${coin.symbol} to Portfolio`;
        amountInput.value = '';
        amountInput.focus();
        updatePriceInfo();
        modal.style.display = 'flex';
      }
    }
  });

  // Update price info when amount changes
  function updatePriceInfo() {
    if (!currentCoinData) return;
    
    const amount = parseFloat(amountInput.value) || 0;
    const totalValue = amount * currentCoinData.price;
    
    if (amount > 0) {
      modalPriceInfo.textContent = `Total: $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      modalPriceInfo.textContent = '';
    }
  }

  amountInput.addEventListener('input', updatePriceInfo);

  // Close modal functions
  function closeModal() {
    modal.style.display = 'none';
    currentCoinData = null;
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Handle confirm button
  modalConfirmBtn.addEventListener('click', async () => {
    if (!currentCoinData) return;

    const amount = parseFloat(amountInput.value);
    
    // Validation
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Import storage functions and history
    const { addCoinToPortfolio } = await import('./utils.js');
    const { addHistoryEntry } = await import('./history.js');

    // Add to portfolio
    const portfolioItem = {
      coinId: currentCoinData.id,
      name: currentCoinData.name,
      symbol: currentCoinData.symbol,
      price: currentCoinData.price,
      amount: amount,
      addedAt: new Date().toISOString()
    };

    addCoinToPortfolio(portfolioItem);
    
    // Add history entry
    addHistoryEntry({
      action: 'added',
      coinId: currentCoinData.id,
      coinName: currentCoinData.name,
      coinSymbol: currentCoinData.symbol,
      amount: amount,
      price: currentCoinData.price
    });
    
    // Show success message and close modal
    alert(`Added ${amount} ${currentCoinData.symbol} to your portfolio!`);
    closeModal();
  });
}


