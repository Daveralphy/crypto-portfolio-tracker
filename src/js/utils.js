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

