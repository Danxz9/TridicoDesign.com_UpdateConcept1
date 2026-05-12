
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

  document.querySelectorAll('[data-filter-bar]').forEach(bar => {
    const grid = document.querySelector('[data-filter-grid]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('[data-category]'));
    bar.addEventListener('click', event => {
      const btn = event.target.closest('[data-filter]');
      if (!btn) return;
      const filter = btn.dataset.filter;
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category.split(' ').includes(filter);
        card.classList.toggle('is-hidden', !show);
      });
    });
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
