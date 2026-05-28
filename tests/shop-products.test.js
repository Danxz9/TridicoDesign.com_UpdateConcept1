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

test('shop catalog exposes 300 customer-facing products with merchandising fields', () => {
  const products = loadProducts();
  assert.equal(products.length, 300);
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
    'car-decals': 30,
    'car-vinyl': 50,
    'wrap-vinyl': 30,
    stickers: 40,
    'mug-stickers': 20,
    'business-decals': 35,
    signs: 30,
    'tech-decals': 25,
    'posters-wall-art': 25,
    'home-decor': 15
  });
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
