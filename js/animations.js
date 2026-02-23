/**
 * Photoness.Studio — animations.js
 * Shared animation helpers:
 *   1. Page-transition overlay (fade-to-black before navigation)
 *   2. Scroll-reveal with IntersectionObserver (.reveal, .reveal-left, .reveal-right, .anim-underline)
 *   3. Scrollspy — highlights the active section in the navbar
 *   4. Ken Burns reset — restarts the zoom animation on each new carousel slide
 */
(function () {
  'use strict';

  /* =========================================================
     1. PAGE TRANSITION OVERLAY
     Fades the screen to black when navigating to another page.
     The body CSS animation (fadeIn) handles the fade-in on load.
     ========================================================= */
  var overlay = document.getElementById('page-overlay');

  if (overlay) {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (
        !href ||
        href.charAt(0) === '#' ||
        href.indexOf('http') === 0 ||
        href.indexOf('mailto') === 0 ||
        href.indexOf('tel') === 0 ||
        link.target === '_blank'
      ) return;

      e.preventDefault();
      overlay.classList.add('is-active');
      setTimeout(function () { window.location.href = href; }, 380);
    });
  }

  /* =========================================================
     2. SCROLL-REVEAL
     Adds `.visible` to elements that enter the viewport.
     Supports: .reveal  .reveal-left  .reveal-right  .anim-underline
     ========================================================= */
  var revealEls = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .anim-underline'
  );

  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    /* Fallback for older browsers */
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* =========================================================
     3. SCROLLSPY — active nav link
     Watches each section and highlights the matching nav link.
     ========================================================= */
  var sections  = document.querySelectorAll('main section[id]');
  var navLinks  = document.querySelectorAll('header nav a[href^="#"]');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) { l.classList.remove('nav-active'); });
        var activeLink = document.querySelector(
          'header nav a[href="#' + entry.target.id + '"]'
        );
        if (activeLink) activeLink.classList.add('nav-active');
      });
    }, { threshold: 0.35 });

    sections.forEach(function (s) { spyObserver.observe(s); });
  }

  /* =========================================================
     4. KEN BURNS RESET on carousel slide change
     Restarts the zoom animation on the newly visible slide.
     ========================================================= */
  var carousel = document.getElementById('carouselExampleCaptions');
  if (carousel) {
    carousel.addEventListener('slid.bs.carousel', function (e) {
      var newImg = e.relatedTarget && e.relatedTarget.querySelector('.hero-slide');
      if (newImg) {
        newImg.style.animation = 'none';
        /* Trigger reflow to restart the CSS animation */
        void newImg.offsetWidth;
        newImg.style.animation = '';
      }
    });
  }

})();
