(() => {
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ——— First-visit loader (home only) ——— */
  const loader = document.getElementById('loader');
  if (loader) {
    document.body.classList.add('is-loading');
    const bar = loader.querySelector('.loader-bar span');
    const meta = loader.querySelector('.loader-meta');
    const phrases = ['Constructing the frame', 'Aligning the strata', 'Setting the plinth', 'Opening the site'];
    let prog = 0;
    let phrase = 0;
    const finish = () => {
      if (bar) bar.style.width = '100%';
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-loaded');
    };
    if (reduceMotion) {
      finish();
    } else {
      const id = setInterval(() => {
        prog = Math.min(100, prog + (prog < 60 ? 4 : prog < 85 ? 2.5 : 1.5));
        if (bar) bar.style.width = `${prog}%`;
        const idx = Math.min(phrases.length - 1, Math.floor(prog / 25));
        if (meta && idx !== phrase) {
          phrase = idx;
          meta.textContent = phrases[phrase];
        }
        if (prog >= 100) {
          clearInterval(id);
          finish();
        }
      }, 28);
      setTimeout(finish, 3200);
    }
  } else {
    document.body.classList.add('is-loaded');
  }

  /* ——— Visible dual cursor ——— */
  const cursor = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  if (finePointer && cursor && dot && ring) {
    root.classList.add('has-cursor');
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let visible = false;

    const label = document.querySelector('.cursor-label');
    const paint = () => {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (label) label.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(paint);
    };
    requestAnimationFrame(paint);

    window.addEventListener('pointermove', (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        cursor.classList.add('is-on');
      }
    }, { passive: true });

    window.addEventListener('pointerdown', () => root.classList.add('is-pressed'));
    window.addEventListener('pointerup', () => root.classList.remove('is-pressed'));

    const hoverTargets = 'a, button, input, textarea, select, .tilt-card, .gallery-card, .project, .model-stage, .magnetic, label';
    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener('pointerenter', () => {
        root.classList.add('is-hovering');
        if (el.matches('img, .project-image, .gallery-card, .masonry figure, .tilt-card')) {
          root.classList.add('is-hovering-media');
        }
      });
      el.addEventListener('pointerleave', () => {
        root.classList.remove('is-hovering', 'is-hovering-media');
      });
    });
  }

  /* ——— Scroll progress ——— */
  const progress = document.querySelector('.page-progress span');
  const onScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${p}%`;
    document.querySelectorAll('[data-nav]').forEach((nav) => {
      nav.classList.toggle('is-solid', window.scrollY > 40);
    });
  };
  window.addEventListener('scroll', onScrollUI, { passive: true });
  onScrollUI();

  /* ——— Split headlines ——— */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const html = el.innerHTML;
    const parts = html.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((line) => {
      const wrap = document.createElement('div');
      wrap.innerHTML = line;
      const textNodes = [];
      const walk = (node) => {
        if (node.nodeType === 3) textNodes.push(node);
        else node.childNodes.forEach(walk);
      };
      walk(wrap);
      textNodes.forEach((tn) => {
        const frag = document.createDocumentFragment();
        tn.textContent.split(/(\s+)/).forEach((chunk) => {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) {
            frag.appendChild(document.createTextNode(chunk));
          } else {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = chunk;
            frag.appendChild(span);
          }
        });
        tn.parentNode.replaceChild(frag, tn);
      });
      return `<span class="line">${wrap.innerHTML}</span>`;
    }).join('');
  });

  /* ——— Reveals + headline in ——— */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in', 'visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('[data-reveal], .reveal, [data-split]').forEach((el) => io.observe(el));
  // Kick hero immediately
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero [data-split], .hero [data-reveal], .page-hero [data-split], .page-hero [data-reveal]').forEach((el) => {
      el.classList.add('is-in', 'visible');
    });
  });

  /* ——— Hero parallax ——— */
  const heroImage = document.querySelector('.hero-bg img');
  window.addEventListener('scroll', () => {
    if (!heroImage || reduceMotion) return;
    const distance = Math.min(window.scrollY, 900);
    heroImage.style.transform = `scale(${1.02 + distance / 14000}) translateY(${distance * 0.08}px)`;
  }, { passive: true });

  document.querySelectorAll('.parallax-img img').forEach((img) => {
    const parent = img.closest('.parallax-img, .promise-image, .studio-image');
    if (!parent) return;
    window.addEventListener('scroll', () => {
      if (reduceMotion) return;
      const rect = parent.getBoundingClientRect();
      const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
      img.style.transform = `translate3d(0, ${mid * -0.06}px, 0)`;
    }, { passive: true });
  });

  /* ——— Tilt cards ——— */
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (reduceMotion) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-8px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ——— Magnetic elements ——— */
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (reduceMotion || !finePointer) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ——— Marquee duplication for seamless loop ——— */
  document.querySelectorAll('[data-marquee]').forEach((rail) => {
    rail.innerHTML += rail.innerHTML;
    rail.classList.add('is-marquee');
  });

  /* ——— Counters ——— */
  const countIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIo.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach((el) => countIo.observe(el));

  /* ——— Contact forms ——— */
  document.querySelectorAll('.contact-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('.form-note');
      if (note) note.textContent = 'Thank you — your enquiry is ready. We’ll be in touch shortly.';
      form.classList.add('is-sent');
      form.reset();
    });
  });

  /* ——— Gallery filters ——— */
  const filters = document.querySelector('.gallery-filter');
  if (filters) {
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      filters.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.masonry figure').forEach((fig) => {
        const show = f === 'all' || fig.dataset.cat === f;
        fig.style.display = show ? '' : 'none';
      });
    });
  }
})();
