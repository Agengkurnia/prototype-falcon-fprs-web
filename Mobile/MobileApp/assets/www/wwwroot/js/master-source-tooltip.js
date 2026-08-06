/**
 * Master Data — Bootstrap tooltips for DB source mapping.
 * Format: title="Source : mTable | column"
 */
(function (global) {
  'use strict';

  function bindOne(el, text) {
    if (!el || !text || !text.startsWith('Source :')) return;
    if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;

    el.setAttribute('data-bs-toggle', 'tooltip');
    el.setAttribute('data-bs-placement', 'top');
    el.setAttribute('data-bs-title', text);
    // Avoid native browser tooltip competing with Bootstrap
    el.removeAttribute('title');

    const existing = bootstrap.Tooltip.getInstance(el);
    if (existing) existing.dispose();
    new bootstrap.Tooltip(el, {
      trigger: 'hover focus',
      container: 'body',
      customClass: 'md-source-tooltip',
    });
  }

  function syncSelect2(el) {
    if (!global.jQuery) return;
    const $el = global.jQuery(el);
    if (!$el.hasClass('select2-hidden-accessible')) return;
    const text = el.getAttribute('data-bs-title');
    if (!text) return;
    const container = $el.next('.select2-container').get(0);
    if (!container) return;
    bindOne(container, text);
  }

  function initMasterSourceTooltips(root) {
    const scope = root || document;
    scope.querySelectorAll('[title^="Source :"], [data-bs-title^="Source :"]').forEach((el) => {
      const text = el.getAttribute('data-bs-title') || el.getAttribute('title');
      bindOne(el, text);
      syncSelect2(el);
    });
  }

  global.initMasterSourceTooltips = initMasterSourceTooltips;

  function boot() {
    initMasterSourceTooltips();
    // Select2 / delayed form fill
    setTimeout(initMasterSourceTooltips, 400);
    setTimeout(initMasterSourceTooltips, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('layoutReady', boot);
      setTimeout(boot, 0);
    });
  } else {
    document.addEventListener('layoutReady', boot);
    setTimeout(boot, 0);
  }

  document.addEventListener('shown.bs.modal', (e) => {
    setTimeout(() => initMasterSourceTooltips(e.target || document), 50);
  });
})(window);
