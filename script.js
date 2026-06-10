/* ═══════════════════════════════════════════════════════════════
   SREESRUTHY MS PORTFOLIO — script.js
   All interactive functionality
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════
   1. NAVBAR — scroll behavior + active section
═══════════════════════════════════════ */
(function () {
  const nav     = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = document.querySelectorAll('section[id], footer[id]');

  window.addEventListener('scroll', function () {
    // Sticky background
    nav.classList.toggle('scrolled', window.scrollY > 60);

    // Back-to-top
    const btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 400);

    // Active nav link
    let current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(function (link) {
      link.classList.remove('active-section');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active-section');
      }
    });
  });

  // Smooth close on mobile
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      const menu = document.getElementById('navMenu');
      if (menu && menu.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(menu);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
})();

/* ═══════════════════════════════════════
   2. BACK TO TOP
═══════════════════════════════════════ */
document.getElementById('backToTop').addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ═══════════════════════════════════════
   3. SCROLL REVEAL
═══════════════════════════════════════ */
(function () {
  // Add data-reveal to key elements
  const targets = [
    '.about-card', '.about-stats',
    '.tl-card', '.edu-item',
    '.proj-card', '.skill-card',
    '.social-card', '.bg-card-premium',
    '.mosaic-card', '.section-heading', '.section-label'
  ];
  targets.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.setAttribute('data-reveal', '');
      el.style.transitionDelay = (i * 0.04) + 's';
    });
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    observer.observe(el);
  });
})();

