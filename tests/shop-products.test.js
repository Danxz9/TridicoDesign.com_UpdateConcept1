const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const repoRoot = path.join(__dirname, '..');

function loadProducts() {
  const code = fs.readFileSync(path.join(repoRoot, 'assets/js/shop-products.js'), 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.window.tridicoShopProducts;
}

function staticAssetPath(assetPath) {
  return assetPath.split('?')[0];
}

function getStaticCustomServiceCards() {
  const html = fs.readFileSync(path.join(repoRoot, 'shop.html'), 'utf8');
  return Array.from(html.matchAll(/<article class="shop-card(?: reveal)?" data-shop-card([^>]*)>/g))
    .map(match => Object.fromEntries(
      Array.from(match[1].matchAll(/data-shop-([\w-]+)="([^"]*)"/g))
        .map(([, key, value]) => [key, value])
    ))
    .filter(card => card.category === 'custom-services');
}

test('shop catalog exposes 350 customer-facing products with merchandising fields', () => {
  const products = loadProducts();
  assert.equal(products.length, 350);
  assert.equal(new Set(products.map(product => product.id)).size, products.length);

  for (const product of products) {
    assert.match(product.id, /^[a-z0-9-]+$/);
    assert.ok(product.name);
    assert.ok(product.description);
    assert.ok(product.price > 0);
    assert.ok(product.count);
    assert.ok(product.unitPrice);
    assert.ok(product.turnaround);
    assert.ok(product.rating);
    assert.ok(product.reviews);
    assert.ok(product.demand);
    assert.ok(Number.isFinite(product.priority));
    assert.ok(product.image);
    assert.ok(product.artworkImage);
    assert.ok(Array.isArray(product.gallery));
    assert.equal(product.gallery.length, 2);
    assert.match(product.image, new RegExp(`^assets/images/shop/(generated/${product.category}|canva-test)/${product.id}-applied\\.svg(?:\\?v=[a-z0-9-]+)?$`));
    assert.match(product.artworkImage, new RegExp(`^assets/images/shop/(generated/${product.category}|canva-test)/${product.id}-artwork\\.svg(?:\\?v=[a-z0-9-]+)?$`));
    assert.ok(Array.isArray(product.tags));
    assert.ok(product.tags.includes(product.category));
  }
});

test('shop product image decks use generated applied and artwork files', () => {
  const products = loadProducts();
  const productData = fs.readFileSync(path.join(repoRoot, 'assets/js/shop-products.js'), 'utf8');
  assert.doesNotMatch(productData, /assets\/images\/placeholders/);

  for (const product of products) {
    const applied = path.join(repoRoot, staticAssetPath(product.image));
    const artwork = path.join(repoRoot, staticAssetPath(product.artworkImage));
    assert.ok(fs.existsSync(applied), `${product.id} applied image missing`);
    assert.ok(fs.existsSync(artwork), `${product.id} artwork image missing`);
    assert.equal(product.gallery[0].src, product.image);
    assert.equal(product.gallery[0].label, 'Applied');
    assert.equal(product.gallery[1].src, product.artworkImage);
    assert.equal(product.gallery[1].label, 'Artwork');
  }
});

test('approved Canva products use Canva deck assets', () => {
  const products = loadProducts();
  const featured = [...products].sort((a, b) => b.priority - a.priority);
  const canvaProducts = [
    products.find(product => product.id === 'stickers-local-pride-weatherproof-sticker-pack'),
    products.find(product => product.id === 'stickers-milestone-moment-sticker-bundle')
  ];

  assert.equal(featured[0].id, 'stickers-milestone-moment-sticker-bundle');
  const localPackRank = featured.findIndex(product => product.id === 'stickers-local-pride-weatherproof-sticker-pack') + 1;
  assert.ok(localPackRank >= 50 && localPackRank <= 65, `expected local pack around 50th, got ${localPackRank}`);

  for (const product of canvaProducts) {
    assert.match(product.image, /^assets\/images\/shop\/canva-test\//);
    assert.match(product.artworkImage, /^assets\/images\/shop\/canva-test\//);
    assert.ok(product.canvaDesigns?.applied);
    assert.ok(product.canvaDesigns?.artwork);
    assert.ok(!fs.existsSync(path.join(repoRoot, 'assets/images/shop/generated/stickers', `${product.id}-applied.svg`)));
    assert.ok(!fs.existsSync(path.join(repoRoot, 'assets/images/shop/generated/stickers', `${product.id}-artwork.svg`)));
  }
});

test('featured shop order groups upgraded decks before custom and standard products', () => {
  const products = loadProducts();
  const staticCustomCards = getStaticCustomServiceCards().map((card, index) => ({
    id: card.id,
    category: card.category,
    priority: 0,
    canvaDeck: true,
    originalOrder: index
  }));
  const catalogCards = products.map((product, index) => ({
    id: product.id,
    category: product.category,
    priority: product.priority,
    canvaDeck: product.canvaDeck,
    originalOrder: staticCustomCards.length + index
  }));
  const sorted = [...staticCustomCards, ...catalogCards].sort((a, b) => {
    const getGroup = product => {
      if (product.canvaDeck) return 2;
      if (product.category === 'custom-services') return 1;
      return 0;
    };
    const groupDiff = getGroup(b) - getGroup(a);
    if (groupDiff) return groupDiff;
    const priorityDiff = (Number(b.priority) || 0) - (Number(a.priority) || 0);
    if (priorityDiff) return priorityDiff;
    return a.originalOrder - b.originalOrder;
  });
  const upgradedCount = [...staticCustomCards, ...products].filter(product => product.canvaDeck).length;

  assert.ok(upgradedCount > 0);
  assert.ok(sorted.slice(0, upgradedCount).every(product => product.canvaDeck), 'upgraded Canva decks should occupy the first featured positions');
  assert.ok(sorted.slice(0, upgradedCount).some(product => product.category === 'custom-services'), 'Custom Services should stay categorized while included in the upgraded deck block');
  assert.ok(sorted.slice(upgradedCount).every(product => !product.canvaDeck), 'standard products should start after the upgraded deck block');
});

test('shop catalog covers requested product lines', () => {
  const products = loadProducts();
  const counts = products.reduce((summary, product) => {
    summary[product.category] = (summary[product.category] || 0) + 1;
    return summary;
  }, {});

  assert.deepEqual(counts, {
    'car-decals': 36,
    'car-vinyl': 50,
    'wrap-vinyl': 30,
    stickers: 46,
    'mug-stickers': 20,
    'business-decals': 35,
    signs: 53,
    'tech-decals': 25,
    'posters-wall-art': 33,
    'home-decor': 22
  });
});

test('research-weighted additions follow demand allocation', () => {
  const products = loadProducts();
  const weighted = products.filter(product => product.tags.includes('research-weighted'));
  assert.equal(weighted.length, 50);
  assert.ok(weighted.every(product => product.researchLine && product.researchWeight));

  const byLine = weighted.reduce((summary, product) => {
    summary[product.researchLine] = (summary[product.researchLine] || 0) + 1;
    return summary;
  }, {});

  assert.deepEqual(byLine, {
    stickers: 6,
    'wedding-signage': 6,
    'poster-gallery': 5,
    'celebration-yard-signs': 5,
    'wall-decals': 4,
    'banners-backdrops': 4,
    'acrylic-signs': 4,
    'mounted-boards': 4,
    'automotive-decals': 3,
    'dorm-fandom': 3,
    'decorative-signs': 3,
    'car-magnets': 3
  });

  const featured = [...products].sort((a, b) => b.priority - a.priority);
  assert.deepEqual(featured.slice(0, 5).map(product => product.researchLine), [
    'stickers',
    'stickers',
    'stickers',
    'stickers',
    'stickers'
  ]);
});

test('existing shop items are preserved as Custom Services', () => {
  const html = fs.readFileSync(path.join(repoRoot, 'shop.html'), 'utf8');
  const customServiceCards = html.match(/data-shop-category="custom-services"/g) || [];
  assert.equal(customServiceCards.length, 8);
  assert.match(html, /Fleet Vehicle Wrap Package/);
  assert.match(html, /Storefront Signage Starter/);
  assert.match(html, /Food Truck Branding Kit/);
  assert.match(html, /Contractor Trailer Graphics/);
});

test('static custom services also have generated image decks', () => {
  const customServiceCards = getStaticCustomServiceCards();
  const html = fs.readFileSync(path.join(repoRoot, 'shop.html'), 'utf8');
  assert.doesNotMatch(html, /assets\/images\/placeholders/);
  assert.equal(customServiceCards.length, 8);

  for (const card of customServiceCards) {
    const applied = path.join(repoRoot, 'assets/images/shop/generated/custom-services', `${card.id}-applied.svg`);
    const artwork = path.join(repoRoot, 'assets/images/shop/generated/custom-services', `${card.id}-artwork.svg`);
    assert.ok(fs.existsSync(applied), `${card.id} applied image missing`);
    assert.ok(fs.existsSync(artwork), `${card.id} artwork image missing`);
  }
});

test('shop grid exposes 24-product batch controls', () => {
  const html = fs.readFileSync(path.join(repoRoot, 'shop.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(repoRoot, 'assets/js/app.js'), 'utf8');
  const styles = fs.readFileSync(path.join(repoRoot, 'assets/css/styles.css'), 'utf8');

  assert.match(html, /id="shop-product-grid" data-shop-grid data-shop-page-size="24"/);
  assert.match(html, /data-shop-load-more[^>]*>See 24 More<\/button>/);
  assert.match(html, /data-shop-load-more/);
  assert.match(html, /data-shop-load-count/);
  assert.doesNotMatch(html, /class="shop-card reveal"/);
  assert.match(appJs, /visibleLimit \+= pageSize/);
  assert.match(appJs, /data-shop-load-count/);
  assert.match(appJs, /card\.classList\.remove\('reveal'\)/);
  assert.match(appJs, /orderedCards = sortCards\(\)/);
  assert.match(appJs, /dataset\.shopCanvaDeck/);
  assert.match(appJs, /if \(card\.dataset\.shopCanvaDeck === 'true'\) return 2/);
  assert.match(appJs, /if \(card\.dataset\.shopCategory === 'custom-services'\) return 1/);
  assert.match(appJs, /Show \$\{nextCount\} more products/);
  assert.match(appJs, /data-shop-media-deck/);
  assert.match(appJs, /initShopMediaDecks/);
  assert.match(styles, /\.shop-card\.reveal\{opacity:1;transform:none\}/);
  assert.match(styles, /\.shop-card\.is-hidden,\.shop-card\.is-deferred\{display:none\}/);
  assert.match(styles, /\.shop-media-slide\.is-active\{opacity:1;pointer-events:auto\}/);
});

test('portfolio replaces ambiguous Work navigation labels', () => {
  const files = [
    'index.html',
    'work.html',
    'shop.html',
    'assets/js/support-assistant.js',
    'tools/build-news-pages.js'
  ];
  for (const file of files) {
    const contents = fs.readFileSync(path.join(repoRoot, file), 'utf8');
    assert.doesNotMatch(contents, />Work<\/a>|View Work|Quote Similar Work|Work With Tridico/);
  }

  const workHtml = fs.readFileSync(path.join(repoRoot, 'work.html'), 'utf8');
  assert.match(workHtml, /<title>Portfolio \| Tridico Design LLC<\/title>/);
  assert.match(workHtml, /<p class="eyebrow">Portfolio<\/p>/);
});
