const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');

const repoRoot = path.join(__dirname, '..');

const read = relativePath => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const loadCatalog = () => {
  const context = { window: {} };
  vm.runInNewContext(read('assets/js/shop-products.js'), context, { filename: 'shop-products.js' });
  return {
    categories: context.window.tridicoShopCategories,
    products: context.window.tridicoShopProducts,
    vehicleOffers: context.window.tridicoVehicleOffers
  };
};

const loadStoreApi = () => {
  const context = {};
  vm.runInNewContext(read('assets/js/store.js'), context, { filename: 'store.js' });
  return context.TridicoRetailStore;
};

test('retail catalog is a browseable set of fixed-price products with image decks and delivery estimates', () => {
  const { categories, products } = loadCatalog();
  const requiredCategories = [
    'stickers',
    'tech-decals',
    'car-decals',
    'helmet-decals',
    'motorcycle-decals',
    'bike-decals',
    'business-decals',
    'business-signage',
    'clever-decals',
    'surface-wraps'
  ];
  const expectedProductIds = [
    'stickers-ocean-pals-sticker-pack',
    'clever-decals-family-height-history-tracker-wall-kit',
    'stickers-friendly-monster-mood-sticker-set',
    'clever-decals-everyday-device-ruler-strip-set',
    'stickers-rainbow-weather-sticker-sheet',
    'stickers-tiny-builder-construction-sticker-pack',
    'tech-decals-geometric-color-block-laptop-sticker-set',
    'tech-decals-botanical-linework-laptop-decal-kit',
    'tech-decals-creative-coder-laptop-sticker-pack',
    'tech-decals-night-sky-minimal-laptop-decal-set',
    'tech-decals-remote-work-badge-sticker-sheet',
    'motorcycle-decals-retro-racing-stripe-tank-kit',
    'bike-decals-wildflower-bicycle-frame-sticker-set',
    'bike-decals-kids-alphabet-number-decal-set',
    'motorcycle-decals-adventure-pannier-decal-pack',
    'car-decals-minimal-route-line-window-set',
    'helmet-decals-retro-checkered-helmet-kit',
    'helmet-decals-topographic-line-helmet-sticker-set',
    'helmet-decals-cosmic-orbit-helmet-accent-pack',
    'helmet-decals-neon-blade-helmet-decal-set',
    'business-decals-branded-equipment-id-set',
    'business-signage-men-women-restroom-door-decal-pair',
    'business-signage-open-closed-storefront-door-set',
    'business-signage-business-hours-window-decal',
    'business-decals-vendor-order-pickup-label-roll',
    'surface-wraps-tool-chest-drawer-front-kit',
    'surface-wraps-retail-countertop-accent-kit',
    'car-decals-mountain-road-window-decal-set',
    'car-decals-student-driver-removable-magnet-pair',
    'car-decals-retro-road-trip-bumper-decal-trio'
  ];

  assert.ok(Array.isArray(categories));
  assert.ok(Array.isArray(products));
  assert.equal(products.length, 30, `expected the approved 30-product catalog, received ${products.length}`);
  assert.deepEqual(Array.from(products, product => product.id), expectedProductIds);
  assert.deepEqual([...new Set(categories.map(category => category.id))].sort(), requiredCategories.sort());

  const ids = new Set();
  const publicImages = new Set();
  const coveredCategories = new Set();

  products.forEach(product => {
    assert.ok(product.id && !ids.has(product.id), `duplicate or missing product id: ${product.id}`);
    ids.add(product.id);
    coveredCategories.add(product.category);

    assert.equal(product.availability, 'active', `${product.id} must be active to appear in the retail catalog`);
    assert.equal(product.quoteOnly, undefined, `${product.id} must be a retail item, not a quote-only service`);
    assert.ok(Number.isInteger(product.priceCents) && product.priceCents > 0, `${product.id} needs an integer cents price`);
    assert.ok(product.description?.length >= 40, `${product.id} needs a useful description`);
    assert.ok(product.pack, `${product.id} needs a count or pack description`);
    assert.ok(Number.isInteger(product.delivery?.minBusinessDays), `${product.id} needs minimum delivery days`);
    assert.ok(Number.isInteger(product.delivery?.maxBusinessDays), `${product.id} needs maximum delivery days`);
    assert.ok(product.delivery.maxBusinessDays >= product.delivery.minBusinessDays, `${product.id} has an invalid delivery window`);
    assert.match(product.delivery.label, /business days/);
    assert.equal(product.images.length, 2, `${product.id} needs its approved two-image public deck`);

    assert.deepEqual(
      Array.from(product.images, image => image.src),
      [
        `assets/images/shop/catalog/batch-040/${product.id}/01-white-background.png`,
        `assets/images/shop/catalog/batch-040/${product.id}/02-real-world-use.png`
      ]
    );

    product.images.forEach(image => {
      assert.ok(image.alt, `${product.id} image needs alt text`);
      assert.ok(fs.existsSync(path.join(repoRoot, image.src)), `missing product image: ${image.src}`);
      assert.ok(!publicImages.has(image.src), `duplicate public image reference: ${image.src}`);
      publicImages.add(image.src);
    });

    ['sku', 'stock', 'rating', 'reviews', 'demand', 'bought', 'printerArtwork'].forEach(field => {
      assert.equal(product[field], undefined, `${product.id} must not contain fabricated ${field}`);
    });
    assert.equal(
      fs.existsSync(path.join(repoRoot, 'assets/images/shop/catalog/batch-040', product.id, '03-print-flat.png')),
      false,
      `${product.id} production print flat must remain private`
    );
  });

  assert.equal(publicImages.size, 60);
  requiredCategories.forEach(category => assert.ok(coveredCategories.has(category), `catalog is missing ${category} products`));
});

