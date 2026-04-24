// Плавкое появление блоков при прокрутке
const revealItems = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.14
});

revealItems.forEach((item) => observer.observe(item));

// Плавный переход по якорным ссылкам (с учётом prefers-reduced-motion)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  const href = anchor.getAttribute('href');
  if (!href || href === '#' || href.length < 2) return;
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    if (history.replaceState) {
      history.replaceState(null, '', href);
    } else {
      location.hash = href;
    }
    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
      block: 'start'
    });
  });
});

// Подсветка активного пункта меню
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav a');

function setActiveNav() {
  let currentId = '';

  sections.forEach((section) => {
    const top = window.scrollY;
    const offset = section.offsetTop - 140;
    const height = section.offsetHeight;

    if (top >= offset && top < offset + height) {
      currentId = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === '#' + currentId) {
      link.style.color = '#ffffff';
    } else {
      link.style.color = '';
    }
  });
}

window.addEventListener('scroll', setActiveNav);
setActiveNav();

// Печать текста в hero (три строки, без библиотек)
(function () {
  const heroSection = document.querySelector('section.hero');
  const typewriterRoot = document.querySelector('.hero-typewriter');
  if (!heroSection || !typewriterRoot) return;

  const LINES = [
    'Проектирую AI-решения под задачи бизнеса',
    'Объединяю сайт, процессы и коммуникацию в систему',
    'Чтобы система работала стабильно и без потерь'
  ];

  const CHAR_MS = 54;
  const BETWEEN_LINES_MS = 400;

  let timeouts = [];
  let heroVisible = false;

  function clearTimers() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
  }

  function reset() {
    clearTimers();
    typewriterRoot.replaceChildren();
  }

  function runTypewriter() {
    reset();

    const lineEls = LINES.map(() => {
      const span = document.createElement('span');
      span.className = 'hero-typewriter-line';
      typewriterRoot.appendChild(span);
      return span;
    });

    const cursor = document.createElement('span');
    cursor.className = 'hero-typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '_';

    function typeLine(lineIndex, col) {
      if (!heroVisible) return;

      if (lineIndex >= LINES.length) return;

      const lineEl = lineEls[lineIndex];
      const text = LINES[lineIndex];

      if (col < text.length) {
        lineEl.textContent = text.slice(0, col + 1);
        lineEl.appendChild(cursor);
        const id = setTimeout(() => {
          timeouts = timeouts.filter((t) => t !== id);
          typeLine(lineIndex, col + 1);
        }, CHAR_MS);
        timeouts.push(id);
      } else {
        lineEl.textContent = text;
        if (lineIndex < LINES.length - 1) {
          const id = setTimeout(() => {
            timeouts = timeouts.filter((t) => t !== id);
            typeLine(lineIndex + 1, 0);
          }, BETWEEN_LINES_MS);
          timeouts.push(id);
        }
      }
    }

    typeLine(0, 0);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible) {
          runTypewriter();
        } else {
          reset();
        }
      });
    },
    { threshold: 0.2 }
  );

  io.observe(heroSection);
})();
