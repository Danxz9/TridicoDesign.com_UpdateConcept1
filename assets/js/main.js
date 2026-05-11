
(function(){
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', (event) => {
      if (event.target.matches('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const filterBars = document.querySelectorAll('.filter-bar');
  filterBars.forEach((bar) => {
    const grid = bar.parentElement.querySelector('[data-filter-grid]');
    if (!grid) return;
    bar.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      const filter = button.dataset.filter;
      bar.querySelectorAll('[data-filter]').forEach((b) => b.classList.toggle('is-active', b === button));
      grid.querySelectorAll('.work-card').forEach((card) => {
        const categories = (card.dataset.category || '').split(/\s+/);
        card.hidden = filter !== 'all' && !categories.includes(filter);
      });
    });
  });

  document.querySelectorAll('form[data-mailto]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = form.dataset.mailto;
      const data = new FormData(form);
      const subject = encodeURIComponent('Project inquiry from tridicodesign.com');
      const lines = [
        'New Tridico Design project inquiry',
        '',
        'Name: ' + (data.get('name') || ''),
        'Email: ' + (data.get('email') || ''),
        'Phone: ' + (data.get('phone') || ''),
        'Project type: ' + (data.get('project_type') || ''),
        'Timeline: ' + (data.get('timeline') || ''),
        '',
        'Details:',
        data.get('details') || ''
      ];
      const body = encodeURIComponent(lines.join('\n'));
      const status = form.querySelector('[data-form-status]');
      if (status) status.textContent = 'Opening your email app with the project brief.';
      window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
    });
  });
})();
