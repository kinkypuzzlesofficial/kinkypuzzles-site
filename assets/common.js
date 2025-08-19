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

    // Initialize cookie consent banner after page load. This will inject
    // a simple notification at the bottom of the viewport if the user
    // has not yet consented to our cookie policy. The banner is
    // intentionally lightweight and does not store any tracking cookies
    // until consent is granted. Once the user clicks the "Accept"
    // button, a flag is stored in localStorage and the banner will not
    // reappear on subsequent visits. The policy page is linked for
    // additional information.
    initCookieConsent();

    // Adjust prices across product listings and detail pages to display
    // a crossed-out MSRP alongside the current price. This helper
    // calculates a simple MSRP by applying a 20% increase to the
    // listed price and formats both values accordingly. It only
    // processes price elements once by tracking a data attribute and
    // gracefully skips values that cannot be parsed.
    adjustPrices();
  });

  // Update cart count whenever storage changes (e.g. from another tab)
  window.addEventListener('storage', updateCartBadge);

  /**
   * Displays a cookie consent banner if the user has not previously
   * dismissed it. The banner informs visitors that the site uses
   * cookies for essential functionality and analytics, and provides
   * an "Accept" button to indicate consent. A link to the full
   * cookie policy is also included. Consent is stored in
   * localStorage under the key "cookieConsent".
   */
  function initCookieConsent() {
    try {
      // Only proceed if window and document are defined
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }
      // Check if the user has already consented
      const consent = localStorage.getItem('cookieConsent');
      if (consent === 'true') {
        return;
      }
      // Create banner container
      const banner = document.createElement('div');
      banner.id = 'cookie-consent-banner';
      banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#16161c;color:#fff;padding:15px;z-index:9999;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;font-size:14px;box-shadow:0 -2px 5px rgba(0,0,0,0.5)';
      // Message text
      const msg = document.createElement('span');
      msg.style.flex = '1 1 auto';
      msg.style.marginRight = '12px';
      msg.innerHTML = 'We use cookies for essential site functions and analytics. By continuing to use our site, you agree to our <a href="/kinkypuzzles-site/legal/cookies.html" style="color:#7c4dff;text-decoration:underline">cookie policy</a>.';
      banner.appendChild(msg);
      // Accept button
      const btn = document.createElement('button');
      btn.textContent = 'Accept';
      btn.style.cssText = 'background:linear-gradient(90deg,#e753a0,#7c4dff);border:none;color:#fff;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:600;';
      btn.onclick = function () {
        try {
          localStorage.setItem('cookieConsent', 'true');
        } catch (e) {
          // Fallback: store a cookie if localStorage fails
          document.cookie = 'cookieConsent=true;path=/;max-age=' + 60 * 60 * 24 * 365;
        }
        banner.remove();
      };
      banner.appendChild(btn);
      // Insert the banner into the body
      document.body.appendChild(banner);
    } catch (err) {
      // Failing quietly is preferable to blocking page load
      console.warn('Cookie consent banner failed to initialize', err);
    }
  }

  /**
   * Adjusts displayed prices by adding an MSRP based on a fixed markup.
   * For each element with the class `price` this function parses the
   * numeric value, computes a 20% higher MSRP, and replaces the text
   * with a crossed-out MSRP and the original price. The function
   * ensures it runs only once per element by setting a data attribute
   * (`data-modified`). It gracefully skips elements where the price
   * cannot be parsed.
   */
  function adjustPrices() {
    try {
      const elements = document.querySelectorAll('.price');
      elements.forEach(el => {
        // Skip if already modified
        if (el.dataset.modified === '1') return;
        const text = el.textContent || '';
        const num = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return;
        // Compute MSRP as 20% above current price
        const msrp = (num * 1.2).toFixed(2);
        const current = num.toFixed(2);
        el.innerHTML = '<span class="old-price" style="text-decoration:line-through;color:#888;margin-right:6px;">$' + msrp + '</span>' +
                       '<span class="new-price">$' + current + '</span>';
        el.dataset.modified = '1';
      });
    } catch (err) {
      console.warn('Failed to adjust prices', err);
    }
  }
})();