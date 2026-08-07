(function () {
  const categories = [
    { id: 'stickers', name: 'Kids & Fun Stickers' },
    { id: 'tech-decals', name: 'Laptop & Tech' },
    { id: 'car-decals', name: 'Car Decals & Magnets' },
    { id: 'helmet-decals', name: 'Helmet Decals' },
    { id: 'motorcycle-decals', name: 'Motorcycle Decals' },
    { id: 'bike-decals', name: 'Bicycle Decals' },
    { id: 'business-decals', name: 'Business Labels' },
    { id: 'business-signage', name: 'Business Signage' },
    { id: 'clever-decals', name: 'Clever Everyday Decals' },
    { id: 'surface-wraps', name: 'Surface Wrap Kits' }
  ];

  const featuredProducts = new Set([
    'stickers-ocean-pals-sticker-pack',
    'tech-decals-geometric-color-block-laptop-sticker-set',
    'car-decals-minimal-route-line-window-set',
    'helmet-decals-retro-checkered-helmet-kit',
    'motorcycle-decals-retro-racing-stripe-tank-kit',
    'bike-decals-wildflower-bicycle-frame-sticker-set',
    'business-decals-branded-equipment-id-set',
    'business-signage-open-closed-storefront-door-set',
    'surface-wraps-tool-chest-drawer-front-kit'
  ]);

  const sourceProducts = [
    {
      id: 'stickers-ocean-pals-sticker-pack',
      name: 'Ocean Pals Sticker Pack',
      category: 'stickers',
      collection: 'Kids & Fun',
      description: 'Original sea-animal, shell, bubble, and coral stickers for bottles, lunchboxes, notebooks, and everyday gear.',
      pack: '1 24-piece sticker pack',
      priceCents: 1400,
      turnaround: '2-4 business days',
      tags: ['kids', 'ocean', 'animals', 'lunchbox', 'notebook', 'sticker pack']
    },
    {
      id: 'clever-decals-family-height-history-tracker-wall-kit',
      name: 'Family Height History Tracker Wall Decal Kit',
      category: 'clever-decals',
      collection: 'Clever Everyday Decals',
      description: "A friendly vertical growth-history wall decal with matching record markers for preserving children's milestones.",
      pack: '1 height tracker plus 24 record marker decals',
      priceCents: 3800,
      turnaround: '3-5 business days',
      tags: ['kids', 'family', 'height tracker', 'growth history', 'wall decal']
    },
    {
      id: 'stickers-friendly-monster-mood-sticker-set',
      name: 'Friendly Monster Mood Sticker Set',
      category: 'stickers',
      collection: 'Kids & Fun',
      description: 'Non-scary expressive monster characters for reward charts, pencil cases, notebooks, and classroom activities.',
      pack: '1 18-piece sticker set',
      priceCents: 1500,
      turnaround: '2-4 business days',
      tags: ['kids', 'classroom', 'moods', 'reward', 'characters']
    },
    {
      id: 'clever-decals-everyday-device-ruler-strip-set',
      name: 'Everyday Device Ruler Decal Strip Set',
      category: 'clever-decals',
      collection: 'Clever Everyday Decals',
      description: 'Two slim measurement strips for a laptop, tablet case, desk shelf, craft station, or workbench.',
      pack: '2 precision ruler decal strips',
      priceCents: 1200,
      turnaround: '2-4 business days',
      tags: ['ruler', 'measurement', 'laptop', 'tablet', 'desk']
    },
    {
      id: 'stickers-rainbow-weather-sticker-sheet',
      name: 'Rainbow Weather Sticker Sheet',
      category: 'stickers',
      collection: 'Kids & Fun',
      description: 'Cheerful suns, clouds, rainbows, raindrops, and lightning characters for planners, lunchboxes, notebooks, and teacher supplies.',
      pack: '1 24-piece sticker sheet',
      priceCents: 1200,
      turnaround: '2-4 business days',
      tags: ['kids', 'weather', 'rainbow', 'planner', 'teacher']
    },
    {
      id: 'stickers-tiny-builder-construction-sticker-pack',
      name: 'Tiny Builder Construction Sticker Pack',
      category: 'stickers',
      collection: 'Kids & Fun',
      description: "Original cranes, cones, dump trucks, hard hats, and tool shapes for favor bags, toy bins, lunchboxes, and kids' notebooks.",
      pack: '1 18-piece sticker pack',
      priceCents: 1500,
      turnaround: '2-4 business days',
      tags: ['kids', 'construction', 'builder', 'party', 'toy bin']
    },
    {
      id: 'tech-decals-geometric-color-block-laptop-sticker-set',
      name: 'Geometric Color Block Laptop Sticker Set',
      category: 'tech-decals',
      collection: 'Laptop & Tech',
      description: 'A coordinated set of bold abstract shapes for unbranded laptops, notebooks, tablets, and remote-work accessories.',
      pack: '1 16-piece device sticker set',
      priceCents: 1500,
      turnaround: '2-4 business days',
      tags: ['laptop', 'geometric', 'student', 'remote work', 'device']
    },
    {
      id: 'tech-decals-botanical-linework-laptop-decal-kit',
      name: 'Botanical Linework Laptop Decal Kit',
      category: 'tech-decals',
      collection: 'Laptop & Tech',
      description: 'Minimal leaf and flower linework arranged as corner and edge accents for laptops, tablet sleeves, and desk accessories.',
      pack: '1 12-piece device decal kit',
      priceCents: 1800,
      turnaround: '2-4 business days',
      tags: ['laptop', 'botanical', 'minimal', 'home office', 'tablet']
    },
    {
      id: 'tech-decals-creative-coder-laptop-sticker-pack',
      name: 'Creative Coder Laptop Sticker Pack',
      category: 'tech-decals',
      collection: 'Laptop & Tech',
      description: 'Original brackets, cursors, terminal windows, code blocks, and debugging motifs without software logos or third-party marks.',
      pack: '1 18-piece device sticker pack',
      priceCents: 1600,
      turnaround: '2-4 business days',
      tags: ['laptop', 'coder', 'developer', 'tech', 'student']
    },
    {
      id: 'tech-decals-night-sky-minimal-laptop-decal-set',
      name: 'Night Sky Minimal Laptop Decal Set',
      category: 'tech-decals',
      collection: 'Laptop & Tech',
      description: 'Moons, stars, constellations, and orbit-line accents for laptops, tablets, notebooks, and dark neutral device cases.',
      pack: '1 14-piece device decal set',
      priceCents: 1600,
      turnaround: '2-4 business days',
      tags: ['laptop', 'moon', 'stars', 'minimal', 'student']
    },
    {
      id: 'tech-decals-remote-work-badge-sticker-sheet',
      name: 'Remote Work Badge Sticker Sheet',
      category: 'tech-decals',
      collection: 'Laptop & Tech',
      description: 'Original desk, focus, headset, coffee, calendar, and home-office badges for laptops, planners, notebooks, and team gift packs.',
      pack: '1 18-piece device sticker sheet',
      priceCents: 1500,
      turnaround: '2-4 business days',
      tags: ['laptop', 'remote work', 'office', 'freelancer', 'badge']
    },
    {
      id: 'motorcycle-decals-retro-racing-stripe-tank-kit',
      name: 'Retro Racing Stripe Motorcycle Accent Kit',
      category: 'motorcycle-decals',
      collection: 'Motorcycle Decals',
      description: 'Short tapered racing stripes, circular accents, and pinstripes for clear painted motorcycle tank and side-fairing areas.',
      pack: '1 14-piece motorcycle accent kit',
      priceCents: 3400,
      turnaround: '3-5 business days',
      tags: ['motorcycle', 'tank', 'fairing', 'retro', 'racing stripe']
    },
    {
      id: 'bike-decals-wildflower-bicycle-frame-sticker-set',
      name: 'Wildflower Bicycle Frame Sticker Set',
      category: 'bike-decals',
      collection: 'Bicycle Decals',
      description: 'Slender original floral clusters designed as decorative accents for clean bicycle tubes, fenders, and smooth accessories.',
      pack: '1 16-piece bicycle sticker set',
      priceCents: 2400,
      turnaround: '3-5 business days',
      tags: ['bicycle', 'wildflower', 'floral', 'frame', 'fender']
    },
    {
      id: 'bike-decals-kids-alphabet-number-decal-set',
      name: 'Kids Bike Alphabet & Number Decal Set',
      category: 'bike-decals',
      collection: 'Bicycle Decals',
      description: "Coordinated letters, numbers, stars, and lightning accents for clean kids' bicycle frames and accessories.",
      pack: '1 30-piece bicycle decal set',
      priceCents: 2200,
      turnaround: '3-5 business days',
      tags: ['bicycle', 'kids', 'alphabet', 'numbers', 'frame']
    },
    {
      id: 'motorcycle-decals-adventure-pannier-decal-pack',
      name: 'Adventure Motorcycle Pannier Decal Pack',
      category: 'motorcycle-decals',
      collection: 'Motorcycle Decals',
      description: 'Original contour lines, mountain peaks, waypoint shapes, and directional accents for smooth motorcycle panniers and top cases.',
      pack: '1 18-piece motorcycle decal pack',
      priceCents: 3200,
      turnaround: '3-5 business days',
      tags: ['motorcycle', 'pannier', 'adventure', 'touring', 'mountain']
    },
    {
      id: 'car-decals-minimal-route-line-window-set',
      name: 'Minimal Route Line Car Window Decal Set',
      category: 'car-decals',
      collection: 'Car Decals',
      description: 'Clean route lines, waypoint dots, and directional accents for an understated rear-quarter or rear-window car detail.',
      pack: '1 16-piece car window decal set',
      priceCents: 2200,
      turnaround: '3-5 business days',
      tags: ['car', 'window', 'route', 'waypoint', 'minimal']
    },
    {
      id: 'helmet-decals-retro-checkered-helmet-kit',
      name: 'Retro Checkered Helmet Decal Kit',
      category: 'helmet-decals',
      collection: 'Motorcycle Helmet Decals',
      description: 'Checker bands and circular accent pieces visualized for decorative placement that leaves vents and certification labels visible.',
      pack: '1 12-piece decorative helmet decal kit',
      priceCents: 2200,
      turnaround: '3-5 business days',
      tags: ['motorcycle', 'helmet', 'retro', 'checkered', 'decorative']
    },
    {
      id: 'helmet-decals-topographic-line-helmet-sticker-set',
      name: 'Topographic Line Helmet Sticker Set',
      category: 'helmet-decals',
      collection: 'Motorcycle Helmet Decals',
      description: 'Contour-line fragments and peak symbols visualized as decorative accents that avoid vents, visors, and certification labels.',
      pack: '1 14-piece decorative helmet sticker set',
      priceCents: 2400,
      turnaround: '3-5 business days',
      tags: ['motorcycle', 'helmet', 'topographic', 'adventure', 'decorative']
    },
    {
      id: 'helmet-decals-cosmic-orbit-helmet-accent-pack',
      name: 'Cosmic Orbit Helmet Accent Pack',
      category: 'helmet-decals',
      collection: 'Motorcycle Helmet Decals',
      description: 'Orbit rings, stars, moons, and small comets arranged as restrained decorative accents for smooth helmet areas.',
      pack: '1 16-piece decorative helmet accent pack',
      priceCents: 2000,
      turnaround: '3-5 business days',
      tags: ['motorcycle', 'helmet', 'cosmic', 'stars', 'decorative']
    },
    {
      id: 'helmet-decals-neon-blade-helmet-decal-set',
      name: 'Neon Blade Helmet Decal Set',
      category: 'helmet-decals',
      collection: 'Motorcycle Helmet Decals',
      description: 'Bright diagonal slashes and angular decorative accents visualized without reflective, protective, or universal-fit claims.',
      pack: '1 10-piece decorative helmet decal set',
      priceCents: 2200,
      turnaround: '3-5 business days',
      tags: ['motorcycle', 'helmet', 'neon', 'angular', 'decorative']
    },
    {
      id: 'business-decals-branded-equipment-id-set',
      name: 'Branded Equipment ID Decal Set',
      category: 'business-decals',
      collection: 'Professional & Business',
      description: 'A coordinated equipment-label set with clear asset, owner, and contact fields for cases, tools, studio gear, and production equipment.',
      pack: '1 24-label equipment ID set',
      priceCents: 3600,
      turnaround: '3-5 business days after text approval',
      tags: ['business', 'equipment', 'asset ID', 'contractor', 'studio']
    },
    {
      id: 'business-signage-men-women-restroom-door-decal-pair',
      name: 'Men & Women Restroom Door Decal Pair',
      category: 'business-signage',
      collection: 'Business Signage',
      description: 'A coordinated pair of clean, high-contrast restroom icon decals for smooth commercial doors.',
      pack: '2 restroom door decals',
      priceCents: 2600,
      turnaround: '3-5 business days',
      tags: ['business', 'restroom', 'men', 'women', 'door signage']
    },
    {
      id: 'business-signage-open-closed-storefront-door-set',
      name: 'Open & Closed Storefront Door Decal Set',
      category: 'business-signage',
      collection: 'Business Signage',
      description: 'A two-piece storefront door set with one OPEN decal and one CLOSED decal in a familiar, highly legible retail style.',
      pack: '2 storefront door decals',
      priceCents: 2800,
      turnaround: '3-5 business days',
      tags: ['business', 'retail', 'open', 'closed', 'storefront']
    },
    {
      id: 'business-signage-business-hours-window-decal',
      name: 'Business Hours Window Decal',
      category: 'business-signage',
      collection: 'Business Signage',
      description: 'A clean storefront window decal with a BUSINESS HOURS heading and organized blank day-and-time rows for final customization.',
      pack: '1 business hours window decal',
      priceCents: 3800,
      turnaround: '3-5 business days after text approval',
      tags: ['business', 'hours', 'window', 'storefront', 'custom text']
    },
    {
      id: 'business-decals-vendor-order-pickup-label-roll',
      name: 'Vendor Order Pickup Label Roll',
      category: 'business-decals',
      collection: 'Professional & Business',
      description: 'Customer-name, order-number, time, and status fields for plain bags, boxes, and order staging at food and pop-up vendors.',
      pack: '1 roll of 50 pickup labels',
      priceCents: 3400,
      turnaround: '3-5 business days',
      tags: ['business', 'vendor', 'pickup', 'order label', 'food']
    },
    {
      id: 'surface-wraps-tool-chest-drawer-front-kit',
      name: 'Tool Chest Drawer Front Wrap Kit',
      category: 'surface-wraps',
      collection: 'Non-Vehicle Surface Wraps',
      description: 'Modular solid-color and stripe panels for clean, smooth tool-chest drawer fronts in garages, workshops, and maker spaces.',
      pack: '1 six-panel drawer-front wrap kit',
      priceCents: 5800,
      turnaround: '3-6 business days',
      tags: ['wrap', 'tool chest', 'garage', 'workshop', 'drawer front']
    },
    {
      id: 'surface-wraps-retail-countertop-accent-kit',
      name: 'Retail Countertop Accent Wrap Kit',
      category: 'surface-wraps',
      collection: 'Non-Vehicle Surface Wraps',
      description: 'A coordinated terrazzo-style surface pattern for clean, smooth boutique counters, market displays, and pop-up retail fixtures.',
      pack: '1 countertop accent wrap kit',
      priceCents: 5400,
      turnaround: '3-6 business days',
      tags: ['wrap', 'retail', 'countertop', 'terrazzo', 'boutique']
    },
    {
      id: 'car-decals-mountain-road-window-decal-set',
      name: 'Mountain Road Car Window Decal Set',
      category: 'car-decals',
      collection: 'Car Decals',
      description: 'A coordinated mountain ridge, winding road, pine, and sunrise decal set for rear-quarter or rear glass.',
      pack: '1 12-piece car window decal set',
      priceCents: 2000,
      turnaround: '3-5 business days',
      tags: ['car', 'window', 'mountain', 'road trip', 'pine']
    },
    {
      id: 'car-decals-student-driver-removable-magnet-pair',
      name: 'Student Driver Removable Car Magnet Pair',
      category: 'car-decals',
      collection: 'Car Decals',
      description: 'Two familiar high-visibility STUDENT DRIVER magnets for temporary placement on clean steel vehicle panels.',
      pack: '2 removable car magnets',
      priceCents: 2400,
      turnaround: '2-4 business days',
      tags: ['car', 'student driver', 'magnet', 'removable', 'family']
    },
    {
      id: 'car-decals-retro-road-trip-bumper-decal-trio',
      name: 'Retro Road Trip Bumper Decal Trio',
      category: 'car-decals',
      collection: 'Car Decals',
      description: 'Three coordinated retro travel decals featuring an open road, sunset ridge, and simple compass motif for clean car or truck surfaces.',
      pack: '3 outdoor car decals',
      priceCents: 1800,
      turnaround: '2-4 business days',
      tags: ['car', 'bumper', 'road trip', 'retro', 'travel']
    }
  ];

  const deliveryFor = turnaround => {
    const range = String(turnaround).match(/(\d+)\s*-\s*(\d+)/);
    const minBusinessDays = Number(range?.[1]) || 0;
    const maxBusinessDays = Number(range?.[2]) || minBusinessDays;
    return { minBusinessDays, maxBusinessDays, label: turnaround };
  };

  const products = sourceProducts.map((product, index) => {
    const assetBase = `assets/images/shop/catalog/batch-040/${product.id}`;
    return {
      ...product,
      sequence: index + 1,
      delivery: deliveryFor(product.turnaround),
      images: [
        { src: `${assetBase}/01-white-background.png`, alt: `${product.name} product set on a clean white background` },
        { src: `${assetBase}/02-real-world-use.png`, alt: `${product.name} shown in real-world use` }
      ],
      featured: featuredProducts.has(product.id),
      availability: 'active'
    };
  });

  const vehicleOffers = [
    {
      id: 'custom-vehicle-decals',
      name: 'Custom Vehicle Decals',
      category: 'vehicle-graphics',
      quoteOnly: true,
      visualType: 'concept',
      image: 'assets/images/shop/vehicle/custom-cut-vehicle-decal-kit-v1.png',
      href: 'quote.html?offer=vehicle-decals#quoteForm',
      summary: 'Original cut-vinyl graphics sized and placed for the specific vehicle.'
    },
    {
      id: 'accent-stripe-panel-graphics',
      name: 'Accent Stripe & Panel Graphics',
      category: 'vehicle-graphics',
      quoteOnly: true,
      visualType: 'concept',
      image: 'assets/images/shop/vehicle/consumer-accent-stripe-kit-v1.png',
      href: 'quote.html?offer=vehicle-accent#quoteForm',
      summary: 'Hood, rocker, tailgate, roof, and small-panel accents planned around real panel breaks.'
    },
    {
      id: 'specialty-color-accent-vinyl',
      name: 'Specialty Color & Accent Vinyl',
      category: 'vehicle-graphics',
      quoteOnly: true,
      visualType: 'concept',
      image: 'assets/images/shop/vehicle/specialty-color-accent-vinyl-v1.png',
      href: 'quote.html?offer=vehicle-specialty#quoteForm',
      summary: 'Small-area specialty finish work scoped after the vehicle and desired coverage are reviewed.'
    },
    {
      id: 'partial-full-vehicle-graphics',
      name: 'Partial & Full Vehicle Graphics',
      category: 'vehicle-graphics',
      quoteOnly: true,
      visualType: 'installed-work',
      image: 'assets/images/work/work-slots/old/fleet-parts-truck/01-01-perf-cjd-delaware-2.jpg',
      href: 'quote.html?offer=vehicle-coverage#quoteForm',
      summary: "Larger partial, full, personal, trailer, and fleet vehicle graphics through Tridico's established wrap process."
    }
  ];

  // Public catalog contract: each retail item has a stable ID, integer USD
  // cents, a delivery window, and two customer-facing images. Production-ready
  // print flats remain private under _project and never enter public assets.
  window.tridicoShopCategories = categories;
  window.tridicoShopProducts = products;
  window.tridicoVehicleOffers = vehicleOffers;
})();
