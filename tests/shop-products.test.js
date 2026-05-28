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
    assert.ok(Array.isArray(product.tags));
    assert.ok(product.tags.includes(product.category));
  }
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
  assert.deepEqual(featured.slice(0, 6).map(product => product.researchLine), [
    'stickers',
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

test('shop grid exposes 15-product batch controls', () => {
  const html = fs.readFileSync(path.join(repoRoot, 'shop.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(repoRoot, 'assets/js/app.js'), 'utf8');
  const styles = fs.readFileSync(path.join(repoRoot, 'assets/css/styles.css'), 'utf8');

  assert.match(html, /id="shop-product-grid" data-shop-grid data-shop-page-size="15"/);
  assert.match(html, /data-shop-load-more/);
  assert.match(html, /data-shop-count/);
  assert.match(appJs, /visibleLimit \+= pageSize/);
  assert.match(appJs, /data-shop-load-more-wrap] \[data-shop-count]/);
  assert.match(appJs, /orderedCards = sortCards\(\)/);
  assert.match(styles, /\.shop-card\.is-hidden,\.shop-card\.is-deferred\{display:none\}/);
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
