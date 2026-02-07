(function () {
  'use strict';

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme (저장된 선호도 적용)
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('pal-theme');
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }
  document.getElementById('themeBtn')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('pal-theme', next);
  });

  // Copy & Scroll
  function copyToClipboard(text, ok = '✓ 복사됨') {
    navigator.clipboard.writeText(text).then(() => {
      const t = document.title;
      document.title = ok;
      setTimeout(() => (document.title = t), 800);
    }).catch(() => alert('클립보드 복사 실패'));
  }
  document.getElementById('copyLinkBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    copyToClipboard(window.location.href);
  });
  document.getElementById('scrollToTopBtn')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Modal
  const modals = {
    terms: document.getElementById('modal-terms'),
    privacy: document.getElementById('modal-privacy'),
    ddongle: document.getElementById('modal-ddongle'),
    gaeddong: document.getElementById('modal-gaeddong')
  };
  const triggers = {
    terms: document.getElementById('openTos'),
    privacy: document.getElementById('openPp'),
    ddongle: document.getElementById('openDdongle'),
    gaeddong: document.getElementById('openGaeddong')
  };

  function getFocusable(container) {
    return container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
  }

  function openModal(key) {
    const m = modals[key];
    if (!m) return;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const dialog = m.querySelector('.dialog');
    const firstFocus = dialog?.querySelector('h2') || dialog;
    if (firstFocus) {
      firstFocus.setAttribute('tabindex', '-1');
      firstFocus.focus();
    }
    if (key === 'terms') location.hash = '#terms';
    if (key === 'privacy') location.hash = '#privacy';
    if (key === 'ddongle') location.hash = '#ddongle';
    if (key === 'gaeddong') location.hash = '#gaeddong';
    const focusables = [...getFocusable(dialog || m)];
    function trap(e) {
      if (e.key === 'Tab' && focusables.length) {
        const idx = focusables.indexOf(document.activeElement);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          focusables[focusables.length - 1].focus();
        } else if (!e.shiftKey && idx === focusables.length - 1) {
          e.preventDefault();
          focusables[0].focus();
        }
      }
      if (e.key === 'Escape') closeModal(key);
    }
    dialog?.addEventListener('keydown', trap);
    m._trap = trap;
  }

  function closeModal(key) {
    const m = modals[key];
    if (!m) return;
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const dialog = m.querySelector('.dialog');
    dialog?.removeEventListener('keydown', m._trap || (() => {}));
    if (['#terms', '#privacy', '#ddongle', '#gaeddong'].includes(location.hash)) {
      history.replaceState(null, '', ' ');
    }
    (triggers[key] || document.body).focus?.();
  }

  Object.keys(triggers).forEach(key => {
    triggers[key]?.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(key);
    });
  });
  document.querySelectorAll('[data-close="terms"]').forEach(el => el.addEventListener('click', () => closeModal('terms')));
  document.querySelectorAll('[data-close="privacy"]').forEach(el => el.addEventListener('click', () => closeModal('privacy')));
  document.querySelectorAll('[data-close="ddongle"]').forEach(el => el.addEventListener('click', () => closeModal('ddongle')));
  document.querySelectorAll('[data-close="gaeddong"]').forEach(el => el.addEventListener('click', () => closeModal('gaeddong')));

  window.addEventListener('load', () => {
    if (location.hash === '#terms') openModal('terms');
    if (location.hash === '#privacy') openModal('privacy');
    if (location.hash === '#ddongle') openModal('ddongle');
    if (location.hash === '#gaeddong') openModal('gaeddong');
  });

  // Lazy in-view animation
  const els = document.querySelectorAll('[data-animate]');
  function showAll() {
    els.forEach(el => el.classList.add('in'));
  }
  try {
    if (!('IntersectionObserver' in window)) {
      showAll();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
    );
    els.forEach(el => io.observe(el));
    window.addEventListener('load', () => {
      setTimeout(() => {
        const anyHidden = Array.from(els).some((el) => !el.classList.contains('in'));
        if (anyHidden) showAll();
      }, 500);
    });
  } catch (e) {
    showAll();
  }
})();