test('cart persists only catalog identities and always resolves current product price and imagery', () => {
  const { products } = loadCatalog();
  const store = loadStoreApi();
  const product = products[0];
  const injected = {
    version: 1,
    items: [
      { productId: product.id, qty: 2, name: 'Injected name', priceCents: 1, image: 'https://invalid.example/bad.png' },
      { productId: 'does-not-exist', qty: 50 }
    ]
  };

  const normalized = store.normalizeCart(injected, products);
  assert.equal(normalized.items.length, 1);
  assert.equal(normalized.items[0].productId, product.id);
  assert.equal(normalized.items[0].qty, 2);
  assert.equal(normalized.items[0].name, undefined);
  assert.equal(normalized.items[0].priceCents, undefined);

  const lines = store.resolveCartLines(normalized, products);
  assert.equal(lines[0].product.name, product.name);
  assert.equal(lines[0].unitPriceCents, product.priceCents);
  assert.equal(lines[0].lineTotalCents, product.priceCents * 2);

  const added = store.addCartItem(normalized, product.id, '', 3, products);
  assert.equal(added.items[0].qty, 5);
  const updated = store.setCartQuantity(added, product.id, '', 4, products);
  assert.equal(updated.items[0].qty, 4);
  const removed = store.removeCartItem(updated, product.id, '', products);
  assert.equal(removed.items.length, 0);
});

