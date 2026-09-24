// ============================================================
// Personal Portfolio — Rayhan Aditya
// Vanilla JavaScript DOM Manipulation (No Framework/Library)
// Features:
//   1. Mobile Navigation Toggle
//   2. Interactive Card Tilt (3D Hover Preview)
//   3. Copy-to-Clipboard Email w/ Toast Feedback
//   4. Smooth Scroll for Navigation Links
//   5. Dynamic Active State (Skills Pills + Timeline Steps)
//   6. Scroll-Reveal via IntersectionObserver
// ============================================================

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* --------------------------------------------------
       1. MOBILE NAVIGATION TOGGLE
    -------------------------------------------------- */
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', function () {
        const isOpen = mobileDrawer.classList.toggle('is-open');
        mobileToggle.classList.toggle('is-active', isOpen);
        mobileToggle.setAttribute('aria-expanded', String(isOpen));
        mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
      });

      // Close drawer when a mobile link is clicked
      const mobileLinks = mobileDrawer.querySelectorAll('.mobile-link');
      mobileLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          mobileDrawer.classList.remove('is-open');
          mobileToggle.classList.remove('is-active');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileDrawer.setAttribute('aria-hidden', 'true');
        });
      });
    }

    /* --------------------------------------------------
       2. INTERACTIVE CARD TILT (Mousemove -> CSS var)
       Tilt is requestAnimationFrame-throttled for
       performance; disabled when reduced-motion is set.
    -------------------------------------------------- */
    const tiltTargets = document.querySelectorAll('.tilt-target');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      tiltTargets.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;  // 0..1
          const y = (e.clientY - rect.top) / rect.height;  // 0..1
          const rotateY = (x - 0.5) * 8;                   // max 4deg
          const rotateX = (0.5 - y) * 8;
          card.style.setProperty('--tilt-x', rotateX.toFixed(2) + 'deg');
          card.style.setProperty('--tilt-y', rotateY.toFixed(2) + 'deg');
        });

        card.addEventListener('mouseleave', function () {
          card.style.setProperty('--tilt-x', '0deg');
          card.style.setProperty('--tilt-y', '0deg');
        });
      });
    }

    /* --------------------------------------------------
       3. COPY-TO-CLIPBOARD (Email) W/ TOAST FEEDBACK
    -------------------------------------------------- */
    const copyBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');

    let toastTimer = null;

    function showToast(message) {
      if (!toast) return;
      toastText.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove('show');
      }, 2000);
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        const address = copyBtn.dataset.clipboard;
        const promiseFn = navigator.clipboard !== undefined
          ? navigator.clipboard.writeText(address)
          : Promise.reject(new Error('No clipboard API'));

        promiseFn
          .then(function () {
            showToast('✓ Email berhasil disalin!');
          })
          .catch(function () {
            // Fallback for older browsers: select + execCommand
            const tempInput = document.createElement('textarea');
            tempInput.value = address;
            tempInput.style.position = 'fixed';
            tempInput.style.opacity = '0';
            tempInput.setAttribute('readonly', '');
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
              document.execCommand('copy');
              showToast('✓ Email berhasil disalin!');
            } catch (err) {
              showToast('Gagal menyalin. Pilih secara manual.');
            }
            document.body.removeChild(tempInput);
          });
      });
    }

    /* --------------------------------------------------
       4. SMOOTH SCROLL (via modern scrollIntoView)
       Handles both regular links and mobile drawer links.
    -------------------------------------------------- */
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"], .mobile-link');
    smoothScrollLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        const targetEl = document.querySelector(href);
        if (!targetEl) return;
        e.preventDefault();
        const headerOffset = 72; // fixed nav height
        const elPosition = targetEl.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elPosition - headerOffset,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
        history.pushState(null, '', href);
      });
    });

    /* --------------------------------------------------
       5. DYNAMIC ACTIVE STATES
       a) Skills Pills: click -> highlight, one at a time
       b) Timeline Steps: click -> highlight active step
    -------------------------------------------------- */

    // 5a) Skills Pills
    const skillContainer = document.getElementById('skills-container');
    const skillTipName = document.getElementById('skill-tip-name');

    if (skillContainer && skillTipName) {
      const skillPills = skillContainer.querySelectorAll('.skill-pill');

      skillPills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          skillPills.forEach(function (p) {
            p.classList.remove('active');
          });
          pill.classList.add('active');
          skillTipName.textContent = pill.textContent.trim();
        });
      });
    }

    // 5b) Timeline Steps
    const timeline = document.getElementById('process-timeline');

    if (timeline) {
      const steps = timeline.querySelectorAll('.timeline-step');

      steps.forEach(function (step) {
        step.addEventListener('click', function () {
          steps.forEach(function (s) {
            s.classList.remove('active');
          });
          step.classList.add('active');
        });
      });
    }

    /* --------------------------------------------------
       6. SCROLL-REVEAL (IntersectionObserver)
       Stagger elements on entry into the viewport.
    -------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      // Assign stagger offset via inline --reveal-index for visual leads
      const sectionGroups = document.querySelectorAll('section, .contact-section');
      sectionGroups.forEach(function (section, sectionIndex) {
        const reveals = section.querySelectorAll('.reveal-on-scroll');
        reveals.forEach(function (el, i) {
          el.style.setProperty('--reveal-delay', (sectionIndex * 0.05 + i * 0.08).toFixed(2) + 's');
        });
      });

      const observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Reduced motion OR no observer: show everything immediately
      revealElements.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }

    /* --------------------------------------------------
       BONUS: Auto-update footer year
    -------------------------------------------------- */
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
      currentYearEl.textContent = String(new Date().getFullYear());
    }
  });
})();