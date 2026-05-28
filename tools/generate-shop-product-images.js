const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.join(__dirname, '..');
const outRoot = path.join(repoRoot, 'assets', 'images', 'shop', 'generated');

const escapeXml = value => String(value || '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
})[char]);

const slugText = value => String(value || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick(list, seed, offset = 0) {
  return list[(seed + offset) % list.length];
}

function splitLines(value, max = 15, limit = 3) {
  const words = String(value || '').replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let current = '';
  words.forEach(word => {
    if (!current) current = word;
    else if ((current + ' ' + word).length <= max) current += ' ' + word;
    else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  if (lines.length <= limit) return lines;
  const kept = lines.slice(0, limit);
  kept[limit - 1] = kept[limit - 1].replace(/[.,;:!?-]+$/, '') + '...';
  return kept;
}

function loadProducts() {
  const code = fs.readFileSync(path.join(repoRoot, 'assets', 'js', 'shop-products.js'), 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window.tridicoShopProducts;
}

function parseAttrs(value) {
  const attrs = {};
  for (const match of value.matchAll(/(data-shop-[\w-]+)="([^"]*)"/g)) {
    attrs[match[1].replace(/^data-shop-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = slugText(match[2]);
  }
  return attrs;
}

function loadStaticShopCards() {
  const html = fs.readFileSync(path.join(repoRoot, 'shop.html'), 'utf8');
  const cards = [];
  const cardRegex = /<article class="shop-card(?: reveal)?" data-shop-card([^>]*)>/g;
  for (const match of html.matchAll(cardRegex)) {
    const attrs = parseAttrs(match[1]);
    if (!attrs.id) continue;
    cards.push({
      id: attrs.id,
      category: attrs.category || 'custom-services',
      name: attrs.name || attrs.id,
      price: Number(attrs.price) || 0,
      tags: String(attrs.tags || '').split(/\s+/).filter(Boolean),
      badge: 'Custom Services',
      count: attrs.count || '1 custom service package',
      turnaround: attrs.turnaround || 'Quote after project review',
      unitPrice: attrs.unitPrice || 'Project-priced',
      priority: 500,
      staticCard: true
    });
  }
  return cards;
}

const paletteByCategory = {
  'car-decals': ['#111827', '#f43f5e', '#facc15', '#e5e7eb'],
  'car-vinyl': ['#0f172a', '#22d3ee', '#a855f7', '#f8fafc'],
  'wrap-vinyl': ['#111827', '#60a5fa', '#34d399', '#f8fafc'],
  stickers: ['#ffffff', '#ef4444', '#facc15', '#38bdf8'],
  'mug-stickers': ['#fff7ed', '#7c2d12', '#fb7185', '#111827'],
  'business-decals': ['#0f172a', '#facc15', '#ffffff', '#ef4444'],
  signs: ['#ffffff', '#111827', '#facc15', '#ef4444'],
  'tech-decals': ['#020617', '#22d3ee', '#a855f7', '#e2e8f0'],
  'posters-wall-art': ['#f8fafc', '#0f172a', '#fb7185', '#f59e0b'],
  'home-decor': ['#fff7ed', '#334155', '#84cc16', '#f97316'],
  'custom-services': ['#111111', '#ffd21d', '#ef1d24', '#ffffff']
};

const motifWords = {
  anime: ['anime', 'kawaii', 'chibi', 'manga'],
  goth: ['goth', 'dark', 'black', 'romance'],
  pet: ['cat', 'dog', 'pet', 'paw'],
  floral: ['floral', 'flower', 'garden', 'wildflower', 'botanical'],
  flame: ['flame', 'fire', 'racing', 'street'],
  lightning: ['lightning', 'bolt', 'electric'],
  digital: ['digital', 'cyber', 'grid', 'gamer', 'console'],
  wedding: ['wedding', 'bridal', 'ceremony'],
  school: ['teacher', 'school', 'classroom', 'graduation'],
  coffee: ['coffee', 'mug', 'cafe', 'kitchen']
};

function hasAny(product, words) {
  const text = [product.name, product.category, ...(product.tags || [])].join(' ').toLowerCase();
  return words.some(word => text.includes(word));
}

function themeFor(product) {
  const seed = hashString(product.id);
  const base = paletteByCategory[product.category] || paletteByCategory['custom-services'];
  let colors = [...base];
  if (hasAny(product, motifWords.goth)) colors = ['#07070a', '#e11d48', '#8b5cf6', '#f8fafc'];
  if (hasAny(product, motifWords.floral)) colors = ['#fff7ed', '#db2777', '#84cc16', '#7c2d12'];
  if (hasAny(product, motifWords.digital)) colors = ['#020617', '#22d3ee', '#a855f7', '#f8fafc'];
  if (hasAny(product, motifWords.flame)) colors = ['#111827', '#ef4444', '#f97316', '#facc15'];
  if (hasAny(product, motifWords.wedding)) colors = ['#fffaf0', '#111827', '#d4af37', '#e11d48'];
  return {
    seed,
    bg: colors[0],
    primary: colors[1],
    secondary: colors[2],
    ink: colors[3],
    soft: pick(['#f8fafc', '#fff7ed', '#eef2ff', '#f1f5f9'], seed, 1)
  };
}

function labelFor(product) {
  const name = product.name;
  const lower = name.toLowerCase();
  const direct = [
    ['restroom', 'RESTROOM'],
    ['exit', 'EXIT'],
    ['open house', 'OPEN HOUSE'],
    ['event this way', 'EVENT THIS WAY'],
    ['this way', 'THIS WAY'],
    ['caution', 'CAUTION'],
    ['no smoking', 'NO SMOKING'],
    ['reserved', 'RESERVED'],
    ['wifi', 'WIFI'],
    ['order here', 'ORDER HERE'],
    ['pick up', 'PICK UP'],
    ['welcome', 'WELCOME'],
    ['graduation', 'CLASS OF 2026'],
    ['birthday', 'HAPPY BIRTHDAY'],
    ['wedding', 'WELCOME'],
    ['teacher', 'GREAT JOB'],
    ['student driver', 'STUDENT DRIVER'],
    ['hours', 'OPEN HOURS']
  ];
  const found = direct.find(([needle]) => lower.includes(needle));
  if (found) return found[1];
  return splitLines(name.replace(/\b(Sticker|Decal|Sign|Print|Poster|Pack|Set|Kit|Bundle|Vinyl|Graphic|Graphics)\b/gi, '').trim() || name, 16, 2).join(' ');
}

function svgDefs(theme) {
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${theme.soft}"/><stop offset="1" stop-color="#d7dde7"/></linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${theme.primary}"/><stop offset="1" stop-color="${theme.secondary}"/></linearGradient>
    <linearGradient id="darkGloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".26"/><stop offset=".35" stop-color="#ffffff" stop-opacity=".05"/><stop offset="1" stop-color="#000000" stop-opacity=".16"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#0f172a" flood-opacity=".24"/></filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="9" stdDeviation="9" flood-color="#0f172a" flood-opacity=".2"/></filter>
    <filter id="paperNoise"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="${theme.seed % 97}" result="noise"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .08"/></feComponentTransfer></filter>
  </defs>`;
}

function iconMotifs(product, theme, x, y, size) {
  const seed = theme.seed;
  if (hasAny(product, motifWords.pet)) {
    return `<g transform="translate(${x} ${y}) scale(${size / 120})"><circle cx="60" cy="68" r="34" fill="${theme.secondary}" opacity=".95"/><circle cx="28" cy="34" r="17" fill="${theme.primary}"/><circle cx="52" cy="22" r="17" fill="${theme.primary}"/><circle cx="78" cy="22" r="17" fill="${theme.primary}"/><circle cx="96" cy="42" r="17" fill="${theme.primary}"/><path d="M44 76q16 16 32 0" fill="none" stroke="${theme.bg}" stroke-width="8" stroke-linecap="round"/></g>`;
  }
  if (hasAny(product, motifWords.floral)) {
    return `<g transform="translate(${x} ${y}) scale(${size / 130})"><circle cx="65" cy="65" r="16" fill="${theme.secondary}"/><g fill="${theme.primary}"><ellipse cx="65" cy="25" rx="18" ry="28"/><ellipse cx="65" cy="105" rx="18" ry="28"/><ellipse cx="25" cy="65" rx="28" ry="18"/><ellipse cx="105" cy="65" rx="28" ry="18"/><ellipse cx="36" cy="36" rx="16" ry="25" transform="rotate(-45 36 36)"/><ellipse cx="94" cy="36" rx="16" ry="25" transform="rotate(45 94 36)"/></g><path d="M66 113c18 14 35 21 51 20" fill="none" stroke="${theme.secondary}" stroke-width="8" stroke-linecap="round"/></g>`;
  }
  if (hasAny(product, motifWords.flame)) {
    return `<path d="M${x + size * .52} ${y} C${x + size * .2} ${y + size * .35} ${x + size * .36} ${y + size * .58} ${x} ${y + size} C${x + size * .55} ${y + size * .82} ${x + size * .95} ${y + size * .62} ${x + size} ${y + size * .18} C${x + size * .82} ${y + size * .34} ${x + size * .7} ${y + size * .2} ${x + size * .52} ${y}Z" fill="url(#accent)" filter="url(#softShadow)"/>`;
  }
  if (hasAny(product, motifWords.lightning)) {
    return `<path d="M${x + size * .58} ${y} L${x + size * .18} ${y + size * .55} H${x + size * .48} L${x + size * .34} ${y + size} L${x + size * .86} ${y + size * .38} H${x + size * .56} Z" fill="url(#accent)" filter="url(#softShadow)"/>`;
  }
  if (hasAny(product, motifWords.digital)) {
    return `<g transform="translate(${x} ${y})"><rect width="${size}" height="${size}" rx="${size * .18}" fill="${theme.bg}" stroke="${theme.primary}" stroke-width="${size * .045}"/><path d="M${size * .18} ${size * .35}H${size * .82}M${size * .18} ${size * .55}H${size * .68}M${size * .18} ${size * .75}H${size * .55}" stroke="${theme.primary}" stroke-width="${size * .055}" stroke-linecap="round"/><circle cx="${size * .78}" cy="${size * .72}" r="${size * .09}" fill="${theme.secondary}"/></g>`;
  }
  const points = Array.from({ length: 5 }, (_, i) => {
    const outer = i * 72 - 90;
    const inner = outer + 36;
    return `${x + size / 2 + Math.cos(outer * Math.PI / 180) * size / 2},${y + size / 2 + Math.sin(outer * Math.PI / 180) * size / 2} ${x + size / 2 + Math.cos(inner * Math.PI / 180) * size / 4},${y + size / 2 + Math.sin(inner * Math.PI / 180) * size / 4}`;
  }).join(' ');
  return `<polygon points="${points}" fill="${pick([theme.primary, theme.secondary], seed)}" filter="url(#softShadow)"/>`;
}

function textLinesSvg(lines, x, y, size, fill, weight = 900, anchor = 'middle') {
  return lines.map((line, index) => `<text x="${x}" y="${y + index * size * 1.16}" text-anchor="${anchor}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${escapeXml(line)}</text>`).join('');
}

function decalArtwork(product, theme, x, y, w, h, compact = false) {
  const label = labelFor(product);
  const titleLines = splitLines(label.toUpperCase(), compact ? 12 : 14, compact ? 2 : 3);
  const radius = Math.min(w, h) * .1;
  const category = product.category;
  if (category === 'wrap-vinyl') {
    return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="${radius}" fill="${theme.bg}" filter="url(#softShadow)"/><rect width="${w}" height="${h}" rx="${radius}" fill="url(#accent)" opacity=".86"/><path d="M0 ${h * .2} C${w * .25} ${h * .04} ${w * .58} ${h * .36} ${w} ${h * .12}V${h}H0Z" fill="#fff" opacity=".18"/><g opacity=".26">${Array.from({ length: 8 }, (_, i) => `<path d="M${-w * .2 + i * w * .2} 0L${i * w * .2} ${h}" stroke="#fff" stroke-width="${w * .025}"/>`).join('')}</g>${textLinesSvg(splitLines(product.name, 18, 2), w / 2, h * .72, compact ? 24 : 38, '#fff')}</g>`;
  }
  if (category === 'signs' || category === 'business-decals') {
    const arrow = hasAny(product, ['arrow', 'directional', 'this way', 'exit']) ? `<path d="M${w * .72} ${h * .5}h-${w * .22}v-${h * .12}L${w * .22} ${h * .5}l${w * .28} ${h * .28}v-${h * .12}h${w * .22}z" fill="${theme.secondary}"/>` : '';
    return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="${radius}" fill="#fff" stroke="${theme.bg}" stroke-width="${Math.max(6, w * .025)}" filter="url(#softShadow)"/><rect x="${w * .05}" y="${h * .05}" width="${w * .9}" height="${h * .18}" rx="${h * .045}" fill="url(#accent)"/><rect x="${w * .08}" y="${h * .76}" width="${w * .84}" height="${h * .08}" rx="${h * .03}" fill="${theme.bg}" opacity=".12"/>${arrow}${textLinesSvg(titleLines, w / 2, h * .43, compact ? 24 : 42, theme.bg)}</g>`;
  }
  if (category === 'posters-wall-art' || category === 'home-decor') {
    return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="${radius * .45}" fill="#fff" filter="url(#softShadow)"/><rect x="${w * .05}" y="${h * .05}" width="${w * .9}" height="${h * .9}" rx="${radius * .32}" fill="${theme.soft}"/><circle cx="${w * .76}" cy="${h * .22}" r="${w * .12}" fill="${theme.secondary}" opacity=".78"/><path d="M${w * .08} ${h * .75}C${w * .26} ${h * .42} ${w * .42} ${h * .88} ${w * .58} ${h * .5}S${w * .83} ${h * .54} ${w * .93} ${h * .28}" fill="none" stroke="${theme.primary}" stroke-width="${w * .045}" stroke-linecap="round"/><rect x="${w * .12}" y="${h * .12}" width="${w * .2}" height="${h * .03}" fill="${theme.bg}" opacity=".55"/>${textLinesSvg(titleLines, w / 2, h * .58, compact ? 22 : 34, theme.bg)}</g>`;
  }
  if (category === 'car-vinyl' || category === 'car-decals') {
    return `<g transform="translate(${x} ${y})"><path d="M${w * .02} ${h * .54}C${w * .18} ${h * .18} ${w * .52} ${h * .1} ${w * .98} ${h * .28}C${w * .8} ${h * .5} ${w * .68} ${h * .74} ${w * .18} ${h * .84}C${w * .1} ${h * .76} ${w * .06} ${h * .66} ${w * .02} ${h * .54}Z" fill="url(#accent)" filter="url(#softShadow)"/><path d="M${w * .14} ${h * .52}C${w * .38} ${h * .42} ${w * .6} ${h * .38} ${w * .86} ${h * .42}" fill="none" stroke="#fff" stroke-width="${w * .035}" stroke-linecap="round" opacity=".84"/>${iconMotifs(product, theme, w * .68, h * .48, w * .18)}${textLinesSvg(titleLines.slice(0, 2), w * .37, h * .61, compact ? 20 : 32, '#fff')}</g>`;
  }
  const stickerShape = `<path d="M${w * .14} ${h * .16}C${w * .32} ${h * .02} ${w * .62} ${h * .08} ${w * .82} ${h * .21}C${w * .98} ${h * .38} ${w * .94} ${h * .66} ${w * .78} ${h * .82}C${w * .58} ${h * .99} ${w * .28} ${h * .94} ${w * .12} ${h * .76}C${-w * .04} ${h * .58} ${-w * .02} ${h * .3} ${w * .14} ${h * .16}Z"/>`;
  return `<g transform="translate(${x} ${y})"><g fill="#fff" stroke="#e5e7eb" stroke-width="${Math.max(5, w * .02)}" filter="url(#softShadow)">${stickerShape}</g><g transform="translate(${w * .08} ${h * .08})">${iconMotifs(product, theme, w * .5, h * .13, w * .26)}</g><rect x="${w * .2}" y="${h * .62}" width="${w * .6}" height="${h * .16}" rx="${h * .08}" fill="url(#accent)"/>${textLinesSvg(titleLines, w / 2, h * .73, compact ? 18 : 28, '#fff')}</g>`;
}

function environmentLabel(product) {
  if (product.category === 'mug-stickers') return 'Applied to mug';
  if (product.category === 'tech-decals') return 'Applied to laptop';
  if (product.category === 'business-decals') return 'Applied to storefront';
  if (product.category === 'signs') return hasAny(product, ['yard', 'lawn', 'open house']) ? 'Installed outdoors' : 'Event display';
  if (product.category === 'posters-wall-art') return 'Framed wall print';
  if (product.category === 'home-decor') return 'Installed decor';
  if (product.category === 'car-decals' || product.category === 'car-vinyl') return 'Applied to vehicle';
  if (product.category === 'wrap-vinyl') return 'Material on vehicle panel';
  if (product.category === 'stickers') return 'Applied to everyday gear';
  return 'Project mockup';
}

function appliedSvg(product) {
  const theme = themeFor(product);
  const art = (x, y, w, h) => decalArtwork(product, theme, x, y, w, h, true);
  let scene = '';
  switch (product.category) {
    case 'mug-stickers':
      scene = `<rect width="1200" height="1200" fill="url(#bg)"/><rect y="760" width="1200" height="440" fill="#b98558"/><path d="M180 805h840" stroke="#8b5e3c" stroke-width="6" opacity=".25"/><rect x="112" y="330" width="380" height="250" rx="24" fill="#1f2937" opacity=".18" transform="rotate(-8 302 455)"/><ellipse cx="690" cy="842" rx="244" ry="50" fill="#111827" opacity=".18"/><path d="M468 380h330c56 0 98 48 91 104l-45 330c-7 50-50 88-101 88H526c-51 0-94-38-101-88l-45-330c-7-56 35-104 88-104Z" fill="#fff" filter="url(#shadow)"/><path d="M820 486c116 6 166 74 150 150-14 69-78 115-162 114" fill="none" stroke="#fff" stroke-width="52" stroke-linecap="round" filter="url(#softShadow)"/><path d="M451 424h390" stroke="#f8fafc" stroke-width="22" opacity=".9"/><g transform="translate(498 538)">${art(0, 0, 285, 210)}</g>`;
      break;
    case 'tech-decals':
      scene = `<rect width="1200" height="1200" fill="#dbe4ea"/><rect y="795" width="1200" height="405" fill="#8a6a53"/><rect x="160" y="376" width="760" height="472" rx="34" fill="#202733" filter="url(#shadow)"/><rect x="198" y="418" width="684" height="386" rx="20" fill="#364152"/><rect x="115" y="840" width="895" height="64" rx="22" fill="#171d26"/><rect x="220" y="884" width="690" height="30" rx="15" fill="#0f141c"/><g transform="translate(412 520)">${art(0, 0, 280, 210)}</g><rect x="930" y="700" width="110" height="170" rx="22" fill="#111827" filter="url(#softShadow)"/><circle cx="985" cy="832" r="11" fill="#64748b"/>`;
      break;
    case 'business-decals':
      scene = `<rect width="1200" height="1200" fill="#e8edf2"/><rect x="178" y="220" width="844" height="790" rx="14" fill="#1f2937" filter="url(#shadow)"/><rect x="220" y="270" width="365" height="680" fill="#dbeafe" opacity=".82"/><rect x="615" y="270" width="365" height="680" fill="#dbeafe" opacity=".82"/><path d="M220 270l365 680M615 270l365 680" stroke="#fff" stroke-width="10" opacity=".35"/><rect x="238" y="466" width="320" height="150" rx="8" fill="#fff" opacity=".9"/><g transform="translate(252 484)">${art(0, 0, 292, 112)}</g><rect x="642" y="344" width="310" height="88" rx="6" fill="#fff" opacity=".9"/><text x="797" y="397" text-anchor="middle" font-family="Inter, Arial" font-weight="900" font-size="35" fill="#111827">OPEN</text><circle cx="600" cy="615" r="10" fill="#111827"/>`;
      break;
    case 'signs':
      if (hasAny(product, ['yard', 'lawn', 'open house'])) {
        scene = `<rect width="1200" height="1200" fill="#cfe8ff"/><path d="M0 760C220 690 382 748 610 712s378-96 590-32v520H0Z" fill="#7eb46a"/><path d="M575 780v285M695 780v285" stroke="#475569" stroke-width="12"/><g transform="translate(350 398)">${art(0, 0, 570, 350)}</g><ellipse cx="635" cy="1070" rx="260" ry="32" fill="#000" opacity=".16"/>`;
      } else {
        scene = `<rect width="1200" height="1200" fill="#f4efe7"/><rect y="790" width="1200" height="410" fill="#c4a484"/><rect x="236" y="270" width="728" height="560" rx="28" fill="#e5ded2" filter="url(#shadow)"/><path d="M336 830l-84 210M864 830l84 210" stroke="#7c5f44" stroke-width="18" stroke-linecap="round"/><g transform="translate(304 350)">${art(0, 0, 592, 388)}</g>`;
      }
      break;
    case 'posters-wall-art':
      scene = `<rect width="1200" height="1200" fill="#e9dfd2"/><rect y="820" width="1200" height="380" fill="#b98b64"/><rect x="315" y="190" width="570" height="690" rx="18" fill="#654321" filter="url(#shadow)"/><rect x="350" y="225" width="500" height="620" rx="8" fill="#fff"/><g transform="translate(382 264)">${art(0, 0, 436, 520)}</g><rect x="170" y="835" width="860" height="70" rx="35" fill="#f8fafc" filter="url(#softShadow)"/><rect x="225" y="870" width="750" height="180" rx="38" fill="#334155"/>`;
      break;
    case 'home-decor':
      scene = `<rect width="1200" height="1200" fill="#efe7dc"/><rect y="830" width="1200" height="370" fill="#caa98b"/><rect x="205" y="315" width="790" height="330" rx="24" fill="#fdf8ef" filter="url(#shadow)"/><g transform="translate(282 370)">${art(0, 0, 636, 220)}</g><rect x="140" y="842" width="340" height="170" rx="20" fill="#fff" filter="url(#softShadow)"/><rect x="720" y="805" width="250" height="260" rx="20" fill="#475569"/><circle cx="845" cy="880" r="48" fill="${theme.secondary}" opacity=".8"/>`;
      break;
    case 'car-decals':
    case 'car-vinyl':
    case 'wrap-vinyl':
      scene = `<rect width="1200" height="1200" fill="#d8e2ee"/><rect y="760" width="1200" height="440" fill="#4b5563"/><path d="M140 735C210 545 330 455 538 425l280-40c80-12 150 15 205 76l70 78c48 54 38 149-24 188-72 45-184 66-340 62l-358-8c-104-2-181-18-231-46Z" fill="#111827" filter="url(#shadow)"/><path d="M360 485h454c62 0 112 44 126 104l16 69H245l36-88c22-52 36-85 79-85Z" fill="#334155"/><path d="M411 505h180v138H318l31-78c15-38 29-60 62-60ZM626 505h174c48 0 82 36 96 88l12 50H626Z" fill="#c7d2fe" opacity=".78"/><circle cx="320" cy="787" r="82" fill="#111827"/><circle cx="320" cy="787" r="38" fill="#94a3b8"/><circle cx="910" cy="787" r="82" fill="#111827"/><circle cx="910" cy="787" r="38" fill="#94a3b8"/><g transform="translate(500 610)">${art(0, 0, 300, 160)}</g><path d="M185 704c185 35 575 35 870 0" stroke="#fff" stroke-width="9" opacity=".22"/>`;
      break;
    case 'stickers':
      scene = `<rect width="1200" height="1200" fill="#e5edf6"/><rect y="782" width="1200" height="418" fill="#a47752"/><rect x="195" y="590" width="430" height="330" rx="28" fill="#f8fafc" transform="rotate(-6 410 755)" filter="url(#shadow)"/><path d="M780 285h120c48 0 86 38 86 86v450c0 56-45 102-102 102H796c-56 0-102-46-102-102V371c0-48 39-86 86-86Z" fill="#2dd4bf" filter="url(#shadow)"/><path d="M706 390h268" stroke="#ccfbf1" stroke-width="26" opacity=".85"/><g transform="translate(745 538)">${art(0, 0, 190, 210)}</g><g transform="translate(245 640)">${art(0, 0, 310, 210)}</g>`;
      break;
    default:
      scene = `<rect width="1200" height="1200" fill="#e5e7eb"/><rect y="775" width="1200" height="425" fill="#b08968"/><rect x="180" y="235" width="840" height="610" rx="34" fill="#111827" filter="url(#shadow)"/><rect x="225" y="290" width="750" height="500" rx="20" fill="#f8fafc"/><g transform="translate(318 385)">${art(0, 0, 564, 314)}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" role="img" aria-label="${escapeXml(product.name)} applied product mockup">
  ${svgDefs(theme)}
  ${scene}
  <rect width="1200" height="1200" fill="#fff" filter="url(#paperNoise)" opacity=".55"/>
  <text x="72" y="94" font-family="Inter, Arial, sans-serif" font-size="31" font-weight="900" fill="#111827">${escapeXml(environmentLabel(product))}</text>
  <text x="72" y="136" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="#475569">${escapeXml(product.name)}</text>
</svg>`;
}

function artworkSvg(product) {
  const theme = themeFor(product);
  const art = decalArtwork(product, theme, 210, 252, 780, 580, false);
  const label = product.category === 'wrap-vinyl' ? 'MATERIAL / COLOR SAMPLE' : 'PRINT READY ARTWORK';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" role="img" aria-label="${escapeXml(product.name)} standalone artwork">
  ${svgDefs(theme)}
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <rect x="90" y="90" width="1020" height="1020" rx="64" fill="#fff" filter="url(#shadow)"/>
  <rect x="130" y="130" width="940" height="940" rx="42" fill="${theme.soft}"/>
  <rect x="160" y="160" width="880" height="70" rx="35" fill="#fff" opacity=".78"/>
  <text x="600" y="207" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="900" fill="#111827">${escapeXml(label)}</text>
  ${art}
  <rect x="220" y="910" width="760" height="96" rx="48" fill="#fff" opacity=".86"/>
  ${textLinesSvg(splitLines(product.name, 34, 2), 600, 953, 25, '#111827', 850)}
  <text x="600" y="1044" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="19" font-weight="800" fill="#64748b">${escapeXml(product.count || product.badge || product.category)}</text>
  <rect width="1200" height="1200" fill="#fff" filter="url(#paperNoise)" opacity=".35"/>
</svg>`;
}

function writeProduct(product) {
  const categoryDir = path.join(outRoot, product.category || 'custom-services');
  fs.mkdirSync(categoryDir, { recursive: true });
  fs.writeFileSync(path.join(categoryDir, `${product.id}-applied.svg`), appliedSvg(product));
  fs.writeFileSync(path.join(categoryDir, `${product.id}-artwork.svg`), artworkSvg(product));
}

function main() {
  const products = loadProducts();
  const staticCards = loadStaticShopCards();
  const all = [...products, ...staticCards];
  fs.mkdirSync(outRoot, { recursive: true });
  all.forEach(writeProduct);
  console.log(`Generated ${all.length * 2} shop product images for ${all.length} products.`);
}

main();
