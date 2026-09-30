const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = new Date().getFullYear(); });

const form = document.querySelector('[data-contact-form]');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = new FormData(form);
    const subject = encodeURIComponent('New website project inquiry');
    const body = encodeURIComponent(`Name: ${fields.get('name')}\nBusiness: ${fields.get('business')}\nProject: ${fields.get('project')}\n\n${fields.get('message')}`);
    window.location.href = `mailto:projects@madeincanadadigital.ca?subject=${subject}&body=${body}`;
    document.querySelector('.notice')?.classList.add('show');
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-site-header]');
if (header) {
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 18);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

const revealItems = document.querySelectorAll('[data-reveal]');
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('revealed'));
}

// The Work section keeps the same study content in both presentation modes.
const studiesSection = document.querySelector('.design-studies');
if (studiesSection) {
  const studyTrack = studiesSection.querySelector('[data-study-track]');
  const studyCards = Array.from(studiesSection.querySelectorAll('.study'));
  const modeButtons = Array.from(studiesSection.querySelectorAll('[data-view-mode]'));
  const slideButtons = Array.from(studiesSection.querySelectorAll('[data-slide]'));
  const slideStatus = studiesSection.querySelector('[data-slide-status]');
  const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (studyTrack && studyCards.length) {
    studyTrack.replaceChildren(...studyCards);
    studiesSection.querySelector('.more-studies')?.remove();
    studiesSection.dataset.mode = 'showcase';
    studyTrack.setAttribute('role', 'group');
    studyTrack.setAttribute('aria-label', 'Floating interface studies. Swipe, drag, or use the left and right arrow keys to browse.');
    studyTrack.tabIndex = 0;

    let activeIndex = 0;
    const paintShowcase = () => {
      studyCards.forEach((card, index) => {
        let offset = index - activeIndex;
        if (offset > studyCards.length / 2) offset -= studyCards.length;
        if (offset < -studyCards.length / 2) offset += studyCards.length;
        card.dataset.position = String(offset);
        card.toggleAttribute('data-active', offset === 0);
        card.setAttribute('aria-hidden', String(Math.abs(offset) > 2));
      });
      if (slideStatus) slideStatus.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(studyCards.length).padStart(2, '0')}`;
    };
    const showStudy = (index) => {
      activeIndex = (index + studyCards.length) % studyCards.length;
      paintShowcase();
    };

    let pointerStart = null;
    studyTrack.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerStart = { x: event.clientX, y: event.clientY };
    });
    studyTrack.addEventListener('pointerup', (event) => {
      if (!pointerStart) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.15) showStudy(activeIndex + (dx < 0 ? 1 : -1));
    });
    studyTrack.addEventListener('pointercancel', () => { pointerStart = null; });
    slideButtons.forEach((button) => button.addEventListener('click', () => {
      showStudy(activeIndex + (button.dataset.slide === 'next' ? 1 : -1));
    }));
    studyTrack.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showStudy(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    });
    modeButtons.forEach((button) => button.addEventListener('click', () => {
      const mode = button.dataset.viewMode;
      studiesSection.dataset.mode = mode;
      modeButtons.forEach((control) => control.setAttribute('aria-pressed', String(control === button)));
      slideButtons.forEach((control) => { control.closest('.studies-controls').hidden = mode !== 'showcase'; });
      if (mode === 'showcase') paintShowcase();
    }));

    paintShowcase();
  }
}

const depthElement = document.querySelector('[data-depth]');
if (depthElement && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const hero = document.querySelector('.home .hero');
  hero?.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 9;
    depthElement.style.setProperty('--depth-x', `${x}px`);
    depthElement.style.setProperty('--depth-y', `${y}px`);
  }, { passive: true });
  hero?.addEventListener('pointerleave', () => {
    depthElement.style.setProperty('--depth-x', '0px');
    depthElement.style.setProperty('--depth-y', '0px');
  }, { passive: true });
}

const canvas = document.querySelector('[data-cosmic-canvas]');
if (canvas) {
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame;
  let pointer = { x: -1000, y: -1000 };
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer && !reducedMotion) {
    canvas.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }, { passive: true });
    canvas.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; }, { passive: true });
  }

  const createParticles = () => {
    const count = window.innerWidth < 700 ? 48 : Math.min(120, Math.round(width * height / 11000));
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.92,
      radius: 0.35 + Math.random() * 1.15,
      speed: 0.026 + Math.random() * 0.066,
      drift: (Math.random() - 0.5) * (0.008 + (index % 3) * 0.012),
      alpha: 0.18 + Math.random() * 0.58,
      layer: index % 3
    }));
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    createParticles();
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      particle.y -= particle.speed * (particle.layer + 0.8);
      particle.x += particle.drift * (particle.layer + 1);
      if (particle.x < -4) particle.x = width + 4;
      if (particle.x > width + 4) particle.x = -4;
      if (particle.y < -4) { particle.y = height * 0.92; particle.x = Math.random() * width; }
      const fade = Math.min(1, Math.max(0, (height - particle.y) / (height * 0.34)));
      const distanceToPointer = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
      const pointerLift = distanceToPointer < 145 ? (1 - distanceToPointer / 145) * 0.24 : 0;
      context.beginPath();
      context.fillStyle = `rgba(203, 225, 255, ${Math.min(0.95, particle.alpha * fade + pointerLift)})`;
      context.arc(particle.x, particle.y, particle.radius + pointerLift * 1.4, 0, Math.PI * 2);
      context.fill();
    });

    const lineParticles = particles.filter((particle) => particle.layer === 0).slice(0, 22);
    for (let i = 0; i < lineParticles.length - 1; i += 2) {
      const a = lineParticles[i];
      const b = lineParticles[i + 1];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 170) {
        context.beginPath();
        context.strokeStyle = `rgba(113, 169, 237, ${0.09 * (1 - distance / 170)})`;
        context.lineWidth = 0.7;
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
    if (!reducedMotion) animationFrame = requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationFrame);
    resize();
    draw();
  }, { passive: true });
}
