const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');
if (menuButton && nav) {
  const setMenuOpen = (open) => {
    nav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };
  menuButton.addEventListener('click', () => setMenuOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (nav.classList.contains('open') && !nav.contains(event.target) && !menuButton.contains(event.target)) setMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
}

document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = new Date().getFullYear(); });

const form = document.querySelector('[data-contact-form]');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const subject = encodeURIComponent('New website project inquiry');
    const body = encodeURIComponent(`Name: ${fields.get('name')}\nBusiness: ${fields.get('business')}\nProject: ${fields.get('project')}\n\n${fields.get('message')}`);
    const notice = document.querySelector('.notice');
    if (notice) {
      notice.textContent = 'Opening your email app. The message has not been sent. If it does not open, email projects@madeincanadadigital.ca.';
      notice.classList.add('show');
    }
    window.location.href = `mailto:projects@madeincanadadigital.ca?subject=${subject}&body=${body}`;
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
  const studyCards = Array.from(studiesSection.querySelectorAll('.study:not([data-study-draft])'));
  const modeButtons = Array.from(studiesSection.querySelectorAll('[data-view-mode]'));
  const slideButtons = Array.from(studiesSection.querySelectorAll('[data-slide]'));
  const slideStatus = studiesSection.querySelector('[data-slide-status]');
  const slideProgress = studiesSection.querySelector('[data-slide-progress]');
  const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (studyTrack && studyCards.length) {
    studyTrack.replaceChildren(...studyCards);
    studiesSection.querySelector('.more-studies')?.remove();
    studiesSection.dataset.mode = 'showcase';
    studyTrack.setAttribute('role', 'group');
    studyTrack.setAttribute('aria-label', 'Floating interface studies. Swipe, drag, or use the left and right arrow keys to browse.');
    studyTrack.tabIndex = 0;

    let activeIndex = Math.max(0, studyCards.findIndex((card) => card.classList.contains('study-dinosaur')));
    const paintShowcase = () => {
      studyCards.forEach((card, index) => {
        let offset = index - activeIndex;
        if (offset > studyCards.length / 2) offset -= studyCards.length;
        if (offset < -studyCards.length / 2) offset += studyCards.length;
        if (offset === -studyCards.length / 2) offset = studyCards.length / 2;
        card.dataset.position = String(offset);
        card.toggleAttribute('data-active', offset === 0);
        const inShowcase = studiesSection.dataset.mode === 'showcase';
        const visible = Math.abs(offset) <= 1;
        if (inShowcase) {
          card.setAttribute('role', 'group');
          card.setAttribute('aria-label', `${card.querySelector(':scope > p')?.textContent.trim() || 'Interface study'}, ${index + 1} of ${studyCards.length}. Select to view.`);
          card.setAttribute('aria-hidden', String(!visible));
          card.tabIndex = visible ? 0 : -1;
        } else {
          card.removeAttribute('role');
          card.removeAttribute('aria-label');
          card.removeAttribute('aria-hidden');
          card.removeAttribute('tabindex');
        }
      });
      if (slideStatus) slideStatus.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(studyCards.length).padStart(2, '0')}`;
      if (slideProgress) slideProgress.style.width = `${((activeIndex + 1) / studyCards.length) * 100}%`;
    };
    const showStudy = (index) => {
      activeIndex = (index + studyCards.length) % studyCards.length;
      paintShowcase();
    };

    let pointerStart = null;
    let suppressCardClicksUntil = 0;
    studyTrack.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (event.target.closest('button,a,input,select,textarea,[role="button"],[data-spatial-screen],[data-raptor-view],[data-bedding-study]')) return;
      pointerStart = { x: event.clientX, y: event.clientY };
    });
    studyTrack.addEventListener('pointerup', (event) => {
      if (!pointerStart) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        suppressCardClicksUntil = Date.now() + 500;
        showStudy(activeIndex + (dx < 0 ? 1 : -1));
      }
    });
    studyTrack.addEventListener('pointercancel', () => { pointerStart = null; });
    studyCards.forEach((card, index) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('button,a,input,select,textarea,[role="button"]')) return;
        if (studiesSection.dataset.mode === 'showcase' && Date.now() >= suppressCardClicksUntil) showStudy(index);
      });
      card.addEventListener('keydown', (event) => {
        if (event.target !== card || studiesSection.dataset.mode !== 'showcase' || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        showStudy(index);
      });
    });
    slideButtons.forEach((button) => button.addEventListener('click', () => {
      showStudy(activeIndex + (button.dataset.slide === 'next' ? 1 : -1));
    }));
    studyTrack.addEventListener('keydown', (event) => {
      if (event.target.closest('button,input,select,textarea,a,[contenteditable="true"]')) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showStudy(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    });
    modeButtons.forEach((button) => button.addEventListener('click', () => {
      const mode = button.dataset.viewMode;
      studiesSection.dataset.mode = mode;
      modeButtons.forEach((control) => control.setAttribute('aria-pressed', String(control === button)));
      slideButtons.forEach((control) => { control.closest('.studies-controls').hidden = mode !== 'showcase'; });
      paintShowcase();
    }));

    paintShowcase();
  }
}


// The systems map controls operate on the diagram preview without moving the carousel.
document.querySelectorAll('.system-screen').forEach((screen) => {
  const network = screen.querySelector('[data-system-network]');
  const status = screen.querySelector('[data-system-status]');
  const links = screen.querySelector('.system-connections');
  if (!network || !links) return;
  let zoom = 1;
  const customNodes = [];
  const positions = [
    { label: 'QUEUE', x: 19, y: 67 },
    { label: 'MODEL', x: 80, y: 66 },
    { label: 'AUDIT', x: 28, y: 39 },
    { label: 'SYNC', x: 73, y: 39 }
  ];
  screen.querySelectorAll('[data-system-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const action = button.dataset.systemAction;
      if (action === 'zoom-in') zoom = Math.min(1.38, zoom + 0.12);
      if (action === 'zoom-out') zoom = Math.max(.78, zoom - 0.12);
      network.style.setProperty('--system-zoom', String(zoom));
      if (action === 'expand') {
        const expanded = screen.dataset.expanded !== 'true';
        screen.dataset.expanded = String(expanded);
        button.setAttribute('aria-pressed', String(expanded));
        button.setAttribute('aria-label', expanded ? 'Collapse system view' : 'Expand system view');
      }
      if (action === 'add' && customNodes.length < positions.length) {
        const spec = positions[customNodes.length];
        const node = document.createElement('div');
        node.className = 'system-node system-node-custom';
        node.textContent = spec.label;
        node.style.left = `${spec.x}%`;
        node.style.top = `${spec.y}%`;
        node.setAttribute('aria-label', `${spec.label} node`);
        network.append(node);
        const connector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        connector.setAttribute('d', `M50 49 L${spec.x + 5} ${spec.y + 3}`);
        connector.classList.add('system-added-link');
        links.append(connector);
        customNodes.push({ node, connector });
      }
      if (action === 'delete' && customNodes.length) {
        const item = customNodes.pop();
        item.node.remove();
        item.connector.remove();
      }
      if (status) {
        const nodeLabel = status.querySelector('[data-node-count]');
        const linkLabel = status.querySelector('[data-link-count]');
        const nodeText = `${String(8 + customNodes.length).padStart(2, '0')} / 12 NODES`;
        const linkText = `${15 + customNodes.length} ACTIVE LINKS`;
        if (nodeLabel && linkLabel) { nodeLabel.textContent = nodeText; linkLabel.textContent = linkText; }
        else status.textContent = `${nodeText} · ${linkText}`;
      }
    });
  });
});

// Draw a compact, faceted 3D Velociraptor that can be rotated by drag or keyboard.
document.querySelectorAll('[data-raptor-view]').forEach((stage) => {
  const canvas = stage.querySelector('.raptor-canvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const vertices = [];
  const faces = [];
  const addTriangle = (a, b, c, color, feather = false) => faces.push({ a, b, c, color, feather });
  const addEllipsoid = (cx, cy, cz, rx, ry, rz, color, rings = 8, sides = 12) => {
    const start = vertices.length;
    for (let r = 0; r <= rings; r++) {
      const lat = -Math.PI / 2 + Math.PI * r / rings;
      for (let s = 0; s < sides; s++) {
        const lon = Math.PI * 2 * s / sides;
        vertices.push([cx + rx * Math.cos(lat) * Math.cos(lon), cy + ry * Math.sin(lat), cz + rz * Math.cos(lat) * Math.sin(lon)]);
      }
    }
    for (let r = 0; r < rings; r++) for (let s = 0; s < sides; s++) {
      const a = start + r * sides + s, b = start + r * sides + (s + 1) % sides;
      const c = start + (r + 1) * sides + s, d = start + (r + 1) * sides + (s + 1) % sides;
      addTriangle(a, c, b, color); addTriangle(b, c, d, color);
    }
  };
  const addTube = (from, to, r0, r1, color, sides = 8, isFeather = false) => {
    const axis = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
    const length = Math.hypot(...axis) || 1;
    const w = axis.map(v => v / length);
    let u = [-w[1], w[0], 0];
    if (Math.hypot(...u) < .001) u = [1, 0, 0];
    const ul = Math.hypot(...u); u = u.map(v => v / ul);
    const v = [w[1] * u[2] - w[2] * u[1], w[2] * u[0] - w[0] * u[2], w[0] * u[1] - w[1] * u[0]];
    const start = vertices.length;
    [from, to].forEach((point, ring) => {
      for (let i = 0; i < sides; i++) {
        const angle = Math.PI * 2 * i / sides, radius = ring ? r1 : r0;
        vertices.push([point[0] + (u[0] * Math.cos(angle) + v[0] * Math.sin(angle)) * radius, point[1] + (u[1] * Math.cos(angle) + v[1] * Math.sin(angle)) * radius, point[2] + (u[2] * Math.cos(angle) + v[2] * Math.sin(angle)) * radius]);
      }
    });
    for (let i = 0; i < sides; i++) {
      const a = start + i, b = start + (i + 1) % sides, c = start + sides + i, d = start + sides + (i + 1) % sides;
      addTriangle(a, b, c, color, isFeather); addTriangle(b, d, c, color, isFeather);
    }
  };
  const body = '#65716d', flank = '#89939a', dark = '#3b4647', feather = '#aab2b3', bone = '#d6c7a8', blue = '#426b7d';
  const motionRanges = { tailFan: null, sickleClaws: [] };
  addEllipsoid(-.22, -.015, 0, .53, .27, .26, body, 10, 14);
  addEllipsoid(-.66, -.035, 0, .3, .24, .28, flank, 8, 12);
  addEllipsoid(.08, .025, 0, .21, .18, .2, flank, 8, 12);
  addTube([-.88, -.025, 0], [-3.7, -.3, 0], .22, .012, dark, 10);
  addTube([-.42, .19, 0], [-3.38, -.11, 0], .028, .003, blue, 7);
  addTube([-.57, .14, .02], [-.92, .12, .02], .035, .015, blue, 7);
  const tailFanStart = vertices.length;
  addTube([-.89, .055, 0], [-3.55, -.25, 0], .13, .008, feather, 9, true);
  motionRanges.tailFan = [tailFanStart, vertices.length];
  // A slim, gently arched neck and narrow, toothed skull follow the fossil profile.
  addTube([.12, .12, 0], [.27, .39, 0], .15, .12, body, 10);
  addTube([.27, .39, 0], [.25, .67, 0], .12, .09, flank, 10);
  addTube([.15, .03, 0], [.23, .59, 0], .055, .035, blue, 7);
  addEllipsoid(.23, .755, 0, .255, .145, .19, flank, 9, 14);
  addTube([.39, .79, 0], [.91, .75, 0], .09, .042, body, 10);
  addTube([.41, .68, 0], [.86, .68, 0], .042, .022, dark, 9);
  addTube([.4, .735, 0], [.89, .72, 0], .018, .012, dark, 7);
  for (let tooth = 0; tooth < 8; tooth++) {
    const tx = .49 + tooth * .047;
    const toothY = .733 - (tx - .4) * .03;
    addTube([tx, toothY, .105], [tx + .012, toothY - .035, .105], .008, .001, bone, 5);
    addTube([tx, toothY, -.105], [tx + .012, toothY - .035, -.105], .008, .001, bone, 5);
  }
  [-1, 1].forEach(side => {
    addEllipsoid(.27, .83, side * .17, .037, .031, .023, '#d7a65b', 6, 9);
    addEllipsoid(.284, .83, side * .19, .014, .018, .01, '#17221f', 5, 7);
  });
  // Compact bare forelimbs tuck below the chest, hands angled inward.
  [-.24, .24].forEach((z, i) => {
    addEllipsoid(.14, .015, z, .105, .12, .1, i ? body : dark, 6, 9);
    addTube([.2, -.035, z], [.38, -.21, z * 1.18], .06, .042, body, 7);
    addTube([.38, -.21, z * 1.18], [.53, -.26, z * 1.27], .04, .025, flank, 7);
    addTube([.53, -.26, z * 1.27], [.61, -.34, z * 1.3], .025, .004, bone, 6);
  });
  // Digitigrade hind limbs based on the documented V. mongoliensis proportions:
  // femur and tibia are close in length; metatarsus is shorter; toes stay compact.
  // The far leg is set slightly back and shaded to keep the side silhouette readable.
  [
    {
      z: -.39, shade: dark,
      hip: [-.63, -.19, -.39], knee: [-.31, -.55, -.39],
      hock: [-.54, -.98, -.39], ankle: [-.37, -1.16, -.39],
    },
    {
      z: .39, shade: flank,
      hip: [-.68, -.22, .39], knee: [-.39, -.58, .39],
      hock: [-.63, -.99, .39], ankle: [-.47, -1.16, .39],
    }
  ].forEach((leg, legIndex) => {
    const { z, shade, hip, knee, hock, ankle } = leg;
    // Femur: powerful but tapered from the pelvis to the forward knee.
    addEllipsoid(hip[0], hip[1], z, .18, .21, .14, shade, 7, 10);
    addTube(hip, knee, .135, .095, body, 8);
    addEllipsoid(knee[0], knee[1], z, .095, .1, .09, flank, 6, 8);
    // Tibia/fibula angle back toward the hock; the joint remains flexed.
    addTube(knee, hock, .09, .06, shade, 8);
    addEllipsoid(hock[0], hock[1], z, .065, .07, .07, dark, 6, 8);
    // Short metatarsus angles forward to the ankle. No oversized foot mass.
    addTube(hock, ankle, .06, .046, body, 7);
    addEllipsoid(ankle[0], ankle[1], z, .054, .045, .058, flank, 6, 8);

    // Three compact toes fan gently forward and plant at a shared ground line.
    const toeSpecs = [
      { endZ: z - .11, len: .17 },
      { endZ: z, len: .22 },
      { endZ: z + .11, len: .17 }
    ];
    toeSpecs.forEach((toe, toeIndex) => {
      const base = [ankle[0] + .025, -1.17, z];
      const knuckle = [ankle[0] + toe.len * .54, -1.195, z + (toe.endZ - z) * .56];
      const tip = [ankle[0] + toe.len, -1.20, toe.endZ];
      addTube(base, knuckle, .037, .027, shade, 6);
      addTube(knuckle, tip, .027, .012, flank, 6);
      // Small keratin tips; toe II carries the characteristic enlarged claw.
      if (toeIndex === 1) {
        const clawStart = vertices.length;
        addTube(tip, [tip[0] - .025, -1.115, tip[2] + .018], .026, .002, bone, 7);
        motionRanges.sickleClaws.push([clawStart, vertices.length]);
      } else {
        addTube(tip, [tip[0] + .035, -1.185, tip[2] + (toeIndex === 0 ? -.012 : .012)], .016, .001, bone, 5);
      }
    });
    // Sparse thigh feathers follow the leg instead of masking its joints.
    for (let f = 0; f < 3; f++) {
      addTube(
        [hip[0] + .02 + f * .085, hip[1] + .09 - f * .02, z + .095],
        [hip[0] - .075 + f * .085, hip[1] - .015 - f * .025, z + .13],
        .032, .003, feather, 5, true
      );
    }
  });
  addEllipsoid(.68, .87, .045, .022, .012, .014, '#53644e', 5, 6);
  addEllipsoid(.68, .87, -.045, .022, .012, .014, '#53644e', 5, 6);
  let yaw = -.3, pitch = .08, zoom = .8, drag = null, width = 0, height = 0;
  let feathersVisible = true;
  let gazeX = 0, gazeY = 0;
  const resize = () => {
    const rect = stage.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  };
  const draw = () => {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(-width * .07, 0);
    ctx.fillStyle = 'rgba(2, 8, 11, .3)'; ctx.beginPath(); ctx.ellipse(width * .52, height * .95, width * .3, height * .035, 0, 0, Math.PI * 2); ctx.fill();
    const camera = 6, scale = Math.min(width / 4.95, height / 2.45) * zoom * .76;
    const motionTime = reducedMotion ? 0 : performance.now() / 1000;
    const breath = Math.sin(motionTime * 1.35);
    const tailSway = Math.sin(motionTime * .82);
    const headScan = Math.sin(motionTime * .48);
    const blinkPhase = (motionTime + 1.1) % 8.2;
    const blink = reducedMotion || blinkPhase > .24 ? 0 : Math.sin(Math.PI * blinkPhase / .24);
    const jawFlex = reducedMotion ? 0 : Math.max(0, Math.sin(motionTime * .31 - .8)) * .012;
    const weightShift = reducedMotion ? 0 : Math.sin(motionTime * .67) * .006;
    const projected = vertices.map(([baseX, baseY, baseZ], vertexIndex) => {
      let x = baseX, y = baseY, z = baseZ;
      if (!reducedMotion) {
        // 1. Subtle ribcage breathing.
        if (x > -1.12 && x < .58 && y > -.4 && y < .38) y += (y > 0 ? 1 : -1) * breath * .008;
        // 2. The tail countersways gently, with more movement at the tip.
        if (x < -.94 && x > -3.66) {
          const tailWeight = Math.min(1, Math.max(0, (-x - .94) / 2.72));
          y += Math.sin(motionTime * .82 + tailWeight * 1.8) * .024 * tailWeight;
          z += Math.sin(motionTime * .58 + tailWeight * 1.4) * .012 * tailWeight;
        }
        // 3 & 10. The head scans slowly and follows a nearby pointer with a damped look.
        if (x > -.2 && y > .46) {
          const headWeight = Math.min(1, Math.max(0, (y - .46) / .52));
          x += headScan * .014 * headWeight;
          y += (headScan * .005 + gazeY * .022) * headWeight;
          z += (Math.sin(motionTime * .36) * .026 + gazeX * .045) * headWeight;
        }
        // 4. A quick, occasional blink.
        if (x > .22 && x < .31 && y > .77 && y < .88 && Math.abs(Math.abs(z) - .17) < .04) {
          y = .83 + (y - .83) * (1 - blink * .86);
        }
        // 5. The lower jaw loosens slightly between breaths.
        if (x > .4 && x < .9 && y < .73 && Math.abs(z) < .1) y -= jawFlex * Math.max(0, (x - .4) / .5);
        // 6. Fine tail-feather ripple.
        if (motionRanges.tailFan && vertexIndex >= motionRanges.tailFan[0] && vertexIndex < motionRanges.tailFan[1]) {
          y += Math.sin(motionTime * 2.7 + x * 1.8) * .009;
        }
        // 7. Toe II's sickle claws flex by a few degrees.
        if (motionRanges.sickleClaws.some(([start, end]) => vertexIndex >= start && vertexIndex < end)) {
          y += Math.sin(motionTime * .9 + baseZ * 2) * .006;
        }
        // 8. Hind legs share a restrained, planted weight shift.
        if (x > -.98 && x < -.2 && y < -.2 && y > -1.2) y += weightShift * (z > 0 ? 1 : -1);
        // 9. The small forearms flex close to the chest.
        if (x > .27 && x < .76 && y > -.44 && y < .16) {
          z += Math.sin(motionTime * 1.05 + (z > 0 ? 0 : Math.PI)) * .006;
          y += Math.sin(motionTime * 1.05 + (z > 0 ? 0 : Math.PI)) * .004;
        }
      }
      const rx = x * Math.cos(yaw) + z * Math.sin(yaw), rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
      const ry = y * Math.cos(pitch) - rz * Math.sin(pitch), rz2 = y * Math.sin(pitch) + rz * Math.cos(pitch);
      const perspective = camera / (camera + rz2);
      return { x: width * .49 + (rx + .4) * scale * perspective, y: height * .49 - ry * scale * perspective, z: rz2 };
    });
    const rendered = faces.filter(face => feathersVisible || !face.feather).map(face => {
      const a = projected[face.a], b = projected[face.b], c = projected[face.c];
      const ab = [b.x-a.x,b.y-a.y,b.z-a.z], ac = [c.x-a.x,c.y-a.y,c.z-a.z];
      const normal = [ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
      const norm = Math.hypot(...normal)||1, lit = Math.abs((normal[0]*-.35+normal[1]*.82+normal[2]*.46)/norm);
      const shade = .5 + lit*.5, value = parseInt(face.color.slice(1),16), r = (value>>16)&255, g=(value>>8)&255, bl=value&255;
      return {a,b,c,z:(a.z+b.z+c.z)/3,color:`rgb(${Math.round(r*shade)},${Math.round(g*shade)},${Math.round(bl*shade)})`};
    }).sort((a,b)=>a.z-b.z);
    rendered.forEach(face => {ctx.beginPath();ctx.moveTo(face.a.x,face.a.y);ctx.lineTo(face.b.x,face.b.y);ctx.lineTo(face.c.x,face.c.y);ctx.closePath();ctx.fillStyle=face.color;ctx.fill();ctx.strokeStyle='rgba(17,29,26,.12)';ctx.lineWidth=.45;ctx.stroke();});
    ctx.restore();
  };
  const observer = new ResizeObserver(resize); observer.observe(stage); resize();
  const modelStatus = stage.querySelector('.raptor-status');
  const controls = stage.querySelector('.raptor-controls');
  const featherToggle = stage.querySelector('[data-raptor-feathers]');
  const zoomIn = stage.querySelector('[data-raptor-action="zoom-in"]');
  const zoomOut = stage.querySelector('[data-raptor-action="zoom-out"]');
  let userPaused = reducedMotion;
  let isInView = false, automaticFrame = 0, lastAutomaticFrame = 0, lastPaint = 0;
  let activePointerId = null;
  const announce = (message) => { if (modelStatus) modelStatus.textContent = message; };
  const syncControls = () => {
    if (zoomIn) zoomIn.disabled = zoom >= 1.5;
    if (zoomOut) zoomOut.disabled = zoom <= .55;
    const autoButton = stage.querySelector('[data-raptor-action="autoplay"]');
    if (autoButton) {
      autoButton.setAttribute('aria-pressed', String(!userPaused));
      autoButton.setAttribute('aria-label', reducedMotion ? 'Automatic rotation unavailable while reduced motion is enabled' : userPaused ? 'Resume automatic rotation' : 'Pause automatic rotation');
      autoButton.title = reducedMotion ? 'Automatic rotation is off for reduced motion' : userPaused ? 'Resume automatic rotation' : 'Pause automatic rotation';
      autoButton.textContent = userPaused ? '▶' : 'Ⅱ';
      autoButton.disabled = reducedMotion;
    }
  };
  const stopAutomaticTurn = () => {
    if (automaticFrame) cancelAnimationFrame(automaticFrame);
    automaticFrame = 0; lastAutomaticFrame = 0; lastPaint = 0;
  };
  const startAutomaticTurn = () => {
    if (!reducedMotion && !userPaused && isInView && !document.hidden && !automaticFrame) {
      automaticFrame = requestAnimationFrame(turn);
    }
  };
  const turn = (time) => {
    automaticFrame = 0;
    if (reducedMotion || userPaused || !isInView || document.hidden || stage.matches(':focus-within')) {
      lastAutomaticFrame = 0;
      return;
    }
    if (lastAutomaticFrame) {
      const elapsed = Math.min(50, time - lastAutomaticFrame);
      yaw += elapsed * (Math.PI * 2 / 120000);
      if (time - lastPaint >= 1000 / 30) { draw(); lastPaint = time; }
    }
    lastAutomaticFrame = time;
    automaticFrame = requestAnimationFrame(turn);
  };
  const pauseForUse = () => stopAutomaticTurn();
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const turnObserver = new IntersectionObserver((entries) => {
      isInView = Boolean(entries[0]?.isIntersecting);
      if (isInView) startAutomaticTurn(); else stopAutomaticTurn();
    }, { threshold: 0.08 });
    turnObserver.observe(stage);
  } else {
    isInView = !reducedMotion;
    startAutomaticTurn();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutomaticTurn(); else startAutomaticTurn();
  });
  stage.addEventListener('focusin', pauseForUse);
  stage.addEventListener('focusout', () => requestAnimationFrame(() => {
    if (!stage.matches(':focus-within')) startAutomaticTurn();
  }));
  const setZoom = (next, announceChange = true) => {
    zoom = Math.max(.55, Math.min(1.5, next));
    syncControls();
    draw();
    if (announceChange) announce(`Zoom ${Math.round(zoom * 100)} percent.`);
  };
  const resetView = () => {
    yaw = -.3; pitch = .08; setZoom(.8, false);
    announce('Model view reset to the starting angle and 80 percent zoom.');
  };
  const describeOrientation = () => {
    const direction = ['front three-quarter', 'side', 'rear three-quarter', 'rear', 'front three-quarter'][
      Math.round((((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 2))];
    announce(`Model viewed from the ${direction} angle.`);
  };
  syncControls();
  featherToggle?.addEventListener('click', (event) => {
    event.preventDefault(); event.stopPropagation();
    feathersVisible = !feathersVisible;
    featherToggle.setAttribute('aria-pressed', String(feathersVisible));
    featherToggle.setAttribute('aria-label', `${feathersVisible ? 'Hide' : 'Show'} interpretive body and tail feathers`);
    featherToggle.textContent = `FEATHERS · ${feathersVisible ? 'ON' : 'OFF'}`;
    draw();
    announce(`Interpretive body and tail feathers ${feathersVisible ? 'shown' : 'hidden'}. Forelimbs stay bare.`);
  });
  stage.addEventListener('pointerdown', event => {
    if (event.target.closest('button, a, summary')) return;
    activePointerId = event.pointerId;
    drag = { x: event.clientX, y: event.clientY, started: false, type: event.pointerType };
    if (event.pointerType === 'mouse') { event.preventDefault(); stage.setPointerCapture?.(event.pointerId); }
    event.stopPropagation();
    pauseForUse();
  });
  stage.addEventListener('pointermove', event => {
    if (drag && event.pointerId === activePointerId) {
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.started && Math.hypot(dx, dy) > 4) drag.started = true;
      if (drag.started) {
        drag.x = event.clientX; drag.y = event.clientY;
        yaw += dx * .012;
        if (drag.type !== 'touch') pitch = Math.max(-.55, Math.min(.55, pitch + dy * .008));
        draw();
      }
      return;
    }
    if (!reducedMotion && event.pointerType === 'mouse') {
      const rect = stage.getBoundingClientRect();
      gazeX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
      gazeY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
      draw();
    }
  });
  stage.addEventListener('pointerleave', () => { gazeX=0; gazeY=0; if (!drag) draw(); });
  const stopDrag = event => {
    if (drag && event.pointerId === activePointerId) {
      const moved = drag.started;
      drag = null; activePointerId = null;
      if (moved) describeOrientation();
      if (!userPaused && !stage.matches(':focus-within')) startAutomaticTurn();
    }
  };
  stage.addEventListener('pointerup', stopDrag);
  stage.addEventListener('pointercancel', stopDrag);
  stage.addEventListener('lostpointercapture', stopDrag);
  stage.addEventListener('keydown', event => {
    if (event.target !== stage) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); yaw += event.key === 'ArrowRight' ? .18 : -.18; draw(); describeOrientation();
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault(); pitch = Math.max(-.55, Math.min(.55, pitch + (event.key === 'ArrowUp' ? .12 : -.12))); draw(); announce('Model tilt adjusted.');
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault(); setZoom(zoom + .12);
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault(); setZoom(zoom - .12);
    } else if (event.key === 'Home') {
      event.preventDefault(); resetView();
    } else if (event.key === ' ') {
      event.preventDefault(); userPaused = !userPaused; syncControls();
      announce(userPaused ? 'Automatic rotation paused.' : 'Automatic rotation resumed.');
      if (userPaused) stopAutomaticTurn(); else startAutomaticTurn();
    }
  });
  stage.addEventListener('click', event => {
    const button = event.target.closest('[data-raptor-action]');
    if (!button) return;
    event.preventDefault(); event.stopPropagation();
    const action = button.dataset.raptorAction;
    if (action === 'zoom-in') setZoom(zoom + .12);
    if (action === 'zoom-out') setZoom(zoom - .12);
    if (action === 'reset') resetView();
    if (action === 'autoplay' && !reducedMotion) {
      userPaused = !userPaused; syncControls();
      announce(userPaused ? 'Automatic rotation paused.' : 'Automatic rotation resumed.');
      if (userPaused) stopAutomaticTurn(); else startAutomaticTurn();
    }
  });

});

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


// Selectable planets in the solar-system interface study.
document.querySelectorAll('.space-screen').forEach((screen) => {
  const buttons = Array.from(screen.querySelectorAll('[data-planet]'));
  const focus = screen.querySelector('.space-focus');
  const title = focus?.querySelector('h3');
  const index = focus?.querySelector('small');
  const detail = focus?.querySelector('span');
  if (!buttons.length || !focus || !title || !index || !detail) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((planet) => {
        const selected = planet === button;
        planet.classList.toggle('active', selected);
        planet.setAttribute('aria-pressed', String(selected));
      });
      screen.dataset.selectedPlanet = button.dataset.planet;
      title.textContent = button.dataset.planet;
      index.textContent = `PLANET / ${button.dataset.planetOrder}`;
      detail.textContent = button.dataset.planetDescription;
    });
  });
});


// Interactive 3D architectural study: mouse/touch drag, keyboard rotation and lighting.
document.querySelectorAll('[data-spatial-screen]').forEach((screen) => {
  const model = screen.querySelector('[data-spatial-model]');
  if (!model) return;
  let yaw = -14;
  let pitch = 0;
  const paint = () => {
    model.style.setProperty('--spatial-yaw', `${yaw}deg`);
    model.style.setProperty('--spatial-pitch', `${pitch}deg`);
  };
  let pointer = null;
  model.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.stopPropagation();
    pointer = {x:event.clientX,y:event.clientY,yaw,pitch};
    model.dataset.dragging = 'true';
    model.setPointerCapture?.(event.pointerId);
  });
  model.addEventListener('pointermove', (event) => {
    if (!pointer) return;
    event.stopPropagation();
    yaw = pointer.yaw + (event.clientX - pointer.x) * .72;
    pitch = Math.max(-8, Math.min(18, pointer.pitch + (event.clientY - pointer.y) * -.28));
    paint();
  });
  const finish = (event) => {
    if (event) event.stopPropagation();
    pointer = null;
    delete model.dataset.dragging;
  };
  model.addEventListener('pointerup', finish);
  model.addEventListener('pointercancel', finish);
  model.addEventListener('lostpointercapture', finish);
  model.addEventListener('keydown', (event) => {
    if (event.target !== model) return;
    const step = event.shiftKey ? 18 : 10;
    if (event.key === 'ArrowLeft') yaw -= step;
    else if (event.key === 'ArrowRight') yaw += step;
    else if (event.key === 'ArrowUp') pitch = Math.max(-8, pitch - 6);
    else if (event.key === 'ArrowDown') pitch = Math.min(18, pitch + 6);
    else return;
    event.preventDefault();
    event.stopPropagation();
    paint();
  });
  screen.querySelectorAll('[data-spatial-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (button.dataset.spatialAction === 'reset') {
        yaw = -14;
        pitch = 0;
        paint();
        model.focus({preventScroll:true});
      } else if (button.dataset.spatialAction === 'light' && button.hasAttribute('data-room-target')) {
        const target = button.dataset.roomTarget === 'addition' ? 'addition' : 'main';
        const unit = model.querySelector(`.room-${target}`);
        if (!unit) return;
        const cool = unit.dataset.light !== 'cool';
        const roomNumber = target === 'main' ? '01' : '02';
        unit.dataset.light = cool ? 'cool' : 'warm';
        button.setAttribute('aria-pressed', String(cool));
        button.textContent = `${roomNumber} · ${cool ? 'COOL' : 'WARM'}`;
        button.setAttribute('aria-label', `Switch Room ${roomNumber} to ${cool ? 'warm' : 'cool'} lighting`);
        const status = screen.querySelector('[data-room-status]');
        if (status) status.textContent = `Room ${roomNumber} ${cool ? 'cool' : 'warm'} lighting selected.`;
      }
    });
  });
});


// Keep one neural node illuminated at all times, moving quickly through the network.
document.querySelectorAll('.study-neural').forEach((study) => {
  const nodes = Array.from(study.querySelectorAll('.neural-nodes circle'));
  if (nodes.length < 3) return;
  const buttons = Array.from(study.querySelectorAll('[data-neural-view]'));
  const caption = study.querySelector('.neural-copy p');
  const captions = {
    design: 'Connect layers and define the model.',
    train: 'Watch signals move through the network.',
    inspect: 'Review the model output and activity.'
  };
  buttons.forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const view = button.dataset.neuralView;
    study.dataset.neuralView = view;
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    if (caption) caption.textContent = captions[view] || captions.design;
  }));

  let currentNode = 0;
  const setLitNode = () => nodes.forEach((node, index) => node.classList.toggle('is-lit', index === currentNode));
  setLitNode();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let visible = !('IntersectionObserver' in window);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      visible = Boolean(entries[0]?.isIntersecting);
    }, { threshold: 0.08 });
    observer.observe(study);
  }
  window.setInterval(() => {
    if (document.hidden || !visible) return;
    currentNode = (currentNode + 1) % nodes.length;
    setLitNode();
  }, 1100);
});


// Room planner: move pieces freely under the pointer, then settle them on each room's own floor grid.
document.querySelectorAll('[data-spatial-screen]').forEach((screen) => {
  const model = screen.querySelector('[data-room-drop-surface]');
  const roomStatus = screen.querySelector('[data-room-status]');
  const roomLabel = screen.querySelector('[data-room-label]');
  const addRoomButton = screen.querySelector('[data-room-action="add-room"]');
  const removeRoomButton = screen.querySelector('[data-room-action="remove-room"]');
  const lightButton = screen.querySelector('[data-room-light-toggle]');
  if (!model || !roomLabel) return;

  const gridSteps = 8;
  let activeRoom = 'main';
  let selectedPiece = null;
  let toolDrag = null;
  let ghost = null;
  const announce = (message) => { if (roomStatus) roomStatus.textContent = message; };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const floorByName = (name) => model.querySelector(`[data-room-floor="${name}"]`);
  const floorsAtPoint = (x, y) => {
    if (typeof document.elementsFromPoint !== 'function') return [];
    return document.elementsFromPoint(x, y)
      .map((element) => element.closest?.('[data-room-floor]'))
      .filter((floor, index, all) => floor && screen.contains(floor) && all.indexOf(floor) === index);
  };
  const floorLayer = (floor) => floor?.closest('.room-main,.room-addition')?.querySelector('[data-room-furniture]');
  const placeOnGrid = (piece, floor, column, row) => {
    const layer = floorLayer(floor);
    if (!layer) return;
    if (piece.parentElement !== layer) layer.append(piece);
    const col = clamp(Math.round(column), 1, gridSteps - 1);
    const r = clamp(Math.round(row), 1, gridSteps - 1);
    piece.style.left = `${(col / gridSteps) * 100}%`;
    piece.style.top = `${(r / gridSteps) * 100}%`;
    piece.dataset.gridColumn = String(col);
    piece.dataset.gridRow = String(r);
    piece.dataset.roomFloor = floor.dataset.roomFloor;
    const type = piece.dataset.roomPiece === 'chair' ? 'Chair' : 'Couch';
    piece.setAttribute('aria-label', `${type}, grid column ${col}, row ${r}. Selected. Drag to move or use arrow keys.`);
  };
  const placeDuringDrag = (piece, floor, column, row) => {
    const layer = floorLayer(floor);
    if (!layer) return;
    if (piece.parentElement !== layer) layer.append(piece);
    piece.style.left = `${(clamp(column,1,gridSteps-1) / gridSteps) * 100}%`;
    piece.style.top = `${(clamp(row,1,gridSteps-1) / gridSteps) * 100}%`;
    piece.dataset.roomFloor = floor.dataset.roomFloor;
  };
  const gridPositionAt = (floor, x, y) => {
    const quad = floor.getBoxQuads?.()[0];
    const cornerPoints = ['tl','tr','br','bl'].map((corner) => {
      const marker = floor.querySelector(`[data-grid-corner="${corner}"]`);
      if (!marker) return null;
      const rect = marker.getBoundingClientRect();
      return {x:rect.left,y:rect.top};
    });
    const shape = quad || (cornerPoints.every(Boolean) ? {p1:cornerPoints[0],p2:cornerPoints[1],p3:cornerPoints[2],p4:cornerPoints[3]} : null);
    let u, v;
    if (shape) {
      const {p1,p2,p3,p4} = shape;
      const dx1=p2.x-p3.x, dx2=p4.x-p3.x, dx3=p1.x-p2.x+p3.x-p4.x;
      const dy1=p2.y-p3.y, dy2=p4.y-p3.y, dy3=p1.y-p2.y+p3.y-p4.y;
      const denominator=dx1*dy2-dx2*dy1;
      if (Math.abs(denominator)>.0001) {
        const g=(dx3*dy2-dx2*dy3)/denominator, h=(dx1*dy3-dx3*dy1)/denominator;
        const a=p2.x-p1.x+g*p2.x, b=p4.x-p1.x+h*p4.x, c=p1.x;
        const d=p2.y-p1.y+g*p2.y, e=p4.y-p1.y+h*p4.y, f=p1.y;
        u=.5; v=.5;
        for (let i=0;i<8;i++) {
          const w=g*u+h*v+1, px=(a*u+b*v+c)/w, py=(d*u+e*v+f)/w;
          const rx=x-px, ry=y-py;
          const xu=(a*w-g*(a*u+b*v+c))/(w*w), xv=(b*w-h*(a*u+b*v+c))/(w*w);
          const yu=(d*w-g*(d*u+e*v+f))/(w*w), yv=(e*w-h*(d*u+e*v+f))/(w*w);
          const jacobian=xu*yv-xv*yu;
          if (Math.abs(jacobian)<.0001) break;
          u+=(rx*yv-xv*ry)/jacobian;
          v+=(xu*ry-rx*yu)/jacobian;
        }
      }
    }
    if (!Number.isFinite(u) || !Number.isFinite(v)) {
      const rect=floor.getBoundingClientRect();
      u=(x-rect.left)/Math.max(rect.width,1);
      v=(y-rect.top)/Math.max(rect.height,1);
    }
    return {column:clamp(u*gridSteps,1,gridSteps-1),row:clamp(v*gridSteps,1,gridSteps-1)};
  };
  const setActiveRoom = (name, shouldAnnounce = true) => {
    const room = name === 'addition' ? 'addition' : 'main';
    if (room === 'addition' && screen.dataset.roomAdded !== 'true') return;
    activeRoom = room;
    model.querySelectorAll('.room-main,.room-addition').forEach((unit) => {
      unit.dataset.active = String(unit.classList.contains(`room-${room}`));
    });
    const number = room === 'main' ? '01' : '02';
    const unit = model.querySelector(`.room-${room}`);
    roomLabel.textContent = `ROOM ${number}`;
    if (lightButton && unit) {
      const cool = unit.dataset.light === 'cool';
      lightButton.textContent = `${number} · ${cool ? 'COOL' : 'WARM'}`;
      lightButton.setAttribute('aria-pressed', String(cool));
      lightButton.setAttribute('aria-label', `Switch Room ${number} to ${cool ? 'warm' : 'cool'} lighting`);
    }
    if (shouldAnnounce) announce(`Room ${number} selected. Choose warm or cool lighting.`);
  };
  const selectPiece = (piece) => {
    selectedPiece = piece;
    model.querySelectorAll('[data-room-piece]').forEach((item) => {
      const active = item === piece;
      item.setAttribute('aria-pressed', String(active));
      item.dataset.selected = String(active);
    });
    if (piece) setActiveRoom(piece.dataset.roomFloor === 'addition' ? 'addition' : 'main',false);
  };
  const addFurniture = (action, floor = floorByName(activeRoom), point = null) => {
    if (!floor) return null;
    const layer = floorLayer(floor);
    if (!layer) return null;
    const pieces = Array.from(layer.querySelectorAll(`[data-room-piece="${action}"]`));
    if (pieces.length >= 3) {
      announce(`Three ${action}s are already in the room.`);
      return null;
    }
    const piece = document.createElement('button');
    piece.type = 'button';
    piece.className = `room-piece room-${action}`;
    piece.dataset.roomPiece = action;
    piece.dataset.selected = 'false';
    piece.setAttribute('aria-pressed','false');
    const cell = point ? gridPositionAt(floor,point.x,point.y) : action === 'chair'
      ? {column:Math.min(2+pieces.length*2,6),row:6}
      : {column:Math.min(5+pieces.length,7),row:5};
    layer.append(piece);
    placeOnGrid(piece,floor,cell.column,cell.row);
    piece.addEventListener('pointerdown',(event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault(); event.stopPropagation();
      selectPiece(piece); piece.focus({preventScroll:true});
      piece.dataset.dragging = 'true';
      piece._roomPointer = {id:event.pointerId,moved:false,floor};
      try { piece.setPointerCapture(event.pointerId); } catch {}
    });
    piece.addEventListener('pointermove',(event) => {
      const pointer=piece._roomPointer;
      if (!pointer || pointer.id!==event.pointerId) return;
      const targetFloor=floorsAtPoint(event.clientX,event.clientY)[0] || floorByName(piece.dataset.roomFloor);
      if (!targetFloor) return;
      const next=gridPositionAt(targetFloor,event.clientX,event.clientY);
      pointer.moved=true; pointer.floor=targetFloor; pointer.column=next.column; pointer.row=next.row;
      placeDuringDrag(piece,targetFloor,next.column,next.row);
    });
    const finish = (event) => {
      const pointer=piece._roomPointer;
      if (!pointer || pointer.id!==event.pointerId) return;
      piece._roomPointer=null; delete piece.dataset.dragging;
      if (pointer.moved) {
        const targetFloor=floorsAtPoint(event.clientX,event.clientY)[0];
        if (targetFloor) {
          const next=gridPositionAt(targetFloor,event.clientX,event.clientY);
          placeOnGrid(piece,targetFloor,next.column,next.row);
        } else placeOnGrid(piece,pointer.floor,pointer.column,pointer.row);
      }
      const type=action==='chair'?'Chair':'Couch';
      announce(`${type} on column ${piece.dataset.gridColumn}, row ${piece.dataset.gridRow}.`);
    };
    piece.addEventListener('pointerup',finish);
    piece.addEventListener('pointercancel',finish);
    piece.addEventListener('lostpointercapture',(event) => {
      if (piece._roomPointer) finish(event);
    });
    piece.addEventListener('click',(event) => { event.stopPropagation(); selectPiece(piece); });
    piece.addEventListener('keydown',(event) => {
      const deltas={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      if (deltas[event.key]) {
        event.preventDefault(); event.stopPropagation();
        const mult=event.shiftKey?2:1, [dx,dy]=deltas[event.key];
        const nextFloor=floorByName(piece.dataset.roomFloor);
        placeOnGrid(piece,nextFloor,Number(piece.dataset.gridColumn)+dx*mult,Number(piece.dataset.gridRow)+dy*mult);
        selectPiece(piece); announce(`${action==='chair'?'Chair':'Couch'} moved to column ${piece.dataset.gridColumn}, row ${piece.dataset.gridRow}.`);
      } else if (event.key==='Delete' || event.key==='Backspace') {
        event.preventDefault(); event.stopPropagation();
        const parent=piece.parentElement; piece.remove(); selectedPiece=null;
        (parent.querySelector('[data-room-piece]') || model).focus({preventScroll:true});
        announce(`${action==='chair'?'Chair':'Couch'} removed.`);
      } else if (event.key==='Escape') {
        event.preventDefault(); event.stopPropagation(); selectPiece(null);
      }
    });
    piece.focus({preventScroll:true}); selectPiece(piece);
    announce(`${action==='chair'?'Chair':'Couch'} placed on the floor grid.`);
    return piece;
  };

  model.querySelectorAll('[data-room-floor]').forEach((floor) => {
    floor.addEventListener('pointerdown',(event) => event.stopPropagation());
    floor.addEventListener('click',(event) => { event.stopPropagation(); setActiveRoom(floor.dataset.roomFloor); });
    floor.addEventListener('keydown',(event) => {
      if (event.key!=='Enter' && event.key!==' ') return;
      event.preventDefault(); event.stopPropagation(); setActiveRoom(floor.dataset.roomFloor);
    });
  });
  const setRoomAdded = (added) => {
    const addition=model.querySelector('.room-addition');
    if (!added) {
      model.querySelectorAll('.room-addition [data-room-piece]').forEach((piece) => {
        placeOnGrid(piece,floorByName('main'),Number(piece.dataset.gridColumn),Number(piece.dataset.gridRow));
      });
      if (addition) addition.setAttribute('aria-hidden','true');
      if (activeRoom==='addition') activeRoom='main';
    } else if (addition) addition.setAttribute('aria-hidden','false');
    screen.dataset.roomAdded=String(added);
    if (addRoomButton) addRoomButton.disabled=added;
    if (removeRoomButton) removeRoomButton.disabled=!added;
    setActiveRoom(activeRoom,false);
    announce(added?'A second room was added beside the first.':'Second room removed.');
  };
  addRoomButton?.addEventListener('click',(event) => { event.preventDefault(); event.stopPropagation(); setRoomAdded(true); });
  removeRoomButton?.addEventListener('click',(event) => { event.preventDefault(); event.stopPropagation(); setRoomAdded(false); });
  lightButton?.addEventListener('click',(event) => {
    event.preventDefault(); event.stopPropagation();
    const unit=model.querySelector(`.room-${activeRoom}`);
    if (!unit) return;
    unit.dataset.light=unit.dataset.light==='cool'?'warm':'cool';
    setActiveRoom(activeRoom,false);
    announce(`Room ${activeRoom==='main'?'01':'02'} ${unit.dataset.light} lighting selected.`);
  });

  const moveGhost = (x,y,action) => {
    if (!ghost) { ghost=document.createElement('div'); ghost.className='room-drag-ghost'; ghost.setAttribute('aria-hidden','true'); document.body.append(ghost); }
    ghost.textContent=action==='chair'?'CHAIR':'COUCH'; ghost.style.left=`${x}px`; ghost.style.top=`${y}px`;
  };
  const clearGhost = () => { ghost?.remove(); ghost=null; };
  screen.querySelectorAll('[data-room-action="chair"],[data-room-action="couch"]').forEach((button) => {
    const action=button.dataset.roomAction;
    button.addEventListener('click',(event) => {
      event.preventDefault(); event.stopPropagation();
      if (button.dataset.skipNextClick==='true') { delete button.dataset.skipNextClick; return; }
      addFurniture(action,floorByName(activeRoom));
    });
    button.addEventListener('pointerdown',(event) => {
      if (event.pointerType==='mouse' && event.button!==0) return;
      toolDrag={button,action,id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
      try { button.setPointerCapture(event.pointerId); } catch {}
    });
  });
  window.addEventListener('pointermove',(event) => {
    if (!toolDrag || toolDrag.id!==event.pointerId) return;
    if (!toolDrag.moved && Math.hypot(event.clientX-toolDrag.x,event.clientY-toolDrag.y)<7) return;
    toolDrag.moved=true; moveGhost(event.clientX,event.clientY,toolDrag.action);
  },{passive:true});
  window.addEventListener('pointerup',(event) => {
    if (!toolDrag || toolDrag.id!==event.pointerId) return;
    const drag=toolDrag; toolDrag=null; clearGhost();
    if (!drag.moved) return;
    drag.button.dataset.skipNextClick='true'; window.setTimeout(()=>{delete drag.button.dataset.skipNextClick;},400);
    const floor=floorsAtPoint(event.clientX,event.clientY)[0];
    if (floor) addFurniture(drag.action,floor,{x:event.clientX,y:event.clientY});
    else announce('Drop the furniture inside a room on its floor grid.');
  });
  window.addEventListener('pointercancel',() => { toolDrag=null; clearGhost(); });
  setActiveRoom('main',false);
});
// Playable word slots: click a tile then a blank slot, drag between them, or use keyboard activation.
document.querySelectorAll('.learning-screen').forEach((screen) => {
  const slots = Array.from(screen.querySelectorAll('[data-word-slot]'));
  const tiles = Array.from(screen.querySelectorAll('[data-letter-tile]'));
  const status = screen.querySelector('[data-learning-status]');
  const feedback = screen.querySelector('[data-learning-feedback]');
  let selectedLetter = '';
  let activePointer = null;
  if (!slots.length || !tiles.length) return;

  const announce = (message, success = false) => {
    if (status) status.textContent = message;
    if (feedback) {
      feedback.textContent = message;
      feedback.dataset.success = String(success);
    }
  };
  const selectTile = (tile) => {
    selectedLetter = tile?.dataset.letterTile || '';
    tiles.forEach((candidate) => candidate.dataset.selected = String(candidate === tile));
    if (selectedLetter) announce(`Letter ${selectedLetter} selected. Choose an empty slot.`);
  };
  const wordList = new Set(['camp','cams','cads','caps','card','carp','cars','cart','cast','cats']);
  const tilePalette = {t:['#c8def0','#263a53'],m:['#f1c8c4','#4b3239'],p:['#f2dfa7','#4a3d27'],r:['#c2e2d4','#29443a'],s:['#dfd2f2','#403853'],d:['#f2cba7','#4e3a2a'],x:['#cad9f0','#2f3b56']};
  const currentWord = () => slots.map((item) => item.textContent.trim()).filter((value) => value !== '_').join('').toLowerCase();
  const reportWord = () => {
    const word = currentWord();
    if (word.length < 4) return announce(word ? `Current word: ${word.toUpperCase()}. Complete all four letters.` : 'Choose letters to make a word.');
    if (wordList.has(word)) announce(`Great! ${word.toUpperCase()} is an English word in this level.`, true);
    else announce(`${word.toUpperCase()} is not in this level’s English word list. Try another combination.`);
  };
  const clearSlot = (slot) => {
    if (!slot) return;
    slot.textContent = '_';
    slot.dataset.filled = 'false';
    slot.style.removeProperty('background-color');
    slot.style.removeProperty('color');
    slot.style.removeProperty('border-color');
    const ordinal = ['first','second','third','fourth'][slots.indexOf(slot)] || 'next';
    slot.setAttribute('aria-label', `${ordinal} letter, empty`);
  };
  const place = (slot, letter, sourceTile = tiles.find((tile) => tile.dataset.letterTile === letter)) => {
    if (!slot || !letter || slot.dataset.filled === 'true') return;
    slot.textContent = letter;
    slot.dataset.filled = 'true';
    if (sourceTile) {
      const [tileColor, textColor] = tilePalette[sourceTile.dataset.letterTile] || ['#fff8d6','#20324f'];
      slot.style.setProperty('background-color', tileColor, 'important');
      slot.style.setProperty('color', textColor, 'important');
      slot.style.setProperty('border-color', 'rgba(35,48,67,.28)', 'important');
    }
    const slotNumber = slots.indexOf(slot) + 1;
    const ordinal = ['first','second','third','fourth'][slotNumber - 1] || `${slotNumber}th`;
    slot.setAttribute('aria-label', `${ordinal} letter, ${letter}`);
    selectedLetter = '';
    tiles.forEach((tile) => tile.dataset.selected = 'false');
    reportWord();
  };

  tiles.forEach((tile) => {
    tile.draggable = false;
    tile.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      event.stopPropagation();
      activePointer = {id:event.pointerId, tile, x:event.clientX, y:event.clientY, moved:false, ghost:null};
      selectedLetter = tile.dataset.letterTile || '';
      tile.dataset.dragging = 'false';
      try { tile.setPointerCapture(event.pointerId); } catch {}
      announce(`Letter ${selectedLetter} ready to move.`);
    });
    tile.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (tile.dataset.ignoreClick === 'true') {
        tile.dataset.ignoreClick = 'false';
        return;
      }
      selectTile(tile);
    });
    tile.addEventListener('dragstart', (event) => event.preventDefault());
    tile.addEventListener('pointercancel', () => {
      if (activePointer?.tile === tile) activePointer = null;
      tile.dataset.dragging = 'false';
    });
  });

  window.addEventListener('pointermove', (event) => {
    if (!activePointer || event.pointerId !== activePointer.id) return;
    const distance = Math.hypot(event.clientX - activePointer.x, event.clientY - activePointer.y);
    if (distance > 6) {
      activePointer.moved = true;
      activePointer.tile.dataset.dragging = 'true';
      if (!activePointer.ghost) {
        const tile = activePointer.tile;
        const style = getComputedStyle(tile);
        const rect = tile.getBoundingClientRect();
        const ghost = tile.cloneNode(true);
        ghost.removeAttribute('id');
        ghost.setAttribute('aria-hidden','true');
        ghost.tabIndex = -1;
        Object.assign(ghost.style, {
          position:'fixed', left:`${event.clientX}px`, top:`${event.clientY}px`,
          width:`${rect.width}px`, height:`${rect.height}px`, margin:'0', zIndex:'9999',
          pointerEvents:'none', transform:'translate(-50%,-50%) scale(1.12)',
          display:'grid', placeItems:'center', color:style.color, background:style.background,
          border:style.border, borderRadius:style.borderRadius, font:style.font,
          boxShadow:'0 8px 22px rgba(17,38,48,.3)', opacity:'.96'
        });
        document.body.append(ghost);
        activePointer.ghost = ghost;
      }
      activePointer.ghost.style.left = `${event.clientX}px`;
      activePointer.ghost.style.top = `${event.clientY}px`;
    }
  }, {passive:true});

  window.addEventListener('pointerup', (event) => {
    if (!activePointer || event.pointerId !== activePointer.id) return;
    const {tile, moved} = activePointer;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const slot = target?.closest?.('[data-word-slot]');
    tile.dataset.dragging = 'false';
    activePointer.ghost?.remove();
    tile.dataset.ignoreClick = 'true';
    if (moved && slot && screen.contains(slot)) place(slot, tile.dataset.letterTile || '');
    else if (moved) announce('Drop the letter into an empty space.');
    else selectTile(tile);
    activePointer = null;
    window.setTimeout(() => { tile.dataset.ignoreClick = 'false'; }, 0);
  });
  window.addEventListener('pointercancel', (event) => {
    if (!activePointer || event.pointerId !== activePointer.id) return;
    activePointer.ghost?.remove();
    activePointer.tile.dataset.dragging = 'false';
    activePointer = null;
  });

  slots.forEach((slot) => {
    slot.addEventListener('click', (event) => {
      event.stopPropagation();
      if (selectedLetter) place(slot, selectedLetter);
      else if (slot.dataset.filled === 'true') {
        clearSlot(slot);
        reportWord('Letter cleared.');
      }
    });
    slot.addEventListener('dragover', (event) => event.preventDefault());
    slot.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      place(slot, event.dataTransfer?.getData('text/plain') || selectedLetter);
    });
  });

  screen.querySelector('[data-learning-reset]')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const lastAdded = slots.slice(2).filter((slot) => slot.dataset.filled === 'true').pop();
    if (lastAdded) clearSlot(lastAdded);
    selectedLetter = '';
    tiles.forEach((tile) => {
      tile.dataset.selected = 'false';
      tile.dataset.dragging = 'false';
    });
    announce(lastAdded ? 'Last letter undone.' : 'No added letters to undo.');
  });
});

// Map-layer controls make the wayfinding concept legible and selectable.
document.querySelectorAll('.wayfinding-screen').forEach((screen) => {
  const controls = Array.from(screen.querySelectorAll('[data-wayfinding-layer]'));
  controls.forEach((control) => control.addEventListener('click', (event) => {
    event.preventDefault();event.stopPropagation();
    const layer = control.dataset.wayfindingLayer;
    screen.dataset.layer = layer;
    const modeLabel = screen.querySelector('.wayfinding-top span:last-child');
    if (modeLabel) modeLabel.textContent = `${layer.toUpperCase()} MAP`;
    controls.forEach((item) => item.setAttribute('aria-pressed', String(item === control)));
  }));
});

// Run orbit and star motion only while the solar-system study is on screen.
const orbitalScreens = document.querySelectorAll('.study-space .space-screen');
if (!reducedMotion && orbitalScreens.length && 'IntersectionObserver' in window) {
  const orbitalObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.dataset.orbitVisible = String(entry.isIntersecting));
  }, { threshold: 0.08 });
  orbitalScreens.forEach((screen) => orbitalObserver.observe(screen));
}


/* Test 6 mental health study: selectable, keyboard-friendly support routes. */
(() => {
  document.querySelectorAll('[data-care-widget]').forEach((widget) => {
    const choices = Array.from(widget.querySelectorAll('[data-care-choice]'));
    const response = widget.querySelector('.care-response');
    const templates = new Map(Array.from(widget.querySelectorAll('template[data-care-template]'), (template) => [template.dataset.careTemplate, template]));
    const baseContent = Array.from(widget.querySelectorAll('.care-top,.care-intro,.care-options,.care-crisis'));
    let returnFocus = null;
    if (!choices.length || !response) return;

    const closeResponse = (restoreFocus = true) => {
      response.hidden = true;
      response.replaceChildren();
      widget.classList.remove('care-response-open');
      baseContent.forEach((element) => { element.inert = false; });
      choices.forEach((choice) => choice.setAttribute('aria-pressed', 'false'));
      if (restoreFocus && returnFocus) returnFocus.focus();
    };

    choices.forEach((choice) => {
      choice.addEventListener('click', () => {
        const template = templates.get(choice.dataset.careChoice);
        if (!template) return;
        returnFocus = choice;
        choices.forEach((item) => item.setAttribute('aria-pressed', String(item === choice)));
        response.replaceChildren(template.content.cloneNode(true));
        response.hidden = false;
        widget.classList.add('care-response-open');
        baseContent.forEach((element) => { element.inert = true; });
        const heading = response.querySelector('h4');
        if (heading) {
          heading.tabIndex = -1;
          heading.focus();
        }
        response.querySelector('[data-care-back]')?.addEventListener('click', () => closeResponse(true));
      });
    });

    widget.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !response.hidden) {
        event.preventDefault();
        closeResponse(true);
      }
    });
  });
})();

/* Accessible information study: restore working schedule/help actions and keep the text preview. */
(() => {
  const content = {
    schedule: {
      kicker: 'SAMPLE DAY · PREVIEW ONLY',
      title: 'A little structure, with room to change.',
      copy: 'A real schedule would show the next useful steps here. This sample is illustrative; it is not connected to a personal calendar.',
      note: 'Choose one task, add a break, and change the plan whenever you need.'
    },
    help: {
      kicker: 'HELP WHEN YOU NEED IT',
      title: 'Start with what would help.',
      copy: 'You can ask someone to listen, help with one next step, or find a local service. This preview does not connect you to a live support person.',
      note: 'Immediate danger? Call 9-1-1.\nSuicide crisis? Call or text 9-8-8.'
    }
  };
  document.querySelectorAll('.study-accessible').forEach((study) => {
    const screen = study.querySelector('.study-screen');
    const popup = study.querySelector('[data-accessible-popup]');
    const actions = [...study.querySelectorAll('[data-accessible-action]')];
    const close = study.querySelector('[data-accessible-close]');
    const kicker = study.querySelector('[data-accessible-kicker]');
    const title = study.querySelector('[data-accessible-title]');
    const copy = study.querySelector('[data-accessible-copy]');
    const note = study.querySelector('[data-accessible-note]');
    if (!screen || !popup || !actions.length || !close) return;
    let returnFocus = null;
    let backgroundInertState = [];
    const focusableInPopup = () => [...popup.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    const closePopup = (restoreFocus = true) => {
      popup.hidden = true;
      actions.forEach((button) => button.setAttribute('aria-expanded', 'false'));
      backgroundInertState.forEach(([element, wasInert]) => { element.inert = wasInert; });
      backgroundInertState = [];
      if (restoreFocus && returnFocus) returnFocus.focus();
    };
    actions.forEach((button) => button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const selected = content[button.dataset.accessibleAction];
      if (!selected) return;
      returnFocus = button;
      kicker.textContent = selected.kicker;
      title.textContent = selected.title;
      copy.textContent = selected.copy;
      note.textContent = selected.note;
      actions.forEach((item) => item.setAttribute('aria-expanded', String(item === button)));
      backgroundInertState = [...screen.children]
        .filter((element) => element !== popup)
        .map((element) => [element, element.inert]);
      backgroundInertState.forEach(([element]) => { element.inert = true; });
      popup.hidden = false;
      title.focus();
    }));
    close.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      closePopup(true);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && !popup.hidden) {
        const stops = focusableInPopup();
        if (!stops.length) {
          event.preventDefault();
          title.focus();
          return;
        }
        const first = stops[0];
        const last = stops[stops.length - 1];
        const focusIsOutsidePopup = !popup.contains(document.activeElement) && document.activeElement !== title;
        if (focusIsOutsidePopup) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === title)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === title)) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === 'Escape' && !popup.hidden) {
        event.preventDefault();
        closePopup(true);
      }
    }, true);
  });
})();

/* Show the current card model at full size in the specimen dialog. */
document.querySelectorAll('[data-raptor-specimen-dialog]').forEach((dialog) => {
  const open = document.querySelector(`[aria-controls="${dialog.id}"][data-raptor-specimen-open]`);
  const close = dialog.querySelector('[data-raptor-specimen-close]');
  const slot = dialog.querySelector('[data-raptor-specimen-stage]');
  const stage = document.querySelector('[data-raptor-view]');
  if (!open || !close || !slot || !stage || typeof dialog.showModal !== 'function') return;
  const placeholder = document.createComment('Velociraptor canvas return position');
  open.addEventListener('click', () => {
    stage.parentNode.insertBefore(placeholder, stage);
    slot.append(stage);
    dialog.showModal();
    window.dispatchEvent(new Event('resize'));
  });
  const restoreStage = () => {
    if (placeholder.parentNode) {
      placeholder.parentNode.insertBefore(stage, placeholder);
      placeholder.remove();
      window.dispatchEvent(new Event('resize'));
    }
  };
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', restoreStage);
});


/* Test 6 care and bedding preview interactions. */
(() => {
  const petCopy = {
    companions: ['MEET THE COMPANIONS', 'Portraits, everyday routines, and the small details that make each companion their own.', 'Sample editorial content'],
    care: ['CARE, AT A GLANCE', 'Browse routine grooming, feeding, and activity checklists. For individual health concerns, speak with a veterinary professional.', 'General information only; not veterinary advice'],
    notes: ['FIELD NOTES', 'Short stories about training, companionship, and the everyday moments worth remembering.', 'Sample editorial content']
  };
  document.querySelectorAll('[data-pet-study]').forEach((study) => {
    const open = study.querySelector('.pet-open');
    const panel = study.querySelector('.pet-panel');
    const heading = study.querySelector('[data-pet-heading]');
    const copy = study.querySelector('[data-pet-copy]');
    const status = study.querySelector('[data-pet-status]');
    const tabs = [...study.querySelectorAll('[data-pet-topic]')];
    const close = study.querySelector('.pet-close');
    if (!open || !panel || !copy) return;
    const select = (name, moveFocus = false) => {
      const tab = tabs.find((item) => item.dataset.petTopic === name);
      const entry = petCopy[name];
      if (!tab || !entry) return;
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      copy.setAttribute('aria-labelledby', tab.id);
      copy.innerHTML = '<p class="pet-overline"></p><p></p><span></span>';
      const lines = copy.querySelectorAll('p, span');
      lines[0].textContent = entry[0];
      lines[1].textContent = entry[1];
      lines[2].textContent = entry[2];
      status.textContent = entry[0] + '. ' + entry[1];
      if (moveFocus) tab.focus();
    };
    const closePanel = (restore = true) => {
      panel.hidden = true;
      open.setAttribute('aria-expanded', 'false');
      if (restore) open.focus();
    };
    open.addEventListener('click', () => {
      panel.hidden = false;
      open.setAttribute('aria-expanded', 'true');
      heading.focus();
    });
    close?.addEventListener('click', () => closePanel(true));
    tabs.forEach((tab, index) => tab.addEventListener('click', () => select(tab.dataset.petTopic)));
    study.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault();
        closePanel(true);
        return;
      }
      const current = event.target.closest('[data-pet-topic]');
      if (!current) return;
      const index = tabs.indexOf(current);
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[next].dataset.petTopic, true);
    });
  });

  const fabricPrices = { 'Washed linen': 148, 'Cotton percale': 118, 'Textured hemp': 168 };
  document.querySelectorAll('[data-bedding-study]').forEach((study) => {
    const panel = study.querySelector('.bedding-panel');
    const heading = study.querySelector('[data-bedding-heading]');
    const openers = [...study.querySelectorAll('[data-bedding-open]')];
    const tabs = [...study.querySelectorAll('.bedding-tabs [data-bedding-tab]')];
    const copy = study.querySelector('[data-bedding-copy]');
    const status = study.querySelector('[data-bedding-status]');
    const fabricButtons = [...study.querySelectorAll('[data-bedding-fabric]')];
    const sizeButtons = [...study.querySelectorAll('[data-bedding-size]')];
    const countOutput = study.querySelector('[data-bedding-count]');
    const price = study.querySelector('[data-bedding-price]');
    const bag = study.querySelector('.bedding-bag');
    const bagStatus = study.querySelector('[data-bedding-bag-status]');
    let selectedFabric = 'Washed linen';
    let selectedSize = 'Queen';
    let quantity = 1;
    const viewName = (view) => view.charAt(0).toUpperCase() + view.slice(1);
    const selectTab = (name, focus = false) => {
      const tab = tabs.find((item) => item.dataset.beddingTab === name);
      if (!tab || !copy) return;
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      copy.setAttribute('aria-labelledby', tab.id);
      copy.querySelectorAll('[data-bedding-view]').forEach((view) => { view.hidden = view.dataset.beddingView !== name; });
      if (heading) heading.textContent = name === 'linen' ? 'Choose your linen' : name === 'bedroom' ? 'A room to unwind' : 'Care notes';
      if (focus) tab.focus();
      status.textContent = viewName(name) + ' details opened.';
    };
    const closePanel = (restore = true) => {
      panel.hidden = true;
      if (restore) lastOpener?.focus();
    };
    let lastOpener = null;
    openers.forEach((button) => button.addEventListener('click', () => {
      lastOpener = button;
      panel.hidden = false;
      selectTab(button.dataset.beddingTab || 'linen');
      heading?.focus();
    }));
    study.querySelector('.bedding-close')?.addEventListener('click', () => closePanel(true));
    tabs.forEach((tab, index) => tab.addEventListener('click', () => selectTab(tab.dataset.beddingTab)));
    study.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault();
        closePanel(true);
        return;
      }
      const current = event.target.closest('.bedding-tabs [data-bedding-tab]');
      if (!current) return;
      const index = tabs.indexOf(current);
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(tabs[next].dataset.beddingTab, true);
    });
    const updatePrice = () => {
      const each = fabricPrices[selectedFabric];
      if (price) price.textContent = 'CA$' + Math.round(each * (selectedSize === 'King' ? 1.18 : selectedSize === 'Twin' ? .82 : 1));
    };
    fabricButtons.forEach((button) => button.addEventListener('click', () => {
      selectedFabric = button.dataset.beddingFabric;
      fabricButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      updatePrice();
      status.textContent = selectedFabric + ' selected.';
    }));
    sizeButtons.forEach((button) => button.addEventListener('click', () => {
      selectedSize = button.dataset.beddingSize;
      sizeButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      updatePrice();
      status.textContent = selectedSize + ' size selected.';
    }));
    study.querySelectorAll('[data-bedding-quantity]').forEach((button) => button.addEventListener('click', () => {
      quantity = Math.max(1, Math.min(9, quantity + Number(button.dataset.beddingQuantity)));
      countOutput.value = String(quantity);
      countOutput.textContent = String(quantity);
      status.textContent = 'Quantity ' + quantity + '.';
    }));
    study.querySelector('[data-bedding-add]')?.addEventListener('click', () => {
      bag.hidden = false;
      bagStatus.textContent = quantity + ' ' + selectedSize + ' ' + selectedFabric.toLowerCase() + (quantity === 1 ? ' set' : ' sets') + ' in your concept bag. Checkout is not available in this preview.';
      status.textContent = bagStatus.textContent;
      bagStatus.focus?.();
    });
    study.querySelector('[data-bedding-remove]')?.addEventListener('click', () => {
      bag.hidden = true;
      status.textContent = 'Sample removed from the concept bag.';
      study.querySelector('[data-bedding-add]')?.focus();
    });
    updatePrice();
  });
})();


/* Arts & Culture / Common Ground: usable concept navigation, honest event details, and replayable motion. */
(() => {
  document.querySelectorAll(".study-culture").forEach((study) => {
    const screen = study.querySelector(".culture-screen");
    const viewButtons = [...study.querySelectorAll("[data-culture-view]")];
    const panels = [...study.querySelectorAll("[data-culture-panel]")];
    const replay = study.querySelector("[data-culture-replay]");
    const detailToggle = study.querySelector(".culture-details-toggle");
    const detailText = study.querySelector("[data-culture-details]");
    if (!screen) return;

    viewButtons.forEach((button) => button.addEventListener("click", () => {
      const selected = button.dataset.cultureView;
      viewButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      panels.forEach((panel) => { panel.hidden = panel.dataset.culturePanel !== selected; });
    }));

    detailToggle?.addEventListener("click", () => {
      const expanded = detailToggle.getAttribute("aria-expanded") !== "true";
      detailToggle.setAttribute("aria-expanded", String(expanded));
      detailText.hidden = !expanded;
      detailToggle.textContent = expanded ? "Hide event details" : "Event details";
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const play = () => {
      if (reducedMotion.matches) return;
      screen.classList.remove("is-d-motion");
      void screen.offsetWidth;
      screen.classList.add("is-d-motion");
    };
    replay?.addEventListener("click", play);
    if (!reducedMotion.matches) {
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          play();
          observer.disconnect();
        }, { threshold: 0.25 });
        observer.observe(screen);
      } else {
        play();
      }
    }
  });
})();


/* Community directory: each option opens useful information in place. */
(() => {
  const details = {
    housing: ["Housing help", "Browse rent, utility, shelter, and housing-stability support."],
    food: ["Food nearby", "Find meal programs, community fridges, markets, and food-access support."],
    health: ["Health access", "Explore community clinics, primary-care access, and local health services."],
    family: ["Family services", "Find childcare, parenting programs, and support for families."],
    legal: ["Legal guidance", "Understand common legal questions and find community legal information or referrals."]
  };

  document.querySelectorAll(".study-information").forEach((study) => {
    const buttons = [...study.querySelectorAll("[data-info-service]")];
    const panel = study.querySelector("[data-info-detail]");
    const title = study.querySelector("[data-info-detail-title]");
    const copy = study.querySelector("[data-info-detail-copy]");
    const close = study.querySelector("[data-info-close]");
    let trigger = null;
    if (!buttons.length || !panel || !title || !copy) return;

    const dismiss = (returnFocus = false) => {
      panel.hidden = true;
      buttons.forEach((button) => button.setAttribute("aria-expanded", "false"));
      if (returnFocus) trigger?.focus();
    };

    buttons.forEach((button) => button.addEventListener("click", () => {
      const sameOption = trigger === button && !panel.hidden;
      if (sameOption) {
        dismiss();
        trigger = null;
        return;
      }
      trigger = button;
      const [label, description] = details[button.dataset.infoService] || [button.textContent.trim(), "More information will be added by local partners."];
      title.textContent = label;
      copy.textContent = description;
      buttons.forEach((item) => item.setAttribute("aria-expanded", String(item === button)));
      panel.hidden = false;
      close?.focus();
    }));

    close?.addEventListener("click", () => dismiss(true));
    study.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        dismiss(true);
      }
    });
  });
})();
