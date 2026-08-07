(function (global) {
  'use strict';

  const STORAGE_KEY = 'tridicoRetailCart:v1';
  const CART_VERSION = 1;
  const MAX_QUANTITY = 99;

  const getCatalog = () => Array.isArray(global.tridicoShopProducts)
    ? global.tridicoShopProducts.filter(product => product && product.id)
    : [];

  const getCategories = () => Array.isArray(global.tridicoShopCategories)
    ? global.tridicoShopCategories.filter(category => category && category.id)
    : [];

  const clampQuantity = value => Math.max(1, Math.min(MAX_QUANTITY, Math.floor(Number(value) || 1)));

  const normalizeCart = (value, catalog = getCatalog()) => {
    const products = new Map(catalog.map(product => [String(product.id), product]));
    const rawItems = Array.isArray(value) ? value : Array.isArray(value?.items) ? value.items : [];
    const merged = new Map();

    rawItems.forEach(item => {
      const productId = String(item?.productId || '');
      const product = products.get(productId);
      if (!product || product.availability !== 'active') return;

      const variantId = item?.variantId ? String(item.variantId) : '';
      if (variantId) {
        const variants = Array.isArray(product.variants) ? product.variants : [];
        if (!variants.some(variant => String(variant.id) === variantId)) return;
      }

      const key = `${productId}::${variantId}`;
      const qty = clampQuantity(item?.qty);
      const existing = merged.get(key);
      if (existing) existing.qty = Math.min(MAX_QUANTITY, existing.qty + qty);
      else merged.set(key, { productId, variantId, qty });
    });

    return { version: CART_VERSION, items: Array.from(merged.values()) };
  };

  const readCart = (storage = global.localStorage, catalog = getCatalog()) => {
    try {
      const value = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null');
      return normalizeCart(value, catalog);
    } catch {
      return normalizeCart(null, catalog);
    }
  };

  const writeCart = (cart, storage = global.localStorage, catalog = getCatalog()) => {
    const normalized = normalizeCart(cart, catalog);
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // The storefront remains usable when storage is blocked; persistence is best effort.
    }
    return normalized;
  };

  const addCartItem = (cart, productId, variantId = '', quantity = 1, catalog = getCatalog()) => {
    const current = normalizeCart(cart, catalog);
    return normalizeCart({
      version: CART_VERSION,
      items: [...current.items, { productId, variantId, qty: quantity }]
    }, catalog);
  };

  const setCartQuantity = (cart, productId, variantId = '', quantity = 1, catalog = getCatalog()) => {
    const key = `${productId}::${variantId}`;
    const current = normalizeCart(cart, catalog);
    const items = current.items
      .filter(item => `${item.productId}::${item.variantId}` !== key)
      .concat(Number(quantity) > 0 ? [{ productId, variantId, qty: quantity }] : []);
    return normalizeCart({ version: CART_VERSION, items }, catalog);
  };

  const removeCartItem = (cart, productId, variantId = '', catalog = getCatalog()) => {
    const key = `${productId}::${variantId}`;
    const current = normalizeCart(cart, catalog);
    return normalizeCart({
      version: CART_VERSION,
      items: current.items.filter(item => `${item.productId}::${item.variantId}` !== key)
    }, catalog);
  };

  const resolveCartLines = (cart, catalog = getCatalog()) => {
    const products = new Map(catalog.map(product => [String(product.id), product]));
    return normalizeCart(cart, catalog).items.map(item => {
      const product = products.get(item.productId);
      const variant = item.variantId && Array.isArray(product.variants)
        ? product.variants.find(entry => String(entry.id) === item.variantId)
        : null;
      const unitPriceCents = Math.max(0, Number(product.priceCents) || 0) + Math.max(0, Number(variant?.priceDeltaCents) || 0);
      return {
        productId: item.productId,
        variantId: item.variantId,
        qty: item.qty,
        product,
        variant,
        unitPriceCents,
        lineTotalCents: unitPriceCents * item.qty
      };
    });
  };

  const formatCurrency = cents => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format((Number(cents) || 0) / 100);

  const api = {
    STORAGE_KEY,
    CART_VERSION,
    MAX_QUANTITY,
    normalizeCart,
    readCart,
    writeCart,
    addCartItem,
    setCartQuantity,
    removeCartItem,
    resolveCartLines,
    formatCurrency
  };

  global.TridicoRetailStore = api;
  if (!global.document) return;

  const document = global.document;
  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const categoryName = (categoryId, categories = getCategories()) => (
    categories.find(category => category.id === categoryId)?.name || categoryId
  );

  const productImages = product => {
    const images = Array.isArray(product.images) ? product.images : [];
    return images.filter(image => image && image.src).map(image => ({
      src: String(image.src),
      alt: String(image.alt || product.name || 'Product image')
    }));
  };

  const getDeliveryLabel = product => product?.delivery?.label || 'Delivery estimate available at order review';

  const getProductQuantity = (cart, productId, catalog = getCatalog()) => (
    normalizeCart(cart, catalog).items.find(item => item.productId === String(productId) && item.variantId === '')?.qty || 0
  );

  const updateCartCount = cart => {
    const count = normalizeCart(cart).items.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('[data-retail-cart-count]').forEach(element => {
      element.textContent = String(count);
      element.setAttribute('aria-label', `${count} ${count === 1 ? 'item' : 'items'} in cart`);
    });
  };

  const renderCategoryControls = (selectedCategory, categories) => {
    document.querySelectorAll('[data-retail-categories]').forEach(container => {
      const includeAll = container.dataset.includeAll !== 'false';
      const entries = includeAll ? [{ id: 'all', name: 'All products' }, ...categories] : categories;
      container.innerHTML = entries.map(category => `
        <button type="button" data-retail-category="${escapeHtml(category.id)}" class="${category.id === selectedCategory ? 'is-active' : ''}" aria-pressed="${category.id === selectedCategory}">
          ${escapeHtml(category.name)}
        </button>`).join('');
    });
  };

  const renderPurchaseControl = (product, quantity, animate = false) => {
    if (quantity < 1) {
      return `<button class="store-add-button${animate ? ' is-entering' : ''}" type="button" data-retail-add="${escapeHtml(product.id)}" aria-label="Add ${escapeHtml(product.name)} to cart">Add to cart</button>`;
    }

    const decreaseLabel = quantity === 1
      ? `Remove ${product.name} from cart`
      : `Decrease quantity of ${product.name}`;

    return `<div class="store-quantity-control${animate ? ' is-entering' : ''}" role="group" aria-label="Quantity for ${escapeHtml(product.name)}">
      <button type="button" data-retail-card-qty-action="decrease" data-product-id="${escapeHtml(product.id)}" aria-label="${escapeHtml(decreaseLabel)}">&minus;</button>
      <span class="store-quantity-control__value"><span class="sr-only">Quantity: </span><strong data-retail-card-quantity aria-live="polite">${quantity}</strong></span>
      <button type="button" data-retail-card-qty-action="increase" data-product-id="${escapeHtml(product.id)}" aria-label="Increase quantity of ${escapeHtml(product.name)}"${quantity >= MAX_QUANTITY ? ' disabled' : ''}>+</button>
    </div>`;
  };

  const renderProductCard = (product, categories, cart, catalog) => {
    const images = productImages(product);
    const firstImage = images[0] || { src: 'assets/images/brand/tridico-logo-mark-small.png', alt: 'Tridico Design product image pending' };
    const quantity = getProductQuantity(cart, product.id, catalog);
    const imageControls = images.length > 1 ? `
      <button class="store-product-gallery__arrow store-product-gallery__arrow--prev" type="button" data-retail-gallery-step="-1" aria-label="Previous image for ${escapeHtml(product.name)}">&#8249;</button>
      <button class="store-product-gallery__arrow store-product-gallery__arrow--next" type="button" data-retail-gallery-step="1" aria-label="Next image for ${escapeHtml(product.name)}">&#8250;</button>
      <span class="store-product-gallery__count" data-retail-gallery-count>1 / ${images.length}</span>` : '';

    return `<article class="store-product-card" data-retail-product data-product-id="${escapeHtml(product.id)}" data-product-images="${escapeHtml(JSON.stringify(images))}">
      <div class="store-product-gallery">
        <img src="${escapeHtml(firstImage.src)}" alt="${escapeHtml(firstImage.alt)}" loading="lazy" decoding="async" data-retail-product-image>
        ${imageControls}
      </div>
      <div class="store-product-card__body">
        <p class="store-product-card__department">${escapeHtml(categoryName(product.category, categories))}</p>
        <h2>${escapeHtml(product.name)}</h2>
        <p class="store-product-card__description">${escapeHtml(product.description)}</p>
        <p class="store-product-card__pack">${escapeHtml(product.pack || '1 item')}</p>
        <p class="store-product-card__price">${escapeHtml(formatCurrency(product.priceCents))}</p>
        <p class="store-product-card__delivery"><span aria-hidden="true">&#128666;</span> Estimated delivery: ${escapeHtml(getDeliveryLabel(product))}</p>
        <div class="store-purchase-control" data-retail-purchase-control="${escapeHtml(product.id)}">
          ${renderPurchaseControl(product, quantity)}
        </div>
      </div>
    </article>`;
  };

  const initCatalogPage = () => {
    const page = document.querySelector('[data-retail-catalog-page]');
    if (!page) return;

    const catalog = getCatalog().filter(product => product.availability === 'active');
    const categories = getCategories();
    const grid = document.querySelector('[data-retail-catalog]');
    const searchInput = document.querySelector('[data-retail-search]');
    const sortSelect = document.querySelector('[data-retail-sort]');
    const resultCount = document.querySelector('[data-retail-result-count]');
    const emptyState = document.querySelector('[data-retail-empty]');
    const toast = document.querySelector('[data-retail-toast]');
    const params = new URLSearchParams(global.location.search);
    let selectedCategory = categories.some(category => category.id === params.get('category')) ? params.get('category') : 'all';
    let cart = readCart(global.localStorage, catalog);

    if (searchInput && params.get('q')) searchInput.value = params.get('q');

    const matchesSearch = product => {
      const query = String(searchInput?.value || '').trim().toLowerCase();
      if (!query) return true;
      const text = [
        product.name,
        product.description,
        product.pack,
        categoryName(product.category, categories),
        ...(Array.isArray(product.tags) ? product.tags : [])
      ].join(' ').toLowerCase();
      return query.split(/\s+/).every(token => text.includes(token));
    };

    const sortedProducts = products => {
      const mode = sortSelect?.value || 'featured';
      return [...products].sort((a, b) => {
        if (mode === 'price-low') return Number(a.priceCents) - Number(b.priceCents);
        if (mode === 'price-high') return Number(b.priceCents) - Number(a.priceCents);
        if (mode === 'delivery') return Number(a.delivery?.maxBusinessDays || 999) - Number(b.delivery?.maxBusinessDays || 999);
        if (mode === 'name') return String(a.name).localeCompare(String(b.name));
        if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
        return catalog.indexOf(a) - catalog.indexOf(b);
      });
    };

    const render = () => {
      const matches = sortedProducts(catalog.filter(product => (
        (selectedCategory === 'all' || product.category === selectedCategory) && matchesSearch(product)
      )));

      if (grid) grid.innerHTML = matches.map(product => renderProductCard(product, categories, cart, catalog)).join('');
      if (resultCount) resultCount.textContent = `${matches.length} ${matches.length === 1 ? 'product' : 'products'}`;
      if (emptyState) emptyState.hidden = matches.length !== 0;
      renderCategoryControls(selectedCategory, categories);
    };

    const showToast = message => {
      if (!toast) return;
      toast.textContent = message;
      toast.hidden = false;
      global.clearTimeout(showToast.timer);
      showToast.timer = global.setTimeout(() => { toast.hidden = true; }, 2600);
    };

    const syncPurchaseControls = (product, animate = true, focusAction = '') => {
      const quantity = getProductQuantity(cart, product.id, catalog);
      let focusTarget = null;
      document.querySelectorAll('[data-retail-purchase-control]').forEach(control => {
        if (control.dataset.retailPurchaseControl !== product.id) return;
        control.innerHTML = renderPurchaseControl(product, quantity, animate);
        if (!focusAction || focusTarget) return;
        const nextAction = quantity < 1
          ? 'add'
          : focusAction === 'increase' && quantity >= MAX_QUANTITY ? 'decrease' : focusAction;
        focusTarget = nextAction === 'add'
          ? control.querySelector('[data-retail-add]')
          : control.querySelector(`[data-retail-card-qty-action="${nextAction}"]`);
      });
      focusTarget?.focus({ preventScroll: true });
    };

    const persistCartChange = (product, quantity, message, focusAction) => {
      cart = setCartQuantity(cart, product.id, '', quantity, catalog);
      cart = writeCart(cart, global.localStorage, catalog);
      updateCartCount(cart);
      syncPurchaseControls(product, true, focusAction);
      const totalItems = normalizeCart(cart, catalog).items.reduce((sum, item) => sum + item.qty, 0);
      showToast(`${message} Cart has ${totalItems} ${totalItems === 1 ? 'item' : 'items'}.`);
    };

    document.addEventListener('click', event => {
      const categoryButton = event.target.closest('[data-retail-category]');
      if (categoryButton) {
        selectedCategory = categoryButton.dataset.retailCategory || 'all';
        render();
        document.querySelector('[data-retail-results-heading]')?.focus({ preventScroll: true });
        return;
      }

      const addButton = event.target.closest('[data-retail-add]');
      if (addButton) {
        const product = catalog.find(entry => entry.id === addButton.dataset.retailAdd);
        if (!product) return;
        const nextQuantity = Math.min(MAX_QUANTITY, getProductQuantity(cart, product.id, catalog) + 1);
        persistCartChange(product, nextQuantity, `${product.name} added to cart.`, 'increase');
        return;
      }

      const quantityButton = event.target.closest('[data-retail-card-qty-action]');
      if (quantityButton) {
        const product = catalog.find(entry => entry.id === quantityButton.dataset.productId);
        if (!product) return;
        const currentQuantity = getProductQuantity(cart, product.id, catalog);
        const nextQuantity = quantityButton.dataset.retailCardQtyAction === 'increase'
          ? Math.min(MAX_QUANTITY, currentQuantity + 1)
          : Math.max(0, currentQuantity - 1);
        const message = nextQuantity === 0
          ? `${product.name} removed from cart.`
          : `${product.name} quantity updated to ${nextQuantity}.`;
        persistCartChange(product, nextQuantity, message, quantityButton.dataset.retailCardQtyAction);
        return;
      }

      const galleryButton = event.target.closest('[data-retail-gallery-step]');
      if (galleryButton) {
        const card = galleryButton.closest('[data-retail-product]');
        const image = card?.querySelector('[data-retail-product-image]');
        const count = card?.querySelector('[data-retail-gallery-count]');
        if (!card || !image) return;
        let images = [];
        try { images = JSON.parse(card.dataset.productImages || '[]'); } catch { images = []; }
        if (images.length < 2) return;
        const current = Number(card.dataset.galleryIndex) || 0;
        const next = (current + Number(galleryButton.dataset.retailGalleryStep) + images.length) % images.length;
        card.dataset.galleryIndex = String(next);
        image.src = images[next].src;
        image.alt = images[next].alt;
        if (count) count.textContent = `${next + 1} / ${images.length}`;
      }
    });

    searchInput?.addEventListener('input', render);
    sortSelect?.addEventListener('change', render);
    document.querySelector('[data-retail-search-form]')?.addEventListener('submit', event => {
      event.preventDefault();
      render();
    });
    global.addEventListener?.('storage', event => {
      if (event.key && event.key !== STORAGE_KEY) return;
      cart = readCart(global.localStorage, catalog);
      render();
      updateCartCount(cart);
    });

    render();
    updateCartCount(cart);
  };

  const initCartPage = () => {
    const page = document.querySelector('[data-retail-cart-page]');
    if (!page) return;

    const catalog = getCatalog();
    const itemsContainer = document.querySelector('[data-retail-cart-items]');
    const emptyState = document.querySelector('[data-retail-cart-empty]');
    const subtotalElement = document.querySelector('[data-retail-cart-subtotal]');
    const deliveryElement = document.querySelector('[data-retail-cart-delivery]');
    const orderLink = document.querySelector('[data-retail-cart-request]');
    const status = document.querySelector('[data-retail-cart-status]');
    let cart = readCart(global.localStorage, catalog);

    const render = (focusRequest = null) => {
      const lines = resolveCartLines(cart, catalog);
      const subtotal = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
      const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);

      updateCartCount(cart);
      if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
      if (emptyState) emptyState.hidden = lines.length !== 0;
      if (itemsContainer) itemsContainer.hidden = lines.length === 0;
      if (orderLink) {
        orderLink.toggleAttribute('aria-disabled', lines.length === 0);
        orderLink.classList.toggle('is-disabled', lines.length === 0);
        orderLink.tabIndex = lines.length === 0 ? -1 : 0;
      }

      const longestDelivery = lines.reduce((current, line) => {
        const maxDays = Number(line.product.delivery?.maxBusinessDays) || 0;
        return maxDays > current.maxDays ? { maxDays, label: getDeliveryLabel(line.product) } : current;
      }, { maxDays: 0, label: '' });
      if (deliveryElement) {
        deliveryElement.textContent = lines.length
          ? `Longest current item estimate: ${longestDelivery.label}`
          : 'Delivery estimates appear after products are added.';
      }

      if (!itemsContainer || !lines.length) {
        if (itemsContainer) itemsContainer.innerHTML = '';
        return;
      }

      itemsContainer.innerHTML = lines.map(line => {
        const image = productImages(line.product)[0] || { src: 'assets/images/brand/tridico-logo-mark-small.png', alt: '' };
        const key = `${line.productId}::${line.variantId}`;
        const decreaseLabel = line.qty === 1
          ? `Remove ${line.product.name} from cart`
          : `Decrease quantity of ${line.product.name}`;
        return `<article class="retail-cart-item" data-retail-cart-line="${escapeHtml(key)}">
          <a class="retail-cart-item__image" href="shop.html?category=${escapeHtml(line.product.category)}">
            <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async">
          </a>
          <div class="retail-cart-item__details">
            <p class="retail-cart-item__department">${escapeHtml(categoryName(line.product.category))}</p>
            <h2>${escapeHtml(line.product.name)}</h2>
            <p>${escapeHtml(line.product.pack || '1 item')}</p>
            <p class="retail-cart-item__delivery">Estimated delivery: ${escapeHtml(getDeliveryLabel(line.product))}</p>
            <button type="button" class="retail-cart-item__remove" data-retail-cart-remove="${escapeHtml(line.productId)}" data-variant-id="${escapeHtml(line.variantId)}">Remove</button>
          </div>
          <div class="retail-cart-item__quantity" aria-label="Quantity for ${escapeHtml(line.product.name)}">
            <button type="button" data-retail-cart-qty="${escapeHtml(line.productId)}" data-retail-cart-qty-action="decrease" data-variant-id="${escapeHtml(line.variantId)}" data-quantity="${line.qty - 1}" aria-label="${escapeHtml(decreaseLabel)}">&minus;</button>
            <span>${line.qty}</span>
            <button type="button" data-retail-cart-qty="${escapeHtml(line.productId)}" data-retail-cart-qty-action="increase" data-variant-id="${escapeHtml(line.variantId)}" data-quantity="${line.qty + 1}" aria-label="Increase quantity of ${escapeHtml(line.product.name)}"${line.qty >= MAX_QUANTITY ? ' disabled' : ''}>+</button>
          </div>
          <div class="retail-cart-item__price">
            <strong>${escapeHtml(formatCurrency(line.lineTotalCents))}</strong>
            ${line.qty > 1 ? `<span>${escapeHtml(formatCurrency(line.unitPriceCents))} each</span>` : ''}
          </div>
        </article>`;
      }).join('');

      document.querySelector('[data-retail-cart-summary-label]')?.replaceChildren(document.createTextNode(`Subtotal (${totalQty} ${totalQty === 1 ? 'item' : 'items'})`));
      if (focusRequest) {
        const key = `${focusRequest.productId}::${focusRequest.variantId}`;
        const line = Array.from(itemsContainer.querySelectorAll('[data-retail-cart-line]'))
          .find(element => element.dataset.retailCartLine === key);
        const resolvedLine = lines.find(entry => `${entry.productId}::${entry.variantId}` === key);
        const focusAction = focusRequest.action === 'increase' && resolvedLine?.qty >= MAX_QUANTITY
          ? 'decrease'
          : focusRequest.action;
        line?.querySelector(`[data-retail-cart-qty-action="${focusAction}"]`)?.focus({ preventScroll: true });
      }
    };

    itemsContainer?.addEventListener('click', event => {
      const quantityButton = event.target.closest('[data-retail-cart-qty]');
      const removeButton = event.target.closest('[data-retail-cart-remove]');

      if (quantityButton) {
        const productId = quantityButton.dataset.retailCartQty;
        const variantId = quantityButton.dataset.variantId || '';
        const action = quantityButton.dataset.retailCartQtyAction;
        cart = setCartQuantity(
          cart,
          productId,
          variantId,
          Number(quantityButton.dataset.quantity),
          catalog
        );
        cart = writeCart(cart, global.localStorage, catalog);
        if (status) status.textContent = 'Cart quantity updated.';
        render({ productId, variantId, action });
      }

      if (removeButton) {
        cart = removeCartItem(cart, removeButton.dataset.retailCartRemove, removeButton.dataset.variantId || '', catalog);
        cart = writeCart(cart, global.localStorage, catalog);
        if (status) status.textContent = 'Item removed from cart.';
        render();
      }
    });

    document.querySelector('[data-retail-cart-clear]')?.addEventListener('click', () => {
      cart = writeCart({ version: CART_VERSION, items: [] }, global.localStorage, catalog);
      if (status) status.textContent = 'Cart cleared.';
      render();
    });

    orderLink?.addEventListener('click', event => {
      if (!resolveCartLines(cart, catalog).length) event.preventDefault();
    });
    global.addEventListener?.('storage', event => {
      if (event.key && event.key !== STORAGE_KEY) return;
      cart = readCart(global.localStorage, catalog);
      render();
    });

    render();
  };

  const initQuoteCartBridge = () => {
    const params = new URLSearchParams(global.location.search);
    if (params.get('cart') !== 'retail') return;

    const form = document.querySelector('#quoteForm');
    const details = form?.elements?.['Project details'];
    const projectType = form?.elements?.['Project type'];
    const lines = resolveCartLines(readCart(global.localStorage), getCatalog());
    if (!form || !details || !lines.length) return;

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
    const marker = 'Online shop order request';
    const summary = [
      marker,
      ...lines.map(line => `${line.qty} x ${line.product.name} \u2014 ${formatCurrency(line.lineTotalCents)} \u2014 estimated delivery ${getDeliveryLabel(line.product)}`),
      `Estimated item subtotal: ${formatCurrency(subtotal)}`,
      'Order request only. Final availability, shipping, taxes, and fulfillment are confirmed by Tridico.'
    ].join('\n');

    if (!details.value.includes(marker)) details.value = details.value.trim() ? `${details.value.trim()}\n\n${summary}` : summary;
    if (projectType && Array.from(projectType.options).some(option => option.value === 'Online Shop Order')) {
      projectType.value = 'Online Shop Order';
    }
  };

  const init = () => {
    const cart = readCart();
    updateCartCount(cart);
    initCatalogPage();
    initCartPage();
    initQuoteCartBridge();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
