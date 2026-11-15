/* Coreografía editorial progresiva y barra de lectura compartida */
(function () {
  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Barra superior de progreso de lectura
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.prepend(progressBar);

  let rafPending = false;
  function updateProgress() {
    rafPending = false;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
  }

  function onScrollProgress() {
    if (!rafPending) {
      rafPending = true;
      window.requestAnimationFrame(updateProgress);
    }
  }

  if (!prefersReduced) {
    window.addEventListener('scroll', onScrollProgress, { passive: true });
    window.addEventListener('resize', onScrollProgress, { passive: true });
    updateProgress();
  }

  // 2. Transición suave en pestañas dinámicas (B, D, E)
  function replayPanelAnimation(panel) {
    if (!panel || prefersReduced) return;
    panel.classList.remove('panel-enter');
    void panel.offsetWidth;
    panel.classList.add('panel-enter');
  }

  [
    { triggers: '.chapter-btn', target: '#chapterSheet' },
    { triggers: '.h-tab', target: '#catalogSheet' },
    { triggers: '.rail-tab', target: '#matrixStage' }
  ].forEach(({ triggers, target }) => {
    const targetEl = document.querySelector(target);
    if (!targetEl) return;
    document.querySelectorAll(triggers).forEach((btn) => {
      btn.addEventListener('click', () => replayPanelAnimation(targetEl));
    });
  });

  // 3. Resaltado sutil de capítulo activo en navegaciones superiores (A, B, D, E)
  const navSelectors = ['.nav-menu a', '.nav-links a', '.e-nav a', '.topbar-nav a'];
  const topNavLinks = Array.from(document.querySelectorAll(navSelectors.join(', ')))
    .filter((a) => {
      const href = a.getAttribute('href') || '';
      return href.startsWith('#') && href.length > 1 && !a.classList.contains('nav-btn') && !a.classList.contains('nav-cta') && !a.classList.contains('e-nav-cta') && !a.classList.contains('cta-cell');
    });

  if (topNavLinks.length > 0) {
    const mappedSections = topNavLinks
      .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
      .filter((item) => item.section);

    function syncTopNav() {
      const triggerY = window.innerHeight * 0.36;
      let activeSection = null;
      for (const item of mappedSections) {
        if (item.section.getBoundingClientRect().top <= triggerY) {
          activeSection = item.section;
        }
      }
      if (window.scrollY < 140) {
        activeSection = null;
      } else if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40 && mappedSections.length > 0) {
        activeSection = mappedSections[mappedSections.length - 1].section;
      }
      mappedSections.forEach(({ link, section }) => {
        link.classList.toggle('is-current', section === activeSection);
      });
    }

    window.addEventListener('scroll', syncTopNav, { passive: true });
    window.addEventListener('resize', syncTopNav, { passive: true });
    syncTopNav();
  }

  // 4. Coreografía de portada + aparición progresiva al scrollear
  if (prefersReduced) {
    return;
  }

  function applyHeroStage(selector, baseDelay, stepDelay, isPortrait) {
    const els = Array.from(document.querySelectorAll(selector));
    els.forEach((el, idx) => {
      el.classList.add(isPortrait ? 'reveal-portrait' : 'reveal-hero');
      el.style.setProperty('--reveal-delay', `${baseDelay + idx * stepDelay}ms`);
    });
    return els;
  }

  const heroAnimated = [
    // Variante F
    ...applyHeroStage('.cover-portrait-col .peripheral-row', 40, 0, false),
    ...applyHeroStage('.role-stack li', 90, 50, false),
    ...applyHeroStage('.cover-statement-col .peripheral-row', 50, 0, false),
    ...applyHeroStage('.void-tag', 110, 0, false),
    ...applyHeroStage('.cover-headline', 150, 0, false),
    ...applyHeroStage('.cover-subgrid > *', 210, 60, false),
    ...applyHeroStage('.cover-portrait', 130, 0, true),

    // Variante D
    ...applyHeroStage('.axes-mono', 40, 0, false),
    ...applyHeroStage('.horizon-title', 95, 0, false),
    ...applyHeroStage('.horizon-lead', 155, 0, false),
    ...applyHeroStage('.horizon-actions', 210, 0, false),
    ...applyHeroStage('.side-dossier', 90, 0, false),
    ...applyHeroStage('.horizon-portrait', 150, 0, true),

    // Variante E
    ...applyHeroStage('.manifesto-kicker', 40, 0, false),
    ...applyHeroStage('.manifesto-h1', 95, 0, false),
    ...applyHeroStage('.signature-col', 165, 0, false),
    ...applyHeroStage('.triptych-panel', 180, 85, false),

    // Variante A
    ...applyHeroStage('.marginal-note', 40, 0, false),
    ...applyHeroStage('.hero-copy .kicker', 60, 0, false),
    ...applyHeroStage('.hero-title', 110, 0, false),
    ...applyHeroStage('.hero-lead', 165, 0, false),
    ...applyHeroStage('.hero-actions', 215, 0, false),
    ...applyHeroStage('.portrait-meta-top', 100, 0, false),
    ...applyHeroStage('.portrait-editorial img', 140, 0, true),

    // Variante B
    ...applyHeroStage('.hero-eyebrow', 40, 0, false),
    ...applyHeroStage('.hero-headline', 95, 0, false),
    ...applyHeroStage('.hero-rule-accent', 140, 0, false),
    ...applyHeroStage('.hero-desc', 175, 0, false),
    ...applyHeroStage('.hero-btn-row', 225, 0, false),
    ...applyHeroStage('.portrait-label', 80, 0, false),
    ...applyHeroStage('.portrait-meta-bar', 200, 0, false),
    ...applyHeroStage('.portrait-cell img', 130, 0, true)
  ];

  // Activación inmediata tras el primer paint del hero
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      heroAnimated.forEach((el) => el.classList.add('is-in'));
    });
  });
  window.setTimeout(() => {
    heroAnimated.forEach((el) => el.classList.add('is-in'));
  }, 450);

  // Elementos de scroll progresivo agrupados por ritmo visual
  const scrollRevealSelectors = [
    // Cabeceras y citas
    '.sec-kicker',
    '.sec-head-split > *',
    '.manifesto-quote',
    '.sec-head > *',
    '.quote-ribbon',
    '.bio-content-col > *',
    '.catalog-head > *',
    '.records-section .sec-tag',
    '.records-section .bio-heading',
    '.section-header > *',
    '.sticky-column > *',
    '.module-head > *',
    // Ítems con ritmo escalonado por grupo
    '.frieze-item',
    '.ledger-row',
    '.bauhaus-mod',
    '.navy-col',
    '.chapter-btn',
    '.diptych-item',
    '.pillar-mini',
    '.mile-item',
    '.pillar-item',
    '.chapter-row',
    '.milestone-item',
    '.photo-card',
    '.axis-cell',
    '.rail-tab',
    '.inst-cell',
    '.mosaic-card',
    // Credenciales académicas
    '.archive-head',
    '.archive-table li',
    '.acad-block h3',
    '.acad-items li',
    '.record-table tbody tr',
    '.degrees-group h4',
    '.degree-list li',
    '.degree-cell',
    // Cierres de contacto
    '.contact-split > *',
    '.e-contact-grid > *',
    '.contact-grid > *',
    '.contact-cells > *'
  ];

  const staggerGroups = [
    '.frieze-grid',
    '.ledger-list',
    '.bauhaus-grid',
    '.navy-cols',
    '.chapter-nav',
    '.diptych-grid',
    '.three-pillars-row',
    '.milestones-bar',
    '.pillars-grid',
    '.practice-index',
    '.milestone-box',
    '.chronicle-layout',
    '.axes-strip',
    '.matrix-rail',
    '.institutional-grid',
    '.mosaic-grid',
    '.archive-table',
    '.acad-items',
    '.record-table tbody',
    '.degree-list',
    '.degrees-grid',
    '.contact-split',
    '.e-contact-grid',
    '.contact-grid',
    '.contact-cells'
  ];

  const fastCascadeParents = new Set(['ARCHIVE-TABLE', 'ACAD-ITEMS', 'TBODY', 'DEGREE-LIST', 'DEGREES-GRID']);

  const allTargets = new Set();
  scrollRevealSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (!el.classList.contains('reveal-hero') && !el.classList.contains('reveal-portrait')) {
        el.classList.add('reveal-item');
        allTargets.add(el);
      }
    });
  });

  // Retrato interior de Variante E
  document.querySelectorAll('.bio-portrait-col img').forEach((img) => {
    img.classList.add('reveal-portrait');
    img.style.setProperty('--reveal-delay', '120ms');
    allTargets.add(img);
  });

  // Calcular delays escalonados por contenedor padre
  staggerGroups.forEach((parentSel) => {
    document.querySelectorAll(parentSel).forEach((parent) => {
      const isFast =
        parent.classList.contains('archive-table') ||
        parent.classList.contains('acad-items') ||
        parent.tagName === 'TBODY' ||
        parent.classList.contains('degree-list') ||
        parent.classList.contains('degrees-grid');
      const step = isFast ? 35 : 65;
      const cap = isFast ? 220 : 260;

      const children = Array.from(parent.children).filter((c) => allTargets.has(c));
      children.forEach((child, index) => {
        child.style.setProperty('--reveal-delay', `${Math.min(index * step, cap)}ms`);
      });
    });
  });

  const revealArray = Array.from(allTargets);

  function revealVisibleInViewport() {
    const limitY = window.innerHeight * 0.96;
    revealArray.forEach((el) => {
      if (el.classList.contains('is-in')) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < limitY && rect.bottom > 0) {
        el.classList.add('is-in');
      }
    });
  }

  function revealAllRemaining() {
    revealArray.forEach((el) => el.classList.add('is-in'));
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -36px 0px' }
    );

    revealArray.forEach((el) => observer.observe(el));
  } else {
    revealAllRemaining();
  }

  // Salvaguarda 1: lo que ya asoma al cargar en pantalla entra sin esperar scroll
  window.requestAnimationFrame(revealVisibleInViewport);

  // Salvaguarda 2: clics en enlaces internos (#seccion) revelan destino incluso en saltos largos
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      window.setTimeout(revealVisibleInViewport, 150);
      window.setTimeout(revealVisibleInViewport, 600);
    });
  });

  // Salvaguarda 3: al llegar al fondo del documento se revela cualquier elemento pendiente
  window.addEventListener(
    'scroll',
    () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 36) {
        revealAllRemaining();
      }
    },
    { passive: true }
  );
})();
