const root = document.documentElement;
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = [...document.querySelectorAll('.nav-links a')];
const sections = [...document.querySelectorAll('main section[id]')];
const themeToggle = document.querySelector('.theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeGlyph = document.querySelector('.theme-glyph');
const themeLabel = document.querySelector('.theme-label');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function applyTheme(theme, persist = false) {
  root.dataset.theme = theme;
  const isLight = theme === 'light';
  themeToggle?.setAttribute('aria-label', isLight ? 'تغيير إلى الوضع الغامق' : 'تغيير إلى الوضع الفاتح');
  themeToggle?.setAttribute('title', isLight ? 'الوضع الغامق' : 'الوضع الفاتح');
  themeMeta?.setAttribute('content', isLight ? '#f3f7fb' : '#070b14');
  if (themeGlyph) themeGlyph.textContent = isLight ? '☾' : '☀';
  if (themeLabel) themeLabel.textContent = isLight ? 'غامق' : 'فاتح';
  if (persist) {
    try { localStorage.setItem('alwi-theme', theme); } catch (_) {}
  }
}

applyTheme(root.dataset.theme || 'dark');

themeToggle?.addEventListener('click', () => {
  applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true);
});

function updateScrollUI() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header?.classList.toggle('scrolled', y > 18);
  if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

  let active = '';
  for (const section of sections) {
    if (y >= section.offsetTop - 180) active = section.id;
  }
  navAnchors.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${active}`);
  });
}
updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });

function closeMenu() {
  navLinks?.classList.remove('open');
  menuToggle?.classList.remove('active');
  menuToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

menuToggle?.addEventListener('click', () => {
  const open = !navLinks.classList.contains('open');
  navLinks.classList.toggle('open', open);
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});
navAnchors.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!navLinks?.classList.contains('open')) return;
  if (navLinks.contains(event.target) || menuToggle?.contains(event.target)) return;
  closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
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
  }, { threshold: 0.14, rootMargin: '0px 0px -40px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('in-view'));
}

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  let raf = null;
  document.addEventListener('pointermove', event => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      root.style.setProperty('--mouse-x', `${(event.clientX / innerWidth) * 100}%`);
      root.style.setProperty('--mouse-y', `${(event.clientY / innerHeight) * 100}%`);
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

// typewriter roles
const roleEl = document.querySelector('.rotating-role');
if (roleEl && !reducedMotion) {
  const roles = (roleEl.dataset.roles || '').split('|').map(x => x.trim()).filter(Boolean);
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const current = roles[roleIndex] || 'Web Developer';
    roleEl.textContent = current.slice(0, charIndex);

    if (!deleting) {
      charIndex++;
      if (charIndex > current.length) {
        deleting = true;
        setTimeout(tick, 1200);
        return;
      }
      setTimeout(tick, 80);
    } else {
      charIndex--;
      if (charIndex < 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        charIndex = 0;
        setTimeout(tick, 260);
        return;
      }
      setTimeout(tick, 45);
    }
  };
  tick();
}

// count up stats
const statValues = document.querySelectorAll('.stat-card strong[data-count]');
if (statValues.length && 'IntersectionObserver' in window && !reducedMotion) {
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const hasPlus = el.textContent.includes('+');
      const startTime = performance.now();
      const duration = 1300;
      const update = now => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = String(value).padStart(2, '0') + (hasPlus ? '+' : '');
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.35 });
  statValues.forEach(el => statObserver.observe(el));
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
