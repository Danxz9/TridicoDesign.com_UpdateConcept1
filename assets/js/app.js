
(function(){
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobile = document.querySelector('[data-mobile-menu]');
  if (header) {
    const setHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    setHeader(); window.addEventListener('scroll', setHeader, {passive:true});
  }
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      mobile.hidden = open;
      document.body.classList.toggle('menu-open', !open);
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      mobile.hidden = true;
      document.body.classList.remove('menu-open');
    }));
  }

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, {threshold: .12, rootMargin: '0px 0px -40px 0px'});
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-compare]').forEach(compare => {
    const input = compare.querySelector('input[type="range"]');
    if (!input) return;
    const update = () => compare.style.setProperty('--position', input.value + '%');
    input.addEventListener('input', update);
    update();
  });

  const setContainBackdrop = (media, img) => {
    if (!img) return;
    const src = img.currentSrc || img.getAttribute('src');
    if (src) media.style.setProperty('--media-backdrop', `url("${new URL(src, window.location.href).href}")`);
  };

  document.querySelectorAll('.portfolio-media--contain').forEach(media => {
    setContainBackdrop(media, media.querySelector('img'));
  });

  document.querySelectorAll('[data-filter-bar]').forEach(bar => {
    const grid = bar.closest('section')?.querySelector('[data-filter-grid]') || document.querySelector('[data-filter-grid]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('[data-category]'));
    const secondaryButtons = Array.from(bar.querySelectorAll('[data-filter-secondary]'));
    const tertiaryButtons = Array.from(bar.querySelectorAll('[data-filter-tertiary]'));
    let secondaryFilter = 'all';
    let tertiaryFilter = '';
    const setPressed = (button, active) => {
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    };
    const applyFilters = () => {
      const secondaryTokens = secondaryFilter === 'all' ? ['design', 'production'] : [secondaryFilter];
      secondaryButtons.forEach(button => {
        const value = button.dataset.filterSecondary;
        const active = value === 'all'
          ? secondaryFilter === 'all'
          : secondaryFilter === 'all' || secondaryFilter === value;
        setPressed(button, active);
      });
      tertiaryButtons.forEach(button => setPressed(button, button.dataset.filterTertiary === tertiaryFilter));
      cards.forEach(card => {
        const categories = card.dataset.category.split(' ');
        const matchesSecondary = secondaryTokens.some(token => categories.includes(token));
        const matchesTertiary = !tertiaryFilter || categories.includes(tertiaryFilter);
        card.classList.toggle('is-hidden', !(matchesSecondary && matchesTertiary));
      });
    };
    bar.addEventListener('click', event => {
      const secondaryBtn = event.target.closest('[data-filter-secondary]');
      if (secondaryBtn) {
        secondaryFilter = secondaryBtn.dataset.filterSecondary;
        if (secondaryFilter === 'all') tertiaryFilter = '';
        applyFilters();
        return;
      }
      const btn = event.target.closest('[data-filter-tertiary]');
      if (!btn) return;
      const filter = btn.dataset.filterTertiary;
      tertiaryFilter = tertiaryFilter === filter ? '' : filter;
      applyFilters();
    });
    applyFilters();
  });

  document.querySelectorAll('[data-card-deck]').forEach(deck => {
    const cards = Array.from(deck.querySelectorAll('[data-deck-card]'));
    const dots = Array.from(deck.querySelectorAll('[data-deck-dot]'));
    const prev = deck.querySelector('[data-deck-prev]');
    const next = deck.querySelector('[data-deck-next]');
    if (!cards.length) return;
    let active = cards.findIndex(card => card.classList.contains('is-active'));
    if (active < 0) active = 0;
    const setActive = index => {
      active = (index + cards.length) % cards.length;
      cards.forEach((card, i) => {
        const isActive = i === active;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-hidden', String(!isActive));
      });
      dots.forEach((dot, i) => {
        const isActive = i === active;
        dot.classList.toggle('is-active', isActive);
        if (isActive) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };
    if (prev) prev.addEventListener('click', () => setActive(active - 1));
    if (next) next.addEventListener('click', () => setActive(active + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => setActive(i)));
    deck.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActive(active - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActive(active + 1);
      }
    });
    setActive(active);
  });

  document.querySelectorAll('[data-portfolio-carousel]').forEach(carousel => {
    const slides = Array.from(carousel.querySelectorAll('[data-portfolio-slide]'));
    const prev = carousel.querySelector('[data-portfolio-prev]');
    const next = carousel.querySelector('[data-portfolio-next]');
    if (!slides.length) return;
    let active = slides.findIndex(slide => slide.classList.contains('is-active'));
    if (active < 0) active = 0;
    const setActive = index => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const isActive = i === active;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
        slide.tabIndex = isActive ? 0 : -1;
      });
      if (carousel.classList.contains('portfolio-media--contain')) {
        setContainBackdrop(carousel, slides[active]?.querySelector('img'));
      }
    };
    if (slides.length < 2) {
      if (prev) prev.hidden = true;
      if (next) next.hidden = true;
    } else {
      if (prev) {
        prev.addEventListener('click', event => {
          event.preventDefault();
          setActive(active - 1);
        });
      }
      if (next) {
        next.addEventListener('click', event => {
          event.preventDefault();
          setActive(active + 1);
        });
      }
      carousel.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          setActive(active - 1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          setActive(active + 1);
        }
      });
    }
    setActive(active);
  });

  function serializeForm(form){
    const data = new FormData(form);
    const lines = [];
    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        if (value.name) lines.push(`${key}: ${value.name}`);
      } else if (String(value).trim()) {
        lines.push(`${key}: ${String(value).trim()}`);
      }
    }
    return lines.join('\n');
  }
  document.querySelectorAll('form[data-mailto]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const to = form.dataset.mailto;
      const status = form.querySelector('[data-form-status]');
      const subjectBase = form.id === 'quoteForm' ? 'Quote Request' : form.id === 'uploadForm' ? 'Artwork Upload' : 'Website Contact';
      const body = serializeForm(form) + '\n\n---\nSubmitted from TridicoDesign.com static website concept.';
      const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subjectBase + ' - Tridico Design')}&body=${encodeURIComponent(body)}`;
      if (status) status.textContent = 'Opening your email app. Attach files manually if needed.';
      window.location.href = href;
    });
  });
})();
