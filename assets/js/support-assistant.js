/* Tridico Design Support Assistant
   Static, rule-based support assistant for GitHub Pages.
   Creates an AI-style guided chat experience without external dependencies.
*/
(function () {
  'use strict';

  if (window.TridicoSupportAssistantLoaded) return;
  window.TridicoSupportAssistantLoaded = true;

  const CONFIG = {
    company: 'Tridico Design LLC',
    assistantName: 'Braxton',
    motto: 'Welcome to integrity, Welcome to Tridico.',
    phone: '(614) 508-0815',
    phoneHref: 'tel:+16145080815',
    email: 'ben@tridicodesign.com',
    address: '8626 Cotter Street, Lewis Center, OH 43035',
    hours: 'Weekdays 9am - 5pm',
    quoteUrl: 'quote.html',
    uploadUrl: 'upload-artwork.html',
    contactUrl: 'contact.html',
    servicesUrl: 'services.html',
    workUrl: 'work.html',
    shopUrl: 'shop.html',
    processUrl: 'process.html',
    resourcesUrl: 'resources.html',
    ticketEndpoint: '', // Optional backend endpoint. Leave blank for mailto fallback.
    storageKey: 'tridico_support_tickets_v1'
  };

  const SLOGAN_LABEL = 'Welcome to integrity, Welcome to Tridico.';

  function sloganHtml(variant) {
    return `<span class="brand-slogan ${variant}" aria-label="${SLOGAN_LABEL}"><span class="brand-slogan__quote brand-slogan__quote--open" aria-hidden="true"></span><span class="brand-slogan__words" aria-hidden="true"><span class="brand-slogan__script">Welcome to</span><span class="brand-slogan__integrity">INTEGRITY</span><span class="brand-slogan__tridico">WELCOME TO <strong>TRIDICO</strong></span></span><span class="brand-slogan__quote brand-slogan__quote--close" aria-hidden="true"></span></span>`;
  }

  const PATHS = {
    start: {
      label: 'Start',
      keywords: ['start over', 'main menu', 'restart', 'begin again', 'reset'],
      html: `<p>I can route you to the right page, help prepare a quote, troubleshoot an upload, document a quality issue, follow up on an existing project, or generate a support ticket.</p><p>Select a path or type what you need.</p>`,
      chips: ['quote', 'upload', 'services', 'quality', 'billing', 'product_support', 'navigation', 'ticket']
    },
    navigation: {
      label: 'Find a page',
      keywords: ['navigation', 'navigate', 'page', 'where', 'find', 'website', 'menu', 'link', 'go to'],
      html: `<p><strong>Fastest website paths:</strong></p><ul><li><a href="work.html">Work</a> - view project examples and portfolio categories.</li><li><a href="services.html">Services</a> - graphic design, print, signs, wraps, branding, and installation.</li><li><a href="shop.html">Shop</a> - search packages, filter by customer type, and build a quote cart.</li><li><a href="process.html">Process</a> - intake, proof, production, and installation.</li><li><a href="quote.html">Get Quote</a> - submit project details.</li><li><a href="upload-artwork.html">Upload Artwork</a> - prepare files for Tridico.</li><li><a href="contact.html">Contact</a> - phone, email, location, and hours.</li></ul>`,
      chips: ['quote', 'upload', 'services', 'website_issue', 'company']
    },
    quote: {
      label: 'Quote help',
      keywords: ['quote', 'estimate', 'price', 'pricing', 'cost', 'bid', 'proposal', 'start a quote', 'how much'],
      html: `<p><strong>For the fastest quote, prepare these details:</strong></p><ul><li>Project type: design, print, sign, wrap, decal, banner, branding, or installation.</li><li>Quantity, size, vehicle/year/model, sign location, or material needs.</li><li>Photos of the space, vehicle, storefront, existing artwork, or reference examples.</li><li>Deadline, installation needs, and service location.</li><li>Any required brand colors, logos, or files.</li></ul><p>I can open the quote page or generate a quote-support ticket if the form is confusing or not working.</p>`,
      chips: ['open_quote', 'ticket_quote', 'services', 'upload', 'rush']
    },
    upload: {
      label: 'Upload artwork',
      keywords: ['upload', 'artwork', 'file', 'files', 'proof', 'art', 'pdf', 'ai', 'eps', 'svg', 'bleed', 'vector', 'resolution', 'jpg', 'png'],
      html: `<p><strong>Artwork upload guidance:</strong></p><ul><li>Best formats: print-ready PDF, AI, EPS, SVG, high-resolution PNG/JPG, or packaged design files.</li><li>For signs, wraps, and large format work, include final dimensions and intended placement.</li><li>For print, include bleed, crop marks, color expectations, quantity, and paper/material notes.</li><li>If a file upload fails, note the file name, file type, file size, browser, and exact error message.</li></ul><p>If needed, I can create an upload issue ticket and prepare the details for Tridico.</p>`,
      chips: ['open_upload', 'ticket_upload', 'artwork_prep', 'quote']
    },
    services: {
      label: 'Services',
      keywords: ['services', 'service', 'sign', 'signage', 'wrap', 'wraps', 'vehicle', 'printing', 'print', 'graphic design', 'branding', 'materials', 'decals', 'banner', 'installation', 'install', 'wall graphic', 'window graphic'],
      html: `<p><strong>Tridico service paths:</strong></p><ul><li><a href="graphic-design.html">Graphic Design</a> - layouts, logos, concepts, and production-ready artwork.</li><li><a href="printing.html">Printing Services</a> - cards, brochures, folders, decals, banners, display materials, and large-format print.</li><li><a href="branding-materials.html">Branding Materials</a> - branded assets that keep a business consistent across touchpoints.</li><li><a href="signage.html">Signage</a> - storefront, interior, exterior, event, wall, and window graphics.</li><li><a href="vehicle-wraps.html">Vehicle Wraps</a> - single vehicles, fleets, trailers, food trucks, and decals.</li><li><a href="installation.html">On-Site Installation</a> - install-ready planning for real locations.</li></ul>`,
      chips: ['quote', 'work', 'shop', 'care', 'installation']
    },
    quality: {
      label: 'Quality issue',
      keywords: ['quality', 'peeling', 'vinyl peeling', 'bubble', 'bubbling', 'wrinkle', 'fading', 'cracking', 'lift', 'lifting', 'damaged', 'scratch', 'wrong', 'defect', 'problem', 'issue', 'complaint'],
      html: `<p><strong>Quality issue path:</strong></p><p>If vinyl is peeling, bubbling, lifting, damaged, or not matching expectations, do this first:</p><ul><li>Do not pull, cut, heat, or pressure-wash the affected area.</li><li>Take clear photos: wide shot, close-up, edge/detail, and surrounding area.</li><li>Note when the issue appeared, weather/temperature exposure, washing/cleaning history, and install/delivery date if known.</li><li>Keep order, invoice, proof, or project references available.</li></ul><p>I can generate a quality support ticket so the issue is documented cleanly.</p>`,
      chips: ['ticket_quality', 'care', 'product_support', 'call']
    },
    billing: {
      label: 'Billing issue',
      keywords: ['billing', 'bill', 'invoice', 'payment', 'paid', 'deposit', 'refund', 'receipt', 'tax', 'charge', 'balance', 'card', 'check', 'purchase order', 'po'],
      html: `<p><strong>Billing support path:</strong></p><ul><li>Invoice or estimate number if available.</li><li>Business name and billing contact.</li><li>Payment method or purchase order details.</li><li>Amount in question and what looks incorrect.</li><li>Whether the issue is urgent because production, pickup, or installation is blocked.</li></ul><p>I can generate a billing ticket that prepares the exact information Tridico needs to resolve it.</p>`,
      chips: ['ticket_billing', 'call', 'product_support', 'company']
    },
    feedback: {
      label: 'Feedback',
      keywords: ['feedback', 'review', 'compliment', 'suggestion', 'experience', 'testimonial', 'thanks', 'thank you', 'recommendation'],
      html: `<p><strong>Feedback path:</strong></p><p>Use this for compliments, suggestions, concerns, website feedback, service experience notes, or follow-up requests after a project.</p><p>I can generate a feedback ticket so the comment reaches the right person with context.</p>`,
      chips: ['ticket_feedback', 'company', 'services', 'call']
    },
    website_issue: {
      label: 'Website issue',
      keywords: ['website issue', 'site issue', 'broken', 'not loading', 'button', 'form', '404', 'bug', 'browser', 'mobile', 'desktop', 'page problem', 'link problem'],
      html: `<p><strong>Website support path:</strong></p><ul><li>Which page or button had the issue?</li><li>What device/browser were you using?</li><li>What did you expect to happen?</li><li>What happened instead?</li><li>Screenshot or error message if available.</li></ul><p>I can generate a website issue ticket and include the page details.</p>`,
      chips: ['ticket_website', 'navigation', 'contact', 'call']
    },
    company: {
      label: 'Company info',
      keywords: ['company', 'about', 'hours', 'address', 'location', 'phone', 'email', 'contact', 'who', 'tridico', 'integrity', 'motto'],
      html: `<p><strong>Tridico Design LLC</strong></p><ul><li class="tdsa-motto-row"><span>Motto:</span> ${sloganHtml('brand-slogan--chat')}</li><li>Phone: <a href="tel:+16145080815">(614) 508-0815</a></li><li>Email: <a href="mailto:ben@tridicodesign.com">ben@tridicodesign.com</a></li><li>Address: 8626 Cotter Street, Lewis Center, OH 43035</li><li>Hours: Weekdays 9am - 5pm</li></ul>`,
      chips: ['contact', 'services', 'quote', 'feedback', 'navigation']
    },
    product_support: {
      label: 'Product support',
      keywords: ['product support', 'customer support', 'support', 'after project', 'after install', 'order', 'project support', 'status', 'pickup', 'delivery'],
      html: `<p><strong>Product/customer support includes:</strong></p><ul><li>Project status or approval questions.</li><li>Pickup, delivery, or installation coordination.</li><li>Reorder help for previous signs, decals, print, or wraps.</li><li>Proof revision questions.</li><li>Material, care, or durability questions.</li><li>Post-install quality documentation.</li></ul><p>For a specific project, creating a ticket is best because it captures the project reference and contact details.</p>`,
      chips: ['ticket_general', 'quality', 'installation', 'billing', 'call']
    },
    artwork_prep: {
      label: 'Artwork prep',
      keywords: ['prep', 'prepare', 'resolution', 'dpi', 'cmyk', 'rgb', 'pantone', 'bleed', 'crop', 'logo file', 'vector', 'art requirements'],
      html: `<p><strong>Artwork prep basics:</strong></p><ul><li>Vector logo files are preferred for signs, wraps, decals, and large graphics.</li><li>Use print-ready PDF when possible for finished layouts.</li><li>Include bleed for printed pieces that go to the edge.</li><li>Confirm final size, orientation, quantity, and material.</li><li>Send brand colors, fonts, or prior proofs if consistency matters.</li><li>For photos, use the highest resolution original file available.</li></ul><p>If you are unsure whether the file is usable, upload it with notes. Tridico can review it.</p>`,
      chips: ['open_upload', 'ticket_upload', 'quote', 'services']
    },
    care: {
      label: 'Care instructions',
      keywords: ['care', 'clean', 'cleaning', 'wash', 'washing', 'maintenance', 'maintain', 'vehicle wash', 'pressure wash', 'wrap care'],
      html: `<p><strong>Care guidance for wraps, decals, and graphics:</strong></p><ul><li>Avoid aggressive pressure washing near vinyl edges.</li><li>Use mild soap, soft cloths, and gentle rinsing.</li><li>Do not scrape edges or use harsh solvents unless Tridico approves the method.</li><li>For vehicle graphics, avoid automatic brushes when possible.</li><li>Document any edge lifting, bubbling, fading, or damage with photos before attempting repair.</li></ul><p>For a specific issue, start a quality ticket so the team can review it properly.</p>`,
      chips: ['ticket_quality', 'product_support', 'services', 'call']
    },
    installation: {
      label: 'Installation help',
      keywords: ['installation', 'install', 'schedule', 'site', 'wall', 'window', 'storefront', 'vehicle dropoff', 'measurements', 'measure', 'access'],
      html: `<p><strong>Installation planning checklist:</strong></p><ul><li>Confirm location, access, hours, parking/loading, and site contact.</li><li>For vehicles, provide year/make/model and clean drop-off expectations.</li><li>For walls/windows/signs, provide photos, dimensions, surface type, and any obstacles.</li><li>Confirm whether ladders, lift access, landlord approval, permits, or after-hours work are needed.</li><li>Keep final proof approval and installation date aligned.</li></ul>`,
      chips: ['ticket_general', 'services', 'quote', 'call']
    },
    rush: {
      label: 'Rush timeline',
      keywords: ['rush', 'urgent', 'emergency', 'asap', 'same day', 'next day', 'deadline', 'event', 'tomorrow', 'fast'],
      html: `<p><strong>Rush project path:</strong></p><ul><li>State the hard deadline first.</li><li>Include what must be produced, quantity, size, and whether design is already approved.</li><li>Upload any files immediately and mention "rush" in the notes.</li><li>Call after submitting details if the deadline is business-critical.</li></ul><p>Rush feasibility depends on design complexity, proof approval, materials, production queue, and installation needs.</p>`,
      chips: ['open_quote', 'call', 'open_upload', 'ticket_quote']
    },
    ticket: {
      label: 'Create ticket',
      keywords: ['ticket', 'help ticket', 'support ticket', 'create ticket', 'human', 'representative', 'manager'],
      html: `<p>I can generate a support ticket path now. Choose the closest category so the request is routed with the right details.</p>`,
      chips: ['ticket_general', 'ticket_quality', 'ticket_billing', 'ticket_upload', 'ticket_website', 'ticket_feedback']
    },
    fallback: {
      label: 'Not sure',
      keywords: [],
      html: `<p>I can help route that. Choose the closest topic below, or type a few more details such as "vinyl peeling," "invoice question," "upload problem," "quote help," or "existing project."</p>`,
      chips: ['quote', 'upload', 'services', 'quality', 'billing', 'product_support', 'ticket']
    }
  };

  const CHIP_DEFS = {
    quote: { label: 'Quote help', path: 'quote', primary: true },
    upload: { label: 'Upload help', path: 'upload' },
    services: { label: 'Services', path: 'services' },
    quality: { label: 'Quality issue', path: 'quality', danger: true },
    billing: { label: 'Billing', path: 'billing' },
    navigation: { label: 'Find a page', path: 'navigation' },
    website_issue: { label: 'Website issue', path: 'website_issue' },
    company: { label: 'Company info', path: 'company' },
    product_support: { label: 'Product support', path: 'product_support' },
    feedback: { label: 'Feedback', path: 'feedback' },
    artwork_prep: { label: 'Artwork prep', path: 'artwork_prep' },
    care: { label: 'Care instructions', path: 'care' },
    installation: { label: 'Installation help', path: 'installation' },
    rush: { label: 'Rush timeline', path: 'rush' },
    ticket: { label: 'Create ticket', path: 'ticket', primary: true },
    work: { label: 'View work', href: CONFIG.workUrl },
    shop: { label: 'Shop', href: CONFIG.shopUrl },
    contact: { label: 'Contact', href: CONFIG.contactUrl },
    call: { label: 'Call Tridico', href: CONFIG.phoneHref, primary: true },
    open_quote: { label: 'Open quote page', href: CONFIG.quoteUrl, primary: true },
    open_upload: { label: 'Open upload page', href: CONFIG.uploadUrl, primary: true },
    ticket_general: { label: 'General ticket', ticket: 'general', primary: true },
    ticket_quality: { label: 'Quality ticket', ticket: 'quality', danger: true },
    ticket_billing: { label: 'Billing ticket', ticket: 'billing' },
    ticket_upload: { label: 'Upload ticket', ticket: 'upload' },
    ticket_quote: { label: 'Quote ticket', ticket: 'quote' },
    ticket_website: { label: 'Website ticket', ticket: 'website' },
    ticket_feedback: { label: 'Feedback ticket', ticket: 'feedback' },
    back: { label: 'Go back', action: 'back' }
  };

  const TICKET_LABELS = {
    general: 'General Support',
    quality: 'Quality Issue',
    billing: 'Billing Issue',
    upload: 'Artwork Upload Issue',
    quote: 'Quote Issue',
    website: 'Website Issue',
    feedback: 'Feedback'
  };

  const COMMON_TICKET_QUESTIONS = [
    { key: 'name', prompt: 'What is your name?' },
    { key: 'company', prompt: 'What business or organization is this for? Type "personal" if not applicable.' },
    { key: 'contact', prompt: 'What is the best phone number or email for follow-up?' },
    { key: 'projectRef', prompt: 'Do you have an invoice, estimate, project, proof, or order number? Type "none" if not available.' }
  ];

  const TICKET_QUESTIONS = {
    general: [
      ...COMMON_TICKET_QUESTIONS,
      { key: 'topic', prompt: 'What kind of support do you need?' },
      { key: 'details', prompt: 'Describe the request. Include dates, project type, and what outcome you need.' },
      { key: 'priority', prompt: 'How urgent is this?', options: ['Normal', 'Time-sensitive', 'Urgent / production blocked'] }
    ],
    quality: [
      ...COMMON_TICKET_QUESTIONS,
      { key: 'productType', prompt: 'Which product has the issue?', options: ['Vehicle wrap/decal', 'Sign', 'Banner', 'Wall/window graphic', 'Printed material', 'Other'] },
      { key: 'issue', prompt: 'What is happening? Examples: peeling edge, bubbling, color mismatch, damage, fading, incorrect size, missing item.' },
      { key: 'timing', prompt: 'When was it installed/delivered, and when did you first notice the issue?' },
      { key: 'photos', prompt: 'Do you have photos ready? The generated ticket will ask you to attach them in the email.', options: ['Photos ready', 'Can take photos', 'No photos available'] },
      { key: 'priority', prompt: 'How urgent is the quality issue?', options: ['Normal', 'Customer-facing issue', 'Vehicle/site unusable', 'Event deadline'] }
    ],
    billing: [
      ...COMMON_TICKET_QUESTIONS,
      { key: 'billingIssue', prompt: 'What billing issue needs review?', options: ['Invoice question', 'Payment question', 'Deposit/balance', 'Receipt needed', 'Refund/credit question', 'Tax exemption', 'Purchase order'] },
      { key: 'amount', prompt: 'What amount, invoice, or payment detail is involved? Type "not sure" if unknown.' },
      { key: 'details', prompt: 'Describe what looks incorrect or what you need changed.' },
      { key: 'priority', prompt: 'Is this blocking production, pickup, or installation?', options: ['No', 'Yes - production blocked', 'Yes - pickup/install blocked'] }
    ],
    upload: [
      ...COMMON_TICKET_QUESTIONS,
      { key: 'fileInfo', prompt: 'What file are you trying to upload? Include file name, file type, and approximate size.' },
      { key: 'error', prompt: 'What happened? Include any error message, browser/device, or whether the page froze.' },
      { key: 'deadline', prompt: 'Is there a deadline connected to this upload?' },
      { key: 'fallback', prompt: 'Can you email the file if the upload does not work?', options: ['Yes', 'No', 'Not sure'] }
    ],
    quote: [
      ...COMMON_TICKET_QUESTIONS,
      { key: 'projectType', prompt: 'What are you trying to quote?', options: ['Graphic design', 'Printing', 'Branding materials', 'Signage', 'Vehicle wrap/decal', 'Installation', 'Multiple services'] },
      { key: 'projectDetails', prompt: 'Describe the project. Include quantity, size, vehicle/model, location, material, or any known specs.' },
      { key: 'timeline', prompt: 'What is your ideal deadline or event date?' },
      { key: 'files', prompt: 'Do you already have artwork, logo files, photos, or references?', options: ['Yes', 'No', 'Some files', 'Need design help'] }
    ],
    website: [
      ...COMMON_TICKET_QUESTIONS,
      { key: 'page', prompt: 'Which page, button, or form had the issue?' },
      { key: 'device', prompt: 'What device and browser were you using? Example: iPhone Safari, Chrome desktop, Android Chrome.' },
      { key: 'issue', prompt: 'What did you expect to happen, and what happened instead?' },
      { key: 'screenshot', prompt: 'Do you have a screenshot or error message?', options: ['Screenshot ready', 'No screenshot', 'Can reproduce issue'] }
    ],
    feedback: [
      ...COMMON_TICKET_QUESTIONS,
      { key: 'feedbackType', prompt: 'What type of feedback is this?', options: ['Compliment', 'Suggestion', 'Concern', 'Website feedback', 'Service experience', 'Other'] },
      { key: 'details', prompt: 'Share the feedback. Include the project or person involved if relevant.' },
      { key: 'followup', prompt: 'Would you like someone to follow up?', options: ['Yes', 'No', 'Only if needed'] }
    ]
  };

  const state = {
    root: null,
    launcher: null,
    panel: null,
    closeButton: null,
    log: null,
    chips: null,
    form: null,
    input: null,
    opened: false,
    started: false,
    ticket: null,
    lastFocus: null,
    lastPath: null,
    pathHistory: []
  };

  const PATH_HISTORY_LIMIT = 12;

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9\s/.-]/g, ' ').replace(/\s+/g, ' ').trim();

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function build() {
    const root = document.createElement('div');
    root.className = 'tdsa-root';
    root.innerHTML = `
      <button class="tdsa-launcher" type="button" aria-expanded="false" aria-controls="tdsa-panel" aria-label="Open Braxton support assistant">
        <span class="tdsa-launcher__orb" aria-hidden="true"><span>AI</span></span>
        <span class="tdsa-launcher__text"><strong>Help</strong><small>Support</small></span>
      </button>
      <section class="tdsa-panel" id="tdsa-panel" role="dialog" aria-modal="false" aria-label="Braxton support assistant" hidden>
        <div class="tdsa-header">
          <div class="tdsa-title-wrap">
            <span class="tdsa-mark" aria-hidden="true"></span>
            <div class="tdsa-title">
              <strong>${escapeHtml(CONFIG.assistantName)}</strong>
            </div>
          </div>
          <div class="tdsa-header-actions">
            <div class="tdsa-header-motto">${sloganHtml('brand-slogan--assistant')}</div>
            <button class="tdsa-close" type="button" aria-label="Close support assistant">&times;</button>
          </div>
        </div>
        <div class="tdsa-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0"></div>
        <div class="tdsa-footer">
          <form class="tdsa-composer" autocomplete="off">
            <button class="tdsa-attach" type="button" aria-label="Attach a file or photo" title="Attach a file or photo">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <input class="tdsa-input" type="text" name="message" placeholder="Type your question..." aria-label="Message Braxton">
            <button class="tdsa-send" type="submit">Send</button>
          </form>
          <p class="tdsa-composer-note">Braxton is a guided support assistant. For urgent production needs, call ${escapeHtml(CONFIG.phone)}.</p>
        </div>
      </section>`;
    document.body.appendChild(root);

    state.root = root;
    state.launcher = root.querySelector('.tdsa-launcher');
    state.panel = root.querySelector('.tdsa-panel');
    state.closeButton = root.querySelector('.tdsa-close');
    state.log = root.querySelector('.tdsa-log');
    state.form = root.querySelector('.tdsa-composer');
    state.input = root.querySelector('.tdsa-input');
    state.attach = root.querySelector('.tdsa-attach');

    state.launcher.addEventListener('click', () => (state.opened ? closePanel() : openPanel()));
    state.closeButton.addEventListener('click', closePanel);
    state.form.addEventListener('submit', handleSubmit);
    if (state.attach) state.attach.addEventListener('click', handleAttachClick);

    document.addEventListener('keydown', (event) => {
      if (!state.opened) return;
      if (event.key === 'Escape') closePanel();
      if (event.key === 'Tab') trapFocus(event);
    });
  }

  function openPanel() {
    state.lastFocus = document.activeElement;
    state.opened = true;
    state.panel.hidden = false;
    state.launcher.setAttribute('aria-expanded', 'true');
    setTimeout(() => state.input && state.input.focus(), 60);
    if (!state.started) {
      state.started = true;
      state.lastPath = 'start';
      state.pathHistory = [];
      botSay(`<p><strong>Hi, I am Braxton.</strong></p><p>I can help with quotes, uploads, services, billing, quality issues, existing project support, website navigation, and support tickets for Tridico Design.</p>`, 350, ['quote', 'upload', 'services', 'quality', 'billing', 'product_support', 'navigation', 'ticket']);
    }
  }

  function closePanel() {
    state.opened = false;
    state.panel.hidden = true;
    state.launcher.setAttribute('aria-expanded', 'false');
    if (state.lastFocus && typeof state.lastFocus.focus === 'function') state.lastFocus.focus();
  }

  function trapFocus(event) {
    const focusable = state.panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const text = state.input.value.trim();
    if (!text) return;
    state.input.value = '';
    userSay(text);
    if (state.ticket) {
      continueTicket(text);
      return;
    }
    routeText(text);
  }

  // The attach button is a routing entry point, not a real upload - the static
  // GitHub Pages site has no upload backend. It mirrors saying "I want to attach
  // a file" and routes the visitor into the upload path, where Open Upload Page
  // and Upload Ticket chips already exist.
  function handleAttachClick() {
    userSay('Attach a file');
    if (state.ticket) {
      // Mid-ticket: don't change the ticket flow - just acknowledge and remind
      // the visitor that the generated ticket email is the place to attach files.
      botSay('<p>Once the ticket is generated, attach your file or photo to the email that opens, or include a link to it. The ticket summary will reference your attachment.</p>', 420);
      return;
    }
    showPath('upload');
  }

  function scrollLog() {
    requestAnimationFrame(() => {
      state.log.scrollTop = state.log.scrollHeight;
    });
  }

  function userSay(text) {
    const row = document.createElement('div');
    row.className = 'tdsa-message tdsa-message--user';
    row.innerHTML = `<div class="tdsa-bubble">${escapeHtml(text)}</div>`;
    state.log.appendChild(row);
    scrollLog();
  }

  function botSay(html, delay = 620, chipIds = null) {
    setChips([]);
    const typing = document.createElement('div');
    typing.className = 'tdsa-typing';
    typing.setAttribute('aria-label', 'Assistant is typing');
    typing.innerHTML = '<span></span><span></span><span></span>';
    state.log.appendChild(typing);
    scrollLog();
    return new Promise((resolve) => {
      window.setTimeout(() => {
        typing.remove();
        const row = document.createElement('div');
        row.className = 'tdsa-message tdsa-message--bot';
        row.innerHTML = `<span class="tdsa-avatar" aria-hidden="true">AI</span><div class="tdsa-bubble">${html}</div>`;
        state.log.appendChild(row);
        if (chipIds) setChips(chipIds);
        scrollLog();
        resolve(row);
      }, delay);
    });
  }

  function setChips(chipIds) {
    if (state.chips) {
      state.chips.remove();
      state.chips = null;
    }
    if (!chipIds.length) return;

    const row = document.createElement('div');
    row.className = 'tdsa-message tdsa-message--options';
    const group = document.createElement('div');
    group.className = 'tdsa-chips';
    group.setAttribute('aria-label', 'Suggested support paths');
    row.appendChild(group);
    state.log.appendChild(row);
    state.chips = row;

    chipIds.forEach((id) => {
      const chip = CHIP_DEFS[id];
      if (!chip) return;
      const el = document.createElement(chip.href ? 'a' : 'button');
      el.className = 'tdsa-chip' + (chip.primary ? ' tdsa-chip--primary' : '') + (chip.danger ? ' tdsa-chip--danger' : '');
      el.textContent = chip.label;
      if (chip.href) {
        el.href = chip.href;
      } else {
        el.type = 'button';
        el.addEventListener('click', () => handleChip(chip));
      }
      group.appendChild(el);
    });
    if (!group.children.length) {
      row.remove();
      state.chips = null;
    }
  }

  function handleChip(chip) {
    userSay(chip.label);
    if (chip.action === 'back') {
      goBack();
      return;
    }
    if (state.ticket && chip.answer) {
      continueTicket(chip.answer);
      return;
    }
    if (chip.ticket) {
      startTicket(chip.ticket);
      return;
    }
    if (chip.path) showPath(chip.path);
  }

  function showPath(id, opts) {
    opts = opts || {};
    const resolvedId = PATHS[id] ? id : 'fallback';
    const path = PATHS[resolvedId];
    // Push the previous path onto history so "Go back" can reverse it.
    if (!opts.skipHistory && state.lastPath && state.lastPath !== resolvedId) {
      state.pathHistory.push(state.lastPath);
      if (state.pathHistory.length > PATH_HISTORY_LIMIT) state.pathHistory.shift();
    }
    state.lastPath = resolvedId;
    const chips = (path.chips || []).slice();
    // Offer "Go back" whenever there is a prior path and we are not mid-ticket.
    if (state.pathHistory.length && !state.ticket) chips.push('back');
    botSay(path.html, 650, chips);
  }

  function goBack() {
    if (!state.pathHistory.length) return;
    const previous = state.pathHistory.pop();
    // Clear lastPath so showPath does not re-push the path we just left onto history.
    state.lastPath = null;
    showPath(previous, { skipHistory: true });
  }

  // Priority order for free-text routing: more specific intents win over generic
  // ones. 'start' is intentionally excluded so users don't get bounced back to the
  // main menu when they type a real question. 'navigation' is last because phrases
  // like "find the quote page" should route to quote, not the page list.
  const ROUTE_PRIORITY = [
    'rush', 'quality', 'website_issue', 'billing',
    'upload', 'artwork_prep', 'care', 'installation',
    'feedback', 'product_support', 'quote', 'services',
    'company', 'ticket', 'navigation'
  ];

  function routeText(text) {
    const lower = normalize(text);
    const direct = ROUTE_PRIORITY.find((id) => PATHS[id] && PATHS[id].keywords.some((kw) => lower.includes(normalize(kw))));
    if (direct) showPath(direct);
    else showPath('fallback');
  }

  function startTicket(type) {
    const ticketType = TICKET_QUESTIONS[type] ? type : 'general';
    state.ticket = {
      type: ticketType,
      label: TICKET_LABELS[ticketType],
      questions: TICKET_QUESTIONS[ticketType],
      step: 0,
      data: {},
      id: createTicketId()
    };
    botSay(`<p>I'm generating a <strong>${escapeHtml(state.ticket.label)}</strong> support ticket path now.</p><p>I'll ask only the details needed to route it clearly. You can type "cancel" at any time.</p>`, 650).then(askTicketQuestion);
  }

  function askTicketQuestion() {
    if (!state.ticket) return;
    const q = state.ticket.questions[state.ticket.step];
    if (!q) return finalizeTicket();
    const chips = q.options ? q.options.map((option) => {
      const id = `answer_${state.ticket.step}_${normalize(option).replace(/\s+/g, '_')}`;
      CHIP_DEFS[id] = { label: option, answer: option };
      return id;
    }) : [];
    botSay(`<p>${escapeHtml(q.prompt)}</p>`, 520, chips);
  }

  function continueTicket(answer) {
    if (!state.ticket) return;
    const trimmed = String(answer || '').trim();
    if (/^(cancel|stop|never mind|nevermind|exit)$/i.test(trimmed)) {
      state.ticket = null;
      state.lastPath = 'start';
      state.pathHistory = [];
      botSay('<p>Ticket generation canceled. Choose another path below.</p>', 420, ['quote', 'upload', 'services', 'quality', 'billing', 'product_support', 'ticket']);
      return;
    }
    const q = state.ticket.questions[state.ticket.step];
    if (!q) return finalizeTicket();
    state.ticket.data[q.key] = trimmed;
    state.ticket.step += 1;
    if (state.ticket.step >= state.ticket.questions.length) finalizeTicket();
    else askTicketQuestion();
  }

  function finalizeTicket() {
    const ticket = state.ticket;
    state.ticket = null;
    // After a completed ticket, treat the chip row that follows as a fresh start
    // so the next click does not push a stale "ticket" path onto history.
    state.lastPath = 'start';
    state.pathHistory = [];
    const body = buildTicketBody(ticket);
    saveTicket(ticket, body);
    const mailto = buildMailto(ticket, body);

    if (CONFIG.ticketEndpoint) {
      postTicket(ticket, body).catch(() => null);
    }

    const summaryHtml = Object.entries(ticket.data).map(([key, value]) => `<span><strong>${formatKey(key)}:</strong> ${escapeHtml(value)}</span>`).join('');
    const html = `
      <p><strong>Ticket generated:</strong> ${escapeHtml(ticket.id)}</p>
      <p>I prepared the support details. Use the email button below to send it to Tridico, or copy the summary for your records.</p>
      <div class="tdsa-ticket-summary">
        <span><strong>Type:</strong> ${escapeHtml(ticket.label)}</span>
        ${summaryHtml}
      </div>
      <div class="tdsa-actions">
        <a class="tdsa-action tdsa-action--yellow" href="${mailto}">Send ticket</a>
        <button class="tdsa-action tdsa-copy-ticket" type="button" data-ticket="${escapeHtml(body)}">Copy summary</button>
        <a class="tdsa-action tdsa-action--outline" href="${CONFIG.phoneHref}">Call</a>
      </div>`;
    botSay(html, 700, ['quote', 'upload', 'services', 'ticket']).then((row) => {
      const copy = row.querySelector('.tdsa-copy-ticket');
      if (copy) {
        copy.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(body);
            copy.textContent = 'Copied';
          } catch (error) {
            copy.textContent = 'Copy unavailable';
          }
        });
      }
    });
  }

  function createTicketId() {
    const now = new Date();
    const stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('');
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `TD-${stamp}-${random}`;
  }

  function formatKey(key) {
    return String(key).replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  }

  function buildTicketBody(ticket) {
    const lines = [
      `${CONFIG.company} Support Ticket`,
      `Ticket ID: ${ticket.id}`,
      `Type: ${ticket.label}`,
      `Created: ${new Date().toLocaleString()}`,
      '',
      'Details:'
    ];
    Object.entries(ticket.data).forEach(([key, value]) => lines.push(`${formatKey(key)}: ${value}`));
    lines.push('', 'Generated from the Tridico Design website support assistant.');
    if (ticket.type === 'quality') lines.push('Photo reminder: attach wide, close-up, and detail photos if available.');
    if (ticket.type === 'upload') lines.push('File reminder: attach the problem file or screenshot if email size allows.');
    return lines.join('\n');
  }

  function buildMailto(ticket, body) {
    const subject = `${ticket.id} - ${ticket.label} - Tridico Design`;
    return `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function saveTicket(ticket, body) {
    try {
      const existing = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
      existing.unshift({ id: ticket.id, type: ticket.type, label: ticket.label, created: new Date().toISOString(), data: ticket.data, body });
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(existing.slice(0, 10)));
    } catch (error) {
      // Local storage is optional; ignore failures.
    }
  }

  async function postTicket(ticket, body) {
    if (!CONFIG.ticketEndpoint) return;
    await fetch(CONFIG.ticketEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket, body, source: 'tridico-support-assistant' })
    });
  }

  ready(build);
})();
