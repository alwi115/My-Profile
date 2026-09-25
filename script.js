const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = [...document.querySelectorAll('.nav-links a')];
const sections = [...document.querySelectorAll('main section[id]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateScrollUI() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header?.classList.toggle('scrolled', y > 18);
  if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

  let active = '';
  for (const section of sections) {
    if (y >= section.offsetTop - 160) active = section.id;
  }
  navAnchors.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${active}`);
  });
}

updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = !navLinks.classList.contains('open');
  navLinks.classList.toggle('open', open);
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});

navAnchors.forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle?.classList.remove('active');
  menuToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}));

document.addEventListener('click', event => {
  if (!navLinks?.classList.contains('open')) return;
  if (navLinks.contains(event.target) || menuToggle?.contains(event.target)) return;
  navLinks.classList.remove('open');
  menuToggle?.classList.remove('active');
  menuToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -30px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('in-view'));
}

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  let raf = null;
  document.addEventListener('pointermove', event => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--mouse-x', `${(event.clientX / innerWidth) * 100}%`);
      document.documentElement.style.setProperty('--mouse-y', `${(event.clientY / innerHeight) * 100}%`);
      raf = null;
    });
  }, { passive: true });

  document.querySelectorAll('.spotlight-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
    }, { passive: true });
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
