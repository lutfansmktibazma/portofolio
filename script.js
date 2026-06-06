'use strict';

/* ============================================================
   LUTFAN IZZAT — Portfolio JS
   Features: Inertia scroll, char reveal, cursor, parallax,
             scroll-reveal, stat count-up
   ============================================================ */

// ── 1. LENIS SMOOTH SCROLLING ──────────────────────────────
// Replaces custom inertia with Lenis library for superior smoothness
(function () {
  // Initialize Lenis
  window.lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease-out
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // RAF loop for Lenis
  function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // Expose scrollToTarget for transitions
  window.scrollToTarget = function(y) {
    window.lenis.scrollTo(y, { immediate: true });
  };
})();

// ── 2. HAMBURGER MOBILE MENU ────────────────────────────────
(function () {
  const btn  = document.getElementById('navHamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  function close() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    if (window.lenis) window.lenis.start();
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    menu.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
    // Pause Lenis scroll while menu is open
    if (window.lenis) isOpen ? window.lenis.stop() : window.lenis.start();
  });

  // Close on any mobile nav link click
  menu.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      close();
      // Smooth scroll after short delay for CSS transition to finish
      const target = link.getAttribute('href');
      if (target && target.startsWith('#')) {
        setTimeout(() => {
          const el = document.querySelector(target);
          if (el && window.lenis) {
            window.lenis.scrollTo(el, { offset: -70 });
          }
        }, 200);
      }
    });
  });

  // Close on backdrop scroll
  window.addEventListener('scroll', () => { if (btn.classList.contains('open')) close(); }, { passive: true });
})();

// ── 3. CUSTOM CURSOR ─────────────────────────────────────
(function () {
  const dot  = document.createElement('div'); dot.id  = 'cur-dot';
  const ring = document.createElement('div'); ring.id = 'cur-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -200, my = -200, rx = -200, ry = -200;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  const big = 'a, button, .stat, .about-img-box, .about-img2-box, .hero-image-box';
  document.querySelectorAll(big).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = ring.style.height = '50px';
      dot.style.width  = dot.style.height  = '8px';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = ring.style.height = '28px';
      dot.style.width  = dot.style.height  = '5px';
    });
  });
})();

// ── 3. NAVIGATION ────────────────────────────────────────
(function () {
  const nav     = document.getElementById('nav');
  const nlHome  = document.getElementById('nl-home');
  const nlAbout = document.getElementById('nl-about');

  function tick() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 28);

    const aboutTop = (document.getElementById('about') || {}).offsetTop || 9999;
    const statsTop = (document.getElementById('stats') || {}).offsetTop || 9999;

    nlHome.classList.toggle('active',  y < aboutTop - 80);
    nlAbout.classList.toggle('active', y >= aboutTop - 80);
  }

  window.addEventListener('scroll', tick, { passive: true });
  tick();

  // Smooth hash navigation with sweep transition
  const varNav = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
  
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - varNav;
      
      const pt = document.getElementById('pageTransition');
      if (pt) {
        pt.style.transition = 'transform 0.6s cubic-bezier(0.85, 0, 0.15, 1)';
        pt.style.transform = 'translateY(0)';
        
        setTimeout(() => {
          if (window.scrollToTarget) window.scrollToTarget(top);
          else window.scrollTo(0, top);
          
          pt.style.transform = 'translateY(-100%)';
          
          setTimeout(() => {
            pt.style.transition = 'none';
            pt.style.transform = 'translateY(100%)';
          }, 600);
        }, 600);
      } else {
        if (window.scrollToTarget) window.scrollToTarget(top);
        else window.scrollTo(0, top);
      }
    });
  });
})();

// ── 4. HERO PARALLAX ─────────────────────────────────────
(function () {
  const wrap = document.getElementById('heroImgWrap');
  const img  = document.getElementById('heroImg');
  const frontWrap = document.getElementById('heroImgFrontWrap');
  const frontImg  = document.getElementById('heroImgFront');

  if (!wrap) return;

  function update({ scroll }) {
    const y = scroll || window.scrollY;
    const h = window.innerHeight;
    if (y <= h * 1.2) {
      const p = y / h;
      wrap.style.transform = `translateY(${p * 40}px)`;
      img.style.transform  = `scale(${1 + p * 0.035})`;
      
      if (frontWrap && frontImg) {
        frontWrap.style.transform = `translateY(${p * 40}px)`;
        frontImg.style.transform  = `scale(${1 + p * 0.035})`;
      }
    }
  }

  // Fallback to window scroll if lenis isn't ready
  if (window.lenis) {
    window.lenis.on('scroll', update);
  } else {
    window.addEventListener('scroll', () => update({ scroll: window.scrollY }), { passive: true });
  }
})();

