/**
 * NOCTIS — Scrollytelling Experience Controller
 * Plain Vanilla JavaScript, Zero External Dependencies
 */

(function () {
  'use strict';

  // State
  const state = {
    isMobile: window.innerWidth < 768,
    preloaded: false,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollY: window.scrollY,
    lastScrollY: window.scrollY,
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    cursor: { x: window.innerWidth / 2, y: window.innerHeight / 2, label: 'VIEW', isMorphed: false, isActive: false },
    hero: {
      current: 0,
      target: 0,
      lastDrawn: -1,
      progress: 0,
      cache: [],
      loadedCount: 0,
      canvas: null,
      ctx: null,
      wrapper: null,
      stage: null,
    },
    dismantle: {
      current: 0,
      target: 0,
      lastDrawn: -1,
      progress: 0,
      cache: [],
      loadedCount: 0,
      canvas: null,
      ctx: null,
      wrapper: null,
      stage: null,
    },
  };

  /* ==========================================================================
     INITIALIZATION & DOM READY
     ========================================================================== */

  document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    initFilmGrain();
    initCustomCursor();
    initNavbar();
    initStatementReveal();
    initLineupAccordion();
    initReserveSection();
    initCallouts();

    // Start preloader and scrollytelling engine
    startPreloader();

    // Listen for resize and reduced-motion changes
    window.addEventListener('resize', handleResize, { passive: true });
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      state.reducedMotion = e.matches;
    });
  });

  function initDOMElements() {
    state.hero.wrapper = document.getElementById('hero-wrapper');
    state.hero.stage = document.getElementById('hero-stage');
    state.hero.canvas = document.getElementById('hero-canvas');
    state.hero.ctx = state.hero.canvas.getContext('2d', { alpha: false });

    state.dismantle.wrapper = document.getElementById('dismantle-wrapper');
    state.dismantle.stage = document.getElementById('dismantle-stage');
    state.dismantle.canvas = document.getElementById('dismantle-canvas');
    state.dismantle.ctx = state.dismantle.canvas.getContext('2d', { alpha: false });

    // Set wrapper heights from config
    state.hero.wrapper.style.height = NOCTIS_CONFIG.hero.scrollDistance;
    state.dismantle.wrapper.style.height = NOCTIS_CONFIG.dismantle.scrollDistance;

    resizeCanvases();
  }

  function resizeCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    [state.hero, state.dismantle].forEach(sec => {
      if (sec.canvas && sec.ctx) {
        sec.canvas.width = Math.round(w * dpr);
        sec.canvas.height = Math.round(h * dpr);
        sec.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        sec.lastDrawn = -1; // force redraw
      }
    });
  }

  function handleResize() {
    const wasMobile = state.isMobile;
    state.isMobile = window.innerWidth < 768;
    resizeCanvases();

    // If crossing mobile breakpoint, reload frames for correct resolution
    if (wasMobile !== state.isMobile) {
      reloadAllFrames();
    }
  }

  /* ==========================================================================
     GLOBAL FILM GRAIN OVERLAY (8 fps random shifts, no gradients, no vignette)
     ========================================================================== */

  function initFilmGrain() {
    const canvas = document.getElementById('grain-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Offscreen small noise pattern tile (128x128)
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 128;
    patternCanvas.height = 128;
    const pCtx = patternCanvas.getContext('2d');
    const imgData = pCtx.createImageData(128, 128);
    const buf = new Uint32Array(imgData.data.buffer);

    // Populate with pure monochrome noise
    for (let i = 0; i < buf.length; i++) {
      const val = (Math.random() * 255) | 0;
      // 32-bit integer: AABBGGRR
      buf[i] = (255 << 24) | (val << 16) | (val << 8) | val;
    }
    pCtx.putImageData(imgData, 0, 0);

    let pattern;
    function resizeGrain() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      pattern = ctx.createPattern(patternCanvas, 'repeat');
    }
    resizeGrain();
    window.addEventListener('resize', resizeGrain, { passive: true });

    // Shift offset ~8 times per second (every 125ms)
    setInterval(() => {
      if (!pattern) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const offsetX = (Math.random() * 128) | 0;
      const offsetY = (Math.random() * 128) | 0;
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.fillStyle = pattern;
      ctx.fillRect(-offsetX, -offsetY, canvas.width + 128, canvas.height + 128);
      ctx.restore();
    }, 125);
  }

  /* ==========================================================================
     CUSTOM CURSOR ("THE HEADLIGHT", Desktop Only)
     ========================================================================== */

  function initCustomCursor() {
    const cursorEl = document.getElementById('cursor-headlight');
    const labelEl = document.getElementById('cursor-label');
    if (!cursorEl || !window.matchMedia('(pointer: fine)').matches) return;

    window.addEventListener('mousemove', (e) => {
      state.mouse.x = e.clientX;
      state.mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      state.cursor.isActive = true;
      cursorEl.classList.add('cursor-active');
      setTimeout(() => {
        state.cursor.isActive = false;
        cursorEl.classList.remove('cursor-active');
      }, 120);
    });

    // Delegate hover states over interactive elements
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [data-cursor], .lineup-slide');
      if (target) {
        state.cursor.isMorphed = true;
        cursorEl.classList.add('cursor-morphed');

        if (target.classList.contains('lineup-slide')) {
          const isOpen = target.getAttribute('aria-expanded') === 'true';
          state.cursor.label = isOpen ? 'CONFIGURE' : 'OPEN';
        } else {
          state.cursor.label = target.getAttribute('data-cursor') || 'VIEW';
        }
        if (labelEl) labelEl.textContent = state.cursor.label;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [data-cursor], .lineup-slide');
      if (target && !e.relatedTarget?.closest('a, button, [data-cursor], .lineup-slide')) {
        state.cursor.isMorphed = false;
        cursorEl.classList.remove('cursor-morphed');
      }
    });

    // Cursor rAF Lerp Loop (0.18 lerp)
    function updateCursor() {
      if (!state.reducedMotion) {
        state.cursor.x += (state.mouse.x - state.cursor.x) * 0.18;
        state.cursor.y += (state.mouse.y - state.cursor.y) * 0.18;
        cursorEl.style.transform = `translate(${state.cursor.x}px, ${state.cursor.y}px)`;
      }
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);
  }

  /* ==========================================================================
     PRELOADER & FRAME LOADING
     ========================================================================== */

  function getFramePath(type, index) {
    const isMob = state.isMobile;
    const cfg = NOCTIS_CONFIG[type];
    const dir = isMob ? cfg.mobileDir : cfg.desktopDir;
    const num = String(index + 1).padStart(4, '0');
    return `${dir}${cfg.filePrefix}${num}${cfg.fileExt}`;
  }

  function startPreloader() {
    const preloaderEl = document.getElementById('preloader');
    const lineEl = document.getElementById('preloader-line');
    const counterEl = document.getElementById('preloader-counter');

    const heroTotal = NOCTIS_CONFIG.hero.frameCount;
    const dismantleTotal = NOCTIS_CONFIG.dismantle.frameCount;
    const initialBatch = Math.min(NOCTIS_CONFIG.preloader.heroInitialBatch, heroTotal);

    // Initialize cache arrays
    state.hero.cache = new Array(heroTotal);
    state.dismantle.cache = new Array(dismantleTotal);

    let initialLoaded = 0;

    // Load initial 40 frames of Hero first
    for (let i = 0; i < initialBatch; i++) {
      loadSingleFrame('hero', i, () => {
        initialLoaded++;
        const pct = Math.round((initialLoaded / initialBatch) * 100);
        if (lineEl) lineEl.style.width = `${pct}%`;
        if (counterEl) counterEl.textContent = String(pct).padStart(3, '0');

        if (initialLoaded === initialBatch) {
          onInitialBatchReady();
        }
      });
    }

    function onInitialBatchReady() {
      state.preloaded = true;
      if (lineEl) lineEl.classList.add('flash');

      // Draw initial frame
      drawHero();

      setTimeout(() => {
        if (preloaderEl) preloaderEl.classList.add('loaded');
        // Start the continuous render loop
        startRenderLoop();
        // Continue loading rest of frames in background
        loadRemainingFrames(initialBatch);
      }, 350);
    }
  }

  function loadSingleFrame(type, index, onComplete) {
    const sec = state[type];
    const path = getFramePath(type, index);

    const img = new Image();
    sec.cache[index] = { img, loaded: false };

    img.onload = () => {
      // Decode image off the main thread
      img.decode().then(() => {
        sec.cache[index].loaded = true;
        sec.loadedCount++;
        if (onComplete) onComplete();
      }).catch(() => {
        sec.cache[index].loaded = true;
        sec.loadedCount++;
        if (onComplete) onComplete();
      });
    };

    img.onerror = () => {
      sec.cache[index].loaded = false;
      if (onComplete) onComplete();
    };

    img.src = path;
  }

  function loadRemainingFrames(startIndex) {
    const heroTotal = NOCTIS_CONFIG.hero.frameCount;
    const dismantleTotal = NOCTIS_CONFIG.dismantle.frameCount;

    // Load rest of hero frames in small asynchronous chunks
    let currHero = startIndex;
    function loadNextHeroChunk() {
      const end = Math.min(currHero + 12, heroTotal);
      for (let i = currHero; i < end; i++) {
        loadSingleFrame('hero', i);
      }
      currHero = end;
      if (currHero < heroTotal) {
        setTimeout(loadNextHeroChunk, 16);
      } else {
        // Once hero finishes, load dismantle frames
        loadDismantleFrames();
      }
    }
    loadNextHeroChunk();

    function loadDismantleFrames() {
      let currDis = 0;
      function loadNextDisChunk() {
        const end = Math.min(currDis + 12, dismantleTotal);
        for (let i = currDis; i < end; i++) {
          loadSingleFrame('dismantle', i);
        }
        currDis = end;
        if (currDis < dismantleTotal) {
          setTimeout(loadNextDisChunk, 16);
        }
      }
      loadNextDisChunk();
    }
  }

  function reloadAllFrames() {
    // Re-trigger frame sources on breakpoint switch
    const heroTotal = NOCTIS_CONFIG.hero.frameCount;
    const dismantleTotal = NOCTIS_CONFIG.dismantle.frameCount;

    for (let i = 0; i < heroTotal; i++) {
      if (state.hero.cache[i]) {
        state.hero.cache[i].img.src = getFramePath('hero', i);
      }
    }
    for (let i = 0; i < dismantleTotal; i++) {
      if (state.dismantle.cache[i]) {
        state.dismantle.cache[i].img.src = getFramePath('dismantle', i);
      }
    }
    state.hero.lastDrawn = -1;
    state.dismantle.lastDrawn = -1;
  }

  function getNearestLoadedImage(type, targetIdx) {
    const sec = state[type];
    const total = NOCTIS_CONFIG[type].frameCount;
    if (sec.cache[targetIdx] && sec.cache[targetIdx].loaded) {
      return sec.cache[targetIdx].img;
    }
    // Search outwards for nearest loaded frame
    for (let delta = 1; delta < total; delta++) {
      const left = targetIdx - delta;
      if (left >= 0 && sec.cache[left]?.loaded) {
        return sec.cache[left].img;
      }
      const right = targetIdx + delta;
      if (right < total && sec.cache[right]?.loaded) {
        return sec.cache[right].img;
      }
    }
    return null;
  }

  /* ==========================================================================
     CANVAS FRAME RENDERING (Cover for landscape, contain for portrait)
     ========================================================================== */

  function renderFrame(ctx, img, canvasW, canvasH, isPortrait, fadeAlpha) {
    // Flat solid page background
    ctx.fillStyle = '#07080A';
    ctx.fillRect(0, 0, canvasW, canvasH);

    if (img && img.naturalWidth) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      let dw, dh, dx, dy;

      if (!isPortrait) {
        // Landscape: cover fit
        const scale = Math.max(canvasW / iw, canvasH / ih);
        dw = iw * scale;
        dh = ih * scale;
        dx = (canvasW - dw) / 2;
        dy = (canvasH - dh) / 2;
      } else {
        // Portrait: contain fit, vertically centered
        const scale = Math.min(canvasW / iw, canvasH / ih);
        dw = iw * scale;
        dh = ih * scale;
        dx = (canvasW - dw) / 2;
        dy = (canvasH - dh) / 2;
      }

      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Solid fade overlay if specified (over last 5% of scroll)
    if (fadeAlpha > 0) {
      ctx.fillStyle = `rgba(7, 8, 10, ${Math.min(fadeAlpha, 1)})`;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
  }

  /* ==========================================================================
     SCROLL ENGINE & MAIN RAF LOOP
     ========================================================================== */

  function startRenderLoop() {
    function tick() {
      updateScrollMetrics();
      updateHero();
      updateDismantle();
      updateCallouts();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function updateScrollMetrics() {
    state.scrollY = window.scrollY;

    // Helper progress formula: clamp(-wrapper.getBoundingClientRect().top / (wrapper.offsetHeight - innerHeight), 0, 1)
    function calcProgress(wrapper) {
      if (!wrapper) return 0;
      const rect = wrapper.getBoundingClientRect();
      const maxScroll = wrapper.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return 0;
      return Math.min(Math.max(-rect.top / maxScroll, 0), 1);
    }

    state.hero.progress = calcProgress(state.hero.wrapper);
    state.dismantle.progress = calcProgress(state.dismantle.wrapper);

    // Compute target frames
    const heroFrames = NOCTIS_CONFIG.hero.frameCount;
    state.hero.target = Math.round(state.hero.progress * (heroFrames - 1));

    const disFrames = NOCTIS_CONFIG.dismantle.frameCount;
    state.dismantle.target = Math.round(state.dismantle.progress * (disFrames - 1));
  }

  /* ==========================================================================
     HERO LOGIC: Frame interpolation, HUD telemetry, Sky chapters
     ========================================================================== */

  function updateHero() {
    const sec = state.hero;
    if (!sec.canvas || !sec.ctx) return;

    // Smooth frame lerp: current += (target - current) * 0.15
    if (state.reducedMotion) {
      sec.current = sec.target;
    } else {
      sec.current += (sec.target - sec.current) * 0.15;
    }

    const frameIdx = Math.min(Math.max(Math.round(sec.current), 0), NOCTIS_CONFIG.hero.frameCount - 1);

    // Redraw only when the rounded frame changes or forced
    if (frameIdx !== sec.lastDrawn) {
      sec.lastDrawn = frameIdx;
      drawHero(frameIdx);
    }

    // Update bottom 1px xenon progress line
    const progressEl = document.getElementById('hero-progress');
    if (progressEl) {
      progressEl.style.width = `${(sec.progress * 100).toFixed(2)}%`;
    }

    // Update Left-Edge HUD
    updateHeroHUD(sec.progress);

    // Update Sky Text Chapters
    updateHeroChapters(sec.progress);
  }

  function drawHero(forcedIdx) {
    const sec = state.hero;
    const idx = forcedIdx !== undefined ? forcedIdx : Math.round(sec.current);
    const img = getNearestLoadedImage('hero', idx);

    // Fade to solid black over last 5% of scroll
    let fadeAlpha = 0;
    if (sec.progress >= NOCTIS_CONFIG.hero.fadeStartProgress) {
      fadeAlpha = (sec.progress - NOCTIS_CONFIG.hero.fadeStartProgress) / (1 - NOCTIS_CONFIG.hero.fadeStartProgress);
    }

    const isPortrait = window.innerHeight > window.innerWidth;
    renderFrame(sec.ctx, img, window.innerWidth, window.innerHeight, isPortrait, fadeAlpha);
  }

  function updateHeroHUD(progress) {
    const speedEl = document.getElementById('hud-speed');
    const distEl = document.getElementById('hud-distance');
    const chEl = document.getElementById('hud-chapter');

    // Speed: 000 -> 118 KM/H
    const speed = Math.round(progress * NOCTIS_CONFIG.hero.hud.speedMax);
    if (speedEl) speedEl.textContent = String(speed).padStart(3, '0');

    // Distance: 0.0 -> 4.2 KM
    const dist = (progress * NOCTIS_CONFIG.hero.hud.distanceMax).toFixed(1);
    if (distEl) distEl.textContent = dist;

    // Active Chapter HUD Indicator
    const chapters = NOCTIS_CONFIG.hero.chapters;
    let activeCh = chapters[0].hudNum;
    for (const ch of chapters) {
      if (progress >= ch.start && progress <= ch.end) {
        activeCh = ch.hudNum;
        break;
      }
    }
    if (chEl) chEl.textContent = activeCh;
  }

  function updateHeroChapters(progress) {
    const chapters = NOCTIS_CONFIG.hero.chapters;

    chapters.forEach(ch => {
      const el = document.getElementById(ch.id);
      if (!el) return;

      const isActive = progress >= ch.start && progress <= ch.end;
      if (isActive) {
        if (!el.classList.contains('active')) {
          el.classList.add('active');
          el.setAttribute('aria-hidden', 'false');
        }
      } else {
        if (el.classList.contains('active')) {
          el.classList.remove('active');
          el.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  /* ==========================================================================
     STATEMENT SECTION: Word-by-word Reveal (15% -> 100% opacity)
     ========================================================================== */

  function initStatementReveal() {
    const textEl = document.getElementById('statement-text');
    if (!textEl) return;

    const sentence = NOCTIS_CONFIG.statement.sentence;
    const words = sentence.split(' ');

    textEl.innerHTML = words
      .map(w => `<span class="word">${w}</span>`)
      .join(' ');

    const wordEls = textEl.querySelectorAll('.word');
    const secEl = document.getElementById('statement-section');

    function onScrollStatement() {
      if (!secEl || wordEls.length === 0) return;
      const rect = secEl.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Reveal progress through the viewport
      const enter = windowH * 0.85;
      const leave = windowH * 0.15;
      const totalDist = enter - leave;
      const curr = enter - rect.top;
      const p = Math.min(Math.max(curr / totalDist, 0), 1);

      const totalWords = wordEls.length;
      wordEls.forEach((el, i) => {
        const wordThreshold = i / totalWords;
        const nextThreshold = (i + 1) / totalWords;
        let opacity = 0.15;
        if (p >= nextThreshold) {
          opacity = 1.0;
        } else if (p > wordThreshold) {
          const ratio = (p - wordThreshold) / (nextThreshold - wordThreshold);
          opacity = 0.15 + 0.85 * ratio;
        }
        el.style.opacity = opacity.toFixed(3);
      });
    }

    window.addEventListener('scroll', onScrollStatement, { passive: true });
    onScrollStatement();
  }

  /* ==========================================================================
     DISMANTLE SECTION: Technical Scrollytelling & 4 Callouts
     ========================================================================== */

  function updateDismantle() {
    const sec = state.dismantle;
    if (!sec.canvas || !sec.ctx) return;

    if (state.reducedMotion) {
      sec.current = sec.target;
    } else {
      sec.current += (sec.target - sec.current) * 0.15;
    }

    const frameIdx = Math.min(Math.max(Math.round(sec.current), 0), NOCTIS_CONFIG.dismantle.frameCount - 1);

    if (frameIdx !== sec.lastDrawn) {
      sec.lastDrawn = frameIdx;
      drawDismantle(frameIdx);
    }

    const progressEl = document.getElementById('dismantle-progress');
    if (progressEl) {
      progressEl.style.width = `${(sec.progress * 100).toFixed(2)}%`;
    }
  }

  function drawDismantle(forcedIdx) {
    const sec = state.dismantle;
    const idx = forcedIdx !== undefined ? forcedIdx : Math.round(sec.current);
    const img = getNearestLoadedImage('dismantle', idx);

    const isPortrait = window.innerHeight > window.innerWidth;
    renderFrame(sec.ctx, img, window.innerWidth, window.innerHeight, isPortrait, 0);
  }

  function initCallouts() {
    const container = document.getElementById('dismantle-callouts');
    if (!container) return;

    container.innerHTML = '';
    const callouts = NOCTIS_CONFIG.dismantle.callouts;

    callouts.forEach(c => {
      const item = document.createElement('div');
      item.className = 'callout-item';
      item.id = c.id;
      item.style.left = `${c.dotX}%`;
      item.style.top = `${c.dotY}%`;

      const dx = c.offsetX;
      const dy = c.offsetY;

      item.innerHTML = `
        <div class="callout-dot"></div>
        <svg class="callout-svg">
          <line class="callout-line" x1="0" y1="0" x2="${dx}" y2="${dy}" />
        </svg>
        <div class="callout-text" style="transform: translate(${dx > 0 ? dx + 12 : dx - 180}px, ${dy - 12}px); text-align: ${dx > 0 ? 'left' : 'right'};">
          <span class="callout-code">${c.code}</span>
          <span class="callout-desc">${c.title}</span>
        </div>
      `;
      container.appendChild(item);
    });
  }

  function updateCallouts() {
    const progress = state.dismantle.progress;
    const callouts = NOCTIS_CONFIG.dismantle.callouts;

    callouts.forEach(c => {
      const el = document.getElementById(c.id);
      if (!el) return;
      if (progress >= c.start) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     LINEUP SECTION: Hover & Keyboard Accordion
     ========================================================================== */

  function initLineupAccordion() {
    const container = document.getElementById('lineup-accordion');
    if (!container) return;

    const models = NOCTIS_CONFIG.lineup.models;
    container.innerHTML = '';

    models.forEach((m, i) => {
      const slide = document.createElement('div');
      slide.className = 'lineup-slide slide-enter';
      slide.setAttribute('role', 'button');
      slide.setAttribute('tabindex', '0');
      slide.setAttribute('aria-expanded', m.defaultOpen ? 'true' : 'false');
      slide.setAttribute('aria-label', `Model ${m.name}`);
      slide.id = `slide-${m.id}`;
      slide.dataset.index = i;

      // Closed view
      const closedView = `
        <div class="slide-closed-view" aria-hidden="${m.defaultOpen ? 'true' : 'false'}">
          <span class="closed-num">${m.index}</span>
          <span class="closed-name">${m.name}</span>
        </div>
        <img class="slide-car-crop-bg" src="${m.image}" alt="" loading="lazy" aria-hidden="true">
      `;

      // Swatches HTML
      const swatchesHtml = m.swatches
        .map((hex, sIdx) => `
          <button type="button" class="swatch-btn ${sIdx === 0 ? 'active' : ''}" style="background-color: ${hex};" data-color="${hex}" aria-label="Color option ${sIdx + 1}" data-cursor="VIEW"></button>
        `)
        .join('');

      // Open view
      const openView = `
        <div class="slide-open-view" aria-hidden="${m.defaultOpen ? 'false' : 'true'}">
          <div class="open-header">
            <span class="open-index">${m.index}</span>
            <h3 class="open-name">${m.name}</h3>
          </div>

          <div class="open-footer">
            <div class="open-tagline">${m.tagline}</div>
            <div class="open-specs-grid">
              ${m.specs.map(s => `
                <div class="open-spec-col">
                  <span class="spec-lbl">${s.label}</span>
                  <span class="spec-data">${s.value}</span>
                </div>
              `).join('')}
            </div>
            <div class="open-actions-row">
              <div class="swatches-row" role="group" aria-label="Color swatches">
                ${swatchesHtml}
              </div>
              <a href="#reserve-section" class="configure-link" data-cursor="CONFIGURE">Configure →</a>
            </div>
          </div>
        </div>

        <div class="slide-car-stage" aria-hidden="true">
          <img class="car-full-img" src="${m.image}" alt="${m.alt}" loading="lazy">
        </div>
        <div class="shared-floor-line" aria-hidden="true"></div>
      `;

      slide.innerHTML = closedView + openView;
      container.appendChild(slide);
    });

    // Stagger slide entrance on scroll into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const slides = container.querySelectorAll('.lineup-slide');
          slides.forEach((s, idx) => {
            setTimeout(() => {
              s.classList.add('slide-entered');
            }, idx * 80);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(container);

    // Interaction handling: Hover with 80ms debounce, Tap, and Keyboard arrows
    let hoverTimeout = null;

    function openSlide(index) {
      const slides = container.querySelectorAll('.lineup-slide');
      slides.forEach((s, i) => {
        const isOpen = i === index;
        s.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        const closedEl = s.querySelector('.slide-closed-view');
        const openEl = s.querySelector('.slide-open-view');
        if (closedEl) closedEl.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
        if (openEl) openEl.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      });
    }

    container.addEventListener('mouseenter', (e) => {
      const slide = e.target.closest('.lineup-slide');
      if (slide) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          openSlide(parseInt(slide.dataset.index, 10));
        }, 80);
      }
    }, true);

    container.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
    }, true);

    container.addEventListener('click', (e) => {
      const swatch = e.target.closest('.swatch-btn');
      if (swatch) {
        e.stopPropagation();
        const row = swatch.closest('.swatches-row');
        row.querySelectorAll('.swatch-btn').forEach(btn => btn.classList.remove('active'));
        swatch.classList.add('active');
        return;
      }

      const slide = e.target.closest('.lineup-slide');
      if (slide) {
        openSlide(parseInt(slide.dataset.index, 10));
      }
    });

    // Keyboard arrow navigation
    container.addEventListener('keydown', (e) => {
      const slides = Array.from(container.querySelectorAll('.lineup-slide'));
      const activeIdx = slides.findIndex(s => s.getAttribute('aria-expanded') === 'true');

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (activeIdx + 1) % slides.length;
        openSlide(next);
        slides[next].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (activeIdx - 1 + slides.length) % slides.length;
        openSlide(prev);
        slides[prev].focus();
      }
    });
  }

  /* ==========================================================================
     NAVBAR CONTROLLER (Hide on scroll down, show on scroll up)
     ========================================================================== */

  function initNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      const currY = window.scrollY;
      const isDown = currY > state.lastScrollY && currY > 120;
      nav.classList.toggle('nav-hidden', isDown);
      state.lastScrollY = currY;
    }, { passive: true });
  }

  /* ==========================================================================
     RESERVE SECTION CTA
     ========================================================================== */

  function initReserveSection() {
    const btn = document.getElementById('reserve-cta');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const originalText = btn.textContent;
      btn.textContent = 'ALLOCATION CONFIRMED — 2026';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 3000);
    });
  }

})();
