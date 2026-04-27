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

// Accordion в правой карточке блока "Обо мне"
(function () {
  const accordion = document.querySelector('.about-accordion');
  if (!accordion) return;

  const triggers = accordion.querySelectorAll('.about-accordion-trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.about-accordion-item');
      if (!item) return;

      const isOpen = item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));

      const meta = trigger.querySelector('.about-accordion-meta');
      const arrow = trigger.querySelector('.about-accordion-arrow');
      if (meta && arrow) {
        const label = isOpen ? 'Скрыть' : 'Подробнее';
        meta.innerHTML = `<span class="about-accordion-arrow">${arrow.textContent}</span>${label}`;
      }
    });
  });
})();

// Typewriter только для последней строки заголовка блока "Обо мне"
(function () {
  const aboutSection = document.querySelector('#about');
  const typewriterLine = document.querySelector('.about-typewriter-line');
  if (!aboutSection || !typewriterLine) return;

  const TEXT = 'к системе, встроенной в бизнес';
  const CHAR_MS = 82;
  const START_DELAY_MS = 900;

  let timeouts = [];
  let isVisible = false;
  let isRunning = false;

  function clearTimers() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
  }

  function reset() {
    clearTimers();
    isRunning = false;
    typewriterLine.textContent = '';
  }

  function schedule(fn, delay) {
    const id = setTimeout(() => {
      timeouts = timeouts.filter((timerId) => timerId !== id);
      fn();
    }, delay);
    timeouts.push(id);
  }

  function startTypewriter() {
    if (isRunning || !isVisible) return;
    reset();
    isRunning = true;

    const cursor = document.createElement('span');
    cursor.className = 'about-typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '_';

    let charIndex = 0;

    function tick() {
      if (!isVisible) {
        reset();
        return;
      }

      if (charIndex < TEXT.length) {
        typewriterLine.textContent = TEXT.slice(0, charIndex + 1);
        typewriterLine.appendChild(cursor);
        charIndex += 1;
        schedule(tick, CHAR_MS);
        return;
      }

      typewriterLine.textContent = TEXT;
      typewriterLine.appendChild(cursor);
      isRunning = false;
    }

    schedule(tick, START_DELAY_MS);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startTypewriter();
        } else {
          reset();
        }
      });
    },
    { threshold: 0.2 }
  );

  io.observe(aboutSection);
})();

// Активное состояние карточек в блоке "С чего начать"
(function () {
  const startGrid = document.querySelector('#automation .start-grid');
  if (!startGrid) return;

  const cards = startGrid.querySelectorAll('.start-card');
  const details = document.querySelector('#automation .services-details');
  const detailsGrid = details?.querySelector('.services-details-grid');
  const detailsTitle = details?.querySelector('.services-details-title');
  if (!cards.length || !details || !detailsGrid || !detailsTitle) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DATA = {
    single: {
      title: 'Одно решение',
      items: [
        ['Оформление сообщества', 'от 3 000 ₽'],
        ['Инфографика', 'от 500 ₽ / слайд'],
        ['Презентации', 'от 5 000 ₽'],
        ['Визуал: баннеры, флаеры, оформление', 'от 1 000 ₽'],
        ['Лендинг', 'от 10 000 ₽'],
        ['Сайт многостраничный', 'от 30 000 ₽'],
        ['Умные боты и автоответы', 'от 15 000 ₽'],
        ['Мобильное приложение под задачу', 'от 30 000 ₽']
      ]
    },
    bundle: {
      title: 'Несколько решений под задачу',
      items: [
        ['Автоматизация приёма заявок: бот + CRM', 'от 25 000 ₽'],
        ['Сайт + заявки', 'от 40 000 ₽'],
        ['Контент + оформление + заявки', 'от 50 000 ₽'],
        ['Коммуникация + автоматизация', 'от 60 000 ₽']
      ]
    },
    system: {
      title: 'Система под процесс',
      items: [
        ['Автоматизация процессов', 'от 40 000 ₽'],
        ['Система под процесс', 'от 90 000 ₽'],
        ['Автоматизация + AI', 'от 120 000 ₽'],
        ['Полная система под бизнес', 'от 150 000 ₽']
      ]
    }
  };

  function renderDetails(serviceKey) {
    const service = DATA[serviceKey];
    if (!service) return;

    detailsTitle.textContent = `${service.title}: решения и цены`;
    detailsGrid.innerHTML = service.items
      .map(([name, price]) => `
        <article class="service-price-card">
          <p class="service-price-name">${name}</p>
          <div class="service-price-value">${price}</div>
        </article>
      `)
      .join('');
  }

  function closeDetails() {
    cards.forEach((card) => {
      card.classList.remove('is-active');
      card.setAttribute('aria-pressed', 'false');
    });
    startGrid.classList.remove('has-active');
    details.classList.remove('is-visible');
  }

  function setActive(cardToActivate, withScroll = false) {
    const serviceKey = cardToActivate.dataset.service;
    if (!serviceKey || !DATA[serviceKey]) return;

    const wasActive = cardToActivate.classList.contains('is-active');
    if (wasActive) {
      closeDetails();
      return;
    }

    cards.forEach((card) => {
      const isActive = card === cardToActivate;
      card.classList.toggle('is-active', isActive);
      card.setAttribute('aria-pressed', String(isActive));
    });

    startGrid.classList.remove('has-active');
    renderDetails(serviceKey);
    details.classList.add('is-visible');

    if (withScroll) {
      details.scrollIntoView({
        behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  }

  cards.forEach((card) => {
    const cta = card.querySelector('.start-card-btn');

    card.addEventListener('click', () => setActive(card));

    if (cta) {
      cta.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setActive(card, true);
      });
    }

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActive(card);
      }
    });
  });
})();