// ── 5. SCROLL REVEAL ─────────────────────────────────────
(function () {
  const classes = [
    '.js-reveal-left', '.js-reveal-right',
    '.js-reveal-fade', '.js-reveal-fade2',
    '.js-reveal-img', '.js-reveal-img2',
    '.js-reveal-stmt',
    '#st-1', '#st-2', '#st-3', '#st-4',
  ];

  const els = document.querySelectorAll(classes.join(','));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach((el) => io.observe(el));

  // Hero elements: trigger after short delay on load
  window.addEventListener('load', () => {
    setTimeout(() => {
      ['.js-reveal-left', '.js-reveal-right', '.js-reveal-fade', '.js-reveal-fade2'].forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add('on');
          }
        });
      });
    }, 80);
  });
})();

// ── 6. STAT COUNT-UP ─────────────────────────────────────
(function () {
  const nums = document.querySelectorAll('.stat-n');
  const done = new Set();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || done.has(entry.target)) return;
      done.add(entry.target);

      const el      = entry.target;
      const target  = parseInt(el.dataset.target, 10);
      const suffix  = el.dataset.suffix || el.textContent.replace(/[0-9]/g, '');
      if (isNaN(target)) return;

      const DUR = 1800;
      const t0  = performance.now();

      (function tick(now) {
        const p = Math.min((now - t0) / DUR, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(e * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.7 });

  nums.forEach((n) => io.observe(n));
})();

// ── 7. CHARACTER REVEAL (scroll-driven, per-char) ────────
(function () {
  const copy = document.getElementById('aboutCopy');
  if (!copy) return;

  // — Wrap every character in a <span class="char"> —
  const paras = copy.querySelectorAll('p');
  const chars = [];

  paras.forEach((p) => {
    const text = p.textContent;
    p.textContent = '';

    [...text].forEach((ch) => {
      const s = document.createElement('span');
      s.className   = 'char';
      s.textContent = ch;
      p.appendChild(s);
      chars.push(s);
    });
  });

  const N = chars.length;
  if (N === 0) return;

  // — Interpolation config —
  const DIM    = 0.18;
  const BRIGHT = 1.0;
  const WIN    = 30;   // transition gradient width in chars

  function smoothstep(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  // — Compute reveal front from scroll position —
  function revealFront() {
    const section = document.getElementById('about');
    if (!section) return 0;

    const rect = section.getBoundingClientRect();
    const vh   = window.innerHeight;

    // Map: section top at 72%vh → start; section bottom at 15%vh → end
    const scrolled = vh * 0.72 - rect.top;
    const total    = section.offsetHeight - vh * 0.28;
    const progress = Math.max(0, Math.min(1, scrolled / total));

    return progress * N;
  }

  // — Update DOM —
  let pending = false;

  function update() {
    pending = false;
    const front = revealFront();

    chars.forEach((s, i) => {
      const dist = i - front;
      let alpha;

      if (dist <= -(WIN / 2)) {
        alpha = BRIGHT;
      } else if (dist >= (WIN / 2)) {
        alpha = DIM;
      } else {
        alpha = DIM + (BRIGHT - DIM) * smoothstep(WIN / 2, -(WIN / 2), dist);
      }

      // Dirty check — skip DOM write if unchanged
      if (s._a === undefined || Math.abs(s._a - alpha) > 0.004) {
        s.style.color = `rgba(255,255,255,${alpha.toFixed(3)})`;
        s._a = alpha;
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }, { passive: true });

  // Initial pass
  update();
})();

// ── 8. ROLLING TEXT HOVER (PER-CHARACTER) ────────────────
(function () {
  document.querySelectorAll('.roll-inner').forEach((el) => {
    const text = el.getAttribute('data-text');
    if (!text) return;
    
    el.innerHTML = ''; // Clear text
    el.removeAttribute('data-text');
    
    [...text].forEach((ch, i) => {
      const charSpan = document.createElement('span');
      charSpan.className = 'roll-char';
      charSpan.innerHTML = ch === ' ' ? '&nbsp;' : ch;
      charSpan.setAttribute('data-char', ch);
      
      // Add staggered delay (e.g., 0.02s per letter)
      charSpan.style.transitionDelay = `${i * 0.025}s`;
      
      el.appendChild(charSpan);
    });
  });
})();

