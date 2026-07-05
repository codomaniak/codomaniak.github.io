const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-close');
const mobileOverlay = document.getElementById('mobile-overlay');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMenu() {
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  mobileOverlay.classList.add('visible');
  mobileOverlay.setAttribute('aria-hidden', 'false');
  mobileToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  mobileOverlay.classList.remove('visible');
  mobileOverlay.setAttribute('aria-hidden', 'true');
  mobileToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (mobileToggle) mobileToggle.addEventListener('click', openMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMenu);
if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

revealElements.forEach(el => revealObserver.observe(el));

const navBar = document.querySelector('.nav-bar');
const footerYear = document.getElementById('footer-year');
if (footerYear) footerYear.textContent = new Date().getFullYear();

if (navBar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navBar.style.background = 'rgba(10,10,10,0.95)';
      navBar.style.borderColor = 'rgba(255,255,255,0.08)';
    } else {
      navBar.style.background = 'rgba(10,10,10,0.8)';
      navBar.style.borderColor = 'rgba(255,255,255,0.1)';
    }
  }, { passive: true });
}
