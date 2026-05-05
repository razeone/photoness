/**
 * PHOTONESS.STUDIO — v4
 * Editorial brutalism interaction layer.
 *
 *   1. Photographic focus-frame cursor (replaces generic cursor)
 *   2. Stamp-in scroll reveal (IntersectionObserver)
 *   3. Glitch activation on section titles when in view
 *   4. EN / FR language toggle (data-en / data-fr attributes)
 *   5. Mobile menu toggle
 *   6. Scrollspy — active nav link
 */
(function () {
  'use strict';

  /* =========================================================
     1. FOCUS-FRAME CURSOR
     ========================================================= */
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (!prefersReduced && !coarsePointer) {
    var cursor = document.createElement('div');
    cursor.className = 'focus-cursor';
    cursor.innerHTML = '<i class="tl"></i><i class="tr"></i>';
    document.body.appendChild(cursor);

    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var tx = cx, ty = cy;
    var ready = false;

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!ready) { ready = true; cursor.classList.add('is-ready'); }
    });

    function tick() {
      var dx = tx - cx, dy = ty - cy;
      // Skip work when the cursor is effectively at rest (sub-pixel delta)
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        cx += dx * 0.22;
        cy += dy * 0.22;
        cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    var hotSelector = 'a, button, .photo-cell, [data-cursor="hot"]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hotSelector)) {
        cursor.classList.add('is-hot');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hotSelector)) {
        cursor.classList.remove('is-hot');
      }
    });
    document.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-ready');
    });
    document.addEventListener('mouseenter', function () {
      cursor.classList.add('is-ready');
    });
  }

  /* =========================================================
     2. STAMP-IN reveal + 3. Glitch activation
     ========================================================= */
  var reveals = document.querySelectorAll('.reveal');
  var glitches = document.querySelectorAll('.glitch');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-stamped');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { io.observe(el); });
    glitches.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-stamped'); });
    glitches.forEach(function (el) { el.classList.add('is-stamped'); });
  }

  /* =========================================================
     4. LANGUAGE TOGGLE — EN / FR
     Reads data-en / data-fr attributes on any element and
     swaps its text content. Persists choice in localStorage.
     ========================================================= */
  var STORAGE_KEY = 'photoness:lang';
  var supported = ['en', 'fr'];

  function detectInitialLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && supported.indexOf(saved) !== -1) return saved;
    } catch (_) { /* storage may be disabled */ }
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return supported.indexOf(nav) !== -1 ? nav : 'en';
  }

  function applyLanguage(lang) {
    if (supported.indexOf(lang) === -1) lang = 'en';
    document.documentElement.setAttribute('lang', lang);

    var nodes = document.querySelectorAll('[data-en], [data-fr]');
    nodes.forEach(function (n) {
      var val = n.getAttribute('data-' + lang);
      if (val == null) return;
      // Honor placeholder vs text content
      if (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA') {
        if (n.hasAttribute('placeholder')) n.setAttribute('placeholder', val);
      } else {
        // innerHTML is required because translations intentionally contain
        // markup (e.g. <em>, <span class="arrow">) authored by the studio in
        // the static HTML. Values are NOT user input — they originate from
        // data-en / data-fr attributes shipped with the page.
        n.innerHTML = val;
      }
      // Refresh glitch data-text so the pseudo-elements update
      if (n.classList && n.classList.contains('glitch')) {
        n.setAttribute('data-text', n.textContent);
      }
    });

    // Toggle button states
    document.querySelectorAll('.lang-toggle button').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-lang') === lang);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
  }

  document.querySelectorAll('.lang-toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      applyLanguage(b.getAttribute('data-lang'));
    });
  });

  applyLanguage(detectInitialLang());

  /* =========================================================
     5. MOBILE MENU
     ========================================================= */
  var hamburger = document.querySelector('.hamburger');
  var navList = document.querySelector('.nav-list');
  if (hamburger && navList) {
    hamburger.addEventListener('click', function () {
      var open = navList.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', String(open));
    });
    navList.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navList.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =========================================================
     6. SCROLLSPY
     ========================================================= */
  var sections = document.querySelectorAll('main section[id], main .ai-block[id]');
  var navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) { l.classList.remove('is-active'); });
        var active = document.querySelector('.nav-list a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('is-active');
      });
    }, { threshold: 0.35 });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
