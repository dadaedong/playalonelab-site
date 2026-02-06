(() => {
  const navBtn = document.getElementById('navBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (!navBtn || !mobileNav) {
    return;
  }

  function closeMobile() {
    mobileNav.classList.remove('open');
    navBtn.setAttribute('aria-expanded', 'false');
  }

  navBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    navBtn.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobile);
  });
})();
