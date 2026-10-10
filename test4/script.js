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
  const studyCards = Array.from(studiesSection.querySelectorAll('.study'));
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

    let activeIndex = 0;
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
  const addTriangle = (a, b, c, color) => faces.push({ a, b, c, color });
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
  const addTube = (from, to, r0, r1, color, sides = 8) => {
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
      addTriangle(a, b, c, color); addTriangle(b, d, c, color);
    }
  };
  const body = '#8b9b71', flank = '#a7a37a', dark = '#5c705b', feather = '#c4b98e', bone = '#d8c9a6';
  const motionRanges = { tailFan: null, sickleClaws: [] };
  addEllipsoid(-.15, -.01, 0, .8, .39, .37, body, 10, 14);
  addEllipsoid(-.69, -.04, 0, .42, .37, .39, flank, 8, 12);
  addEllipsoid(.34, .02, 0, .4, .31, .34, flank, 8, 12);
  addTube([-.93, -.02, 0], [-3.12, -.31, 0], .28, .025, dark, 10);
  const tailFanStart = vertices.length;
  addTube([-.93, .04, 0], [-3.02, -.27, 0], .19, .015, feather, 9);
  motionRanges.tailFan = [tailFanStart, vertices.length];
  // A lifted, articulated neck gives the silhouette the alert, upright raptor profile.
  addTube([.18, .13, 0], [.31, .48, 0], .23, .19, body, 10);
  addTube([.31, .48, 0], [.46, .81, 0], .19, .15, body, 10);
  addTube([.21, -.02, 0], [.37, .58, 0], .105, .075, flank, 8);
  addEllipsoid(.57, .93, 0, .32, .21, .24, flank, 9, 14);
  // Long, tapered muzzle with a distinct lower jaw and restrained teeth.
  addTube([.69, .98, 0], [1.08, .94, 0], .15, .09, body, 10);
  addTube([.69, .84, 0], [1.03, .85, 0], .075, .045, dark, 9);
  addTube([.68, .9, 0], [1.04, .9, 0], .025, .018, dark, 7);
  for (let tooth = 0; tooth < 5; tooth++) {
    const tx = .76 + tooth * .052;
    addTube([tx, .905, .12], [tx + .018, .865, .12], .012, .001, bone, 5);
    addTube([tx, .905, -.12], [tx + .018, .865, -.12], .012, .001, bone, 5);
  }
  [-1, 1].forEach(side => {
    addTube([.48, 1.065, side * .19], [.71, 1.075, side * .18], .035, .018, dark, 7);
    addEllipsoid(.63, 1.015, side * .205, .044, .04, .025, '#e3c36d', 6, 9);
    addEllipsoid(.645, 1.016, side * .228, .018, .02, .011, '#17221f', 5, 7);
  });
  // Two feathered forelimbs with hooked claws.
  [-.24, .24].forEach((z, i) => {
    addEllipsoid(.46, .08, z, .16, .18, .14, i ? body : dark, 6, 9);
    addTube([.49, .02, z], [.57, -.25, z * 1.2], .09, .065, body, 7);
    addTube([.57, -.25, z * 1.2], [.82, -.34, z * 1.35], .065, .035, flank, 7);
    addTube([.82, -.34, z * 1.35], [.9, -.42, z * 1.35], .035, .006, bone, 6);
    for (let f = 0; f < 3; f++) addTube([.53 + f * .055, -.02, z * 1.13], [.64 + f * .06, -.12, z * 1.34], .035, .008, feather, 5);
  });
  // Digitigrade hind limbs based on the documented V. mongoliensis proportions:
  // femur and tibia are close in length; metatarsus is shorter; toes stay compact.
  // The far leg is set slightly back and shaded to keep the side silhouette readable.
  [
    {
      z: -.39, shade: dark,
      hip: [-.63, -.19, -.39], knee: [-.31, -.52, -.39],
      hock: [-.54, -.91, -.39], ankle: [-.37, -1.08, -.39],
    },
    {
      z: .39, shade: flank,
      hip: [-.68, -.22, .39], knee: [-.39, -.55, .39],
      hock: [-.63, -.92, .39], ankle: [-.47, -1.08, .39],
    }
  ].forEach((leg, legIndex) => {
    const { z, shade, hip, knee, hock, ankle } = leg;
    // Femur: powerful but tapered from the pelvis to the forward knee.
    addEllipsoid(hip[0], hip[1], z, .19, .22, .14, shade, 7, 10);
    addTube(hip, knee, .145, .105, body, 8);
    addEllipsoid(knee[0], knee[1], z, .105, .11, .105, flank, 6, 8);
    // Tibia/fibula angle back toward the hock; the joint remains flexed.
    addTube(knee, hock, .095, .065, shade, 8);
    addEllipsoid(hock[0], hock[1], z, .075, .08, .075, dark, 6, 8);
    // Short metatarsus angles forward to the ankle. No oversized foot mass.
    addTube(hock, ankle, .065, .052, body, 7);
    addEllipsoid(ankle[0], ankle[1], z, .06, .045, .065, flank, 6, 8);

    // Three compact toes fan gently forward and plant at a shared ground line.
    const toeSpecs = [
      { endZ: z - .11, len: .17 },
      { endZ: z, len: .22 },
      { endZ: z + .11, len: .17 }
    ];
    toeSpecs.forEach((toe, toeIndex) => {
      const base = [ankle[0] + .025, -1.09, z];
      const knuckle = [ankle[0] + toe.len * .54, -1.115, z + (toe.endZ - z) * .56];
      const tip = [ankle[0] + toe.len, -1.12, toe.endZ];
      addTube(base, knuckle, .037, .027, shade, 6);
      addTube(knuckle, tip, .027, .012, flank, 6);
      // Small keratin tips; toe II carries the characteristic enlarged claw.
      if (toeIndex === 1) {
        const clawStart = vertices.length;
        addTube(tip, [tip[0] - .025, -1.035, tip[2] + .018], .026, .002, bone, 7);
        motionRanges.sickleClaws.push([clawStart, vertices.length]);
      } else {
        addTube(tip, [tip[0] + .035, -1.105, tip[2] + (toeIndex === 0 ? -.012 : .012)], .016, .001, bone, 5);
      }
    });
    // Sparse thigh feathers follow the leg instead of masking its joints.
    for (let f = 0; f < 3; f++) {
      addTube(
        [hip[0] + .02 + f * .085, hip[1] + .09 - f * .02, z + .095],
        [hip[0] - .075 + f * .085, hip[1] - .015 - f * .025, z + .13],
        .032, .003, feather, 5
      );
    }
  });
  addEllipsoid(1.12, .99, .045, .018, .01, .012, '#53644e', 5, 6);
  addEllipsoid(1.12, .99, -.045, .018, .01, .012, '#53644e', 5, 6);
  let yaw = -.3, pitch = .08, zoom = 1, drag = null, width = 0, height = 0;
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
    ctx.fillStyle = 'rgba(2, 8, 11, .3)'; ctx.beginPath(); ctx.ellipse(width * .52, height * .95, width * .3, height * .035, 0, 0, Math.PI * 2); ctx.fill();
    const camera = 6, scale = Math.min(width / 4.95, height / 2.45) * zoom;
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
        if (x < -.94 && x > -3.16) {
          const tailWeight = Math.min(1, Math.max(0, (-x - .94) / 2.18));
          y += Math.sin(motionTime * .82 + tailWeight * 1.8) * .024 * tailWeight;
          z += Math.sin(motionTime * .58 + tailWeight * 1.4) * .012 * tailWeight;
        }
        // 3 & 10. The head scans slowly and follows a nearby pointer with a damped look.
        if (x > .28 && y > .48) {
          const headWeight = Math.min(1, Math.max(0, (y - .48) / .5));
          x += headScan * .014 * headWeight;
          y += (headScan * .005 + gazeY * .022) * headWeight;
          z += (Math.sin(motionTime * .36) * .026 + gazeX * .045) * headWeight;
        }
        // 4. A quick, occasional blink.
        if (x > .585 && x < .675 && y > .975 && y < 1.055 && Math.abs(Math.abs(z) - .205) < .035) {
          y = 1.015 + (y - 1.015) * (1 - blink * .86);
        }
        // 5. The lower jaw loosens slightly between breaths.
        if (x > .68 && x < 1.06 && y < .88 && Math.abs(z) < .1) y -= jawFlex * Math.max(0, (x - .68) / .38);
        // 6. Fine tail-feather ripple.
        if (motionRanges.tailFan && vertexIndex >= motionRanges.tailFan[0] && vertexIndex < motionRanges.tailFan[1]) {
          y += Math.sin(motionTime * 2.7 + x * 1.8) * .009;
        }
        // 7. Toe II's sickle claws flex by a few degrees.
        if (motionRanges.sickleClaws.some(([start, end]) => vertexIndex >= start && vertexIndex < end)) {
          y += Math.sin(motionTime * .9 + baseZ * 2) * .006;
        }
        // 8. Hind legs share a restrained, planted weight shift.
        if (x > -.98 && x < -.2 && y < -.2 && y > -1.05) y += weightShift * (z > 0 ? 1 : -1);
        // 9. The small forearms flex close to the chest.
        if (x > .45 && x < .94 && y > -.44 && y < .16) {
          z += Math.sin(motionTime * 1.05 + (z > 0 ? 0 : Math.PI)) * .006;
          y += Math.sin(motionTime * 1.05 + (z > 0 ? 0 : Math.PI)) * .004;
        }
      }
      const rx = x * Math.cos(yaw) + z * Math.sin(yaw), rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
      const ry = y * Math.cos(pitch) - rz * Math.sin(pitch), rz2 = y * Math.sin(pitch) + rz * Math.cos(pitch);
      const perspective = camera / (camera + rz2);
      return { x: width * .53 + (rx + .4) * scale * perspective, y: height * .49 - ry * scale * perspective, z: rz2 };
    });
    const rendered = faces.map(face => {
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
  const zoomIn = stage.querySelector('[data-raptor-action="zoom-in"]');
  const zoomOut = stage.querySelector('[data-raptor-action="zoom-out"]');
  let userPaused = reducedMotion;
  let isInView = false, automaticFrame = 0, lastAutomaticFrame = 0, lastPaint = 0;
  let activePointerId = null;
  const announce = (message) => { if (modelStatus) modelStatus.textContent = message; };
  const syncControls = () => {
    if (zoomIn) zoomIn.disabled = zoom >= 1.5;
    if (zoomOut) zoomOut.disabled = zoom <= .72;
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
    zoom = Math.max(.72, Math.min(1.5, next));
    syncControls();
    draw();
    if (announceChange) announce(`Zoom ${Math.round(zoom * 100)} percent.`);
  };
  const resetView = () => {
    yaw = -.3; pitch = .08; setZoom(1, false);
    announce('Model view reset to the starting angle and 100 percent zoom.');
  };
  const describeOrientation = () => {
    const direction = ['front three-quarter', 'side', 'rear three-quarter', 'rear', 'front three-quarter'][
      Math.round((((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 2))];
    announce(`Model viewed from the ${direction} angle.`);
  };
  syncControls();
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
    if (action === 'rotate-left') { yaw -= .22; draw(); describeOrientation(); }
    if (action === 'rotate-right') { yaw += .22; draw(); describeOrientation(); }
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
  let yaw = -28;
  let pitch = 15;
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
    pitch = Math.max(-22, Math.min(42, pointer.pitch + (event.clientY - pointer.y) * -.48));
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
    const step = event.shiftKey ? 18 : 10;
    if (event.key === 'ArrowLeft') yaw -= step;
    else if (event.key === 'ArrowRight') yaw += step;
    else if (event.key === 'ArrowUp') pitch = Math.max(-22, pitch - 8);
    else if (event.key === 'ArrowDown') pitch = Math.min(42, pitch + 8);
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
        yaw = -28;
        pitch = 15;
        paint();
        model.focus({preventScroll:true});
      } else if (button.dataset.spatialAction === 'light') {
        const cool = screen.dataset.light !== 'cool';
        screen.dataset.light = cool ? 'cool' : 'warm';
        button.setAttribute('aria-pressed', String(cool));
        button.textContent = cool ? 'COOL LIGHT' : 'WARM LIGHT';
        button.setAttribute('aria-label', cool ? 'Switch to warm model lighting' : 'Switch to cool model lighting');
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
  }, 420);
});


