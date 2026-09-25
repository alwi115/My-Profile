const root = document.documentElement;
const body = document.body;
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
themeToggle?.addEventListener('click', () => applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true));

// Premium loader: quick first impression without slowing the site.
const pageLoader = document.getElementById('page-loader');
const hideLoader = () => {
  if (!pageLoader || pageLoader.classList.contains('is-hidden')) return;
  pageLoader.classList.add('is-leaving');
  window.setTimeout(() => {
    pageLoader.classList.add('is-hidden');
    body.classList.add('site-ready');
  }, reducedMotion ? 0 : 430);
};
if (document.readyState === 'complete') {
  window.setTimeout(hideLoader, reducedMotion ? 0 : 420);
} else {
  window.addEventListener('load', () => window.setTimeout(hideLoader, reducedMotion ? 0 : 420), { once: true });
  window.setTimeout(hideLoader, 1500);
}

function updateScrollUI() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header?.classList.toggle('scrolled', y > 18);
  if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

  let active = '';
  for (const section of sections) {
    if (y >= section.offsetTop - 180) active = section.id;
  }
  navAnchors.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${active}`));
}
updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });

function closeMenu() {
  navLinks?.classList.remove('open');
  menuToggle?.classList.remove('active');
  menuToggle?.setAttribute('aria-expanded', 'false');
  body.classList.remove('menu-open');
}
menuToggle?.addEventListener('click', () => {
  const open = !navLinks.classList.contains('open');
  navLinks.classList.toggle('open', open);
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  body.classList.toggle('menu-open', open);
});
navAnchors.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!navLinks?.classList.contains('open')) return;
  if (navLinks.contains(event.target) || menuToggle?.contains(event.target)) return;
  closeMenu();
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
      const px = event.clientX / innerWidth;
      const py = event.clientY / innerHeight;
      root.style.setProperty('--mouse-x', `${px * 100}%`);
      root.style.setProperty('--mouse-y', `${py * 100}%`);
      root.style.setProperty('--parallax-x', `${(px - .5) * 22}px`);
      root.style.setProperty('--parallax-y', `${(py - .5) * 18}px`);
      root.style.setProperty('--parallax-x2', `${(px - .5) * -14}px`);
      root.style.setProperty('--parallax-y2', `${(py - .5) * -12}px`);
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

// Typewriter roles
const roleEl = document.querySelector('.rotating-role');
if (roleEl && !reducedMotion) {
  const roles = (roleEl.dataset.roles || '').split('|').map(x => x.trim()).filter(Boolean);
  let roleIndex = 0, charIndex = 0, deleting = false;
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

// Count-up cards
const statValues = document.querySelectorAll('.stat-card strong[data-count]');
if (statValues.length && 'IntersectionObserver' in window && !reducedMotion) {
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const hasPlus = el.textContent.includes('+');
      const startTime = performance.now();
      const duration = 1200;
      const update = now => {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = Math.round(target * eased);
        el.textContent = String(value).padStart(2, '0') + (hasPlus ? '+' : '');
        if (p < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.35 });
  statValues.forEach(el => statObserver.observe(el));
}

// Project modal
const projectData = {
  darbflow: {
    title: 'دَرب فلو | DarbFlow',
    type: 'SAAS • FULL-STACK',
    description: 'نظام متكامل لإدارة شركات تأجير السيارات من مكان واحد، ويجمع الحجوزات والعقود والمدفوعات والمصروفات والصيانة والفروع والتقارير وبوابة العميل.',
    tags: ['Node.js', 'Express', 'MongoDB', 'SaaS'],
    logo: 'darbflow-logo.png',
    url: 'https://darbflow.up.railway.app',
    action: 'فتح DarbFlow',
    theme: 'darbflow'
  },
  mansawwaha: {
    title: 'من سوّاها؟',
    type: 'SOCIAL GAME • WEB & ANDROID',
    description: 'لعبة اجتماعية خليجية للجلسات والأصدقاء، فيها أونلاين وأوفلاين وغرف وتصويت وتفاعل جماعي، ومصممة عشان تعطي مساحة أكبر للنقاش والضحك.',
    tags: ['Flutter', 'Firebase', 'Realtime', 'Game UI'],
    logo: 'man-sawwaha-logo.png',
    url: 'https://man-sawwaha.web.app',
    action: 'العب من سوّاها؟',
    theme: 'game'
  }
};
const modal = document.getElementById('project-modal');
const modalDialog = modal?.querySelector('.project-modal-dialog');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalType = document.getElementById('modal-type');
const modalLogo = document.getElementById('modal-logo');
const modalTags = document.getElementById('modal-tags');
const modalOpenLink = document.getElementById('modal-open-link');
let lastModalTrigger = null;

function openProjectModal(key, trigger) {
  const data = projectData[key];
  if (!data || !modal) return;
  lastModalTrigger = trigger || null;
  modal.className = `project-modal modal-theme-${data.theme}`;
  modal.setAttribute('aria-hidden', 'false');
  modalTitle.textContent = data.title;
  modalDescription.textContent = data.description;
  modalType.textContent = data.type;
  modalLogo.src = data.logo;
  modalLogo.alt = `شعار ${data.title}`;
  modalTags.innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join('');
  modalOpenLink.href = data.url;
  modalOpenLink.querySelector('span').textContent = data.action;
  body.classList.add('modal-open');
  requestAnimationFrame(() => modal.classList.add('is-open'));
  window.setTimeout(() => modalDialog?.querySelector('[data-modal-close]')?.focus(), reducedMotion ? 0 : 150);
}
function closeProjectModal() {
  if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
  modal.classList.remove('is-open');
  body.classList.remove('modal-open');
  window.setTimeout(() => {
    modal.setAttribute('aria-hidden', 'true');
    lastModalTrigger?.focus?.();
  }, reducedMotion ? 0 : 260);
}
document.querySelectorAll('[data-project-modal]').forEach(trigger => {
  trigger.addEventListener('click', event => {
    event.preventDefault();
    openProjectModal(trigger.dataset.projectModal, trigger);
  });
});
document.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', closeProjectModal));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeMenu();
    closeProjectModal();
  }
  if (event.key === 'Tab' && modal?.classList.contains('is-open')) {
    const focusable = [...modalDialog.querySelectorAll('button, a[href]')].filter(el => !el.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

// Back to top
const backTop = document.getElementById('back-top');
backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