test('shop page provides conventional catalog search, departments, sorting, product grid, and cart entry points', () => {
  const html = read('shop.html');
  const storeSource = read('assets/js/store.js');

  assert.match(html, /<body class="store-page" data-retail-catalog-page>/);
  assert.match(html, /data-retail-search/);
  assert.match(html, /data-retail-categories/);
  assert.match(html, /data-retail-sort/);
  assert.match(html, /data-retail-catalog/);
  assert.match(html, /data-retail-result-count/);
  assert.match(html, /href="cart\.html"/);
  assert.match(html, /assets\/js\/shop-products\.js/);
  assert.match(html, /assets\/js\/store\.js/);
  assert.match(html, /Every card shows the item price and current delivery estimate/);
  assert.match(storeSource, /Estimated delivery:/);
  assert.match(storeSource, /Add to cart/);
  assert.match(storeSource, /data-retail-card-qty-action="decrease"/);
  assert.match(storeSource, /data-retail-card-qty-action="increase"/);
  assert.match(storeSource, /Remove \$\{product\.name\} from cart/);
  assert.doesNotMatch(html, /class="vehicle-store-hero|<section class="vehicle-offers|false checkout/);
  assert.doesNotMatch(storeSource, /bought in past month|out of 5 stars|shop-rating/);
});

test('catalog cards replace Add to cart with synchronized minus, quantity, and plus controls', () => {
  const { window } = parseHTML(`<!doctype html><html><body data-retail-catalog-page>
    <span data-retail-cart-count>0</span>
    <input data-retail-search>
    <select data-retail-sort><option value="featured" selected>Featured</option></select>
    <div data-retail-categories></div>
    <p data-retail-result-count></p>
    <div data-retail-empty hidden></div>
    <div data-retail-catalog></div>
    <p data-retail-toast hidden></p>
  </body></html>`);
  let focusedElement = null;
  window.HTMLElement.prototype.focus = function focus() {
    focusedElement = this;
  };
  const stored = new Map();
  const storage = {
    getItem: key => stored.has(key) ? stored.get(key) : null,
    setItem: (key, value) => stored.set(key, String(value))
  };
  const context = {
    window: null,
    globalThis: null,
    document: window.document,
    localStorage: storage,
    location: { search: '' },
    URLSearchParams,
    Intl,
    Event: window.Event,
    setTimeout,
    clearTimeout
  };
  context.window = context;
  context.globalThis = context;
  vm.runInNewContext(read('assets/js/shop-products.js'), context, { filename: 'shop-products.js' });
  vm.runInNewContext(read('assets/js/store.js'), context, { filename: 'store.js' });
  context.document.dispatchEvent(new window.Event('DOMContentLoaded'));

  const product = context.tridicoShopProducts[0];
  const purchaseSelector = `[data-retail-purchase-control="${product.id}"]`;
  const click = element => element.dispatchEvent(new window.Event('click', { bubbles: true }));
  const quantity = () => Number(context.document.querySelector(`${purchaseSelector} [data-retail-card-quantity]`)?.textContent || 0);

  const addButton = context.document.querySelector(`${purchaseSelector} [data-retail-add]`);
  assert.ok(addButton, 'card starts with Add to cart');
  click(addButton);
  assert.equal(quantity(), 1);
  assert.match(context.document.querySelector(`${purchaseSelector} [data-retail-card-qty-action="decrease"]`).getAttribute('aria-label'), /^Remove /);
  assert.equal(context.document.querySelector('[data-retail-cart-count]').textContent, '1');
  assert.equal(focusedElement.getAttribute('aria-label'), `Increase quantity of ${product.name}`);

  click(context.document.querySelector(`${purchaseSelector} [data-retail-card-qty-action="increase"]`));
  assert.equal(quantity(), 2);
  assert.equal(context.document.querySelector('[data-retail-cart-count]').textContent, '2');
  assert.equal(focusedElement.getAttribute('aria-label'), `Increase quantity of ${product.name}`);

  click(context.document.querySelector(`${purchaseSelector} [data-retail-card-qty-action="decrease"]`));
  assert.equal(quantity(), 1);
  assert.equal(focusedElement.getAttribute('aria-label'), `Remove ${product.name} from cart`);
  click(context.document.querySelector(`${purchaseSelector} [data-retail-card-qty-action="decrease"]`));
  assert.ok(context.document.querySelector(`${purchaseSelector} [data-retail-add]`), 'zero quantity restores Add to cart');
  assert.equal(context.document.querySelector('[data-retail-cart-count]').textContent, '0');
  assert.equal(focusedElement.getAttribute('aria-label'), `Add ${product.name} to cart`);
  assert.deepEqual(JSON.parse(stored.get('tridicoRetailCart:v1')).items, []);
});