// Room planner controls: add an adjoining room and compact furniture pieces.
document.querySelectorAll('[data-spatial-screen]').forEach((screen) => {
  const furniture = screen.querySelector('[data-room-furniture]');
  const roomStatus = screen.querySelector('[data-room-status]');
  const roomLabel = screen.querySelector('[data-room-label]');
  if (!furniture) return;
  screen.querySelectorAll('[data-room-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const action = button.dataset.roomAction;
      if (action === 'room') {
        const added = screen.dataset.roomAdded !== 'true';
        screen.dataset.roomAdded = String(added);
        button.setAttribute('aria-pressed', String(added));
        roomLabel.textContent = added ? 'ROOM 01 + 02' : 'ROOM 01';
        if (roomStatus) roomStatus.textContent = added ? 'A second connected room was added.' : 'Showing one room.';
        return;
      }
      const pieces = Array.from(furniture.querySelectorAll(`.room-${action}`));
      if (pieces.length >= 3) {
        if (roomStatus) roomStatus.textContent = `Three ${action}s are already in the room.`;
        return;
      }
      const piece = document.createElement('div');
      piece.className = `room-${action}`;
      piece.setAttribute('aria-hidden', 'true');
      furniture.append(piece);
      if (roomStatus) roomStatus.textContent = `${action === 'chair' ? 'Chair' : 'Couch'} added to the room.`;
    });
  });
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
  const place = (slot, letter) => {
    if (!slot || !letter || slot.dataset.filled === 'true') return;
    slot.textContent = letter;
    slot.dataset.filled = 'true';
    const slotNumber = slots.indexOf(slot) + 1;
    const ordinal = ['first','second','third','fourth'][slotNumber - 1] || `${slotNumber}th`;
    slot.setAttribute('aria-label', `${ordinal} letter, ${letter}`);
    selectedLetter = '';
    tiles.forEach((tile) => tile.dataset.selected = 'false');
    const word = slots.map((item) => item.textContent.trim()).filter((value) => value !== '_').join('').toLowerCase();
    if (word.length >= 3) announce(`Great! You spelled ${word.toUpperCase()}.`, true);
    else announce(word ? `Current word: ${word.toUpperCase()}` : 'Choose letters to make a word.');
  };

  tiles.forEach((tile) => {
    tile.draggable = false;
    tile.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      event.stopPropagation();
      activePointer = {id:event.pointerId, tile, x:event.clientX, y:event.clientY, moved:false};
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
    }
  }, {passive:true});

  window.addEventListener('pointerup', (event) => {
    if (!activePointer || event.pointerId !== activePointer.id) return;
    const {tile, moved} = activePointer;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const slot = target?.closest?.('[data-word-slot]');
    tile.dataset.dragging = 'false';
    tile.dataset.ignoreClick = 'true';
    if (moved && slot && screen.contains(slot)) place(slot, tile.dataset.letterTile || '');
    else if (moved) announce('Drop the letter into an empty space.');
    else selectTile(tile);
    activePointer = null;
    window.setTimeout(() => { tile.dataset.ignoreClick = 'false'; }, 0);
  });

  slots.forEach((slot) => {
    slot.addEventListener('click', (event) => {
      event.stopPropagation();
      if (selectedLetter) place(slot, selectedLetter);
      else if (slot.dataset.filled === 'true') {
        slot.textContent = '_';
        slot.dataset.filled = 'false';
        const ordinal = ['first','second','third','fourth'][slots.indexOf(slot)] || 'next';
        slot.setAttribute('aria-label', `${ordinal} letter, empty`);
        const word = slots.map((item) => item.textContent.trim()).filter((value) => value !== '_').join('').toLowerCase();
        announce(word.length >= 3 ? `Great! You spelled ${word.toUpperCase()}.` : 'Letter cleared. Choose another when ready.', word.length >= 3);
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
    slots.slice(2).forEach((slot, index) => {
      slot.textContent = '_';
      slot.dataset.filled = 'false';
      slot.setAttribute('aria-label', `${['third','fourth'][index] || 'next'} letter, empty`);
    });
    selectedLetter = '';
    tiles.forEach((tile) => {
      tile.dataset.selected = 'false';
      tile.dataset.dragging = 'false';
    });
    announce('Choose letters to make a word.');
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
