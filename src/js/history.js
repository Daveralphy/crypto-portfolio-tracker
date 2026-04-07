import { loadHeaderFooter, initBottomNav, updateActiveSidebarItem, getPortfolio } from './utils.js';

/**
 * Initialize history page
 */
async function initHistory() {
  // Load header and sidebar
  await loadHeaderFooter();

  // Update active sidebar item
  updateActiveSidebarItem();

  // Initialize mobile bottom navigation
  initBottomNav();

  // Load and render history
  const history = getHistory();
  renderHistory(history);
}

/**
 * Get history from localStorage
 * @returns {Array} Array of history entries
 */
function getHistory() {
  try {
    const stored = localStorage.getItem('portfolio_history');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
}

/**
 * Add entry to history
 * @param {Object} entry - History entry {action, coinId, coinName, coinSymbol, amount, price, timestamp}
 */
export function addHistoryEntry(entry) {
  const history = getHistory();
  history.unshift({
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString()
  });

  // Keep only last 100 entries
  if (history.length > 100) {
    history.pop();
  }

  saveHistory(history);
}

/**
 * Save history to localStorage
 * @param {Array} history - Array of history entries
 */
function saveHistory(history) {
  try {
    localStorage.setItem('portfolio_history', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

/**
 * Render history to the page
 * @param {Array} history - Array of history entries
 */
function renderHistory(history) {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;

  if (!history || history.length === 0) {
    historyList.innerHTML = `<tr class="no-data">
      <td colspan="5">No activity history yet.</td>
    </tr>`;
    return;
  }

  const historyHTML = history.map(entry => {
    const date = new Date(entry.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const actionClass = entry.action === 'added' ? 'action-added' : 'action-removed';
    const actionText = entry.action === 'added' ? '+' : '−';

    return `
      <tr class="history-item">
        <td class="action ${actionClass}">${actionText} ${entry.action.toUpperCase()}</td>
        <td class="coin">
          <div class="coin-info">
            <strong>${entry.coinSymbol}</strong>
            <span>${entry.coinName}</span>
          </div>
        </td>
        <td class="amount">${entry.amount.toLocaleString('en-US', { maximumFractionDigits: 8 })}</td>
        <td class="price">$${entry.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="date">${formattedDate}</td>
      </tr>
    `;
  }).join('');

  historyList.innerHTML = historyHTML;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initHistory();
});
