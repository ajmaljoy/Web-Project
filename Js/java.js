// java.js — modal + robust reveal (IntersectionObserver + fallback) with console debug

(function () {
  'use strict';

  // --- Modal (keep global because HTML uses onclick="openForm(...)") ---
  window.openForm = function (plan) {
    const modal = document.getElementById("membershipForm");
    if (!modal) return;
    modal.style.display = "flex";
    const sel = document.getElementById("planSelect");
    if (sel && plan) sel.value = plan;
  };

  window.closeForm = function () {
    const modal = document.getElementById("membershipForm");
    if (!modal) return;
    modal.style.display = "none";
  };

  // Close modal on click outside or Esc
  document.addEventListener("click", function (e) {
    const modal = document.getElementById("membershipForm");
    if (!modal) return;
    if (e.target === modal) closeForm();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeForm();
  });

  // --- Reveal utilities ---
  function revealFallback(els, offset) {
    els.forEach((el, idx) => {
      if (el.classList.contains('show')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - offset) {
        el.style.transitionDelay = `${idx * 120}ms`;
        el.classList.add('show');
        console.log(`fallback: showed ${selectorName(el)} (index ${idx})`);
      }
    });
  }

  function selectorName(el) {
    return el.className ? `.${el.className.split(' ').join('.')}` : el.tagName;
  }

  function setupReveal(selector, opts) {
    const els = Array.from(document.querySelectorAll(selector));
    console.log(`setupReveal: selector="${selector}" found ${els.length}`);
    if (els.length === 0) return;

    const options = Object.assign({ threshold: 0.12, rootMargin: '0px 0px -80px 0px' }, opts || {});

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const index = els.indexOf(el);
            el.style.transitionDelay = `${index * 120}ms`;
            if (!el.classList.contains('show')) {
              el.classList.add('show');
              console.log(`observer: showed ${selectorName(el)} (index ${index})`);
            }
            obs.unobserve(el);
          }
        });
      }, options);

      els.forEach(el => observer.observe(el));

      // small timeout to run a fallback check (handles elements already in view)
      setTimeout(() => {
        els.forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight) {
            if (!el.classList.contains('show')) {
              el.style.transitionDelay = `${idx * 120}ms`;
              el.classList.add('show');
              console.log(`post-init: forced show ${selectorName(el)} (index ${idx})`);
              try { observer.unobserve(el); } catch (e) {}
            }
          }
        });
      }, 60);
    } else {
      // fallback for very old browsers
      revealFallback(els, 100);
      window.addEventListener('scroll', () => revealFallback(els, 100), { passive: true });
      window.addEventListener('resize', () => revealFallback(els, 100));
    }
  }

  function init() {
    setupReveal('.choose-card');
    setupReveal('.pricing-card');
    console.log('reveal init done');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
