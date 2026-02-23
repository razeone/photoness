/**
 * Photoness.Studio — i18n.js
 * Lightweight internationalisation for a static site.
 *
 * Supported languages: es (default), en, de, fr
 *
 * How it works:
 *   1. On load, reads the saved language from localStorage (or falls back to "es").
 *   2. Fetches the matching JSON file from /lang/<code>.json.
 *   3. Walks every element that carries a data-i18n attribute and sets its
 *      innerHTML to the translated value.
 *   4. Handles data-i18n-placeholder and data-i18n-title too.
 *   5. Updates <html lang>, <title>, and meta[description].
 */
(function () {
  'use strict';

  var SUPPORTED_LANGS = ['es', 'en', 'de', 'fr'];
  var DEFAULT_LANG = 'es';
  var STORAGE_KEY = 'photoness_lang';

  /* ---- helpers --------------------------------------------------- */

  function resolveBasePath() {
    var scripts = document.querySelectorAll('script[src*="i18n.js"]');
    if (scripts.length) {
      var src = scripts[0].getAttribute('src');
      /* Strip "js/i18n.js" from the end to get the site root (relative or absolute) */
      return src.replace(/js\/i18n\.js(\?.*)?$/, '');
    }
    return '/';
  }

  function getSavedLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    } catch (_) { /* private browsing */ }
    return DEFAULT_LANG;
  }

  function saveLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) { /* noop */ }
  }

  /* ---- core ------------------------------------------------------ */

  function applyTranslations(translations) {
    /* data-i18n  → innerHTML */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (translations[key] !== undefined) el.innerHTML = translations[key];
    });

    /* data-i18n-placeholder → placeholder attribute */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (translations[key] !== undefined) el.setAttribute('placeholder', translations[key]);
    });

    /* data-i18n-title → document title */
    var titleEl = document.querySelector('[data-i18n-title]');
    if (titleEl) {
      var key = titleEl.getAttribute('data-i18n-title');
      if (translations[key] !== undefined) document.title = translations[key];
    }

    /* meta description */
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && translations['meta.description']) {
      metaDesc.setAttribute('content', translations['meta.description']);
    }
  }

  function setLang(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = DEFAULT_LANG;
    saveLang(lang);
    document.documentElement.setAttribute('lang', lang);

    var base = resolveBasePath();
    var url = base + 'lang/' + lang + '.json';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        var translations = JSON.parse(xhr.responseText);
        applyTranslations(translations);
      }
    };
    xhr.send();

    /* Update active state on language switcher buttons */
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('lang-active');
      } else {
        btn.classList.remove('lang-active');
      }
    });
  }

  /* ---- init ------------------------------------------------------ */

  /* Bind language-switcher clicks (event delegation) */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-lang]');
    if (!btn) return;
    e.preventDefault();
    setLang(btn.getAttribute('data-lang'));
  });

  /* Apply saved language on page load */
  var current = getSavedLang();
  if (current !== DEFAULT_LANG) {
    setLang(current);
  }
  /* Always mark the active button, even for the default language */
  document.querySelectorAll('[data-lang]').forEach(function (btn) {
    if (btn.getAttribute('data-lang') === current) {
      btn.classList.add('lang-active');
    }
  });

})();
