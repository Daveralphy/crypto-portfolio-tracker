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
    <tr class="coin-row" data-coin-id="${coin.id}">
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
      <td class="price">${formatPrice(coin.price)}</td>
      <td class="change ${changeClass}">${changeSymbol}${priceChange.toFixed(2)}%</td>
      <td class="market-cap">${marketCap}</td>
    </tr>
  `;
}

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
  if (price >= 1) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
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

