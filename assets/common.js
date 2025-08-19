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
    // Determine a base path for GitHub Pages deployments. When a site is
    // hosted on <username>.github.io/repository, the root of the site
    // includes the repository name as the first segment of the pathname.
    // Without adjusting for this prefix, absolute URLs beginning with
    // "/" will point to <username>.github.io/header.html instead of
    // <username>.github.io/<repository>/header.html and therefore 404.
    const isGitHubPages = /github\.io$/.test(window.location.hostname);
    let basePath = '';
    if (isGitHubPages) {
      // location.pathname starts with "/<repo>/..." when served via Pages.
      const parts = window.location.pathname.split('/');
      // parts[0] is "" because pathname begins with "/".
      // parts[1] should be the repository name if it exists.
      if (parts.length > 1 && parts[1]) {
        basePath = '/' + parts[1];
      }
    }
    // Inject header and footer fragments. When hosted on GitHub Pages the
    // repository name is used as a base prefix (/kinkypuzzles-site). Hard-code
    // this prefix so that fragments resolve correctly on both GitHub Pages and
    // custom domains. Without this adjustment the loader would attempt to
    // fetch /header.html at the domain root and return 404.
    const prefix = '/kinkypuzzles-site';
    loadFragment(`${prefix}/header.html`, 'header');
    loadFragment(`${prefix}/footer.html`, 'footer');
    // Update cart count once fragments are loaded
    updateCartBadge();
    // After the header and footer are injected, adjust any links that
    // erroneously point to the root of the domain rather than the base path.
    // This ensures navigation works correctly when hosted on GitHub Pages.
    const fixLinks = () => {
      if (!basePath) return;
      // Fix anchor links
      document.querySelectorAll('a[href^="/"]').forEach(el => {
        const href = el.getAttribute('href');
        if (href && !href.startsWith(basePath + '/')) {
          el.setAttribute('href', basePath + href);
        }
      });
      // Fix link tags referencing CSS
      document.querySelectorAll('link[href^="/"]').forEach(el => {
        const href = el.getAttribute('href');
        if (href && !href.startsWith(basePath + '/')) {
          el.setAttribute('href', basePath + href);
        }
      });
      // Fix script tags referencing JS
      document.querySelectorAll('script[src^="/"]').forEach(el => {
        const src = el.getAttribute('src');
        if (src && !src.startsWith(basePath + '/')) {
          el.setAttribute('src', basePath + src);
        }
      });
      // Fix image sources
      document.querySelectorAll('img[src^="/"]').forEach(el => {
        const src = el.getAttribute('src');
        if (src && !src.startsWith(basePath + '/')) {
          el.setAttribute('src', basePath + src);
        }
      });
    };
    // Defer fixing links slightly to allow header/footer injection to complete.
    setTimeout(fixLinks, 250);
  });

  // Update cart count whenever storage changes (e.g. from another tab)
  window.addEventListener('storage', updateCartBadge);
})();