test('vehicle-focused shop content is preserved inside Services as a quote-led service path', () => {
  const html = read('services.html');

  assert.match(html, /id="personal-vehicle-graphics"/);
  assert.match(html, /Personalize the vehicle you already love\./);
  assert.match(html, /vehicle-shop-intro/);
  assert.match(html, /id="vehicle-offers"/);
  assert.match(html, /vehicle-proof/);
  assert.match(html, /vehicle-shop-process/);
  assert.match(html, /vehicle-shop-cta/);
  assert.match(html, /custom-cut-vehicle-decal-kit-v1\.png/);
  assert.match(html, /consumer-accent-stripe-kit-v1\.png/);
  assert.match(html, /specialty-color-accent-vinyl-v1\.png/);
  assert.match(html, /fleet-parts-truck\/01-01-perf-cjd-delaware-2\.jpg/);
  assert.match(html, /color-change-vinyl\/01-01-mtn-shaker-1\.jpg/);
  assert.match(html, /formacars-trailer\/01-01-formacars-1\.jpg/);
  assert.match(html, /quote\.html\?offer=vehicle-decals#quoteForm/);
  assert.match(html, /quote\.html\?offer=vehicle-accent#quoteForm/);
  assert.match(html, /quote\.html\?offer=vehicle-specialty#quoteForm/);
  assert.match(html, /quote\.html\?offer=vehicle-coverage#quoteForm/);
  assert.doesNotMatch(html, /data-retail-add|data-retail-cart-page/);
});

test('cart page supports persistent quantities, removal, subtotal, delivery summary, and order handoff', () => {
  const html = read('cart.html');
  const quote = read('quote.html');
  const storeSource = read('assets/js/store.js');

  assert.match(html, /data-retail-cart-page/);
  assert.match(html, /data-retail-cart-items/);
  assert.match(html, /data-retail-cart-empty/);
  assert.match(html, /data-retail-cart-subtotal/);
  assert.match(html, /data-retail-cart-delivery/);
  assert.match(html, /data-retail-cart-clear/);
  assert.match(html, /data-retail-cart-request/);
  assert.match(html, /quote\.html\?cart=retail#quoteForm/);
  assert.match(html, /not a completed purchase/);
  assert.match(storeSource, /tridicoRetailCart:v1/);
  assert.match(storeSource, /data-retail-cart-qty/);
  assert.match(storeSource, /data-retail-cart-qty-action="decrease"/);
  assert.match(storeSource, /line\.qty >= MAX_QUANTITY \? ' disabled' : ''/);
  assert.match(storeSource, /global\.addEventListener\?\.\('storage'/);
  assert.match(storeSource, /data-retail-cart-remove/);
  assert.match(storeSource, /Online shop order request/);
  assert.match(quote, /<option>Online Shop Order<\/option>/);
  assert.match(quote, /assets\/js\/store\.js/);
});

test('vehicle offer registry remains source-bounded for Services integrations', () => {
  const { vehicleOffers } = loadCatalog();
  assert.equal(vehicleOffers.length, 4);
  assert.deepEqual(
    Array.from(vehicleOffers, offer => offer.id),
    [
      'custom-vehicle-decals',
      'accent-stripe-panel-graphics',
      'specialty-color-accent-vinyl',
      'partial-full-vehicle-graphics'
    ]
  );
  vehicleOffers.forEach(offer => {
    assert.equal(offer.quoteOnly, true);
    assert.match(offer.href, /^quote\.html\?offer=vehicle-(decals|accent|specialty|coverage)#quoteForm$/);
    assert.ok(fs.existsSync(path.join(repoRoot, offer.image)), `missing vehicle service image: ${offer.image}`);
  });
});
