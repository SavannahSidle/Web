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
  addEllipsoid(-.15, -.01, 0, .8, .39, .37, body, 10, 14);
  addEllipsoid(-.69, -.04, 0, .42, .37, .39, flank, 8, 12);
  addEllipsoid(.34, .02, 0, .4, .31, .34, flank, 8, 12);
  // Volume and anatomical landmarks: throat, shoulder, and hip masses overlap the core mesh.
  addEllipsoid(-.08, -.18, 0, .63, .22, .31, '#788967', 9, 14);
  addEllipsoid(.43, -.1, 0, .32, .27, .31, '#91a079', 8, 12);
  addEllipsoid(-.63, -.13, 0, .3, .24, .32, '#879370', 8, 12);
  addTube([-.93, -.02, 0], [-2.33, -.23, 0], .28, .035, dark, 10);
  addTube([-.93, .04, 0], [-2.28, -.18, 0], .19, .018, feather, 9);
  addTube([.44, .16, 0], [.72, .56, 0], .22, .15, body, 9);
  addEllipsoid(.77, .57, 0, .3, .2, .2, flank, 8, 12);
  // Defined cheek planes and a low brow give the skull a more recognizable raptor profile.
  [-1, 1].forEach(side => {
    addEllipsoid(.82, .53, side * .176, .17, .105, .055, '#7e8c66', 7, 10);
    addTube([.83, .69, side * .17], [1.06, .67, side * .135], .036, .018, '#59694f', 7);
    addEllipsoid(1.008, .652, side * .198, .019, .019, .012, '#f0d88b', 5, 7);
    addEllipsoid(1.014, .652, side * .208, .009, .011, .007, '#17221f', 5, 6);
  });
  // Fine, muted dorsal scutes add surface detail without changing the silhouette.
  for (let i = 0; i < 8; i++) {
    const x = -.72 + i * .17;
    const y = .3 + .045 * Math.sin((i / 7) * Math.PI);
    addEllipsoid(x, y, 0, .065, .038, .12, i % 2 ? '#a0a982' : '#687a5f', 4, 7);
  }
  addTube([.86, .58, 0], [1.42, .52, 0], .14, .045, body, 9);
  addTube([.86, .42, 0], [1.25, .36, 0], .09, .045, dark, 8);
  // Two feathered forelimbs with hooked claws.
  [-.24, .24].forEach((z, i) => {
    addEllipsoid(.46, .08, z, .16, .18, .14, i ? body : dark, 6, 9);
    addTube([.49, .02, z], [.57, -.25, z * 1.2], .09, .065, body, 7);
    addTube([.57, -.25, z * 1.2], [.82, -.34, z * 1.35], .065, .035, flank, 7);
    addTube([.82, -.34, z * 1.35], [.9, -.42, z * 1.35], .035, .006, bone, 6);
    for (let f = 0; f < 3; f++) addTube([.53 + f * .055, -.02, z * 1.13], [.64 + f * .06, -.12, z * 1.34], .035, .008, feather, 5);
  });
  // Strong hind legs, long lower limbs, three toes, and the raised sickle claw.
  [-.3, .3].forEach((z, i) => {
    const shade = i ? flank : dark, dz = z * 1.45;
    addEllipsoid(-.59, -.26, dz, .24, .32, .19, shade, 7, 10);
    addTube([-.54, -.3, dz], [-.18, -.65, dz], .2, .13, body, 8);
    addEllipsoid(-.18, -.65, dz, .14, .14, .13, flank, 6, 9);
    addTube([-.18, -.65, dz], [.03, -1.04, dz], .12, .075, shade, 8);
    addEllipsoid(.07, -1.06, dz, .12, .075, .12, flank, 6, 8);
    [-1, 0, 1].forEach((toe) => {
      const toeZ = dz + toe * .12;
      addTube([.08, -1.07, dz], [.34, -1.1, toeZ], .07, .04, body, 6);
      addTube([.34, -1.1, toeZ], [.47, -1.13, toeZ], .04, .005, bone, 6);
    });
    addTube([.12, -1.02, dz + .02], [-.015, -.79, dz + .1], .065, .04, bone, 7);
    addTube([-.015, -.79, dz + .1], [.17, -.69, dz + .1], .04, .004, bone, 7);
    // small feather vanes along the thigh
    for (let f = 0; f < 4; f++) addTube([-.64 + f * .1, -.05 - f * .03, dz + .12], [-.78 + f * .1, -.2 - f * .035, dz + .18], .045, .004, feather, 5);
  });
  addEllipsoid(.98, .63, .17, .035, .035, .025, '#e3c36d', 5, 8);
  addEllipsoid(.98, .63, -.17, .035, .035, .025, '#e3c36d', 5, 8);
  addEllipsoid(1.005, .635, .195, .012, .013, .008, '#17221f', 5, 6);
  addEllipsoid(1.005, .635, -.195, .012, .013, .008, '#17221f', 5, 6);
  // Small catchlights keep the eyes legible at thumbnail scale.
  addEllipsoid(.997, .646, .214, .006, .006, .004, '#f2e9c9', 4, 5);
  addEllipsoid(.997, .646, -.214, .006, .006, .004, '#f2e9c9', 4, 5);
  addEllipsoid(1.38, .555, .045, .018, .01, .012, '#53644e', 5, 6);
  addEllipsoid(1.38, .555, -.045, .018, .01, .012, '#53644e', 5, 6);
  let yaw = -.3, pitch = .08, zoom = 1, drag = null, width = 0, height = 0;
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
    ctx.fillStyle = 'rgba(2, 8, 11, .3)'; ctx.beginPath(); ctx.ellipse(width * .52, height * .83, width * .3, height * .055, 0, 0, Math.PI * 2); ctx.fill();
    const camera = 6, scale = Math.min(width / 4.75, height / 2.25) * zoom;
    const projected = vertices.map(([x, y, z]) => {
      const rx = x * Math.cos(yaw) + z * Math.sin(yaw), rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
      const ry = y * Math.cos(pitch) - rz * Math.sin(pitch), rz2 = y * Math.sin(pitch) + rz * Math.cos(pitch);
      const perspective = camera / (camera + rz2);
      return { x: width * .53 + (rx + .4) * scale * perspective, y: height * .57 - ry * scale * perspective, z: rz2 };
    });
    const rendered = faces.map(face => {
      const a = projected[face.a], b = projected[face.b], c = projected[face.c];
      const ab = [b.x-a.x,b.y-a.y,b.z-a.z], ac = [c.x-a.x,c.y-a.y,c.z-a.z];
      const normal = [ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
      const norm = Math.hypot(...normal)||1;
      const facing = [normal[0]/norm, normal[1]/norm, normal[2]/norm];
      const key = Math.max(0, facing[0]*-.28 + facing[1]*-.78 + facing[2]*.38);
      const rim = Math.max(0, facing[2]) * .14;
      const shade = Math.min(1.18, .48 + key*.66 + rim);
      const value = parseInt(face.color.slice(1),16), r = (value>>16)&255, g=(value>>8)&255, bl=value&255;
      const warmth = Math.max(0, key-.42);
      return {a,b,c,z:(a.z+b.z+c.z)/3,color:`rgb(${Math.min(255,Math.round(r*shade+warmth*5))},${Math.min(255,Math.round(g*shade+warmth*8))},${Math.min(255,Math.round(bl*shade))})`};
    }).sort((a,b)=>a.z-b.z);
    rendered.forEach(face => {ctx.beginPath();ctx.moveTo(face.a.x,face.a.y);ctx.lineTo(face.b.x,face.b.y);ctx.lineTo(face.c.x,face.c.y);ctx.closePath();ctx.fillStyle=face.color;ctx.fill();ctx.strokeStyle='rgba(17,29,26,.055)';ctx.lineWidth=.45;ctx.stroke();});
    ctx.restore();
  };
  const observer = new ResizeObserver(resize); observer.observe(stage); resize();
  if (!reducedMotion) {
    let isInView = false, automaticFrame = 0, lastAutomaticFrame = 0;
    const stopAutomaticTurn = () => {
      if (automaticFrame) cancelAnimationFrame(automaticFrame);
      automaticFrame = 0; lastAutomaticFrame = 0;
    };
    const turn = (time) => {
      automaticFrame = 0;
      if (!isInView || document.hidden) { lastAutomaticFrame = 0; return; }
      if (lastAutomaticFrame) {
        yaw += Math.min(50, time - lastAutomaticFrame) * (Math.PI * 2 / 100000);
        draw();
      }
      lastAutomaticFrame = time;
      automaticFrame = requestAnimationFrame(turn);
    };
    const startAutomaticTurn = () => {
      if (isInView && !document.hidden && !automaticFrame) automaticFrame = requestAnimationFrame(turn);
    };
    if ('IntersectionObserver' in window) {
      const turnObserver = new IntersectionObserver((entries) => {
        isInView = Boolean(entries[0]?.isIntersecting);
        if (isInView) startAutomaticTurn(); else stopAutomaticTurn();
      }, { threshold: 0.08 });
      turnObserver.observe(stage);
    } else {
      isInView = true;
      startAutomaticTurn();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutomaticTurn(); else startAutomaticTurn();
    });
  }
  stage.addEventListener('pointerdown', event => {event.stopPropagation();if(event.target.closest('button'))return;drag={x:event.clientX,y:event.clientY};stage.setPointerCapture?.(event.pointerId);});
  stage.addEventListener('pointermove', event => {if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;drag={x:event.clientX,y:event.clientY};yaw+=dx*.012;pitch=Math.max(-.55,Math.min(.55,pitch+dy*.008));draw();});
  const stopDrag = event => {if(drag){drag=null;event.stopPropagation();}};
  stage.addEventListener('pointerup',stopDrag);stage.addEventListener('pointercancel',stopDrag);
  stage.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();yaw+=(event.key==='ArrowRight'?.18:-.18);draw();}if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();pitch=Math.max(-.55,Math.min(.55,pitch+(event.key==='ArrowUp'?.12:-.12)));draw();}});
  stage.querySelectorAll('[data-raptor-action]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(button.dataset.raptorAction==='zoom-in')zoom=Math.min(1.5,zoom+.12);if(button.dataset.raptorAction==='zoom-out')zoom=Math.max(.72,zoom-.12);if(button.dataset.raptorAction==='reset'){yaw=-.3;pitch=.08;zoom=1;}draw();}));
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


// Randomly illuminate a few neural nodes at a time, with reduced-motion support.
document.querySelectorAll('.study-neural').forEach((study) => {
  const nodes = Array.from(study.querySelectorAll('.neural-nodes circle'));
  if (nodes.length < 3 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let visible = !('IntersectionObserver' in window);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      visible = Boolean(entries[0]?.isIntersecting);
    }, { threshold: 0.08 });
    observer.observe(study);
  }
  const lightRandomNodes = () => {
    if (document.hidden || !visible) return;
    nodes.forEach((node) => node.classList.remove('is-lit'));
    const pool = nodes.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const count = 2 + Math.floor(Math.random() * 2);
    pool.slice(0, count).forEach((node) => node.classList.add('is-lit'));
  };
  lightRandomNodes();
  window.setInterval(lightRandomNodes, 950);
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

// Playable word slots support mouse/touch drag and a keyboard-friendly select/place flow.
document.querySelectorAll('.learning-screen').forEach((screen) => {
  const slots = Array.from(screen.querySelectorAll('[data-word-slot]'));
  const tiles = Array.from(screen.querySelectorAll('[data-letter-tile]'));
  const status = screen.querySelector('[data-learning-status]');
  let selectedLetter = '';
  if (!slots.length || !tiles.length) return;
  const selectTile = (tile) => {
    selectedLetter = tile?.dataset.letterTile || '';
    tiles.forEach((candidate) => candidate.dataset.selected = String(candidate === tile));
    if (status && selectedLetter) status.textContent = `Letter ${selectedLetter} selected. Choose a blank slot.`;
  };
  const place = (slot, letter) => {
    if (!slot || !letter) return;
    slot.textContent = letter;
    slot.dataset.filled = 'true';
    const slotNumber = slots.indexOf(slot) + 1;
    const ordinal = ['first','second','third','fourth'][slotNumber - 1] || `${slotNumber}th`;
    slot.setAttribute('aria-label', `${ordinal} letter, ${letter}`);
    selectedLetter = '';
    tiles.forEach((tile) => tile.dataset.selected = 'false');
    const word = slots.map((item) => item.textContent.trim()).filter((letter) => letter !== '_').join('').toLowerCase();
    if (status) status.textContent = ['cat','cap','camp'].includes(word) ? `You made ${word}!` : `Current word: ${word}`;
  };
  tiles.forEach((tile) => {
    tile.addEventListener('click', (event) => { event.stopPropagation(); selectTile(tile); });
    tile.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse') return;
      event.preventDefault();event.stopPropagation();
      selectedLetter = tile.dataset.letterTile || '';
      tile.dataset.dragging = 'true';
      try { tile.setPointerCapture(event.pointerId); } catch {}
      if (status && selectedLetter) status.textContent = `Dragging ${selectedLetter}. Drop it into a blank slot.`;
    });
    tile.addEventListener('pointerup', (event) => {
      if (event.pointerType === 'mouse') return;
      const letter = tile.dataset.letterTile || '';
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const slot = target?.closest?.('[data-word-slot]');
      tile.dataset.dragging = 'false';
      if (slot && screen.contains(slot)) place(slot, letter);
      else selectTile(tile);
      event.stopPropagation();
    });
    tile.addEventListener('pointercancel', () => { tile.dataset.dragging = 'false'; });
    tile.addEventListener('dragstart', (event) => {
      event.dataTransfer?.setData('text/plain', tile.dataset.letterTile);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
      selectTile(tile);
    });
  });
  slots.forEach((slot) => {
    slot.addEventListener('click', (event) => {
      event.stopPropagation();
      if (selectedLetter) place(slot, selectedLetter);
      else if (slot.dataset.filled === 'true') {
        slot.textContent = '_';slot.dataset.filled = 'false';
        const ordinal = ['first','second','third','fourth'][slots.indexOf(slot)] || 'next';
        slot.setAttribute('aria-label', `${ordinal} letter, empty`);
        if (status) status.textContent = 'Letter cleared. Choose another letter when ready.';
      }
    });
    slot.addEventListener('dragover', (event) => event.preventDefault());
    slot.addEventListener('drop', (event) => {
      event.preventDefault();event.stopPropagation();
      place(slot, event.dataTransfer?.getData('text/plain') || selectedLetter);
    });
  });
  screen.querySelector('[data-learning-reset]')?.addEventListener('click', (event) => {
    event.preventDefault();event.stopPropagation();
    slots.slice(2).forEach((slot, index) => {
      slot.textContent = '_';slot.dataset.filled = 'false';
      slot.setAttribute('aria-label', `${['third','fourth'][index] || 'next'} letter, empty`);
    });
    selectedLetter = '';
    tiles.forEach((tile) => tile.dataset.selected = 'false');
    if (status) status.textContent = 'Added letters were cleared.';
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
