// Common utilities for KinkyPuzzles static site
// This script dynamically loads the header and footer into each page and
// updates the cart count based on items stored in localStorage. By keeping
// navigation and footer markup in separate files, we can update them in
// one location and have the changes propagate across all pages.

(function() {
  /**
   * Fetches an external HTML fragment and inserts it into the specified element.
   * @param {string} url The URL of the fragment to fetch (e.g. '/header.html').
   * @param {string} selector The ID of the element into which the fragment
   *                          should be inserted.
   */
  async function loadFragment(url, selector) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed to fetch ${url}: ${res.status}`);
        return;
      }
      const html = await res.text();
      const container = document.getElementById(selector);
      if (container) {
        container.innerHTML = html;
      }
    } catch (err) {
      console.error(`Error loading fragment ${url}`, err);
    }
  }

  /**
   * Updates the cart count badge by reading the current cart from
   * localStorage. The cart is stored as JSON under the key used by
   * cart.js (`kinkyCart`) and contains an array of objects with qty fields.
   * If no cart exists yet, the badge will show zero. This helper is named
   * updateCartBadge to avoid clashing with updateCartCount() defined in
   * cart.js.
   */
  function updateCartBadge() {
    const badge = document.querySelector('#cart-count');
    if (!badge) return;
    let total = 0;
    try {
      const key = 'kinkyCart';
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      total = items.reduce((sum, item) => sum + (item.qty || 1), 0);
    } catch (err) {
      console.warn('Could not parse cart items from storage', err);
    }
    badge.textContent = total;
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Inject header and footer fragments
    loadFragment('/header.html', 'header');
    loadFragment('/footer.html', 'footer');
    // Update cart count once fragments are loaded
    updateCartBadge();
  });

  // Update cart count whenever storage changes (e.g. from another tab)
  window.addEventListener('storage', updateCartBadge);
})();