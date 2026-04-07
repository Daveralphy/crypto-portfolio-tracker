import { loadHeaderFooter, initBottomNav, updateActiveSidebarItem, showConfirmModal } from './utils.js';

/**
 * Mock alerts data
 */
const mockAlerts = [
  {
    id: 1,
    coinName: 'Bitcoin',
    coinSymbol: 'BTC',
    condition: 'Price > $50,000',
    status: 'active',
    createdAt: '2026-04-07'
  },
  {
    id: 2,
    coinName: 'Ethereum',
    coinSymbol: 'ETH',
    condition: 'Price < $2,000',
    status: 'active',
    createdAt: '2026-04-06'
  },
  {
    id: 3,
    coinName: 'Solana',
    coinSymbol: 'SOL',
    condition: 'Price > $250',
    status: 'inactive',
    createdAt: '2026-04-05'
  },
  {
    id: 4,
    coinName: 'Cardano',
    coinSymbol: 'ADA',
    condition: '24h change > 10%',
    status: 'active',
    createdAt: '2026-04-07'
  }
];

/**
 * Initialize alerts page
 */
async function initAlerts() {
  // Load header and sidebar
  await loadHeaderFooter();

  // Update active sidebar item
  updateActiveSidebarItem();

  // Initialize mobile bottom navigation
  initBottomNav();

  // Load and render alerts
  const alerts = getAlerts();
  renderAlerts(alerts);
}

/**
 * Get alerts from localStorage or use mock data
 * @returns {Array} Array of alerts
 */
function getAlerts() {
  try {
    const stored = localStorage.getItem('alerts');
    return stored ? JSON.parse(stored) : mockAlerts;
  } catch (error) {
    console.error('Error reading alerts:', error);
    return mockAlerts;
  }
}

/**
 * Render alerts to the page
 * @param {Array} alerts - Array of alerts
 */
function renderAlerts(alerts) {
  const container = document.getElementById('alerts-container');
  if (!container) return;

  if (!alerts || alerts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text">No alerts yet. Create one to get started!</p>
      </div>
    `;
    return;
  }

  const alertsHTML = alerts.map(alert => `
    <div class="alert-card" data-alert-id="${alert.id}">
      <div class="alert-header">
        <div class="alert-coin-info">
          <h3 class="alert-coin-name">${alert.coinName}</h3>
          <span class="alert-coin-symbol">${alert.coinSymbol}</span>
        </div>
        <span class="alert-status ${alert.status === 'active' ? 'status-active' : 'status-inactive'}">
          ${alert.status.toUpperCase()}
        </span>
      </div>
      <div class="alert-body">
        <p class="alert-condition"><strong>Condition:</strong> ${alert.condition}</p>
        <p class="alert-date">Created: ${new Date(alert.createdAt).toLocaleDateString()}</p>
      </div>
      <div class="alert-footer">
        <button class="alert-btn-toggle" data-alert-id="${alert.id}">
          ${alert.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
        <button class="alert-btn-remove" data-alert-id="${alert.id}">Remove</button>
      </div>
    </div>
  `).join('');

  container.innerHTML = alertsHTML;

  // Setup event listeners
  setupAlertListeners();
}

/**
 * Setup event listeners for alert actions
 */
function setupAlertListeners() {
  // Toggle alert status
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('alert-btn-toggle')) {
      const alertId = parseInt(e.target.getAttribute('data-alert-id'));
      toggleAlertStatus(alertId);
    }

    // Remove alert
    if (e.target.classList.contains('alert-btn-remove')) {
      const alertId = parseInt(e.target.getAttribute('data-alert-id'));
      await removeAlert(alertId);
    }
  });
}

/**
 * Toggle alert status
 * @param {number} alertId - The alert ID
 */
function toggleAlertStatus(alertId) {
  const alerts = getAlerts();
  const alert = alerts.find(a => a.id === alertId);

  if (alert) {
    alert.status = alert.status === 'active' ? 'inactive' : 'active';
    saveAlerts(alerts);
    renderAlerts(alerts);
  }
}

/**
 * Remove an alert
 * @param {number} alertId - The alert ID
 */
async function removeAlert(alertId) {
  const confirmed = await showConfirmModal('Are you sure you want to remove this alert?');
  
  if (confirmed) {
    const alerts = getAlerts();
    const filtered = alerts.filter(a => a.id !== alertId);
    saveAlerts(filtered);
    renderAlerts(filtered);
  }
}

/**
 * Save alerts to localStorage
 * @param {Array} alerts - Array of alerts
 */
function saveAlerts(alerts) {
  try {
    localStorage.setItem('alerts', JSON.stringify(alerts));
  } catch (error) {
    console.error('Error saving alerts:', error);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initAlerts();
});
