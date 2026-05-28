
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

  const hydratePortfolioImage = img => {
    if (!img || img.getAttribute('src')) return;
    const src = img.dataset.src;
    if (src) img.setAttribute('src', src);
  };

  const hydratePortfolioCard = card => {
    if (!card || card.dataset.assetsLoaded === 'true') return;
    card.querySelectorAll('img[data-src]').forEach(hydratePortfolioImage);
    card.dataset.assetsLoaded = 'true';
    card.querySelectorAll('.portfolio-media--contain').forEach(media => {
      const activeImg = media.querySelector('.portfolio-slide.is-active img') || media.querySelector('img');
      setContainBackdrop(media, activeImg);
    });
  };

  document.querySelectorAll('.portfolio-media--contain').forEach(media => {
    setContainBackdrop(media, media.querySelector('img'));
  });

  document.querySelectorAll('[data-filter-bar]').forEach(bar => {
    const section = bar.closest('section');
    const grid = section?.querySelector('[data-filter-grid]') || document.querySelector('[data-filter-grid]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('[data-category]'));
    const secondaryButtons = Array.from(bar.querySelectorAll('[data-filter-secondary]'));
    const tertiaryButtons = Array.from(bar.querySelectorAll('[data-filter-tertiary]'));
    const loadMoreWrap = section?.querySelector('[data-portfolio-load-more-wrap]');
    const loadMoreButton = loadMoreWrap?.querySelector('[data-portfolio-load-more]');
    const loadMoreCount = loadMoreWrap?.querySelector('[data-portfolio-count]');
    const pageSize = Math.max(1, Number(grid.dataset.portfolioPageSize) || 12);
    let secondaryFilter = 'all';
    let tertiaryFilter = '';
    let visibleLimit = pageSize;
    const setPressed = (button, active) => {
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    };
    const cardMatchesFilters = card => {
      const categories = card.dataset.category.split(' ');
      const secondaryTokens = secondaryFilter === 'all' ? ['design', 'production'] : [secondaryFilter];
      const matchesSecondary = secondaryTokens.some(token => categories.includes(token));
      const matchesTertiary = !tertiaryFilter || categories.includes(tertiaryFilter);
      return matchesSecondary && matchesTertiary;
    };
    const updateLoadMoreControls = matches => {
      if (!loadMoreWrap) return;
      const shown = Math.min(visibleLimit, matches.length);
      if (loadMoreCount) {
        loadMoreCount.textContent = matches.length
          ? `Showing ${shown} of ${matches.length} projects`
          : 'No projects match the selected filters.';
      }
      if (loadMoreButton) {
        const remaining = Math.max(matches.length - shown, 0);
        loadMoreButton.hidden = remaining === 0;
        loadMoreButton.setAttribute('aria-label', `Show 12 more projects. ${remaining} remaining.`);
      }
    };
    const applyFilters = () => {
      secondaryButtons.forEach(button => {
        const value = button.dataset.filterSecondary;
        const active = value === 'all'
          ? secondaryFilter === 'all'
          : secondaryFilter === 'all' || secondaryFilter === value;
        setPressed(button, active);
      });
      tertiaryButtons.forEach(button => setPressed(button, button.dataset.filterTertiary === tertiaryFilter));
      const matches = cards.filter(cardMatchesFilters);
      const matchedCards = new Set(matches);
      const visibleCards = new Set(matches.slice(0, visibleLimit));
      cards.forEach(card => {
        const isMatch = matchedCards.has(card);
        const isVisible = visibleCards.has(card);
        card.classList.toggle('is-hidden', !isMatch);
        card.classList.toggle('is-deferred', isMatch && !isVisible);
        if (isVisible) hydratePortfolioCard(card);
      });
      updateLoadMoreControls(matches);
    };
    bar.addEventListener('click', event => {
      const secondaryBtn = event.target.closest('[data-filter-secondary]');
      if (secondaryBtn) {
        secondaryFilter = secondaryBtn.dataset.filterSecondary;
        if (secondaryFilter === 'all') tertiaryFilter = '';
        visibleLimit = pageSize;
        applyFilters();
        return;
      }
      const btn = event.target.closest('[data-filter-tertiary]');
      if (!btn) return;
      const filter = btn.dataset.filterTertiary;
      tertiaryFilter = tertiaryFilter === filter ? '' : filter;
      visibleLimit = pageSize;
      applyFilters();
    });
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', () => {
        visibleLimit += pageSize;
        applyFilters();
      });
    }
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

  const accountStorageKey = 'tridicoMockAccount';
  const getAccount = () => {
    try {
      return JSON.parse(window.localStorage.getItem(accountStorageKey) || 'null');
    } catch {
      return null;
    }
  };
  const saveAccount = account => window.localStorage.setItem(accountStorageKey, JSON.stringify(account));
  const clearAccount = () => window.localStorage.removeItem(accountStorageKey);
  const getDisplayName = email => {
    const raw = String(email || '').split('@')[0].replace(/[._-]+/g, ' ').trim();
    return raw ? raw.replace(/\b\w/g, char => char.toUpperCase()) : 'Client';
  };
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
  const homeHref = document.querySelector('.brand')?.getAttribute('href') || 'index.html';
  const siteRoot = homeHref.replace(/index\.html(?:[#?].*)?$/, '');
  const sitePath = path => `${siteRoot}${path}`;

  const accountIcon = '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>';
  const accountDesktopButton = document.createElement('button');
  accountDesktopButton.className = 'btn btn-small account-trigger';
  accountDesktopButton.type = 'button';
  accountDesktopButton.dataset.accountOpen = 'true';

  const accountMobileButton = document.createElement('button');
  accountMobileButton.className = 'account-mobile-link';
  accountMobileButton.type = 'button';
  accountMobileButton.dataset.accountOpen = 'true';

  const refreshAccountTriggers = () => {
    const account = getAccount();
    const label = account ? 'Account' : 'Login';
    accountDesktopButton.innerHTML = `${accountIcon}<span>${label}</span>`;
    accountDesktopButton.setAttribute('aria-label', account ? `Open account for ${account.name}` : 'Open account login');
    accountMobileButton.innerHTML = `${accountIcon}<span>${account ? 'Client Account' : 'Account Login'}</span>`;
  };

  const headerActions = document.querySelector('.header-actions');
  if (headerActions) headerActions.prepend(accountDesktopButton);
  const mobilePanelInner = document.querySelector('.mobile-panel-inner');
  if (mobilePanelInner) {
    const firstMobileCta = mobilePanelInner.querySelector('.btn');
    if (firstMobileCta) mobilePanelInner.insertBefore(accountMobileButton, firstMobileCta);
    else mobilePanelInner.append(accountMobileButton);
  }

  const scheduleOptions = [
    {
      id: 'car-decal-install',
      title: 'Car Decal Install',
      duration: '45-90 min',
      detail: 'Schedule vehicle lettering, spot decals, door graphics, or small install work.'
    },
    {
      id: 'consultation',
      title: 'Consultation',
      duration: '30 min',
      detail: 'Talk through a new design, wrap, sign, print, or branding project before quoting.'
    },
    {
      id: 'on-site-installation',
      title: 'On-Site Installation',
      duration: 'Site dependent',
      detail: 'Plan installation for storefront, wall, window, sign, or display graphics at your location.'
    },
    {
      id: 'meeting',
      title: 'Meeting',
      duration: '30-60 min',
      detail: 'Book a general project meeting, proof review, or production handoff conversation.'
    },
    {
      id: 'vehicle-wrap-review',
      title: 'Vehicle Wrap Review',
      duration: '30-45 min',
      detail: 'Review vehicle condition, measurements, placement, photos, and wrap direction.'
    },
    {
      id: 'storefront-site-survey',
      title: 'Storefront Site Survey',
      duration: '45 min',
      detail: 'Review windows, walls, sign placement, measurements, surfaces, and visibility goals.'
    },
    {
      id: 'artwork-file-review',
      title: 'Artwork / File Review',
      duration: '20-30 min',
      detail: 'Check logos, PDFs, design files, measurements, bleed, scale, and production readiness.'
    },
    {
      id: 'pickup-dropoff',
      title: 'Pickup / Drop-off',
      duration: '15 min',
      detail: 'Coordinate materials, samples, proofs, printed items, or project handoff.'
    }
  ];

  const closeMobileMenu = () => {
    const open = toggle?.getAttribute('aria-expanded') === 'true';
    if (open && mobile) {
      toggle.setAttribute('aria-expanded', 'false');
      mobile.hidden = true;
      document.body.classList.remove('menu-open');
    }
  };

  const scheduleIcon = '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>';
  const scheduleWrap = document.createElement('div');
  scheduleWrap.className = 'schedule-dropdown';
  scheduleWrap.innerHTML = `
    <button class="btn btn-small schedule-trigger" type="button" aria-haspopup="true" aria-expanded="false">
      ${scheduleIcon}<span>Schedule</span>
    </button>
    <div class="schedule-menu" role="menu" hidden>
      <p>Schedule an appointment</p>
      ${scheduleOptions.map(option => `
        <button type="button" role="menuitem" data-schedule-choice="${escapeHtml(option.id)}">
          <strong>${escapeHtml(option.title)}</strong>
          <span>${escapeHtml(option.duration)} - ${escapeHtml(option.detail)}</span>
        </button>`).join('')}
    </div>`;

  const scheduleTrigger = scheduleWrap.querySelector('.schedule-trigger');
  const scheduleMenu = scheduleWrap.querySelector('.schedule-menu');
  const quoteButton = headerActions?.querySelector('a[href$="quote.html"], a[href*="quote.html"]');
  if (headerActions) {
    if (quoteButton) headerActions.insertBefore(scheduleWrap, quoteButton);
    else headerActions.append(scheduleWrap);
  }

  let scheduleMobile = null;
  if (mobilePanelInner) {
    scheduleMobile = document.createElement('details');
    scheduleMobile.className = 'schedule-mobile-dropdown';
    scheduleMobile.innerHTML = `
      <summary>${scheduleIcon}<span>Schedule Appointment</span></summary>
      <div>
        ${scheduleOptions.map(option => `
          <button type="button" data-schedule-choice="${escapeHtml(option.id)}">
            <strong>${escapeHtml(option.title)}</strong>
            <span>${escapeHtml(option.duration)}</span>
          </button>`).join('')}
      </div>`;
    const firstMobileCta = mobilePanelInner.querySelector('.btn');
    if (accountMobileButton.parentElement === mobilePanelInner) mobilePanelInner.insertBefore(scheduleMobile, accountMobileButton);
    else if (firstMobileCta) mobilePanelInner.insertBefore(scheduleMobile, firstMobileCta);
    else mobilePanelInner.append(scheduleMobile);
  }

  const scheduleModal = document.createElement('div');
  scheduleModal.className = 'schedule-modal';
  scheduleModal.hidden = true;
  scheduleModal.innerHTML = `
    <div class="schedule-modal__backdrop" data-schedule-close></div>
    <section class="schedule-modal__panel" role="dialog" aria-modal="true" aria-labelledby="schedule-title" tabindex="-1">
      <button class="schedule-modal__close" type="button" data-schedule-close aria-label="Close schedule dialog">&times;</button>
      <div class="schedule-modal__head">
        <span class="schedule-modal__mark">${scheduleIcon}</span>
        <div>
          <p>Appointment request</p>
          <h2 id="schedule-title">Schedule an Appointment</h2>
        </div>
      </div>
      <form class="schedule-form" data-schedule-form novalidate>
        <div class="schedule-choice-card" data-schedule-detail></div>
        <label>Appointment type
          <select name="appointmentType" data-schedule-type required>
            ${scheduleOptions.map(option => `<option value="${escapeHtml(option.id)}">${escapeHtml(option.title)}</option>`).join('')}
          </select>
        </label>
        <div class="schedule-form-row">
          <label>Preferred date
            <input type="date" name="preferredDate" required>
          </label>
          <label>Preferred time
            <select name="preferredTime" required>
              <option value="">Choose a time</option>
              <option>9:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>12:00 PM</option>
              <option>1:00 PM</option>
              <option>2:00 PM</option>
              <option>3:00 PM</option>
              <option>4:00 PM</option>
              <option>5:00 PM</option>
              <option>First Available</option>
            </select>
          </label>
        </div>
        <div class="schedule-form-row">
          <label>Name
            <input type="text" name="name" autocomplete="name" placeholder="Your name" required>
          </label>
          <label>Phone or email
            <input type="text" name="contact" autocomplete="email" placeholder="How should Tridico reach you?" required>
          </label>
        </div>
        <label>Project notes
          <textarea name="notes" rows="4" placeholder="Vehicle, location, project type, deadline, or anything Tridico should know."></textarea>
        </label>
        <button class="btn btn-primary schedule-submit" type="submit">Request Appointment</button>
        <p class="schedule-note">No appointment is confirmed until Tridico responds.</p>
        <p class="schedule-status" data-schedule-status></p>
      </form>
    </section>`;
  document.body.append(scheduleModal);

  const schedulePanel = scheduleModal.querySelector('.schedule-modal__panel');
  const scheduleForm = scheduleModal.querySelector('[data-schedule-form]');
  const scheduleType = scheduleModal.querySelector('[data-schedule-type]');
  const scheduleDetail = scheduleModal.querySelector('[data-schedule-detail]');
  const scheduleStatus = scheduleModal.querySelector('[data-schedule-status]');
  let lastFocusedScheduleTrigger = null;

  const getScheduleOption = id => scheduleOptions.find(option => option.id === id) || scheduleOptions[0];
  const renderScheduleDetail = id => {
    const option = getScheduleOption(id);
    if (!scheduleDetail) return;
    scheduleDetail.innerHTML = `
      <strong>${escapeHtml(option.title)}</strong>
      <span>${escapeHtml(option.duration)}</span>
      <p>${escapeHtml(option.detail)}</p>`;
  };
  const closeScheduleMenu = () => {
    if (!scheduleMenu || !scheduleTrigger) return;
    scheduleMenu.hidden = true;
    scheduleTrigger.setAttribute('aria-expanded', 'false');
  };
  const toggleScheduleMenu = () => {
    if (!scheduleMenu || !scheduleTrigger) return;
    const open = scheduleTrigger.getAttribute('aria-expanded') === 'true';
    scheduleMenu.hidden = open;
    scheduleTrigger.setAttribute('aria-expanded', String(!open));
  };
  const openSchedule = (optionId, trigger) => {
    const option = getScheduleOption(optionId);
    lastFocusedScheduleTrigger = trigger || document.activeElement;
    closeScheduleMenu();
    closeMobileMenu();
    if (scheduleType) scheduleType.value = option.id;
    renderScheduleDetail(option.id);
    if (scheduleStatus) scheduleStatus.textContent = '';
    const dateInput = scheduleForm?.elements.preferredDate;
    if (dateInput && !dateInput.min) dateInput.min = new Date().toISOString().slice(0, 10);
    scheduleModal.hidden = false;
    document.body.classList.add('schedule-modal-open');
    window.requestAnimationFrame(() => schedulePanel?.focus());
  };
  const closeSchedule = () => {
    scheduleModal.hidden = true;
    document.body.classList.remove('schedule-modal-open');
    if (lastFocusedScheduleTrigger && typeof lastFocusedScheduleTrigger.focus === 'function') {
      lastFocusedScheduleTrigger.focus();
    }
  };

  scheduleTrigger?.addEventListener('click', event => {
    event.stopPropagation();
    toggleScheduleMenu();
  });
  scheduleWrap.querySelectorAll('[data-schedule-choice]').forEach(button => {
    button.addEventListener('click', () => openSchedule(button.dataset.scheduleChoice, button));
  });
  scheduleMobile?.querySelectorAll('[data-schedule-choice]').forEach(button => {
    button.addEventListener('click', () => openSchedule(button.dataset.scheduleChoice, button));
  });
  document.addEventListener('click', event => {
    if (!scheduleWrap.contains(event.target)) closeScheduleMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeScheduleMenu();
      if (!scheduleModal.hidden) closeSchedule();
    }
  });
  scheduleModal.querySelectorAll('[data-schedule-close]').forEach(button => button.addEventListener('click', closeSchedule));
  scheduleType?.addEventListener('change', () => renderScheduleDetail(scheduleType.value));
  scheduleForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!scheduleForm.reportValidity()) return;
    const option = getScheduleOption(scheduleType?.value);
    const data = new FormData(scheduleForm);
    const lines = [
      `Appointment type: ${option.title}`,
      `Preferred date: ${data.get('preferredDate')}`,
      `Preferred time: ${data.get('preferredTime')}`,
      `Name: ${data.get('name')}`,
      `Contact: ${data.get('contact')}`,
      `Notes: ${data.get('notes') || 'None provided'}`
    ];
    const href = `mailto:ben@tridicodesign.com?subject=${encodeURIComponent(`Appointment Request - ${option.title}`)}&body=${encodeURIComponent(`${lines.join('\n')}\n\nNo appointment is confirmed until Tridico responds.\n\nSubmitted from TridicoDesign.com.`)}`;
    if (scheduleStatus) scheduleStatus.textContent = 'Opening your email app with the appointment request.';
    window.location.href = href;
  });
  renderScheduleDetail(scheduleOptions[0].id);

  const modal = document.createElement('div');
  modal.className = 'account-modal';
  modal.dataset.accountModal = 'true';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="account-modal__backdrop" data-account-close></div>
    <section class="account-modal__panel" role="dialog" aria-modal="true" aria-labelledby="account-title" tabindex="-1">
      <button class="account-modal__close" type="button" data-account-close aria-label="Close account dialog">&times;</button>
      <div class="account-modal__brand">
        <span class="account-modal__mark">TD</span>
        <div>
          <p>Client Portal</p>
          <h2 id="account-title">Tridico Account</h2>
        </div>
      </div>
      <div class="account-auth" data-account-auth>
        <div class="account-tabs" role="tablist" aria-label="Account options">
          <button class="account-tab is-active" type="button" data-account-tab="signin" role="tab" aria-selected="true">Sign in</button>
          <button class="account-tab" type="button" data-account-tab="create" role="tab" aria-selected="false">Create account</button>
        </div>
        <form class="account-form is-active" data-account-form="signin" novalidate>
          <label>Email address
            <input type="email" name="email" autocomplete="email" placeholder="client@example.com" required>
          </label>
          <label>Password
            <span class="account-password-field">
              <input type="password" name="password" autocomplete="current-password" placeholder="Enter password" required>
              <button type="button" data-password-toggle>Show</button>
            </span>
          </label>
          <div class="account-form-row">
            <label class="account-check"><input type="checkbox" name="remember" checked> Remember me</label>
            <button class="account-link-button" type="button" data-reset-link>Forgot password?</button>
          </div>
          <button class="btn btn-primary account-submit" type="submit">Sign in securely</button>
          <p class="account-status" data-account-status></p>
        </form>
        <form class="account-form" data-account-form="create" novalidate>
          <label>Full name
            <input type="text" name="name" autocomplete="name" placeholder="Your name" required>
          </label>
          <label>Company
            <input type="text" name="company" autocomplete="organization" placeholder="Company or organization">
          </label>
          <label>Email address
            <input type="email" name="email" autocomplete="email" placeholder="client@example.com" required>
          </label>
          <label>Password
            <span class="account-password-field">
              <input type="password" name="password" autocomplete="new-password" placeholder="Create password" required>
              <button type="button" data-password-toggle>Show</button>
            </span>
          </label>
          <button class="btn btn-primary account-submit" type="submit">Create client account</button>
          <p class="account-status" data-account-status></p>
        </form>
        <p class="account-preview-note">Preview mode. No data is sent; this browser stores only a mock session until a backend is connected.</p>
      </div>
      <div class="account-dashboard" data-account-dashboard hidden></div>
    </section>`;
  document.body.append(modal);

  const panel = modal.querySelector('.account-modal__panel');
  const authArea = modal.querySelector('[data-account-auth]');
  const dashboard = modal.querySelector('[data-account-dashboard]');
  let lastFocusedAccountTrigger = null;

  const setAccountTab = target => {
    modal.querySelectorAll('[data-account-tab]').forEach(item => {
      const active = item.dataset.accountTab === target;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    modal.querySelectorAll('[data-account-form]').forEach(form => {
      form.classList.toggle('is-active', form.dataset.accountForm === target);
    });
  };

  const renderDashboard = account => {
    if (!dashboard || !account) return;
    const safeName = escapeHtml(account.name);
    const safeEmail = escapeHtml(account.email);
    dashboard.innerHTML = `
      <div class="account-welcome">
        <div>
          <p>Signed in as</p>
          <h3>${safeName}</h3>
          <span>${safeEmail}</span>
        </div>
        <span class="account-avatar" aria-hidden="true">${safeName.slice(0, 1).toUpperCase()}</span>
      </div>
      <div class="account-projects" aria-label="Client portal preview">
        <article>
          <span>Proof Review</span>
          <strong>Vehicle wrap proof ready</strong>
          <em>Awaiting approval</em>
        </article>
        <article>
          <span>Quote</span>
          <strong>Storefront signage package</strong>
          <em>Under review</em>
        </article>
        <article>
          <span>Files</span>
          <strong>Artwork uploads received</strong>
          <em>3 files checked in</em>
        </article>
      </div>
      <div class="account-actions">
        <a class="btn btn-primary" href="${sitePath('quote.html')}">Start a quote</a>
        <a class="btn btn-outline account-dark-outline" href="${sitePath('upload-artwork.html')}">Upload artwork</a>
        <button class="btn btn-ghost-light account-signout" type="button" data-account-signout>Sign out</button>
      </div>`;
    dashboard.querySelector('[data-account-signout]')?.addEventListener('click', () => {
      clearAccount();
      setAccountTab('signin');
      renderAccountState();
    });
  };

  function renderAccountState(){
    const account = getAccount();
    refreshAccountTriggers();
    if (authArea) authArea.hidden = Boolean(account);
    if (dashboard) dashboard.hidden = !account;
    if (account) renderDashboard(account);
  }

  const openAccount = trigger => {
    lastFocusedAccountTrigger = trigger || document.activeElement;
    renderAccountState();
    modal.hidden = false;
    document.body.classList.add('account-modal-open');
    window.requestAnimationFrame(() => panel?.focus());
  };

  const closeAccount = () => {
    modal.hidden = true;
    document.body.classList.remove('account-modal-open');
    if (lastFocusedAccountTrigger && typeof lastFocusedAccountTrigger.focus === 'function') {
      lastFocusedAccountTrigger.focus();
    }
  };

  document.querySelectorAll('[data-account-open]').forEach(button => {
    button.addEventListener('click', () => {
      const open = toggle?.getAttribute('aria-expanded') === 'true';
      if (open && mobile) {
        toggle.setAttribute('aria-expanded', 'false');
        mobile.hidden = true;
        document.body.classList.remove('menu-open');
      }
      openAccount(button);
    });
  });

  modal.querySelectorAll('[data-account-close]').forEach(button => button.addEventListener('click', closeAccount));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) closeAccount();
  });

  modal.querySelectorAll('[data-account-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      setAccountTab(tab.dataset.accountTab);
    });
  });

  modal.querySelectorAll('[data-password-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const input = button.parentElement?.querySelector('input');
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.textContent = show ? 'Hide' : 'Show';
    });
  });

  modal.querySelector('[data-reset-link]')?.addEventListener('click', event => {
    const form = event.currentTarget.closest('form');
    const status = form?.querySelector('[data-account-status]');
    const email = form?.elements.email?.value;
    if (status) {
      status.textContent = email
        ? `Password reset preview prepared for ${email}.`
        : 'Enter your email and request a reset link.';
      status.classList.remove('is-error');
    }
  });

  modal.querySelectorAll('[data-account-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const status = form.querySelector('[data-account-status]');
      const submit = form.querySelector('.account-submit');
      const email = form.elements.email?.value.trim();
      const password = form.elements.password?.value;
      if (!email || !password || !email.includes('@')) {
        if (status) {
          status.textContent = 'Enter a valid email and password.';
          status.classList.add('is-error');
        }
        return;
      }
      if (password.length < 4) {
        if (status) {
          status.textContent = 'Use at least 4 characters for this preview.';
          status.classList.add('is-error');
        }
        return;
      }
      if (status) {
        status.textContent = 'Checking secure portal credentials...';
        status.classList.remove('is-error');
      }
      if (submit) submit.disabled = true;
      window.setTimeout(() => {
        const nameField = form.elements.name?.value.trim();
        saveAccount({
          name: nameField || getDisplayName(email),
          email,
          company: form.elements.company?.value.trim() || 'Tridico Client',
          signedInAt: new Date().toISOString()
        });
        if (submit) submit.disabled = false;
        form.reset();
        renderAccountState();
      }, 650);
    });
  });

  const initShop = () => {
    const shopPage = document.querySelector('[data-shop-page]');
    if (!shopPage) return;

    const storageKey = 'tridicoShopCart';
    const grid = document.querySelector('[data-shop-grid]');
    const catalogProducts = Array.isArray(window.tridicoShopProducts) ? window.tridicoShopProducts : [];
    const formatCurrency = value => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
    const renderCatalogProducts = () => {
      if (!grid || !catalogProducts.length) return;
      const existingIds = new Set(Array.from(grid.querySelectorAll('[data-shop-card]')).map(card => card.dataset.shopId));
      const fragment = document.createDocumentFragment();
      catalogProducts.forEach(product => {
        if (!product || !product.id || existingIds.has(product.id)) return;
        const article = document.createElement('article');
        const tags = Array.isArray(product.tags) ? product.tags.join(' ') : String(product.tags || '');
        const price = Number(product.price) || 0;
        const href = product.href || 'quote.html';
        const image = product.image || 'assets/images/placeholders/service-printing.svg';
        const count = product.count || product.unit || '1 item';
        const turnaround = product.turnaround || 'Made to order';
        const unitPrice = product.unitPrice || '';
        const demand = product.demand || 'Popular custom product';
        const rating = product.rating || '4.8';
        const reviews = product.reviews || '100+';
        article.className = 'shop-card reveal';
        article.dataset.shopCard = 'true';
        article.dataset.shopGenerated = 'true';
        article.dataset.shopId = product.id;
        article.dataset.shopName = product.name || product.id;
        article.dataset.shopCategory = product.category || 'custom-services';
        article.dataset.shopPrice = String(price);
        article.dataset.shopPriority = String(Number(product.priority) || 0);
        article.dataset.shopTags = tags;
        article.dataset.shopCount = count;
        article.dataset.shopTurnaround = turnaround;
        article.dataset.shopUnitPrice = unitPrice;
        article.innerHTML = `
          <a class="shop-card-media" href="${escapeHtml(href)}"><img src="${escapeHtml(image)}" alt="${escapeHtml(product.name || 'Shop product')}" loading="lazy" decoding="async"></a>
          <div class="shop-card-body">
            <span class="shop-badge">${escapeHtml(product.badge || 'Made to order')}</span>
            <h2><a href="${escapeHtml(href)}">${escapeHtml(product.name || product.id)}</a></h2>
            <div class="shop-rating" aria-label="${escapeHtml(rating)} out of 5 stars"><strong>${escapeHtml(rating)}</strong><span aria-hidden="true">★</span><em>(${escapeHtml(reviews)})</em></div>
            <p class="shop-demand">${escapeHtml(demand)}</p>
            <strong class="shop-price">${price ? formatCurrency(price) : 'Request quote'}</strong>
            <p class="shop-count">${escapeHtml(count)}${unitPrice ? ` · ${escapeHtml(unitPrice)}` : ''}</p>
            <p class="shop-turnaround">Turnaround: ${escapeHtml(turnaround)}</p>
            <p class="shop-desc">${escapeHtml(product.description || 'Custom printed product prepared by Tridico Design.')}</p>
            <button class="btn btn-primary" type="button" data-shop-add>Add to cart</button>
          </div>`;
        fragment.append(article);
        existingIds.add(product.id);
      });
      grid.append(fragment);
    };
    renderCatalogProducts();
    const normalizeStaticCards = () => {
      if (!grid) return;
      grid.querySelectorAll('[data-shop-card]:not([data-shop-generated])').forEach(card => {
        const body = card.querySelector('.shop-card-body');
        if (!body || card.dataset.shopNormalized === 'true') return;
        const link = body.querySelector('h2 a');
        const name = card.dataset.shopName || link?.textContent?.trim() || 'Custom service';
        const href = link?.getAttribute('href') || 'quote.html';
        const description = body.querySelector('p')?.textContent?.trim() || 'Custom Tridico service quoted after project details are reviewed.';
        const badge = body.querySelector('.shop-badge')?.textContent?.trim() || 'Custom Services';
        const price = Number(card.dataset.shopPrice) || 0;
        const count = card.dataset.shopCount || '1 custom service package';
        const unitPrice = card.dataset.shopUnitPrice || 'Project-priced';
        const turnaround = card.dataset.shopTurnaround || 'Quote after review';
        const detail = body.querySelector('.shop-rating em')?.textContent?.trim() || 'Custom quote package';
        body.innerHTML = `
          <span class="shop-badge">${escapeHtml(badge)}</span>
          <h2><a href="${escapeHtml(href)}">${escapeHtml(name)}</a></h2>
          <div class="shop-rating" aria-label="Custom service package"><strong>4.9</strong><span aria-hidden="true">★</span><em>(custom)</em></div>
          <p class="shop-demand">${escapeHtml(detail)}</p>
          <strong class="shop-price">${price ? `From ${formatCurrency(price)}` : 'Request quote'}</strong>
          <p class="shop-count">${escapeHtml(count)} · ${escapeHtml(unitPrice)}</p>
          <p class="shop-turnaround">Turnaround: ${escapeHtml(turnaround)}</p>
          <p class="shop-desc">${escapeHtml(description)}</p>
          <button class="btn btn-primary" type="button" data-shop-add>Add to cart</button>`;
        card.dataset.shopNormalized = 'true';
      });
    };
    normalizeStaticCards();
    const cards = Array.from(document.querySelectorAll('[data-shop-card]'));
    const searchForm = document.querySelector('[data-shop-search-form]');
    const queryInput = document.querySelector('[data-shop-query]');
    const categorySelect = document.querySelector('[data-shop-category]');
    const sortSelect = document.querySelector('[data-shop-sort]');
    const resultCount = document.querySelector('[data-shop-result-count]');
    const emptyState = document.querySelector('[data-shop-empty]');
    const loadMoreWrap = document.querySelector('[data-shop-load-more-wrap]');
    const loadMoreButton = document.querySelector('[data-shop-load-more]');
    const loadMoreCount = document.querySelector('[data-shop-load-more-wrap] [data-shop-count]');
    const chips = Array.from(document.querySelectorAll('[data-shop-chip]'));
    const filterInputs = Array.from(document.querySelectorAll('[data-shop-filter]'));
    const clearFilters = document.querySelector('[data-shop-clear]');
    const cartDrawer = document.querySelector('[data-shop-cart]');
    const cartPanel = cartDrawer?.querySelector('.shop-cart-panel');
    const cartItems = document.querySelector('[data-shop-cart-items]');
    const cartCountEls = Array.from(document.querySelectorAll('[data-shop-cart-count]'));
    const cartTotal = document.querySelector('[data-shop-cart-total]');
    const cartStatus = document.querySelector('[data-shop-cart-status]');
    const checkoutButton = document.querySelector('[data-shop-checkout]');
    const originalOrder = new Map(cards.map((card, index) => [card, index]));
    const pageSize = Math.max(1, Number(grid?.dataset.shopPageSize) || 15);
    let selectedCategory = categorySelect?.value || 'all';
    let visibleLimit = pageSize;
    let cart = [];
    let lastCartTrigger = null;

    const normalize = value => String(value || '').toLowerCase();
    const getSearchText = card => normalize([
      card.dataset.shopName,
      card.dataset.shopCategory,
      card.dataset.shopTags,
      card.textContent
    ].join(' '));
    const getProduct = card => ({
      id: card.dataset.shopId,
      name: card.dataset.shopName,
      category: card.dataset.shopCategory,
      price: Number(card.dataset.shopPrice) || 0,
      image: card.querySelector('img')?.getAttribute('src') || '',
      href: card.querySelector('a')?.getAttribute('href') || 'shop.html',
      count: card.dataset.shopCount || '',
      turnaround: card.dataset.shopTurnaround || '',
      unitPrice: card.dataset.shopUnitPrice || ''
    });
    const loadCart = () => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
        cart = Array.isArray(parsed) ? parsed.filter(item => item && item.id) : [];
      } catch {
        cart = [];
      }
    };
    const saveCart = () => window.localStorage.setItem(storageKey, JSON.stringify(cart));
    const getFilterGroups = () => Array.from(document.querySelectorAll('.shop-filters fieldset'))
      .map(group => Array.from(group.querySelectorAll('[data-shop-filter]:checked')).map(input => input.value))
      .filter(values => values.length);
    const applyChipState = () => {
      chips.forEach(chip => chip.classList.toggle('is-active', chip.dataset.shopChip === selectedCategory));
      if (categorySelect && categorySelect.value !== selectedCategory) categorySelect.value = selectedCategory;
    };
    const cardMatches = card => {
      const text = getSearchText(card);
      const query = normalize(queryInput?.value).trim();
      const matchesQuery = !query || query.split(/\s+/).every(part => text.includes(part));
      const matchesCategory = selectedCategory === 'all' || card.dataset.shopCategory === selectedCategory;
      const matchesFilters = getFilterGroups().every(group => group.some(token => text.includes(token)));
      return matchesQuery && matchesCategory && matchesFilters;
    };
    const sortCards = () => {
      if (!grid) return cards;
      const mode = sortSelect?.value || 'featured';
      const getFeaturedPriority = card => Number(card.dataset.shopPriority) || 0;
      const sorted = [...cards].sort((a, b) => {
        if (mode === 'price-low') return Number(a.dataset.shopPrice) - Number(b.dataset.shopPrice);
        if (mode === 'price-high') return Number(b.dataset.shopPrice) - Number(a.dataset.shopPrice);
        if (mode === 'name') return String(a.dataset.shopName).localeCompare(String(b.dataset.shopName));
        const priorityDiff = getFeaturedPriority(b) - getFeaturedPriority(a);
        if (priorityDiff) return priorityDiff;
        return originalOrder.get(a) - originalOrder.get(b);
      });
      sorted.forEach(card => grid.append(card));
      return sorted;
    };
    const resetVisibleLimit = () => {
      visibleLimit = pageSize;
    };
    const updateLoadMoreControls = matches => {
      const total = matches.length;
      const shown = Math.min(visibleLimit, total);
      if (loadMoreWrap) loadMoreWrap.hidden = total === 0;
      if (loadMoreCount) {
        loadMoreCount.textContent = total
          ? `Showing ${shown} of ${total} ${total === 1 ? 'product' : 'products'}`
          : 'No matching products';
      }
      if (loadMoreButton) {
        const remaining = Math.max(0, total - shown);
        const nextCount = Math.min(pageSize, remaining);
        loadMoreButton.hidden = remaining === 0;
        loadMoreButton.disabled = remaining === 0;
        loadMoreButton.textContent = nextCount ? `See ${nextCount} More` : 'See More';
        loadMoreButton.setAttribute('aria-label', remaining
          ? `Show ${nextCount} more products. ${remaining} remaining.`
          : 'All matching products are shown.');
      }
    };
    const applyFilters = () => {
      const orderedCards = sortCards();
      const matches = orderedCards.filter(cardMatches);
      const matchedCards = new Set(matches);
      const visibleCards = new Set(matches.slice(0, visibleLimit));
      orderedCards.forEach(card => {
        const isMatch = matchedCards.has(card);
        card.classList.toggle('is-hidden', !isMatch);
        card.classList.toggle('is-deferred', isMatch && !visibleCards.has(card));
      });
      if (resultCount) resultCount.textContent = `${matches.length} ${matches.length === 1 ? 'item' : 'items'}`;
      if (emptyState) emptyState.hidden = matches.length !== 0;
      updateLoadMoreControls(matches);
      applyChipState();
    };
    const setCategory = value => {
      selectedCategory = value || 'all';
      resetVisibleLimit();
      applyFilters();
    };
    const renderCart = () => {
      const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
      const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
      cartCountEls.forEach(item => { item.textContent = String(totalQty); });
      if (cartTotal) cartTotal.textContent = formatCurrency(totalPrice);
      if (!cartItems) return;
      if (!cart.length) {
        cartItems.innerHTML = '<p class="shop-cart-empty">Your quote cart is empty.</p>';
        return;
      }
      cartItems.innerHTML = cart.map(item => `
        <article class="shop-cart-item">
          <img src="${escapeHtml(item.image)}" alt="">
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${formatCurrency(item.price)}${item.count ? ` · ${escapeHtml(item.count)}` : ''}</p>
            ${item.turnaround ? `<p class="shop-cart-meta">Turnaround: ${escapeHtml(item.turnaround)}</p>` : ''}
            <div class="shop-cart-controls">
              <button type="button" data-shop-qty="${escapeHtml(item.id)}" data-delta="-1" aria-label="Decrease ${escapeHtml(item.name)} quantity">-</button>
              <span>${item.qty}</span>
              <button type="button" data-shop-qty="${escapeHtml(item.id)}" data-delta="1" aria-label="Increase ${escapeHtml(item.name)} quantity">+</button>
              <button class="shop-cart-remove" type="button" data-shop-remove="${escapeHtml(item.id)}">Remove</button>
            </div>
          </div>
        </article>`).join('');
    };
    const openCart = trigger => {
      if (!cartDrawer) return;
      lastCartTrigger = trigger || document.activeElement;
      renderCart();
      cartDrawer.hidden = false;
      document.body.classList.add('shop-cart-open');
      window.requestAnimationFrame(() => cartPanel?.focus());
    };
    const closeCart = () => {
      if (!cartDrawer) return;
      cartDrawer.hidden = true;
      document.body.classList.remove('shop-cart-open');
      if (lastCartTrigger && typeof lastCartTrigger.focus === 'function') lastCartTrigger.focus();
    };
    const addToCart = (card, trigger) => {
      const product = getProduct(card);
      const existing = cart.find(item => item.id === product.id);
      if (existing) existing.qty += 1;
      else cart.push({...product, qty: 1});
      saveCart();
      renderCart();
      if (cartStatus) cartStatus.textContent = `${product.name} added.`;
      openCart(trigger);
    };
    const updateQty = (id, delta) => {
      const item = cart.find(entry => entry.id === id);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) cart = cart.filter(entry => entry.id !== id);
      saveCart();
      renderCart();
    };
    const requestQuote = () => {
      if (!cart.length) {
        if (cartStatus) cartStatus.textContent = 'Add at least one item to request a quote.';
        return;
      }
      const body = cart.map(item => `${item.qty} x ${item.name} - ${formatCurrency(item.price)}${item.count ? ` (${item.count})` : ''}${item.turnaround ? ` - Turnaround: ${item.turnaround}` : ''}`).join('\n');
      const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
      const href = `mailto:ben@tridicodesign.com?subject=${encodeURIComponent('Shop Quote Cart - Tridico Design')}&body=${encodeURIComponent(`${body}\n\nEstimated starting total: ${formatCurrency(total)}\n\nSubmitted from the Tridico shop preview.`)}`;
      if (cartStatus) cartStatus.textContent = 'Opening your email app with the quote cart.';
      window.location.href = href;
    };

    searchForm?.addEventListener('submit', event => {
      event.preventDefault();
      resetVisibleLimit();
      applyFilters();
    });
    queryInput?.addEventListener('input', () => {
      resetVisibleLimit();
      applyFilters();
    });
    categorySelect?.addEventListener('change', () => setCategory(categorySelect.value));
    sortSelect?.addEventListener('change', applyFilters);
    chips.forEach(chip => chip.addEventListener('click', () => setCategory(chip.dataset.shopChip)));
    filterInputs.forEach(input => input.addEventListener('change', () => {
      resetVisibleLimit();
      applyFilters();
    }));
    clearFilters?.addEventListener('click', () => {
      filterInputs.forEach(input => { input.checked = false; });
      if (queryInput) queryInput.value = '';
      setCategory('all');
    });
    loadMoreButton?.addEventListener('click', () => {
      visibleLimit += pageSize;
      applyFilters();
    });
    cards.forEach(card => {
      card.querySelector('[data-shop-add]')?.addEventListener('click', event => addToCart(card, event.currentTarget));
    });
    document.querySelectorAll('[data-shop-cart-open]').forEach(button => {
      button.addEventListener('click', () => openCart(button));
    });
    cartDrawer?.querySelectorAll('[data-shop-cart-close]').forEach(button => button.addEventListener('click', closeCart));
    cartItems?.addEventListener('click', event => {
      const qtyButton = event.target.closest('[data-shop-qty]');
      const removeButton = event.target.closest('[data-shop-remove]');
      if (qtyButton) updateQty(qtyButton.dataset.shopQty, Number(qtyButton.dataset.delta));
      if (removeButton) {
        cart = cart.filter(item => item.id !== removeButton.dataset.shopRemove);
        saveCart();
        renderCart();
      }
    });
    checkoutButton?.addEventListener('click', requestQuote);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && cartDrawer && !cartDrawer.hidden) closeCart();
    });

    loadCart();
    applyFilters();
    renderCart();
  };

  renderAccountState();
  initShop();
})();
