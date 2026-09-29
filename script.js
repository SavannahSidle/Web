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

const depthElement = document.querySelector('[data-depth]');
if (depthElement && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 10;
    const y = (event.clientY / window.innerHeight - 0.5) * 8;
    depthElement.style.setProperty('--depth-x', `${x}px`);
    depthElement.style.setProperty('--depth-y', `${y}px`);
  }, { passive: true });
}

const canvas = document.querySelector('[data-cosmic-canvas]');
if (canvas) {
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame;

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
      context.beginPath();
      context.fillStyle = `rgba(203, 225, 255, ${particle.alpha * fade})`;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
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
