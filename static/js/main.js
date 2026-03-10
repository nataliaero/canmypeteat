/* ============================================
   Can My Pet Eat — Main JS (vanilla, no deps)
   ============================================ */

(function () {
  'use strict';

  // --- Mobile Nav ---
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !open);
      nav.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      }
    });
  }

  // --- Header scroll effect ---
  const header = document.getElementById('site-header');
  if (header) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.classList.toggle('scrolled', y > 20);
      lastY = y;
    }, { passive: true });
  }

  // --- Rotating hero food ---
  const foods = ['pineapple', 'chocolate', 'cheese', 'broccoli', 'grapes', 'bananas', 'avocado', 'rice'];
  const rotEl = document.getElementById('rotating-food');
  if (rotEl) {
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % foods.length;
      rotEl.style.opacity = '0';
      rotEl.style.transform = 'translateY(8px)';
      setTimeout(() => {
        rotEl.textContent = foods[idx];
        rotEl.style.opacity = '1';
        rotEl.style.transform = 'translateY(0)';
      }, 250);
    }, 2500);
    rotEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    rotEl.style.display = 'inline-block';
  }

  // --- Search ---
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  let articles = [];

  if (searchInput && searchResults) {
    // Load search index
    fetch('/index.json')
      .then(r => r.json())
      .then(data => { articles = data; })
      .catch(() => {});

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (q.length < 2) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
      }

      const results = articles.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        (a.pets && a.pets.some(p => p.toLowerCase().includes(q)))
      ).slice(0, 8);

      if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">No articles found. Try another food!</div>';
        searchResults.classList.add('active');
        return;
      }

      const verdictLabels = { yes: 'Safe', no: 'Unsafe', caution: 'Caution' };
      searchResults.innerHTML = results.map(r => `
        <a href="${r.url}" class="search-result-item">
          <span class="search-result-badge verdict-${r.verdict}"></span>
          <div style="flex:1;min-width:0">
            <div class="search-result-title">${highlight(r.title, q)}</div>
            <div class="search-result-pets">${r.pets ? r.pets.join(', ') : ''}</div>
          </div>
          <span class="search-result-verdict verdict-${r.verdict}">${verdictLabels[r.verdict] || ''}</span>
        </a>
      `).join('');
      searchResults.classList.add('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });

    // Close on Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchResults.classList.remove('active');
        searchInput.blur();
      }
    });
  }

  function highlight(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // --- Filter tabs (taxonomy pages) ---
  const filterTabs = document.querySelectorAll('.filter-tab');
  if (filterTabs.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;

        // Update active state
        filterTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Filter cards
        document.querySelectorAll('.article-card').forEach(card => {
          if (filter === 'all' || card.dataset.verdict === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

})();
