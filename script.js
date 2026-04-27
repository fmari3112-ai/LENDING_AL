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
  if (!cards.length) return;

  function toggleCard(card) {
    const isActive = !card.classList.contains('is-active');
    card.classList.toggle('is-active', isActive);
    card.setAttribute('aria-pressed', String(isActive));
  }

  function closeCard(card) {
    card.classList.remove('is-active');
    card.setAttribute('aria-pressed', 'false');
  }

  cards.forEach((card) => {
    const cta = card.querySelector('.start-card-btn');
    const close = card.querySelector('.card-close');

    card.addEventListener('click', (event) => {
      if (event.target.closest('.card-details')) return;
      toggleCard(card);
    });

    if (cta) {
      cta.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleCard(card);
      });
    }

    if (close) {
      close.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeCard(card);
      });
    }

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleCard(card);
      }
    });
  });
})();

// Интерактивный блок "Проекты" в секции #cases
(function () {
  const casesSection = document.querySelector('#cases');
  if (!casesSection) return;

  const items = casesSection.querySelectorAll('.project-item');
  const displayImage = casesSection.querySelector('#project-display-image');
  const defaultImage = 'img/project-display.png';
  if (!items.length || !displayImage) return;

  function setDisplayImage(src, isDefault) {
    displayImage.src = src;
    displayImage.classList.toggle('is-default', isDefault);
    displayImage.classList.toggle('is-case', !isDefault);
  }

  function closeItem(item) {
    item.classList.remove('is-open');
    const trigger = item.querySelector('.project-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function openItem(item) {
    items.forEach((otherItem) => {
      if (otherItem !== item) closeItem(otherItem);
    });

    item.classList.add('is-open');
    const trigger = item.querySelector('.project-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');

    const nextImage = item.dataset.projectImage || defaultImage;
    setDisplayImage(nextImage, false);
  }

  items.forEach((item) => {
    const trigger = item.querySelector('.project-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      if (isOpen) {
        closeItem(item);
        setDisplayImage(defaultImage, true);
      } else {
        openItem(item);
      }
    });
  });

  setDisplayImage(defaultImage, true);
})();

// Одноразовый прогон таймлайна в блоке #process на вход в viewport
(function () {
  const processSection = document.querySelector('#process');
  const timeline = document.querySelector('#process .process-timeline');
  if (!processSection || !timeline) return;

  const nodes = Array.from(timeline.querySelectorAll('.process-node'));
  const line = timeline.querySelector('.process-line');
  const progress = timeline.querySelector('.process-line-progress');
  const moving = timeline.querySelector('.process-moving-icon');
  const isMobile = () => window.matchMedia('(max-width: 860px)').matches;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!nodes.length || !line || !progress || !moving) return;

  const moveDuration = 1900;
  const pauseDuration = 900;
  const finalPauseDuration = 1700;

  let timeoutId = null;
  let rafId = null;
  let currentIndex = 0;
  let hasRunForEntry = false;
  let isRunning = false;

  function clearAllTimers() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function setActive(index) {
    nodes.forEach((node, i) => node.classList.toggle('is-active', i === index));
  }

  function hideMotion() {
    moving.style.opacity = '0';
    moving.style.transition = 'none';
    progress.style.width = '0px';
    progress.style.transition = 'none';
  }

  function resetState() {
    clearAllTimers();
    isRunning = false;
    currentIndex = 0;
    setActive(0);
    hideMotion();
  }

  function getIconCenter(index) {
    const icon = nodes[index].querySelector('.process-node-icon');
    const timelineRect = timeline.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    return {
      x: iconRect.left + iconRect.width / 2 - timelineRect.left,
      y: iconRect.top + iconRect.height / 2 - timelineRect.top
    };
  }

  function setMovingIconShape(index) {
    const icon = nodes[index].querySelector('.process-node-icon');
    moving.innerHTML = icon ? icon.innerHTML : '';
  }

  function finishRun() {
    isRunning = false;
    hasRunForEntry = true;
    hideMotion();
  }

  function runStep() {
    if (isMobile() || isReduced) {
      finishRun();
      return;
    }

    if (currentIndex === nodes.length - 1) {
      hideMotion();
      timeoutId = setTimeout(() => {
        finishRun();
      }, finalPauseDuration);
      return;
    }

    const from = getIconCenter(currentIndex);
    const nextIndex = currentIndex + 1;
    const to = getIconCenter(nextIndex);
    const lineStart = Math.min(from.x, to.x);
    const lineWidth = Math.abs(to.x - from.x);

    setMovingIconShape(currentIndex);
    moving.style.transition = 'none';
    moving.style.left = `${from.x}px`;
    moving.style.top = `${from.y}px`;
    moving.style.opacity = '0.68';

    progress.style.transition = 'none';
    progress.style.left = `${lineStart}px`;
    progress.style.top = `${from.y}px`;
    progress.style.width = '0px';

    rafId = requestAnimationFrame(() => {
      moving.style.transition = `left ${moveDuration}ms linear`;
      progress.style.transition = `width ${moveDuration}ms linear`;
      moving.style.left = `${to.x}px`;
      progress.style.width = `${lineWidth}px`;
    });

    timeoutId = setTimeout(() => {
      currentIndex = nextIndex;
      setActive(currentIndex);
      hideMotion();
      timeoutId = setTimeout(runStep, pauseDuration);
    }, moveDuration + 40);
  }

  function startRunFromZero() {
    if (isRunning || hasRunForEntry) return;
    resetState();
    isRunning = true;
    runStep();
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startRunFromZero();
        } else {
          hasRunForEntry = false;
          resetState();
        }
      });
    },
    { threshold: 0.25 }
  );

  io.observe(processSection);
})();
