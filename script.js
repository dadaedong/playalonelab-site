// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile Nav
const navBtn = document.getElementById('navBtn');
const mobileNav = document.getElementById('mobileNav');
const navLinks = mobileNav.querySelectorAll('a');

function closeMobileNav() {
  mobileNav.classList.remove('open');
  navBtn.setAttribute('aria-expanded', 'false');
}

navBtn?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  navBtn.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeMobileNav();
  });
});


// Theme toggle
const themeBtn = document.getElementById('themeBtn');
const root = document.documentElement;
const savedTheme = localStorage.getItem('pal-theme');

if (savedTheme) {
  root.setAttribute('data-theme', savedTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  root.setAttribute('data-theme', 'dark');
}

themeBtn?.addEventListener('click', () => {
  const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', nextTheme);
  localStorage.setItem('pal-theme', nextTheme);
});

// Copy helper function
function copyToClipboard(text, successMessage = '✓ 복사됨') {
  navigator.clipboard.writeText(text).then(() => {
    const originalTitle = document.title;
    document.title = successMessage;
    setTimeout(() => {
      document.title = originalTitle;
    }, 800);
  }).catch(err => {
    console.error('클립보드 복사 실패:', err);
    alert('클립보드 복사에 실패했습니다.');
  });
}

// Copy link & scroll to top
document.getElementById('copyLinkBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  copyToClipboard(window.location.href);
});

document.getElementById('scrollToTopBtn')?.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Lazy in-view animation
const elements = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

elements.forEach(el => observer.observe(el));
