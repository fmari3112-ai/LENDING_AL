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