/* ═══════════════════════════════════════
   4. SKILLS FILTER TABS
═══════════════════════════════════════ */
(function () {
  const tabs  = document.querySelectorAll('.skill-tab');
  const items = document.querySelectorAll('.skill-item');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.cat;
      items.forEach(function (item) {
        if (cat === 'all' || item.dataset.cat === cat) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
})();

/* ═══════════════════════════════════════
   5. GLOBE
═══════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('aboutGlobe');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 300, H = 300, R = 138, CX = W / 2, CY = H / 2;
  let rotation = 0, autoSpin = true, dragging = false, lastX = 0, worldData = null;
  let lastProjected = [];

  const locations = [
    { lat: 8.89,  lng: 76.61, label: 'University of Kerala',   sub: 'B.Sc. Geology — State Rank' },
    { lat: 8.52,  lng: 76.94, label: 'CED Kerala',             sub: 'Diploma in Geoinformatics' },
    { lat: 11.01, lng: 76.96, label: 'TN Forest Dept',         sub: 'GIS Expert — Wildlife Crime Bureau' },
    { lat: 11.13, lng: 78.66, label: 'Green Fellowship TN',    sub: 'Dept. of Environment & Climate Change' },
    { lat: 12.97, lng: 77.59, label: 'Bellissimo, Bangalore',  sub: 'GIS Analyst — European POI Projects' },
    { lat: 30.73, lng: 79.07, label: 'Wadia Institute',        sub: 'Intern — Himalayan Geology' },
    { lat: 30.34, lng: 76.39, label: 'Central Univ Punjab',    sub: 'M.Sc. Earth Science' },
    { lat: 34.15, lng: 77.57, label: 'Leh, Ladakh',            sub: 'Soil Erosion RUSLE Project' },
    { lat: 13.08, lng: 80.27, label: 'Chennai',                sub: 'Urban Green Space Mapping' },
    { lat: 45.44, lng: 12.31, label: 'Venezia',                sub: 'Flood susceptibility Tool model in QGIS demo' },
    { lat: 25.38, lng: 49.58, label: 'Al_Ahsa',                sub: 'Urban Heat Exposure Index and Hotspot Detection,POSTGIS & Dashboard' }
  ];

  function project(lat, lng, rot) {
    const phi   = (90 - lat) * Math.PI / 180;
    const theta = (lng + rot) * Math.PI / 180;
    const x3 = R * Math.sin(phi) * Math.cos(theta);
    const y3 = R * Math.cos(phi);
    const z3 = R * Math.sin(phi) * Math.sin(theta);
    return { x: CX + x3, y: CY - y3, z: z3, visible: z3 > -10 };
  }

  function drawBg() {
    const g = ctx.createRadialGradient(CX - 50, CY - 50, R * 0.1, CX, CY, R);
    g.addColorStop(0, '#6ab4e8');
    g.addColorStop(0.5, '#3a8fd4');
    g.addColorStop(1, '#1460a8');
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
  }

  function drawGraticules(rot) {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 0.4;
    for (let la = -60; la <= 60; la += 30) {
      ctx.beginPath(); let first = true;
      for (let i = 0; i <= 360; i += 3) {
        const p = project(la, i - 180, rot);
        if (p.z < -R * 0.05) { first = true; continue; }
        first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        first = false;
      }
      ctx.stroke();
    }
    for (let lo = 0; lo < 360; lo += 30) {
      ctx.beginPath(); let first = true;
      for (let i = -85; i <= 85; i += 3) {
        const p = project(i, lo - 180, rot);
        if (p.z < -R * 0.05) { first = true; continue; }
        first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        first = false;
      }
      ctx.stroke();
    }
  }

  function drawCountries(rot) {
    if (!worldData) return;
    const countries = topojson.feature(worldData, worldData.objects.countries);
    countries.features.forEach(function (feature) {
      const isIndia = feature.id === '356';
      const geom = feature.geometry;
      if (!geom) return;
      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
      polys.forEach(function (poly) {
        poly.forEach(function (ring) {
          const pts = ring.map(c => project(c[1], c[0], rot));
          if (!pts.some(p => p.z > 0)) return;
          ctx.beginPath();
          pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.fillStyle   = isIndia ? 'rgba(50,170,80,0.92)' : 'rgba(80,160,90,0.55)';
          ctx.strokeStyle = isIndia ? 'rgba(30,140,60,0.5)' : 'rgba(50,130,65,0.3)';
          ctx.lineWidth   = 0.4;
          ctx.fill(); ctx.stroke();
        });
      });
    });
  }

  function drawPins(rot) {
    lastProjected = [];
    const now = Date.now() / 1000;
    locations.forEach(function (loc, idx) {
      const p = project(loc.lat, loc.lng, rot);
      if (!p.visible || p.z < 15) return;
      const alpha = Math.min(1, (p.z - 15) / 35);
      const sc    = 0.7 + 0.45 * (p.z / R);
      const px    = p.x, py = p.y, ps = 15 * sc;

      // Pin body
      ctx.beginPath();
      ctx.arc(px, py - ps, ps * 0.72, 0, Math.PI * 2);
      ctx.fillStyle   = 'rgba(192,40,30,' + alpha + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 0.95) + ')';
      ctx.lineWidth   = 1.8; ctx.stroke();

      // Stem
      ctx.beginPath();
      ctx.moveTo(px - ps * 0.32, py - ps * 0.68);
      ctx.lineTo(px, py + 1);
      ctx.lineTo(px + ps * 0.32, py - ps * 0.68);
      ctx.fillStyle = 'rgba(180,30,20,' + alpha + ')';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(px, py - ps, ps * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.92) + ')';
      ctx.fill();

      // Pulse ring
      const pulse = ((now * 0.7 + idx * 0.6) % 1);
      ctx.beginPath();
      ctx.arc(px, py - ps, ps * 0.72 + pulse * ps * 0.9, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(220,60,50,' + ((1 - pulse) * alpha * 0.55) + ')';
      ctx.lineWidth   = 1.5; ctx.stroke();

      lastProjected.push({ x: px, y: py - ps, r: ps * 0.72, idx: idx });
    });
  }

  function drawShine() {
    const s = ctx.createRadialGradient(CX - R * 0.38, CY - R * 0.38, R * 0.04, CX - R * 0.1, CY - R * 0.1, R);
    s.addColorStop(0, 'rgba(255,255,255,0.12)');
    s.addColorStop(0.35, 'rgba(255,255,255,0.04)');
    s.addColorStop(1, 'rgba(0,10,30,0.22)');
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = s; ctx.fill();
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1.5; ctx.stroke();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2); ctx.clip();
    drawBg(); drawGraticules(rotation); drawCountries(rotation); drawShine(); drawPins(rotation);
    ctx.restore();
  }

  // Drag to rotate
  canvas.addEventListener('mousedown',  e => { dragging = true; autoSpin = false; lastX = e.clientX; });
  canvas.addEventListener('mousemove',  e => { if (!dragging) return; rotation += (e.clientX - lastX) * 0.4; lastX = e.clientX; });
  canvas.addEventListener('mouseup',    () => { dragging = false; });
  canvas.addEventListener('mouseleave', () => { dragging = false; });
  canvas.addEventListener('touchstart', e => { dragging = true; autoSpin = false; lastX = e.touches[0].clientX; }, { passive: true });
  canvas.addEventListener('touchmove',  e => { if (!dragging) return; rotation += (e.touches[0].clientX - lastX) * 0.4; lastX = e.touches[0].clientX; }, { passive: true });
  canvas.addEventListener('touchend',   () => { dragging = false; });

  // Pin click
  canvas.addEventListener('click', function (e) {
    if (dragging) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
    const popup = document.getElementById('globePopup');

    let hit = false;
    lastProjected.forEach(function (pin) {
      const dx = mx - pin.x, dy = my - pin.y;
      if (Math.sqrt(dx * dx + dy * dy) < pin.r + 8) {
        document.getElementById('globePopupTitle').textContent = locations[pin.idx].label;
        document.getElementById('globePopupSub').textContent   = locations[pin.idx].sub;
        popup.classList.add('active');
        hit = true;
      }
    });
    if (!hit) popup.classList.remove('active');
  });

  document.getElementById('globePopupClose').addEventListener('click', function () {
    document.getElementById('globePopup').classList.remove('active');
  });

  function animate() {
    if (autoSpin) rotation += 0.14;
    drawFrame();
    requestAnimationFrame(animate);
  }

  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(r => r.json())
    .then(data => { worldData = data; animate(); })
    .catch(() => animate());
})();

/* ═══════════════════════════════════════
   6. ESRI MOSAIC LIGHTBOX
═══════════════════════════════════════ */
(function () {
  const overlay = document.getElementById('esriLB');
  const lbImg   = document.getElementById('esriLBImg');
  const lbTag   = document.getElementById('esriLBTag');
  const lbTitle = document.getElementById('esriLBTitle');
  const lbSub   = document.getElementById('esriLBSub');
  const lbClose = document.getElementById('esriLBClose');

  document.querySelectorAll('.mosaic-card').forEach(function (card) {
    card.addEventListener('click', function () {
      const img = card.querySelector('img');
      lbImg.src           = img ? img.src : '';
      lbTag.textContent   = card.dataset.tag   || '';
      lbTitle.textContent = card.dataset.title || '';
      lbSub.textContent   = card.dataset.sub   || '';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeEsriLB() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  lbClose.addEventListener('click', closeEsriLB);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeEsriLB(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEsriLB(); });
})();

/* ═══════════════════════════════════════
   7. RECOGNITION VIEWER
═══════════════════════════════════════ */
(function () {
  const thumbs      = document.querySelectorAll('.rec-thumb');
  const activeImg   = document.getElementById('recActiveImg');
  const activeTag   = document.getElementById('recActiveTag');
  const activeTitle = document.getElementById('recActiveTitle');
  const activeIssuer= document.getElementById('recActiveIssuer');
  const activeYear  = document.getElementById('recActiveYear');
  const expandBtn   = document.getElementById('recExpandBtn');
  const lb          = document.getElementById('recLB');
  const lbImg       = document.getElementById('recLBImg');
  const lbClose     = document.getElementById('recLBClose');

  function switchCert(thumb) {
    thumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');

    activeImg.classList.add('fading');
    setTimeout(function () {
      activeImg.src            = thumb.dataset.img;
      activeTag.textContent    = thumb.dataset.tag;
      activeTitle.textContent  = thumb.dataset.title;
      activeIssuer.textContent = thumb.dataset.issuer;
      activeYear.textContent   = thumb.dataset.year;
      activeImg.classList.remove('fading');
    }, 300);
  }

  thumbs.forEach(t => t.addEventListener('click', () => switchCert(t)));

  expandBtn.addEventListener('click', function () {
    lbImg.src = activeImg.src;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeRecLB() { lb.classList.remove('active'); document.body.style.overflow = ''; }
  lbClose.addEventListener('click', closeRecLB);
  lb.addEventListener('click', e => { if (e.target === lb) closeRecLB(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRecLB(); });
})();

/* ═══════════════════════════════════════
   8. GALLERY VIEWER
═══════════════════════════════════════ */
(function () {
  const films   = Array.from(document.querySelectorAll('.gal-film'));
  const spotImg = document.getElementById('galSpotImg');
  const tagEl   = document.getElementById('galTag');
  const titleEl = document.getElementById('galTitle');
  const counter = document.getElementById('galCounter');
  const prevBtn = document.getElementById('galPrev');
  const nextBtn = document.getElementById('galNext');
  const spot    = document.getElementById('galSpot');
  const lb      = document.getElementById('galLB');
  const lbImg   = document.getElementById('galLBImg');
  const lbCap   = document.getElementById('galLBCaption');
  const lbClose = document.getElementById('galLBClose');

  if (!films.length) return;
  let current = 0;

  function goTo(index) {
    films[current].classList.remove('active');
    current = (index + films.length) % films.length;
    const item = films[current];
    item.classList.add('active');
    // item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
const filmstrip = document.getElementById('galFilmstrip');
if (filmstrip) {
  const itemLeft = item.offsetLeft - (filmstrip.offsetWidth / 2) + (item.offsetWidth / 2);
  filmstrip.scrollTo({ left: itemLeft, behavior: 'smooth' });
}

    spotImg.classList.add('fading');
    setTimeout(function () {
      spotImg.src       = item.querySelector('img').src;
      tagEl.textContent = item.dataset.tag;
      titleEl.textContent = item.dataset.title;
      counter.textContent = (current + 1) + ' / ' + films.length;
      spotImg.classList.remove('fading');
    }, 380);
  }

  films.forEach((f, i) => f.addEventListener('click', () => goTo(i)));
  prevBtn.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });

  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  spot.addEventListener('click', function () {
    lbImg.src = spotImg.src;
    lbCap.textContent = titleEl.textContent;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeGalLB() { lb.classList.remove('active'); document.body.style.overflow = ''; }
  lbClose.addEventListener('click', closeGalLB);
  lb.addEventListener('click', e => { if (e.target === lb) closeGalLB(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGalLB(); });

  counter.textContent = '1 / ' + films.length;

  // Auto-advance every 5 seconds
  setInterval(function () {
    if (!document.hidden && !lb.classList.contains('active')) {
      goTo(current + 1);
    }
  }, 5000);
})();

/* ═══════════════════════════════════════
   9. INTERACTIVE CONTACT FORM
═══════════════════════════════════════ */
(function () {
  const form      = document.getElementById('contactForm');
  const success   = document.getElementById('cfSuccess');
  const resetBtn  = document.getElementById('cfReset');
  const submitBtn = document.getElementById('cfSubmit');
  const btnText   = submitBtn.querySelector('.cf-btn-text');
  const btnLoad   = submitBtn.querySelector('.cf-btn-loading');

  // Character count on textarea
  const msgInput   = document.getElementById('cfMessage');
  const charCount  = document.getElementById('cfCharCount');
  const MAX_CHARS  = 500;

  msgInput.addEventListener('input', function () {
    const len = msgInput.value.length;
    charCount.textContent = len + ' / ' + MAX_CHARS;
    charCount.classList.remove('near-limit', 'at-limit');
    if (len >= MAX_CHARS) { charCount.classList.add('at-limit'); msgInput.value = msgInput.value.slice(0, MAX_CHARS); }
    else if (len >= MAX_CHARS * 0.8) charCount.classList.add('near-limit');
  });

  // Real-time validation helpers
  function showError(inputId, errId, msg) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errId);
    inp.classList.add('error');
    err.textContent = msg;
    err.classList.add('visible');
  }

  function clearError(inputId, errId) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errId);
    inp.classList.remove('error');
    err.classList.remove('visible');
  }

  // Live clear on input
  ['cfName', 'cfEmail', 'cfSubject', 'cfMessage'].forEach(function (id) {
    const errId = id + 'Err';
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () {
        if (el.value.trim()) clearError(id, errId);
      });
    }
  });

  function validateForm() {
    let valid = true;

    const name    = document.getElementById('cfName');
    const email   = document.getElementById('cfEmail');
    const subject = document.getElementById('cfSubject');
    const message = document.getElementById('cfMessage');

    if (!name.value.trim()) {
      showError('cfName', 'cfNameErr', 'Please enter your name.'); valid = false;
    } else clearError('cfName', 'cfNameErr');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      showError('cfEmail', 'cfEmailErr', 'Please enter your email.'); valid = false;
    } else if (!emailRegex.test(email.value.trim())) {
      showError('cfEmail', 'cfEmailErr', 'Please enter a valid email address.'); valid = false;
    } else clearError('cfEmail', 'cfEmailErr');

    if (!subject.value.trim()) {
      showError('cfSubject', 'cfSubjectErr', 'Please enter a subject.'); valid = false;
    } else clearError('cfSubject', 'cfSubjectErr');

    if (!message.value.trim()) {
      showError('cfMessage', 'cfMessageErr', 'Please write a message.'); valid = false;
    } else if (message.value.trim().length < 10) {
      showError('cfMessage', 'cfMessageErr', 'Please write at least 10 characters.'); valid = false;
    } else clearError('cfMessage', 'cfMessageErr');

    return valid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    // Show loading
    btnText.classList.add('d-none');
    btnLoad.classList.remove('d-none');
    submitBtn.disabled = true;

    // Simulate async send (replace with real endpoint if needed)
    setTimeout(function () {
      form.classList.add('d-none');
      success.classList.remove('d-none');
    }, 1600);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      form.classList.remove('d-none');
      success.classList.add('d-none');
      btnText.classList.remove('d-none');
      btnLoad.classList.add('d-none');
      submitBtn.disabled = false;
      charCount.textContent = '0 / ' + MAX_CHARS;
      charCount.classList.remove('near-limit', 'at-limit');
      ['cfName', 'cfEmail', 'cfSubject', 'cfMessage'].forEach(id => clearError(id, id + 'Err'));
    });
  }
})();

/* ═══════════════════════════════════════
   10. NAVBAR COLLAPSE ON LINK CLICK (mobile)
═══════════════════════════════════════ */
document.querySelectorAll('.navbar-nav .nav-link').forEach(function (link) {
  link.addEventListener('click', function () {
    const toggler = document.querySelector('.navbar-toggler');
    const menu    = document.getElementById('navMenu');
    if (window.innerWidth < 1200 && menu.classList.contains('show')) {
      toggler.click();
    }
  });
});