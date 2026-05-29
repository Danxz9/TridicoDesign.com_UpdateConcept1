(function(){
  const categoryDetails = {
    'car-decals': {
      badge: 'Car decal',
      rating: 'Outdoor vinyl',
      detail: 'Bumper, window, toolbox, and cooler friendly',
      description: name => name + ' printed on outdoor-ready vinyl for cars, trucks, laptops, coolers, and daily-use gear.'
    },
    'car-vinyl': {
      badge: 'Easy install',
      rating: 'Peel-and-apply',
      detail: 'Small-format vinyl for car enthusiasts',
      description: name => name + ' is a simple end-user vinyl accent for quarter windows, side skirts, mirrors, bumpers, or interior panels.'
    },
    'wrap-vinyl': {
      badge: 'Wrap vinyl',
      rating: 'Color-change finish',
      detail: 'Order material samples or project sheets',
      description: name => name + ' gives DIY builders and car owners a color-change vinyl option for samples, accent panels, trims, mirrors, roofs, or wrap planning.'
    },
    'stickers': {
      badge: 'Sticker pack',
      rating: 'Waterproof vinyl',
      detail: 'Great for kids, water bottles, notebooks, and gifts',
      description: name => name + ' is a durable sticker product designed for bottles, notebooks, lockers, gift bags, party favors, and everyday personal gear.'
    },
    'mug-stickers': {
      badge: 'Mug sticker',
      rating: 'Mug-ready vinyl',
      detail: 'Sized for cups, tumblers, jars, and kitchen gifts',
      description: name => name + ' is sized for mugs, tumblers, jars, coffee bars, teacher gifts, and small branded drinkware runs.'
    },
    'business-decals': {
      badge: 'Business decal',
      rating: 'Storefront ready',
      detail: 'Useful for windows, doors, counters, and facilities',
      description: name => name + ' helps businesses label doors, windows, counters, safety areas, customer zones, and everyday operating details clearly.'
    },
    'signs': {
      badge: 'Signage',
      rating: 'Event and facility ready',
      detail: 'Directional, retail, yard, event, and table signs',
      description: name => name + ' gives customers, guests, staff, or event visitors clear direction with a clean Tridico-produced sign.'
    },
    'tech-decals': {
      badge: 'Tech decal',
      rating: 'Device friendly',
      detail: 'Laptop, phone, tablet, and console personalization',
      description: name => name + ' adds personality to laptops, tablets, phone cases, consoles, chargers, desk gear, and creator setups.'
    },
    'posters-wall-art': {
      badge: 'Wall print',
      rating: 'Decor print',
      detail: 'Posters, art prints, photo prints, and wallpaper panels',
      description: name => name + ' brings print-shop quality to walls, events, bedrooms, offices, studios, dorms, gallery walls, and branded interiors.'
    },
    'home-decor': {
      badge: 'Home decor',
      rating: 'Personalized decor',
      detail: 'Room signs, wall decals, garage signs, and labels',
      description: name => name + ' is a decor-ready product for bedrooms, playrooms, kitchens, garages, bars, home offices, and giftable spaces.'
    }
  };

  const products = [];
  const seenIds = new Set();
  const slugify = value => String(value).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
  const merch = {
    'car-decals': { count: '1 outdoor vinyl decal', turnaround: '2-4 business days', unit: price => '$' + price.toFixed(2) + ' each', demand: '300+ bought in past month' },
    'car-vinyl': { count: '2-piece easy install kit', turnaround: '3-5 business days', unit: price => '$' + (price / 2).toFixed(2) + ' per piece', demand: '150+ bought in past month' },
    'wrap-vinyl': { count: '12 in x 24 in vinyl sheet', turnaround: '3-6 business days', unit: price => '$' + price.toFixed(2) + ' per sheet', demand: '80+ bought in past month' },
    'stickers': { count: '24-sticker pack', turnaround: '2-4 business days', unit: price => '$' + (price / 24).toFixed(2) + ' each', demand: '1K+ bought in past month' },
    'mug-stickers': { count: '2 mug decals', turnaround: '2-4 business days', unit: price => '$' + (price / 2).toFixed(2) + ' each', demand: '200+ bought in past month' },
    'business-decals': { count: '1 business decal set', turnaround: '3-5 business days', unit: price => '$' + price.toFixed(2) + ' per set', demand: '100+ bought in past month' },
    'signs': { count: '1 printed sign', turnaround: '3-6 business days', unit: price => '$' + price.toFixed(2) + ' each', demand: '75+ bought in past month' },
    'tech-decals': { count: '1 device decal set', turnaround: '2-4 business days', unit: price => '$' + price.toFixed(2) + ' per set', demand: '250+ bought in past month' },
    'posters-wall-art': { count: '1 wall print', turnaround: '3-6 business days', unit: price => '$' + price.toFixed(2) + ' each', demand: '120+ bought in past month' },
    'home-decor': { count: '1 decor piece', turnaround: '3-6 business days', unit: price => '$' + price.toFixed(2) + ' each', demand: '90+ bought in past month' }
  };
  const reviewBuckets = ['128', '246', '333', '518', '739', '1.1K', '1.7K', '2.4K'];
  const starValues = ['4.6', '4.7', '4.8', '4.9', '5.0'];
  const categoryPriority = {
    stickers: 940,
    signs: 780,
    'posters-wall-art': 900,
    'home-decor': 700,
    'car-decals': 740,
    'car-vinyl': 740,
    'wrap-vinyl': 720,
    'mug-stickers': 820,
    'tech-decals': 720,
    'business-decals': 580,
    'custom-services': 500
  };
  const tagPriorityRules = [
    { score: 940, tokens: ['sticker-pack', 'sticker-sheet', 'water-bottle', 'reward', 'label', 'sticker-bomb'] },
    { score: 930, tokens: ['wedding', 'bridal', 'ceremony', 'seating-chart', 'bar-sign'] },
    { score: 900, tokens: ['poster', 'gallery-wall', 'wall-art', 'art-print', 'canvas-style'] },
    { score: 870, tokens: ['yard-sign', 'graduation', 'birthday', 'baby-announcement', 'senior-night', 'open-house'] },
    { score: 830, tokens: ['wall-decal', 'nursery', 'kids-room', 'bedroom', 'renter-friendly'] },
    { score: 810, tokens: ['banner', 'backdrop', 'photo-moment', 'step-and-repeat'] },
    { score: 780, tokens: ['acrylic', 'frosted', 'tabletop', 'table-number'] },
    { score: 760, tokens: ['foam-board', 'mounted', 'photo-board', 'easel-ready', 'collage-board'] },
    { score: 740, tokens: ['car', 'automotive', 'rear-window', 'boat', 'vehicle'] },
    { score: 720, tokens: ['dorm', 'fandom', 'fan-cave', 'gamer'] },
    { score: 700, tokens: ['decorative-sign', 'home-sign', 'garage', 'classroom'] },
    { score: 650, tokens: ['car-magnet', 'removable-magnet'] }
  ];
  const getPriority = (category, name, tags, options = {}) => {
    if (Number.isFinite(options.priority)) return options.priority;
    const haystack = [category, name, ...tags].join(' ').toLowerCase();
    return tagPriorityRules.reduce((score, rule) => (
      rule.tokens.some(token => haystack.includes(token)) ? Math.max(score, rule.score) : score
    ), categoryPriority[category] || 500);
  };
  const add = (category, name, price, tags = [], options = {}) => {
    let id = slugify(category + '-' + name);
    let suffix = 2;
    while (seenIds.has(id)) id = slugify(category + '-' + name + '-' + suffix++);
    seenIds.add(id);
    const defaults = categoryDetails[category];
    const merchandising = merch[category];
    const index = products.length;
    const normalizedTags = Array.from(new Set([category, ...tags, options.badge || defaults.badge, options.rating || defaults.rating].join(' ').toLowerCase().split(/\s+/).map(tag => tag.replace(/[^a-z0-9-]/g, '')).filter(Boolean)));
    products.push({
      id,
      category,
      name,
      price,
      badge: options.badge || defaults.badge,
      rating: options.rating || starValues[index % starValues.length],
      reviews: options.reviews || reviewBuckets[index % reviewBuckets.length],
      demand: options.demand || merchandising.demand,
      detail: options.detail || defaults.detail,
      researchLine: options.researchLine || '',
      researchWeight: options.researchWeight || '',
      priority: getPriority(category, name, normalizedTags, options),
      count: options.count || merchandising.count,
      turnaround: options.turnaround || merchandising.turnaround,
      unitPrice: options.unitPrice || merchandising.unit(price),
      description: options.description || defaults.description(name),
      tags: normalizedTags,
      image: options.image || '',
      href: options.href || 'quote.html'
    });
  };

  [
    ['Clean Driver Oval Bumper Sticker', 8, ['bumper', 'classic', 'driver']],
    ['Weekend Road Trip Bumper Sticker', 9, ['bumper', 'travel', 'outdoor']],
    ['Local Legend Vinyl Car Decal', 10, ['bumper', 'local', 'fun']],
    ['Tiny Warning Huge Personality Sticker', 8, ['bumper', 'funny', 'gift']],
    ['Coffee Fueled Driver Bumper Sticker', 9, ['bumper', 'coffee', 'daily-driver']],
    ['Dog Co-Pilot Rear Window Decal', 12, ['pets', 'dogs', 'rear-window']],
    ['Cat Hair Everywhere Car Sticker', 10, ['pets', 'cats', 'funny']],
    ['Adventure Rig Badge Decal', 14, ['outdoor', 'truck', 'suv']],
    ['Lake Day Tailgate Sticker', 9, ['summer', 'outdoor', 'bumper']],
    ['Soft Smile Daisy Car Decal', 11, ['girly', 'floral', 'cute']],
    ['Mini Lightning Bolt Bumper Decal', 8, ['lightning', 'bold', 'sport']],
    ['Retro Sunset Road Sticker', 12, ['retro', 'vibrant', 'travel']],
    ['No Bad Days Car Sticker', 9, ['positive', 'gift', 'bumper']],
    ['Little Shop Supporter Decal', 10, ['small-business', 'local', 'retail']],
    ['Proud Coach Bumper Sticker', 9, ['sports', 'family', 'school']],
    ['Band Parent Road Crew Sticker', 9, ['school', 'music', 'family']],
    ['Plant Parent On Board Decal', 10, ['plant', 'cute', 'green']],
    ['Kindness Is Cool Bumper Sticker', 8, ['positive', 'school', 'gift']],
    ['Weekend Warrior Truck Decal', 12, ['truck', 'outdoor', 'sport']],
    ['Tiny Racer Big Dreams Sticker', 11, ['kids', 'car', 'racing']],
    ['Bookstore Detour Bumper Sticker', 9, ['books', 'cozy', 'gift']],
    ['Farm Market Cruiser Decal', 10, ['local', 'farm', 'truck']],
    ['Stay Weird Window Sticker', 8, ['fun', 'vibrant', 'bumper']],
    ['Clean Hands Dirty Garage Sticker', 10, ['garage', 'tools', 'car']],
    ['Good Vibes Only Car Decal', 9, ['positive', 'vibrant', 'bumper']],
    ['Mom Taxi Premium Bumper Sticker', 9, ['family', 'funny', 'daily-driver']],
    ['Dad Joke Delivery Vehicle Decal', 9, ['family', 'funny', 'bumper']],
    ['Hometown Pride Oval Decal', 10, ['local', 'classic', 'custom-text']],
    ['Quiet Car Loud Playlist Sticker', 9, ['music', 'funny', 'daily-driver']],
    ['First Car Memory Decal', 12, ['gift', 'personalized', 'car']]
  ].forEach(item => add('car-decals', item[0], item[1], item[2]));

  [
    ['Manga Speed Line Side Stripe Kit', 34, ['anime-style', 'street-racer', 'side-stripe']],
    ['Neon Drift Kanji-Inspired Door Decal', 28, ['anime-style', 'drift', 'vibrant']],
    ['Comic Burst Quarter Window Decal', 18, ['comic-style', 'cartoon', 'window']],
    ['Halftone Hero Mirror Accent Pair', 22, ['comic-style', 'mirror', 'bold']],
    ['Bubble Pop Cartoon Door Mini Kit', 24, ['cartoon', 'fun', 'vibrant']],
    ['Goth Thorn Rocker Panel Vinyl', 32, ['goth', 'dark', 'side-skirt']],
    ['Black Rose Rear Glass Decal', 24, ['goth', 'floral', 'rear-window']],
    ['Pastel Heart Fender Accent Set', 18, ['girly', 'pastel', 'cute']],
    ['Pearl Bow Side Mirror Decals', 16, ['girly', 'cute', 'mirror']],
    ['Rainbow Unicorn Door Accent Kit', 26, ['unicorns', 'vibrant', 'kids']],
    ['Cosmic Cat Window Decal Pack', 20, ['cats', 'space', 'cute']],
    ['Dog Pack Paw Trail Side Decal', 22, ['dogs', 'pets', 'fun']],
    ['Flame Fade Fender Decal Pair', 26, ['flames', 'sport', 'classic']],
    ['Lightning Split Hood Accent', 38, ['lightning', 'hood', 'bold']],
    ['Pixel Grid Cyber Side Stripe', 34, ['digital', 'cyber', 'street-racer']],
    ['Glitch Neon Rear Quarter Kit', 30, ['digital', 'glitch', 'vibrant']],
    ['Y2K Chrome Star Door Decals', 24, ['y2k', 'chrome-look', 'stars']],
    ['Vaporwave Palm Window Decal', 19, ['vaporwave', 'retro', 'window']],
    ['Retro Arcade Side Marker Kit', 24, ['retro', 'arcade', 'digital']],
    ['Kawaii Cloud Gas Cap Decal', 12, ['kawaii', 'cute', 'small']],
    ['Angry Cloud Cartoon Hood Mini', 20, ['cartoon', 'fun', 'hood']],
    ['Dark Moon Rear Window Decal', 21, ['dark', 'moon', 'goth']],
    ['Solar Flare Door Sweep Decal', 29, ['flames', 'sun', 'vibrant']],
    ['Electric Bolt Rocker Stripe', 32, ['lightning', 'racer', 'side-skirt']],
    ['Carbon Tech Hexagon Accent Kit', 35, ['digital', 'tech', 'motorsport']],
    ['Street Sakura Fender Decals', 24, ['anime-style', 'floral', 'jdm-inspired']],
    ['Purple Galaxy Side Accent Set', 31, ['space', 'vibrant', 'dark']],
    ['Bubblegum Star Mirror Decals', 15, ['girly', 'stars', 'pastel']],
    ['Skull Bloom Window Decal', 19, ['goth', 'floral', 'dark']],
    ['Cartoon Lightning Door Slash', 24, ['cartoon', 'lightning', 'bold']],
    ['Pixel Heart Gas Cap Decal', 12, ['digital', 'heart', 'cute']],
    ['Turbo Snail Funny Fender Decal', 14, ['funny', 'racing', 'car']],
    ['Low-Key Racer Windshield Corner', 16, ['minimal', 'street-racer', 'window']],
    ['Nocturne Wave Side Stripe', 32, ['dark', 'minimal', 'side-stripe']],
    ['Candy Splash Rocker Decals', 30, ['vibrant', 'paint-splash', 'fun']],
    ['Chrome Look Butterfly Window Pair', 18, ['girly', 'butterfly', 'chrome-look']],
    ['Wildflower Cruiser Door Decal', 22, ['floral', 'soft', 'cute']],
    ['Blue Flame Mini Hood Accent', 25, ['flames', 'hood', 'sport']],
    ['Circuit Board Window Decal', 18, ['digital', 'tech', 'cyber']],
    ['Mecha Panel Line Accent Kit', 34, ['anime-style', 'robot', 'digital']],
    ['Gamer Respawn Rear Window Decal', 20, ['gamer', 'digital', 'fun']],
    ['Celestial Bat Quarter Window Decal', 17, ['goth', 'moon', 'dark']],
    ['Pink Lightning Mirror Decals', 15, ['girly', 'lightning', 'vibrant']],
    ['Dog Mom Tailgate Decal', 16, ['dogs', 'pets', 'rear-window']],
    ['Cat Dad Rear Window Decal', 16, ['cats', 'pets', 'rear-window']],
    ['Alien Arcade Side Stripe', 32, ['alien-core', 'arcade', 'digital']],
    ['Heat Map Drift Door Decal', 27, ['street-racer', 'vibrant', 'motorsport']],
    ['Matte Black Ghost Stripe Kit', 36, ['dark', 'minimal', 'stealth']],
    ['Anime Sparkle Door Handle Decals', 14, ['anime-style', 'sparkle', 'cute']],
    ['Comic Panel Rear Window Strip', 22, ['comic-style', 'window', 'bold']]
  ].forEach(item => add('car-vinyl', item[0], item[1], item[2]));

  [
    ['Satin Obsidian Black Color Change Vinyl Sheet', 42, ['satin', 'black', 'wrap-material']],
    ['Gloss Candy Red Wrap Vinyl Sheet', 39, ['gloss', 'red', 'wrap-material']],
    ['Matte Army Green Wrap Vinyl Sheet', 44, ['matte', 'green', 'wrap-material']],
    ['Satin Stealth Gray Wrap Vinyl Sheet', 42, ['satin', 'gray', 'wrap-material']],
    ['Pearl White Color Change Vinyl Sheet', 45, ['pearl', 'white', 'wrap-material']],
    ['Gloss Piano Black Roof Vinyl Sheet', 49, ['gloss', 'black', 'roof']],
    ['Carbon Fiber Look Accent Vinyl Sheet', 34, ['carbon-look', 'accent', 'trim']],
    ['Brushed Metal Silver Vinyl Sheet', 38, ['metallic', 'silver', 'trim']],
    ['Satin Bronze Accent Vinyl Sheet', 46, ['satin', 'bronze', 'premium']],
    ['Metallic Copper Wrap Vinyl Sheet', 48, ['metallic', 'copper', 'premium']],
    ['Deep Navy Gloss Wrap Vinyl Sheet', 42, ['gloss', 'blue', 'premium']],
    ['Satin Metallic Blue Vinyl Sheet', 45, ['satin', 'blue', 'metallic']],
    ['Color Shift Purple Teal Vinyl Sheet', 58, ['color-shift', 'purple', 'teal']],
    ['Iridescent Pearl Accent Vinyl Sheet', 55, ['iridescent', 'pearl', 'accent']],
    ['Chrome Mirror Silver Trim Vinyl Sheet', 64, ['chrome', 'mirror', 'trim']],
    ['Gloss Metallic Gold Vinyl Sheet', 60, ['metallic', 'gold', 'premium']],
    ['Biophilic Sage Green Wrap Vinyl Sheet', 44, ['green', 'sage', 'trend']],
    ['Matte Sandstorm Tan Vinyl Sheet', 41, ['matte', 'tan', 'truck']],
    ['Satin Burgundy Wrap Vinyl Sheet', 43, ['satin', 'burgundy', 'premium']],
    ['Frozen Blue Pearl Vinyl Sheet', 52, ['pearl', 'blue', 'premium']],
    ['Neon Lime Accent Vinyl Sheet', 36, ['neon', 'lime', 'accent']],
    ['Fluorescent Pink Accent Vinyl Sheet', 36, ['neon', 'pink', 'accent']],
    ['Smoked Headlight Tint Vinyl Sheet', 24, ['tint', 'smoked', 'accent']],
    ['Amber Lens Tint Vinyl Sheet', 22, ['tint', 'amber', 'accent']],
    ['Matte Clear Paint Protection Sample Sheet', 28, ['clear', 'protection', 'sample']],
    ['Gloss Clear Paint Protection Sample Sheet', 28, ['clear', 'protection', 'sample']],
    ['Black Camouflage Accent Vinyl Sheet', 39, ['camo', 'black', 'truck']],
    ['Digital Camo Gray Vinyl Sheet', 39, ['camo', 'digital', 'gray']],
    ['Holographic Flake Accent Vinyl Sheet', 48, ['holographic', 'sparkle', 'accent']],
    ['Wrap Color Sample Starter Pack', 29, ['sample-pack', 'color-change', 'starter']]
  ].forEach(item => add('wrap-vinyl', item[0], item[1], item[2]));

  [
    ['Kawaii Snack Sticker Pack', 12, ['kawaii', 'food', 'kids']],
    ['Cute Animal Friends Sticker Pack', 12, ['animals', 'kids', 'cute']],
    ['Dino Explorer Sticker Pack', 10, ['kids', 'dinosaurs', 'school']],
    ['Space Club Sticker Pack', 11, ['kids', 'space', 'science']],
    ['Mermaid Lagoon Sticker Pack', 12, ['kids', 'girly', 'fantasy']],
    ['Unicorn Sparkle Sticker Pack', 12, ['unicorns', 'kids', 'vibrant']],
    ['Cats With Attitude Sticker Pack', 13, ['cats', 'funny', 'pets']],
    ['Dogs Doing Jobs Sticker Pack', 13, ['dogs', 'pets', 'funny']],
    ['Gamer Quest Sticker Pack', 12, ['gamer', 'kids', 'digital']],
    ['Retro Arcade Sticker Pack', 12, ['retro', 'arcade', 'digital']],
    ['Cottage Garden Sticker Pack', 13, ['cottagecore', 'floral', 'soft']],
    ['Mushroom Forest Sticker Pack', 13, ['cottagecore', 'nature', 'kids']],
    ['Dark Academia Desk Sticker Pack', 14, ['dark-academia', 'books', 'school']],
    ['Goth Garden Sticker Pack', 14, ['goth', 'floral', 'dark']],
    ['Motivational Mini Sticker Sheet', 9, ['positive', 'planner', 'school']],
    ['Teacher Reward Sticker Sheet', 10, ['teacher', 'school', 'kids']],
    ['Planner Icon Sticker Sheet', 9, ['planner', 'organization', 'office']],
    ['Water Bottle Adventure Stickers', 11, ['water-bottle', 'outdoor', 'travel']],
    ['Campfire Weekend Sticker Pack', 12, ['outdoor', 'camping', 'travel']],
    ['Sports Season Sticker Sheet', 12, ['sports', 'school', 'team']],
    ['Cheer Team Sticker Sheet', 12, ['sports', 'school', 'team']],
    ['Graduation Cap Sticker Set', 13, ['graduation', 'party', 'school']],
    ['Birthday Party Favor Stickers', 14, ['birthday', 'party', 'kids']],
    ['Baby Shower Favor Stickers', 14, ['baby-shower', 'party', 'gift']],
    ['Wedding Favor Sticker Set', 15, ['wedding', 'party', 'gift']],
    ['Small Business Thank You Stickers', 16, ['small-business', 'packaging', 'custom-text']],
    ['Logo Seal Sticker Roll Starter', 22, ['business', 'logo', 'packaging']],
    ['QR Code Promo Sticker Set', 18, ['qr-code', 'business', 'marketing']],
    ['Handmade With Care Sticker Roll', 16, ['small-business', 'packaging', 'maker']],
    ['Bakery Box Label Sticker Set', 18, ['bakery', 'business', 'packaging']],
    ['Salon Appointment Sticker Set', 15, ['salon', 'business', 'appointment']],
    ['Farmers Market Label Stickers', 18, ['farm', 'market', 'packaging']],
    ['Library Bookplate Sticker Set', 12, ['books', 'school', 'personalized']],
    ['Name Label School Sticker Pack', 15, ['kids', 'school', 'custom-text']],
    ['Allergy Alert Kids Sticker Set', 14, ['kids', 'school', 'safety']],
    ['Chore Chart Sticker Sheet', 12, ['kids', 'home', 'organization']],
    ['Reward Star Sticker Sheet', 9, ['kids', 'school', 'teacher']],
    ['Holiday Gift Tag Sticker Set', 13, ['holiday', 'gift', 'packaging']],
    ['Pet Name Label Sticker Pack', 12, ['pets', 'custom-text', 'home']],
    ['Sticker Bomb Starter Pack', 18, ['sticker-bomb', 'vibrant', 'maximalist']]
  ].forEach(item => add('stickers', item[0], item[1], item[2]));

  [
    ['Coffee First Mug Sticker', 7, ['coffee', 'mug', 'gift']],
    ['Tea Time Floral Mug Decal', 7, ['tea', 'floral', 'gift']],
    ['Teacher Fuel Mug Sticker', 8, ['teacher', 'school', 'gift']],
    ['Nurse Shift Mug Decal', 8, ['nurse', 'work', 'gift']],
    ['Mama Bear Mug Sticker', 8, ['family', 'gift', 'custom-text']],
    ['Dad Garage Mug Decal', 8, ['garage', 'gift', 'family']],
    ['Book Club Mug Sticker', 7, ['books', 'club', 'gift']],
    ['Game Night Mug Decal', 7, ['gamer', 'party', 'gift']],
    ['Pet Portrait Mug Sticker', 10, ['pets', 'personalized', 'gift']],
    ['Small Business Logo Mug Decal', 12, ['business', 'logo', 'branded']],
    ['Cafe Brand Mug Sticker Set', 16, ['cafe', 'business', 'bulk-ready']],
    ['Bridesmaid Name Mug Decal', 9, ['wedding', 'custom-text', 'gift']],
    ['Birthday Name Mug Sticker', 9, ['birthday', 'custom-text', 'gift']],
    ['Camping Mug Adventure Decal', 8, ['camping', 'outdoor', 'gift']],
    ['Motivational Quote Mug Sticker', 7, ['positive', 'quote', 'gift']],
    ['Office Humor Mug Decal', 7, ['office', 'funny', 'gift']],
    ['Bakery Cup Label Decal Set', 15, ['bakery', 'business', 'packaging']],
    ['QR Code Tip Jar Mug Sticker', 10, ['qr-code', 'business', 'cafe']],
    ['Holiday Cocoa Mug Sticker Set', 14, ['holiday', 'gift', 'seasonal']],
    ['Minimal Monogram Mug Decal', 9, ['monogram', 'custom-text', 'gift']]
  ].forEach(item => add('mug-stickers', item[0], item[1], item[2]));

  [
    ['Store Hours Window Decal', 38, ['hours', 'window', 'retail', 'custom-text']],
    ['Open Closed Door Decal Set', 28, ['open-closed', 'door', 'retail']],
    ['Restroom Door Icon Decal', 18, ['restroom', 'door', 'facility']],
    ['Men Women Restroom Decal Pair', 26, ['restroom', 'facility', 'door']],
    ['All Gender Restroom Door Decal', 20, ['restroom', 'facility', 'door']],
    ['Employees Only Door Decal', 18, ['facility', 'door', 'business']],
    ['Exit Arrow Door Decal', 16, ['exit', 'wayfinding', 'facility']],
    ['Emergency Exit Keep Clear Decal', 22, ['exit', 'safety', 'facility']],
    ['Caution Stripe Floor Marker Set', 34, ['caution', 'safety', 'yellow-black']],
    ['Watch Your Step Decal', 18, ['safety', 'stairs', 'facility']],
    ['Authorized Personnel Only Decal', 20, ['facility', 'safety', 'door']],
    ['No Smoking Window Decal', 16, ['facility', 'window', 'policy']],
    ['Delivery Pickup Window Decal', 24, ['pickup', 'retail', 'window']],
    ['Order Here Counter Decal', 24, ['restaurant', 'counter', 'business']],
    ['Pick Up Here Counter Decal', 24, ['restaurant', 'pickup', 'counter']],
    ['QR Code Menu Window Decal', 32, ['qr-code', 'restaurant', 'window']],
    ['QR Code Review Us Decal', 28, ['qr-code', 'reviews', 'business']],
    ['Accepted Payments Door Decal Set', 22, ['payment', 'retail', 'door']],
    ['WiFi Password Table Decal', 18, ['wifi', 'restaurant', 'table']],
    ['Please Wait To Be Seated Decal', 22, ['restaurant', 'front-door', 'business']],
    ['Private Office Door Decal', 18, ['office', 'door', 'facility']],
    ['Conference Room Door Decal', 18, ['office', 'door', 'facility']],
    ['Reception Window Decal', 24, ['office', 'window', 'business']],
    ['Logo Door Vinyl Lettering', 48, ['logo', 'door', 'custom-text']],
    ['Suite Number Door Decal', 24, ['office', 'door', 'custom-text']],
    ['Vehicle DOT Number Decal Pair', 30, ['vehicle', 'fleet', 'custom-text']],
    ['Food Truck Menu QR Decal', 35, ['food-truck', 'qr-code', 'restaurant']],
    ['Salon Service Menu Window Decal', 42, ['salon', 'window', 'business']],
    ['Gym Rules Wall Decal', 40, ['gym', 'wall', 'business']],
    ['Warehouse Zone Label Decal Set', 46, ['warehouse', 'safety', 'labels']],
    ['Loading Dock Caution Decal', 28, ['warehouse', 'caution', 'safety']],
    ['No Parking Loading Zone Decal', 24, ['parking', 'facility', 'safety']],
    ['Reserved Parking Window Decal', 22, ['parking', 'facility', 'business']],
    ['Storefront Logo Window Cling', 55, ['logo', 'window', 'custom-text']],
    ['Seasonal Sale Window Decal Kit', 45, ['retail', 'sale', 'seasonal']]
  ].forEach(item => add('business-decals', item[0], item[1], item[2]));

  [
    ['Event This Way Arrow Sign', 32, ['event', 'directional', 'arrow']],
    ['Restroom This Way Sign', 28, ['restroom', 'directional', 'event']],
    ['Check-In This Way Sign', 30, ['event', 'directional', 'check-in']],
    ['Parking This Way Yard Sign', 29, ['parking', 'yard-sign', 'event']],
    ['Open House Yard Sign', 35, ['real-estate', 'yard-sign', 'open-house']],
    ['Real Estate Rider Sign', 24, ['real-estate', 'yard-sign', 'custom-text']],
    ['Graduation Yard Sign', 32, ['graduation', 'yard-sign', 'celebration']],
    ['Birthday Yard Sign', 32, ['birthday', 'yard-sign', 'party']],
    ['Sports Player Yard Sign', 34, ['sports', 'yard-sign', 'team']],
    ['Team Banner Sign', 85, ['sports', 'banner', 'team']],
    ['Wedding Welcome Sign', 72, ['wedding', 'event', 'welcome']],
    ['Wedding Seating Chart Sign', 95, ['wedding', 'event', 'custom-text']],
    ['Baby Shower Welcome Sign', 62, ['baby-shower', 'event', 'welcome']],
    ['Market Vendor Table Sign', 45, ['market', 'vendor', 'table']],
    ['Food Truck Menu Board Print', 85, ['food-truck', 'menu', 'restaurant']],
    ['Cafe Counter Menu Sign', 65, ['cafe', 'menu', 'counter']],
    ['Retail Sale A-Frame Insert', 48, ['retail', 'sale', 'a-frame']],
    ['Now Hiring Window Sign', 28, ['hiring', 'business', 'window']],
    ['Closed for Private Event Sign', 28, ['event', 'business', 'door']],
    ['Please Use Other Door Sign', 24, ['wayfinding', 'door', 'facility']],
    ['No Public Restroom Sign', 24, ['restroom', 'facility', 'business']],
    ['Quiet Zone Sign', 24, ['office', 'school', 'facility']],
    ['Reserved Table Sign Set', 30, ['restaurant', 'table', 'event']],
    ['Photo Booth This Way Sign', 32, ['event', 'party', 'directional']],
    ['Custom QR Code Table Display', 36, ['qr-code', 'table', 'restaurant']],
    ['Donation QR Code Sign', 38, ['qr-code', 'fundraiser', 'event']],
    ['Sponsor Logo Event Board', 115, ['event', 'sponsor', 'logo']],
    ['Step and Repeat Mini Backdrop', 145, ['event', 'photo', 'banner']],
    ['Directional Arrow Floor Decal Sign', 26, ['floor', 'directional', 'event']],
    ['Curbside Pickup Yard Sign', 30, ['pickup', 'yard-sign', 'retail']]
  ].forEach(item => add('signs', item[0], item[1], item[2]));

  [
    ['Laptop Name Decal', 12, ['laptop', 'custom-text', 'school']],
    ['Minimal Monogram Laptop Decal', 14, ['laptop', 'monogram', 'custom-text']],
    ['Cyber Grid Laptop Skin Decal', 18, ['laptop', 'digital', 'cyber']],
    ['Dark Academia Laptop Sticker Set', 16, ['laptop', 'dark-academia', 'books']],
    ['Kawaii Desk Tech Sticker Pack', 15, ['laptop', 'kawaii', 'cute']],
    ['Gamer Tag Laptop Decal', 16, ['gamer', 'custom-text', 'laptop']],
    ['Streamer Handle Decal Set', 18, ['creator', 'custom-text', 'tech']],
    ['QR Code Laptop Promo Decal', 16, ['qr-code', 'business', 'laptop']],
    ['Company Logo Laptop Decal Pack', 24, ['business', 'logo', 'bulk-ready']],
    ['Tablet Classroom Name Sticker Set', 20, ['school', 'tablet', 'custom-text']],
    ['Phone Case Mini Sticker Pack', 10, ['phone', 'mini', 'cute']],
    ['Cellphone Aesthetic Sticker Sheet', 11, ['phone', 'aesthetic', 'vibrant']],
    ['Webcam Reminder Sticker Set', 8, ['office', 'laptop', 'privacy']],
    ['Keyboard Shortcut Sticker Strip', 9, ['keyboard', 'office', 'productivity']],
    ['Charger Label Sticker Set', 9, ['organization', 'tech', 'custom-text']],
    ['Console Controller Decal Pair', 14, ['gamer', 'console', 'controller']],
    ['Gaming Console Skin Accent', 24, ['gamer', 'console', 'digital']],
    ['Desk Cable Label Sticker Pack', 9, ['organization', 'desk', 'office']],
    ['Creator Studio Label Set', 16, ['creator', 'studio', 'organization']],
    ['Podcast Gear Label Decals', 18, ['podcast', 'studio', 'custom-text']],
    ['Camera Case Name Decal', 12, ['camera', 'creator', 'custom-text']],
    ['Toolbox Tech Logo Decal', 14, ['tools', 'logo', 'custom-text']],
    ['Drone Case ID Decal', 14, ['drone', 'custom-text', 'gear']],
    ['VR Headset Accent Decal', 16, ['gamer', 'vr', 'tech']],
    ['Digital Sticker Bomb Laptop Pack', 22, ['sticker-bomb', 'laptop', 'maximalist']]
  ].forEach(item => add('tech-decals', item[0], item[1], item[2]));

  [
    ['Premium Photo Poster Print', 28, ['poster', 'photo', 'gift']],
    ['Custom Event Poster', 34, ['poster', 'event', 'custom-text']],
    ['Band Night Poster Print', 32, ['poster', 'music', 'event']],
    ['Sports Team Poster', 34, ['poster', 'sports', 'team']],
    ['Graduation Photo Poster', 36, ['poster', 'graduation', 'gift']],
    ['Birthday Milestone Poster', 34, ['poster', 'birthday', 'party']],
    ['Wedding Welcome Poster', 45, ['wedding', 'poster', 'event']],
    ['Pet Portrait Poster', 42, ['pets', 'poster', 'gift']],
    ['Nursery Name Poster', 32, ['kids', 'nursery', 'custom-text']],
    ['Game Room Poster Set', 55, ['gamer', 'poster', 'home']],
    ['Garage Blueprint Poster', 45, ['garage', 'poster', 'home']],
    ['Vintage Travel Style Poster', 38, ['travel', 'retro', 'poster']],
    ['Local Landmark Art Print', 42, ['local', 'art-print', 'home']],
    ['Office Motivation Poster Set', 48, ['office', 'poster', 'business']],
    ['Menu Poster Print', 40, ['restaurant', 'menu', 'poster']],
    ['Retail Promotion Poster', 32, ['retail', 'sale', 'poster']],
    ['Canvas-Style Family Wall Print', 68, ['family', 'wall-art', 'gift']],
    ['Canvas-Style Logo Lobby Print', 78, ['business', 'logo', 'office']],
    ['Gallery Wall Mini Print Set', 65, ['gallery-wall', 'home', 'decor']],
    ['Removable Wallpaper Sample Panel', 35, ['wallpaper', 'sample', 'home']],
    ['Peel and Stick Accent Wallpaper Panel', 58, ['wallpaper', 'home', 'removable']],
    ['Kids Room Pattern Wallpaper Panel', 58, ['wallpaper', 'kids', 'home']],
    ['Game Room Mural Panel', 95, ['wallpaper', 'gamer', 'home']],
    ['Cafe Feature Wall Print Panel', 120, ['wallpaper', 'business', 'cafe']],
    ['Trade Show Back Wall Poster Panel', 125, ['poster', 'business', 'event']]
  ].forEach(item => add('posters-wall-art', item[0], item[1], item[2]));

  [
    ['Personalized Bedroom Name Sign', 32, ['bedroom', 'custom-text', 'kids']],
    ['Kids Room Wall Name Decal', 28, ['kids', 'bedroom', 'custom-text']],
    ['Game Room Door Sign', 30, ['gamer', 'room-sign', 'home']],
    ['Home Office Door Sign', 28, ['office', 'room-sign', 'home']],
    ['Garage Shop Wall Sign', 38, ['garage', 'man-cave', 'home']],
    ['Man Cave Bar Sign', 40, ['bar', 'man-cave', 'home']],
    ['She Shed Floral Sign', 36, ['floral', 'home', 'custom-text']],
    ['Laundry Room Label Decal Set', 24, ['laundry', 'organization', 'home']],
    ['Pantry Label Sticker Set', 22, ['pantry', 'organization', 'kitchen']],
    ['Toy Bin Label Sticker Set', 22, ['kids', 'organization', 'home']],
    ['Family Rules Wall Decal', 35, ['family', 'wall-decal', 'home']],
    ['Script Quote Wall Decal', 32, ['quote', 'wall-decal', 'home']],
    ['Entryway Welcome Wall Decal', 32, ['welcome', 'entryway', 'home']],
    ['Pet Station Label Decal Set', 20, ['pets', 'organization', 'home']],
    ['Holiday Window Decor Decal Set', 28, ['holiday', 'seasonal', 'window']]
  ].forEach(item => add('home-decor', item[0], item[1], item[2]));

  const weightedLaunchProducts = [
    { category: 'stickers', line: 'stickers', weight: '12%', name: 'Local Pride Weatherproof Sticker Pack', price: 14, tags: ['local', 'water-bottle', 'gift', 'sticker-pack'], options: { count: '12-sticker local pack', unitPrice: '$1.17 each', priority: 939 } },
    { category: 'stickers', line: 'stickers', weight: '12%', name: 'Milestone Moment Sticker Bundle', price: 16, tags: ['graduation', 'birthday', 'baby-shower', 'wedding', 'bundle', 'sticker-pack'], options: { count: '20-sticker milestone bundle', unitPrice: '$0.80 each', priority: 946 } },
    { category: 'stickers', line: 'stickers', weight: '12%', name: 'Cottage Garden Bottle Sticker Pack', price: 13, tags: ['floral', 'cottagecore', 'water-bottle', 'sticker-pack'], options: { count: '15-sticker waterproof pack', unitPrice: '$0.87 each', priority: 945 } },
    { category: 'stickers', line: 'stickers', weight: '12%', name: 'Maximalist Mood Sticker Sheet', price: 12, tags: ['maximalist', 'gen-z', 'aesthetic', 'sticker-sheet'], options: { count: '1 large sticker sheet', unitPrice: '$12.00 per sheet', priority: 945 } },
    { category: 'stickers', line: 'stickers', weight: '12%', name: 'Teacher Reward Mega Sticker Sheet', price: 14, tags: ['teacher', 'school', 'reward', 'sticker-sheet'], options: { count: '2 reward sticker sheets', unitPrice: '$7.00 per sheet', priority: 944 } },
    { category: 'stickers', line: 'stickers', weight: '12%', name: 'Custom Name Label Five-Pack', price: 15, tags: ['kids', 'school', 'personalized', 'label', 'bundle'], options: { count: '5 personalized name labels', unitPrice: '$3.00 each', priority: 944 } },

    { category: 'signs', line: 'wedding-signage', weight: '12%', name: 'Botanical Wedding Welcome Sign', price: 78, tags: ['wedding', 'welcome', 'botanical', 'event'], options: { count: '1 18 in x 24 in wedding sign', turnaround: '3-5 business days after proof approval', priority: 936 } },
    { category: 'signs', line: 'wedding-signage', weight: '12%', name: 'Gothic Romance Wedding Welcome Sign', price: 84, tags: ['wedding', 'welcome', 'gothic-romance', 'event'], options: { count: '1 18 in x 24 in wedding sign', turnaround: '3-5 business days after proof approval', priority: 935 } },
    { category: 'signs', line: 'wedding-signage', weight: '12%', name: 'Wildflower Seating Chart Sign', price: 115, tags: ['wedding', 'seating-chart', 'wildflower', 'custom-text'], options: { count: '1 large seating chart sign', turnaround: '4-7 business days after proof approval', priority: 934 } },
    { category: 'signs', line: 'wedding-signage', weight: '12%', name: 'Stained Glass Style Wedding Bar Sign', price: 68, tags: ['wedding', 'bar-sign', 'stained-glass', 'tabletop'], options: { count: '1 wedding bar sign', turnaround: '3-5 business days after proof approval', priority: 934 } },
    { category: 'signs', line: 'wedding-signage', weight: '12%', name: 'Minimal Ceremony Directional Sign Set', price: 72, tags: ['wedding', 'ceremony', 'directional', 'event'], options: { count: '2 ceremony directional signs', unitPrice: '$36.00 each', priority: 933 } },
    { category: 'signs', line: 'wedding-signage', weight: '12%', name: 'Wedding Menu Table Sign Set', price: 55, tags: ['wedding', 'menu', 'tabletop', 'custom-text'], options: { count: '3 matching table signs', unitPrice: '$18.33 each', priority: 933 } },

    { category: 'posters-wall-art', line: 'poster-gallery', weight: '10%', name: 'Eclectic Gallery Wall Three-Print Set', price: 58, tags: ['gallery-wall', 'maximalist', 'wall-art', 'home'], options: { count: '3 coordinated wall prints', unitPrice: '$19.33 each', priority: 906 } },
    { category: 'posters-wall-art', line: 'poster-gallery', weight: '10%', name: 'Local Landmark Gallery Print Set', price: 52, tags: ['local', 'art-print', 'gallery-wall', 'gift'], options: { count: '2 local landmark prints', unitPrice: '$26.00 each', priority: 905 } },
    { category: 'posters-wall-art', line: 'poster-gallery', weight: '10%', name: 'Coastal Apartment Art Print Pair', price: 46, tags: ['coastal', 'apartment', 'art-print', 'wall-art'], options: { count: '2 apartment art prints', unitPrice: '$23.00 each', priority: 904 } },
    { category: 'posters-wall-art', line: 'poster-gallery', weight: '10%', name: 'Literary Quote Gallery Print Set', price: 48, tags: ['books', 'quote', 'gallery-wall', 'art-print'], options: { count: '3 literary quote prints', unitPrice: '$16.00 each', priority: 904 } },
    { category: 'posters-wall-art', line: 'poster-gallery', weight: '10%', name: 'Abstract Color Story Poster Trio', price: 54, tags: ['abstract', 'poster', 'gallery-wall', 'decor'], options: { count: '3 abstract poster prints', unitPrice: '$18.00 each', priority: 903 } },

    { category: 'signs', line: 'celebration-yard-signs', weight: '10%', name: 'Graduation Photo Yard Sign with H-Stake', price: 38, tags: ['graduation', 'yard-sign', 'photo', 'celebration'], options: { count: '1 24 in x 18 in yard sign with stake', unitPrice: '$38.00 each', priority: 876 } },
    { category: 'signs', line: 'celebration-yard-signs', weight: '10%', name: 'Birthday Milestone Yard Sign', price: 36, tags: ['birthday', 'yard-sign', 'celebration', 'custom-text'], options: { count: '1 24 in x 18 in yard sign with stake', unitPrice: '$36.00 each', priority: 875 } },
    { category: 'signs', line: 'celebration-yard-signs', weight: '10%', name: 'Baby Announcement Yard Sign', price: 34, tags: ['baby-announcement', 'yard-sign', 'celebration', 'custom-text'], options: { count: '1 24 in x 18 in yard sign with stake', unitPrice: '$34.00 each', priority: 874 } },
    { category: 'signs', line: 'celebration-yard-signs', weight: '10%', name: 'Senior Night Sports Yard Sign', price: 39, tags: ['senior-night', 'sports', 'yard-sign', 'team'], options: { count: '1 player yard sign with stake', unitPrice: '$39.00 each', priority: 873 } },
    { category: 'signs', line: 'celebration-yard-signs', weight: '10%', name: 'Open House Welcome Yard Sign Bundle', price: 45, tags: ['open-house', 'yard-sign', 'real-estate', 'bundle'], options: { count: '1 yard sign plus rider', unitPrice: '$45.00 per bundle', priority: 872 } },

    { category: 'home-decor', line: 'wall-decals', weight: '8%', name: 'Nursery Name Wall Decal Kit', price: 34, tags: ['nursery', 'wall-decal', 'kids-room', 'custom-text'], options: { count: '1 personalized wall decal kit', unitPrice: '$34.00 per kit', priority: 836 } },
    { category: 'home-decor', line: 'wall-decals', weight: '8%', name: 'Dorm Quote Removable Wall Decal', price: 29, tags: ['dorm', 'wall-decal', 'renter-friendly', 'quote'], options: { count: '1 removable wall decal', unitPrice: '$29.00 each', priority: 835 } },
    { category: 'home-decor', line: 'wall-decals', weight: '8%', name: 'Kids Sports Room Name Decal', price: 32, tags: ['kids-room', 'sports', 'wall-decal', 'custom-text'], options: { count: '1 room name wall decal', unitPrice: '$32.00 each', priority: 834 } },
    { category: 'home-decor', line: 'wall-decals', weight: '8%', name: 'Renter Friendly Accent Decal Set', price: 36, tags: ['renter-friendly', 'wall-decal', 'apartment', 'decor'], options: { count: '1 removable accent decal set', unitPrice: '$36.00 per set', priority: 833 } },

    { category: 'signs', line: 'banners-backdrops', weight: '8%', name: 'First Birthday Photo Backdrop Banner', price: 88, tags: ['birthday', 'backdrop', 'photo-moment', 'banner'], options: { count: '1 4 ft x 6 ft backdrop banner', unitPrice: '$88.00 each', priority: 816 } },
    { category: 'signs', line: 'banners-backdrops', weight: '8%', name: 'Graduation Photo Moment Banner', price: 92, tags: ['graduation', 'backdrop', 'photo-moment', 'banner'], options: { count: '1 4 ft x 6 ft photo banner', unitPrice: '$92.00 each', priority: 815 } },
    { category: 'signs', line: 'banners-backdrops', weight: '8%', name: 'Bridal Shower Floral Backdrop', price: 96, tags: ['bridal', 'backdrop', 'floral', 'banner'], options: { count: '1 4 ft x 6 ft shower backdrop', unitPrice: '$96.00 each', priority: 814 } },
    { category: 'signs', line: 'banners-backdrops', weight: '8%', name: 'Sports Banquet Sponsor Banner', price: 115, tags: ['sports', 'banquet', 'sponsor', 'banner'], options: { count: '1 sponsor banner', unitPrice: '$115.00 each', priority: 813 } },

    { category: 'signs', line: 'acrylic-signs', weight: '8%', name: 'Frosted Acrylic Welcome Sign', price: 105, tags: ['acrylic', 'frosted', 'welcome', 'event'], options: { count: '1 premium acrylic sign', turnaround: '4-7 business days after proof approval', priority: 786 } },
    { category: 'signs', line: 'acrylic-signs', weight: '8%', name: 'Acrylic Table Number Sign Set', price: 75, tags: ['acrylic', 'table-number', 'wedding', 'event'], options: { count: '10 acrylic table signs', unitPrice: '$7.50 each', priority: 785 } },
    { category: 'signs', line: 'acrylic-signs', weight: '8%', name: 'Clear Acrylic Bar Menu Sign', price: 64, tags: ['acrylic', 'bar-sign', 'menu', 'tabletop'], options: { count: '1 acrylic tabletop sign', unitPrice: '$64.00 each', priority: 784 } },
    { category: 'signs', line: 'acrylic-signs', weight: '8%', name: 'Color Backed Acrylic Baby Shower Sign', price: 82, tags: ['acrylic', 'baby-shower', 'welcome', 'event'], options: { count: '1 color-backed acrylic sign', unitPrice: '$82.00 each', priority: 783 } },

    { category: 'signs', line: 'mounted-boards', weight: '8%', name: 'Graduation Photo Collage Foam Board', price: 55, tags: ['graduation', 'foam-board', 'photo-board', 'collage-board'], options: { count: '1 easel-ready foam board', unitPrice: '$55.00 each', priority: 766 } },
    { category: 'signs', line: 'mounted-boards', weight: '8%', name: 'Memorial Celebration Photo Board', price: 62, tags: ['memorial', 'foam-board', 'photo-board', 'easel-ready'], options: { count: '1 mounted photo board', unitPrice: '$62.00 each', priority: 765 } },
    { category: 'signs', line: 'mounted-boards', weight: '8%', name: 'Wedding Welcome Foam Board Sign', price: 58, tags: ['wedding', 'foam-board', 'mounted', 'welcome'], options: { count: '1 mounted wedding sign', unitPrice: '$58.00 each', priority: 764 } },
    { category: 'signs', line: 'mounted-boards', weight: '8%', name: 'Retirement Timeline Mounted Board', price: 64, tags: ['retirement', 'mounted', 'photo-board', 'easel-ready'], options: { count: '1 mounted timeline board', unitPrice: '$64.00 each', priority: 763 } },

    { category: 'car-decals', line: 'automotive-decals', weight: '6%', name: 'Family Name Rear Window Decal', price: 18, tags: ['family', 'rear-window', 'custom-text', 'automotive'], options: { count: '1 personalized rear window decal', unitPrice: '$18.00 each', priority: 746 } },
    { category: 'car-decals', line: 'automotive-decals', weight: '6%', name: 'Lake Life Boat and Car Decal', price: 16, tags: ['boat', 'car', 'outdoor', 'automotive'], options: { count: '1 outdoor vinyl decal', unitPrice: '$16.00 each', priority: 745 } },
    { category: 'car-decals', line: 'automotive-decals', weight: '6%', name: 'Memorial Ribbon Car Decal', price: 15, tags: ['memorial', 'car', 'rear-window', 'automotive'], options: { count: '1 outdoor vinyl decal', unitPrice: '$15.00 each', priority: 744 } },

    { category: 'posters-wall-art', line: 'dorm-fandom', weight: '6%', name: 'Dorm Refresh Poster Mini Set', price: 38, tags: ['dorm', 'poster', 'move-in', 'bundle'], options: { count: '3 dorm poster prints', unitPrice: '$12.67 each', priority: 726 } },
    { category: 'posters-wall-art', line: 'dorm-fandom', weight: '6%', name: 'Travel Statement Dorm Print Pair', price: 42, tags: ['dorm', 'travel', 'statement', 'poster'], options: { count: '2 statement dorm prints', unitPrice: '$21.00 each', priority: 725 } },
    { category: 'posters-wall-art', line: 'dorm-fandom', weight: '6%', name: 'Fan Cave Wall Art Poster Set', price: 45, tags: ['fandom', 'fan-cave', 'poster', 'gamer'], options: { count: '3 fan-cave posters', unitPrice: '$15.00 each', priority: 724 } },

    { category: 'home-decor', line: 'decorative-signs', weight: '6%', name: 'Personalized Family Entry Sign', price: 48, tags: ['decorative-sign', 'home-sign', 'family', 'custom-text'], options: { count: '1 personalized home sign', unitPrice: '$48.00 each', priority: 706 } },
    { category: 'home-decor', line: 'decorative-signs', weight: '6%', name: 'Garage Coordinates Wall Sign', price: 44, tags: ['decorative-sign', 'garage', 'coordinates', 'custom-text'], options: { count: '1 garage wall sign', unitPrice: '$44.00 each', priority: 705 } },
    { category: 'home-decor', line: 'decorative-signs', weight: '6%', name: 'Classroom Name Door Sign', price: 36, tags: ['decorative-sign', 'classroom', 'teacher', 'custom-text'], options: { count: '1 classroom door sign', unitPrice: '$36.00 each', priority: 704 } },

    { category: 'car-decals', line: 'car-magnets', weight: '6%', name: 'Graduation Parade Car Magnet', price: 58, tags: ['graduation', 'car-magnet', 'removable-magnet', 'celebration'], options: { badge: 'Car magnet', count: '2 removable car magnets', unitPrice: '$29.00 each', priority: 656 } },
    { category: 'car-decals', line: 'car-magnets', weight: '6%', name: 'Small Business Removable Car Magnet Pair', price: 72, tags: ['small-business', 'car-magnet', 'removable-magnet', 'logo'], options: { badge: 'Car magnet', count: '2 removable car magnets', unitPrice: '$36.00 each', priority: 655 } },
    { category: 'car-decals', line: 'car-magnets', weight: '6%', name: 'Student Driver Removable Car Magnet', price: 48, tags: ['student-driver', 'car-magnet', 'removable-magnet', 'family'], options: { badge: 'Car magnet', count: '2 removable car magnets', unitPrice: '$24.00 each', priority: 654 } }
  ];

  weightedLaunchProducts.forEach(item => {
    add(item.category, item.name, item.price, [...item.tags, 'research-weighted', 'line-' + item.line, 'weight-' + item.weight.replace('%', '')], {
      ...item.options,
      demand: item.options.demand || 'High-fit launch product',
      researchLine: item.line,
      researchWeight: item.weight
    });
  });

  if (products.length !== 350) {
    throw new Error('Expected 350 shop products, generated ' + products.length);
  }

  const canvaTestDecks = {
    'stickers-local-pride-weatherproof-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-local-pride-weatherproof-sticker-pack-applied.svg?v=20260528-no-pride',
      artworkImage: 'assets/images/shop/canva-test/stickers-local-pride-weatherproof-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/dLlgH0UD-i27N09',
        artwork: 'https://www.canva.com/d/pPMNerMxWZCXeMA'
      }
    },
    'stickers-cats-with-attitude-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-cats-with-attitude-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-cats-with-attitude-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/CCA8R9vFZdZoSMG',
        artwork: 'https://www.canva.com/d/-42IuWALTnfiKjS'
      }
    },
    'stickers-cute-animal-friends-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-cute-animal-friends-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-cute-animal-friends-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/expLCFIGenB6O2M',
        artwork: 'https://www.canva.com/d/apUNhdc-LL_JAPD'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-011',
        applied: {
          jobId: '7dc102c6-6ab4-43a2-9617-bd1884f2fb94',
          candidateId: 'dg-d3837a13-e9fd-467e-baaa-e4e95ed9b68e',
          designId: 'DAHLAkcjM4c',
          editUrl: 'https://www.canva.com/d/expLCFIGenB6O2M',
          viewUrl: 'https://www.canva.com/d/S6NpaMlmLgF8wPz'
        },
        artwork: {
          jobId: '11ef7aa1-f4bf-4711-87ab-06e067370623',
          candidateId: 'dg-b06c21f5-7176-4838-bc14-299433352473',
          designId: 'DAHLAqRql4Y',
          editUrl: 'https://www.canva.com/d/apUNhdc-LL_JAPD',
          viewUrl: 'https://www.canva.com/d/mnZtVC_ADMc3l7G'
        }
      }
    },
    'stickers-dino-explorer-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-dino-explorer-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-dino-explorer-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/ZmVQLGXs3jsGtq2',
        artwork: 'https://www.canva.com/d/LCVacR1XYGD14i4'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-017',
        applied: {
          sourceBatch: '2026-05-29_batch-016',
          jobId: 'e188019d-9cf3-4d53-8bf7-cfa534b1e857',
          candidateId: 'dg-43c2bfcd-ef1b-4b7d-8517-7f906cb5bd35',
          designId: 'DAHLBJinM3A',
          editUrl: 'https://www.canva.com/d/ZmVQLGXs3jsGtq2',
          viewUrl: 'https://www.canva.com/d/kHMBr8uQbiYuD-1'
        },
        artwork: {
          jobId: '85d0785b-6182-4c19-abe1-4d3b729aa0d5',
          candidateId: 'dg-06ea0d27-8129-40f3-8aea-47e3f4429e30',
          designId: 'DAHLBLDK1Hw',
          editUrl: 'https://www.canva.com/d/LCVacR1XYGD14i4',
          viewUrl: 'https://www.canva.com/d/ZwfHyID3VE3KUef'
        }
      }
    },
    'stickers-dogs-doing-jobs-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-dogs-doing-jobs-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-dogs-doing-jobs-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/Rv74HMhI275cJJ4',
        artwork: 'https://www.canva.com/d/-uAhdHKjBhyCcam'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-017',
        applied: {
          jobId: '1f414d2d-6dc1-497a-8763-dc29bfcb0710',
          candidateId: 'dg-c0d418af-d6af-45d3-b093-cd1696b95c78',
          designId: 'DAHLBFchJNk',
          editUrl: 'https://www.canva.com/d/Rv74HMhI275cJJ4',
          viewUrl: 'https://www.canva.com/d/Iz1Qxvd053uQYnb'
        },
        artwork: {
          jobId: '8d5e741a-1386-4342-be1e-2c798c37fe78',
          candidateId: 'dg-6cb9914c-4f5d-4797-817a-00ca627bb151',
          designId: 'DAHLBHxazZo',
          editUrl: 'https://www.canva.com/d/-uAhdHKjBhyCcam',
          viewUrl: 'https://www.canva.com/d/wQaQofERHnNtBtn'
        }
      }
    },
    'stickers-farmers-market-label-stickers': {
      image: 'assets/images/shop/canva-test/stickers-farmers-market-label-stickers-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-farmers-market-label-stickers-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/6VM8zfYcrB8ccv3',
        artwork: 'https://www.canva.com/d/PvlO27-h0ZsBDVt'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-018',
        applied: {
          jobId: '48b1778b-5159-4f6c-bbab-34a3dc9d0dd8',
          candidateId: 'dg-c64b7d27-72c1-43c5-93b1-53051b9908de',
          designId: 'DAHLBCWHNvk',
          editUrl: 'https://www.canva.com/d/6VM8zfYcrB8ccv3',
          viewUrl: 'https://www.canva.com/d/HateKch_n5zwr5t'
        },
        artwork: {
          source: 'canva_search-designs',
          jobId: null,
          candidateId: null,
          designId: 'DAHLBM2FiGk',
          editUrl: 'https://www.canva.com/d/PvlO27-h0ZsBDVt',
          viewUrl: 'https://www.canva.com/d/VMpOu5zXBZFcbNC'
        }
      }
    },
    'stickers-gamer-quest-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-gamer-quest-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-gamer-quest-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/chz2KEaa8UslKEf',
        artwork: 'https://www.canva.com/d/IO4YFtTVZm2CPC-'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-020-existing-inventory',
        applied: {
          source: 'non-generating Canva owned-design search result',
          jobId: null,
          candidateId: null,
          designId: 'DAHLBYF1j7E',
          editUrl: 'https://www.canva.com/d/chz2KEaa8UslKEf',
          viewUrl: 'https://www.canva.com/d/ic6BKXNagt5yFUG'
        },
        artwork: {
          source: 'non-generating Canva owned-design search result',
          jobId: null,
          candidateId: null,
          designId: 'DAHLBUgChWU',
          editUrl: 'https://www.canva.com/d/IO4YFtTVZm2CPC-',
          viewUrl: 'https://www.canva.com/d/RKVO-XQzYCgV6X8'
        }
      }
    },
    'tech-decals-podcast-gear-label-decals': {
      image: 'assets/images/shop/canva-test/tech-decals-podcast-gear-label-decals-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/tech-decals-podcast-gear-label-decals-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/tfC7VJSQ1znpKXK',
        artwork: 'https://www.canva.com/d/Eh99LNbxE0eAsFr'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-037-podcast-gear-existing-canva',
        applied: {
          source: 'existing owned Canva design signed document-export thumbnail',
          designId: 'DAHLA5eXAyA',
          editUrl: 'https://www.canva.com/d/tfC7VJSQ1znpKXK',
          viewUrl: 'https://www.canva.com/d/aMvNXaMvH5yhElw',
          sourceSha256: '121AB17287E1E41FC88B5B06B5B98944EC2E5954E3AAAFFD3A21610D136A77F9'
        },
        artwork: {
          source: 'existing owned Canva design signed document-export thumbnail',
          designId: 'DAHLA8cr27k',
          editUrl: 'https://www.canva.com/d/Eh99LNbxE0eAsFr',
          viewUrl: 'https://www.canva.com/d/7QKrTUiT89tcchn',
          sourceSha256: '8C048882E922FA680D63111D4A18FEDA9267561276C2201ABB0EEE7AE0532C92'
        }
      }
    },
    'stickers-name-label-school-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-name-label-school-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-name-label-school-sticker-pack-artwork.svg',
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-037-name-label-school-existing-canva',
        applied: {
          source: 'existing owned Canva thumbnail saved by C2 in review_work',
          jobId: null,
          candidateId: null,
          designId: null,
          editUrl: null,
          viewUrl: null,
          sourceSha256: 'D1D8791691AC9384DEDBC7EB59FD1DF56C2B5E4AC96B54242FF1257FDDD40607'
        },
        artwork: {
          source: 'C1 crop of existing owned Canva thumbnail removing incorrect five-pack headline/footer while retaining the product-photo sticker composition',
          jobId: null,
          candidateId: null,
          designId: null,
          editUrl: null,
          viewUrl: null,
          sourceSha256: 'A7DD35CBAB645C82063B9BCB7DDDA9B71FBAAA1623A922F0A415A6F10700549E',
          originalSourceSha256: 'BA8C147B7D9E915077FAD1EAD5D52DE154728B073DD7F4E06C31B3BBD677B5FF'
        }
      }
    },
    'stickers-goth-garden-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-goth-garden-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-goth-garden-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/MKIkeYzpssIvVk8',
        artwork: 'https://www.canva.com/d/kq2KmwKlDXuMysP'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-020-goth-garden',
        applied: {
          jobId: '0fef9886-2916-462b-8c82-a5623b6bbbf9',
          candidateId: 'dg-1cd5711f-9b8c-43d4-baa8-d0c0be581529',
          designId: 'DAHLBSqNPZ8',
          editUrl: 'https://www.canva.com/d/MKIkeYzpssIvVk8',
          viewUrl: 'https://www.canva.com/d/Aq7MBzE33FYcgrQ'
        },
        artwork: {
          jobId: 'c9baddd1-f7c8-47e5-92fb-ff675d17a7db',
          candidateId: 'dg-d662b9ab-5b25-44d3-b639-b02ca5076bf0',
          designId: 'DAHLBc7RTtM',
          editUrl: 'https://www.canva.com/d/kq2KmwKlDXuMysP',
          viewUrl: 'https://www.canva.com/d/zr5psTqu7emGY1d'
        }
      }
    },
    'stickers-graduation-cap-sticker-set': {
      image: 'assets/images/shop/canva-test/stickers-graduation-cap-sticker-set-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-graduation-cap-sticker-set-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/jn6fSNvh0Fcv3vw',
        artwork: 'https://www.canva.com/d/LwDGVZfa-XM_oSg'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-021-graduation-cap',
        applied: {
          jobId: 'b29eaf33-9370-4905-8159-1eaf527fc980',
          candidateId: 'dg-9291b4eb-7617-4303-937f-9568123fbceb',
          designId: 'DAHLBoGfQVs',
          editUrl: 'https://www.canva.com/d/jn6fSNvh0Fcv3vw',
          viewUrl: 'https://www.canva.com/d/G89QqUgKzNWLJSE'
        },
        artwork: {
          jobId: '31c7f8d3-7886-4be7-a6de-005a757667b3',
          candidateId: 'dg-127b3ce1-c20b-43a1-9a7a-c9e58292ac8e',
          designId: 'DAHLBq-hWc4',
          editUrl: 'https://www.canva.com/d/LwDGVZfa-XM_oSg',
          viewUrl: 'https://www.canva.com/d/5MEkZvXacAXL5Z9'
        }
      }
    },
    'stickers-handmade-with-care-sticker-roll': {
      image: 'assets/images/shop/canva-test/stickers-handmade-with-care-sticker-roll-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-handmade-with-care-sticker-roll-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/lClvun12KXql4_M',
        artwork: 'https://www.canva.com/d/t8JndgmAoUZdmFa'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-023-handmade-care',
        applied: {
          jobId: '420bb666-5c45-4e8f-89f5-53ea6e0f6c61',
          candidateId: 'dg-ada2897f-9905-468e-b5d4-cb8bf7e30be9',
          designId: 'DAHLBkhyWwg',
          editUrl: 'https://www.canva.com/d/lClvun12KXql4_M',
          viewUrl: 'https://www.canva.com/d/JpKZIZiRtfPTCqz'
        },
        artwork: {
          jobId: '42e9d4cd-371c-4297-96e2-3063ec366599',
          candidateId: 'dg-b61a40e2-85a1-4284-9862-b76adb181dbe',
          designId: 'DAHLBklgqAE',
          editUrl: 'https://www.canva.com/d/t8JndgmAoUZdmFa',
          viewUrl: 'https://www.canva.com/d/L5LPLyFKDOcxuLs'
        }
      }
    },
    'stickers-holiday-gift-tag-sticker-set': {
      image: 'assets/images/shop/canva-test/stickers-holiday-gift-tag-sticker-set-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-holiday-gift-tag-sticker-set-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/-0akB7KJQTANzbY',
        artwork: 'https://www.canva.com/d/KvUIapVEiMKe5iU'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-024-holiday-gift-tags',
        applied: {
          source: 'existing owned Canva design search result',
          jobId: null,
          candidateId: null,
          designId: 'DAHLBmDJrUY',
          editUrl: 'https://www.canva.com/d/-0akB7KJQTANzbY',
          viewUrl: 'https://www.canva.com/d/uL4hzMTwKZV0Aen'
        },
        artwork: {
          source: 'current-turn Canva generation',
          jobId: '927c990c-3b2f-4732-a2e8-f87327fa73a7',
          candidateId: 'dg-f688eb65-9626-47e1-8572-7ed505b940e3',
          designId: 'DAHLBooLbok',
          editUrl: 'https://www.canva.com/d/KvUIapVEiMKe5iU',
          viewUrl: 'https://www.canva.com/d/luckpFMFKIF-Eld'
        }
      }
    },
    'stickers-kawaii-snack-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-kawaii-snack-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-kawaii-snack-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/jG4xQa90adCrv1v',
        artwork: 'https://www.canva.com/d/YN_oiGuX3JMRMkB'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-025-kawaii-snack',
        applied: {
          source: 'current-turn Canva generation',
          jobId: '71c70118-0c3a-4952-8c5c-e932fb1b26bb',
          candidateId: 'dg-d7dbb386-fbd8-405b-a0f0-452046b66172',
          designId: 'DAHLBx7DDfE',
          editUrl: 'https://www.canva.com/d/jG4xQa90adCrv1v',
          viewUrl: 'https://www.canva.com/d/ZP53WBzCtl9EJ-s'
        },
        artwork: {
          source: 'current-turn Canva generation cropped product-photo area',
          jobId: '71c70118-0c3a-4952-8c5c-e932fb1b26bb',
          candidateId: 'dg-7e691d67-a2fd-4a39-aba7-18edec4fe368',
          designId: 'DAHLB8QQnk8',
          editUrl: 'https://www.canva.com/d/YN_oiGuX3JMRMkB',
          viewUrl: 'https://www.canva.com/d/wrPLZZsmJAJfWnW'
        }
      }
    },
    'home-decor-laundry-room-label-decal-set': {
      image: 'assets/images/shop/canva-test/home-decor-laundry-room-label-decal-set-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/home-decor-laundry-room-label-decal-set-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/vjGlPET20DZmVT2',
        artwork: 'https://www.canva.com/d/AKlns2Fjwzdwgg8'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-026-laundry-labels',
        applied: {
          source: 'current-turn Canva generation',
          jobId: 'b4ad5c15-e61b-424d-b64d-de8e7836a882',
          candidateId: 'dg-07a5b7aa-2433-4a28-a576-15489d49139a',
          designId: 'DAHLB8sZis8',
          editUrl: 'https://www.canva.com/d/vjGlPET20DZmVT2',
          viewUrl: 'https://www.canva.com/d/hB4dLatCL-zaISX'
        },
        artwork: {
          source: 'current-turn Canva generation',
          jobId: 'f8426ca5-2006-4c41-92e0-866bdacf3e1f',
          candidateId: 'dg-7f890d08-1f29-403e-9944-e9810567c42d',
          designId: 'DAHLB1Cfn84',
          editUrl: 'https://www.canva.com/d/AKlns2Fjwzdwgg8',
          viewUrl: 'https://www.canva.com/d/6EPyvwkyqZJOGf0'
        }
      }
    },
    'stickers-library-bookplate-sticker-set': {
      image: 'assets/images/shop/canva-test/stickers-library-bookplate-sticker-set-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-library-bookplate-sticker-set-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/yJ1UqqyafgwmKye',
        artwork: 'https://www.canva.com/d/5nkYpvi5YrW20v9'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-027-library-bookplate',
        applied: {
          source: 'existing owned Canva design search, signed document-export thumbnail',
          jobId: null,
          candidateId: null,
          designId: 'DAHLB9QZWw4',
          editUrl: 'https://www.canva.com/d/yJ1UqqyafgwmKye',
          viewUrl: 'https://www.canva.com/d/eB4U1H0eSxOPyhQ'
        },
        artwork: {
          source: 'existing owned Canva design search, cropped product-photo area from signed document-export thumbnail',
          jobId: null,
          candidateId: null,
          designId: 'DAHLByPdt2Q',
          editUrl: 'https://www.canva.com/d/5nkYpvi5YrW20v9',
          viewUrl: 'https://www.canva.com/d/p6AEeLDlL1H6CS4'
        }
      }
    },
    'stickers-logo-seal-sticker-roll-starter': {
      image: 'assets/images/shop/canva-test/stickers-logo-seal-sticker-roll-starter-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-logo-seal-sticker-roll-starter-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/xGIm0TMpA5uGV6M',
        artwork: 'https://www.canva.com/d/5-8-CVJKjftEH8O'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-028-logo-seal',
        applied: {
          source: 'existing owned Canva design search, signed document-export thumbnail',
          jobId: null,
          candidateId: null,
          designId: 'DAHLB6xHzGI',
          editUrl: 'https://www.canva.com/d/xGIm0TMpA5uGV6M',
          viewUrl: 'https://www.canva.com/d/G_HZ6XBi4p6xMQR'
        },
        artwork: {
          source: 'existing owned Canva design search, signed document-export thumbnail',
          jobId: null,
          candidateId: null,
          designId: 'DAHLB1xKXgo',
          editUrl: 'https://www.canva.com/d/5-8-CVJKjftEH8O',
          viewUrl: 'https://www.canva.com/d/iAvqGx3p-v1hgYH'
        }
      }
    },
    'stickers-mermaid-lagoon-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-mermaid-lagoon-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-mermaid-lagoon-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/CYwEa1T13b963Nj',
        artwork: 'https://www.canva.com/d/vJNDRnbQ5REYZyH'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-029-mermaid-lagoon',
        applied: {
          source: 'current-turn Canva generation',
          jobId: '9138cff0-8fe8-4a83-999d-8c879b519a8d',
          candidateId: 'dg-b656f055-6b55-435f-a697-e65f2e1f9b3c',
          designId: 'DAHLB4sLAjw',
          editUrl: 'https://www.canva.com/d/CYwEa1T13b963Nj',
          viewUrl: 'https://www.canva.com/d/0Y8I-u53J8vUza8'
        },
        artwork: {
          source: 'current-turn Canva generation',
          jobId: '0a9a79f5-e67d-448f-b388-91b694f07843',
          candidateId: 'dg-d7143f67-fab0-442f-a676-489ac7af678c',
          designId: 'DAHLB0V5NQE',
          editUrl: 'https://www.canva.com/d/vJNDRnbQ5REYZyH',
          viewUrl: 'https://www.canva.com/d/Nsb26IgayqVAOVl'
        }
      }
    },
    'stickers-motivational-mini-sticker-sheet': {
      image: 'assets/images/shop/canva-test/stickers-motivational-mini-sticker-sheet-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-motivational-mini-sticker-sheet-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/T2HMe30Q26mtmVC',
        artwork: 'https://www.canva.com/d/A_EJnIzRrWGul4d'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-030-motivational-mini',
        applied: {
          source: 'existing owned Canva design search, signed document-export thumbnail',
          jobId: null,
          candidateId: null,
          designId: 'DAHLCFsuYnY',
          editUrl: 'https://www.canva.com/d/T2HMe30Q26mtmVC',
          viewUrl: 'https://www.canva.com/d/BfppK5ljLrt2Zwq'
        },
        artwork: {
          source: 'owned Canva design edited in current turn; poster text/header removed in Canva and saved, then signed Canva manipulation thumbnail exported',
          jobId: null,
          candidateId: null,
          designId: 'DAHK_ofYgyI',
          editUrl: 'https://www.canva.com/d/A_EJnIzRrWGul4d',
          viewUrl: 'https://www.canva.com/d/448ZbfRpBpcCHCl'
        }
      }
    },
    'stickers-dark-academia-desk-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-dark-academia-desk-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-dark-academia-desk-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/YpYx46zoisrov6m',
        artwork: 'https://www.canva.com/d/HkRAb4Dd50BfUBM'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-011',
        applied: {
          jobId: '512f8b38-ad7f-4714-ad69-f2b1124e045c',
          candidateId: 'dg-e442be7d-c101-439d-ba0b-2d595a9c2e69',
          designId: 'DAHLA4JPuU8',
          editUrl: 'https://www.canva.com/d/YpYx46zoisrov6m',
          viewUrl: 'https://www.canva.com/d/_DEafFrkuLPL3jA'
        },
        artwork: {
          jobId: '025fb2ee-6e35-4c13-806a-405efa81942d',
          candidateId: 'dg-19b83ea1-a11a-45b7-8fae-a8aa02a065b3',
          designId: 'DAHLAxZwPPk',
          editUrl: 'https://www.canva.com/d/HkRAb4Dd50BfUBM',
          viewUrl: 'https://www.canva.com/d/YBzXekgu4k2DZmi'
        }
      }
    },
    'stickers-milestone-moment-sticker-bundle': {
      image: 'assets/images/shop/canva-test/stickers-milestone-moment-sticker-bundle-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-milestone-moment-sticker-bundle-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/-VDHHuJ5hqepTrq',
        artwork: 'https://www.canva.com/d/UHGpVGSoSaghQwB'
      }
    },
    'stickers-cottage-garden-bottle-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-cottage-garden-bottle-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-cottage-garden-bottle-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/VSiWa_JtpsLYUVN',
        artwork: 'https://www.canva.com/d/3j9tzmHqRYQaZiF'
      }
    },
    'stickers-maximalist-mood-sticker-sheet': {
      image: 'assets/images/shop/canva-test/stickers-maximalist-mood-sticker-sheet-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-maximalist-mood-sticker-sheet-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/t8dSUXMantnuKnA',
        artwork: 'https://www.canva.com/d/SVA-rwUVCkzNmcm'
      }
    },
    'stickers-custom-name-label-five-pack': {
      image: 'assets/images/shop/canva-test/stickers-custom-name-label-five-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-custom-name-label-five-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/0YSoW0ATVWuxdq3',
        artwork: 'https://www.canva.com/d/jY8WzGnjtkrcUHR'
      }
    },
    'stickers-teacher-reward-mega-sticker-sheet': {
      image: 'assets/images/shop/canva-test/stickers-teacher-reward-mega-sticker-sheet-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-teacher-reward-mega-sticker-sheet-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/OALalTP-A_4hf-f',
        artwork: 'https://www.canva.com/d/-QKVY7UIU25dV7Z'
      }
    },
    'stickers-allergy-alert-kids-sticker-set': {
      image: 'assets/images/shop/canva-test/stickers-allergy-alert-kids-sticker-set-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-allergy-alert-kids-sticker-set-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/aMQvIDRXYbiqKSE',
        artwork: 'https://www.canva.com/d/IRlZ8PaH_SD1vG7'
      }
    },
    'stickers-baby-shower-favor-stickers': {
      image: 'assets/images/shop/canva-test/stickers-baby-shower-favor-stickers-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-baby-shower-favor-stickers-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/FD6nDtHcYcizWAN',
        artwork: 'https://www.canva.com/d/uhW-9b_kAl8Z1yk'
      }
    },
    'stickers-bakery-box-label-sticker-set': {
      image: 'assets/images/shop/canva-test/stickers-bakery-box-label-sticker-set-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-bakery-box-label-sticker-set-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/CnPsaB-QffqjhcT',
        artwork: 'https://www.canva.com/d/Ef5OKjr6K8BqLAR'
      }
    },
    'mug-stickers-bakery-cup-label-decal-set': {
      image: 'assets/images/shop/canva-test/mug-stickers-bakery-cup-label-decal-set-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/mug-stickers-bakery-cup-label-decal-set-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/ts3qbXFCB7llor-',
        artwork: 'https://www.canva.com/d/F-Xkqa9af-N7xRF'
      }
    },
    'stickers-birthday-party-favor-stickers': {
      image: 'assets/images/shop/canva-test/stickers-birthday-party-favor-stickers-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-birthday-party-favor-stickers-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/3s0Rm00W6lWouHm',
        artwork: 'https://www.canva.com/d/ld7XHjtyujfmDPz'
      }
    },
    'stickers-campfire-weekend-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-campfire-weekend-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-campfire-weekend-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/RgasuIe_8xqsnPB',
        artwork: 'https://www.canva.com/d/_WedFcQXlAINdt4'
      }
    },
    'tech-decals-charger-label-sticker-set': {
      image: 'assets/images/shop/canva-test/tech-decals-charger-label-sticker-set-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/tech-decals-charger-label-sticker-set-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/smwtXAGDYfa7QhU',
        artwork: 'https://www.canva.com/d/ksyJurpPYznYVEk'
      }
    },
    'tech-decals-creator-studio-label-set': {
      image: 'assets/images/shop/canva-test/tech-decals-creator-studio-label-set-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/tech-decals-creator-studio-label-set-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/j_QtchyBOH32hzd',
        artwork: 'https://www.canva.com/d/ysrNDUQI-Cf26xu'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-014',
        applied: {
          jobId: 'ac8c18c5-ee2c-4b0c-9d33-c69f2daab895',
          candidateId: 'dg-2b204eef-f502-4d3d-bb4a-d04ce351643a',
          designId: 'DAHLAzFkPnY',
          editUrl: 'https://www.canva.com/d/j_QtchyBOH32hzd',
          viewUrl: 'https://www.canva.com/d/IRwHLkydHOHQPzv'
        },
        artwork: {
          jobId: '5381501a-4a7a-424f-8c8d-a0b402edb4d4',
          candidateId: 'dg-478728a8-8ab8-45fd-96d1-f92fea2cab0d',
          designId: 'DAHLA0Yy1Yk',
          editUrl: 'https://www.canva.com/d/ysrNDUQI-Cf26xu',
          viewUrl: 'https://www.canva.com/d/VKoRTdMlJB8P-bf'
        }
      }
    },
    'tech-decals-digital-sticker-bomb-laptop-pack': {
      image: 'assets/images/shop/canva-test/tech-decals-digital-sticker-bomb-laptop-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/tech-decals-digital-sticker-bomb-laptop-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/GQQu1ornhsZBXhQ',
        artwork: 'https://www.canva.com/d/8YfCqypCHB0TZvc'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-015',
        applied: {
          jobId: '17f3a08a-0b7f-436c-a76a-17b1dacb9fe4',
          candidateId: 'dg-8376c8db-cf82-4f1a-ada9-c63df9c2f6af',
          designId: 'DAHLA6QBYaM',
          editUrl: 'https://www.canva.com/d/GQQu1ornhsZBXhQ',
          viewUrl: 'https://www.canva.com/d/BPCxaAE5WMWpDDT'
        },
        artwork: {
          jobId: 'f8dfd4a6-ec84-4368-aea1-ed457a2896b1',
          candidateId: 'dg-2230a142-2178-4991-b286-1768f8364f61',
          designId: 'DAHLBHYNkZo',
          editUrl: 'https://www.canva.com/d/8YfCqypCHB0TZvc',
          viewUrl: 'https://www.canva.com/d/xtBHTMD8lw_KVtW'
        }
      }
    },
    'tech-decals-desk-cable-label-sticker-pack': {
      image: 'assets/images/shop/canva-test/tech-decals-desk-cable-label-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/tech-decals-desk-cable-label-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/nqHmLA72BvnAU0p',
        artwork: 'https://www.canva.com/d/HFGr2PYUIwI5rg6'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-012',
        applied: {
          jobId: 'f0a94cf0-0974-4020-a925-5b779d862ded',
          candidateId: 'dg-7ce1bc89-3a82-470b-b8bb-32a75b4df286',
          designId: 'DAHLAw8_wBA',
          editUrl: 'https://www.canva.com/d/nqHmLA72BvnAU0p',
          viewUrl: 'https://www.canva.com/d/VtARAslNhs0bcbi'
        },
        artwork: {
          jobId: '3a75347b-f582-4002-879b-5df94bbcc1a9',
          candidateId: 'dg-c27732e5-62c1-4d1c-814c-47b41bbeb550',
          designId: 'DAHLAyab7mA',
          editUrl: 'https://www.canva.com/d/HFGr2PYUIwI5rg6',
          viewUrl: 'https://www.canva.com/d/mJ1N6xZPdLe5tZP'
        }
      }
    },
    'stickers-chore-chart-sticker-sheet': {
      image: 'assets/images/shop/canva-test/stickers-chore-chart-sticker-sheet-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-chore-chart-sticker-sheet-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/uMR2UMj2CA2NSgA',
        artwork: 'https://www.canva.com/d/pXIekjFu4LzbXdU'
      },
      canvaTrace: {
        sourceBatch: '2026-05-28_batch-008',
        applied: {
          jobId: 'd737b479-8880-4d70-9e44-d9dd62f0eed2',
          candidateId: 'dg-7ba15bfc-2be5-4b24-9047-154ff98bede4',
          designId: 'DAHLAZ_3wAI',
          editUrl: 'https://www.canva.com/d/uMR2UMj2CA2NSgA',
          viewUrl: 'https://www.canva.com/d/M7B27o0ErbQxVWc'
        },
        artwork: {
          jobId: '253b61ac-26d1-454d-b5d0-f6d528e17c0e',
          candidateId: 'dg-28fbc472-e577-446e-9357-209f2070c1bf',
          designId: 'DAHLAZBE-QI',
          editUrl: 'https://www.canva.com/d/pXIekjFu4LzbXdU',
          viewUrl: 'https://www.canva.com/d/NvmkV8sMKHGWJdb'
        }
      }
    },
    'stickers-cheer-team-sticker-sheet': {
      image: 'assets/images/shop/canva-test/stickers-cheer-team-sticker-sheet-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-cheer-team-sticker-sheet-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/YdUkfzXP30MoXTn',
        artwork: 'https://www.canva.com/d/UGCpKF6ACV1xB6M'
      },
      canvaTrace: {
        sourceBatch: '2026-05-28_batch-007',
        applied: {
          jobId: '3d6d0b68-4cf2-4f1c-8a1e-b76befc8e52e',
          candidateId: 'dg-366250d3-c095-47cf-8e6f-90bff32ec50c',
          designId: 'DAHLAaDGRss',
          editUrl: 'https://www.canva.com/d/YdUkfzXP30MoXTn',
          viewUrl: 'https://www.canva.com/d/07Suqaut8LRfHPL'
        },
        artwork: {
          jobId: '878d6300-ef32-4a2f-9b6f-7185abe097bf',
          candidateId: 'dg-05972da9-0d2f-4e1a-9005-0af17d89aa90',
          designId: 'DAHLAbOzRPA',
          editUrl: 'https://www.canva.com/d/UGCpKF6ACV1xB6M',
          viewUrl: 'https://www.canva.com/d/YBkefY11jEoaiMp'
        }
      }
    },
    'stickers-cottage-garden-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-cottage-garden-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-cottage-garden-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/Mk5XVajluEPiiXO',
        artwork: 'https://www.canva.com/d/8r3m_lANWWyHDBz'
      },
      canvaTrace: {
        sourceBatch: '2026-05-28_batch-009',
        applied: {
          jobId: 'b37819d2-e68b-4dff-b694-a57ebf6537fc',
          candidateId: 'dg-5b8a49e3-31ec-4669-9fff-4bc0a887911f',
          designId: 'DAHLAQA1rqU',
          editUrl: 'https://www.canva.com/d/Mk5XVajluEPiiXO',
          viewUrl: 'https://www.canva.com/d/aA5lZut0IGvsQEh'
        },
        artwork: {
          jobId: '129e3245-ec77-4c32-9953-07c8de5f4a69',
          candidateId: 'dg-a6d1e799-1986-4280-8257-426c7b2c4c61',
          designId: 'DAHLAvjqbKc',
          editUrl: 'https://www.canva.com/d/8r3m_lANWWyHDBz',
          viewUrl: 'https://www.canva.com/d/S6fcVyoda9R2zPE'
        }
      }
    },
    'stickers-mushroom-forest-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-mushroom-forest-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-mushroom-forest-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/WGGdKGc1DMdO2Cg',
        artwork: 'https://www.canva.com/d/U9BhN-KLvi3uqPr'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-031-mushroom-forest',
        applied: {
          source: 'current-turn Canva generation converted to editable design, signed document-export thumbnail',
          jobId: 'd8f4ad6d-777c-401c-b6b9-85be627b6d6b',
          candidateId: 'dg-1f219950-9dc2-4c14-b7ea-97210ff48db2',
          designId: 'DAHLCFsuYnY',
          editUrl: 'https://www.canva.com/d/WGGdKGc1DMdO2Cg',
          viewUrl: 'https://www.canva.com/d/jjNAskIyqPexvs_',
          sourceSha256: '00EAB88F09FBCF07A139E92DBFE6C25A00D62C8647BAB45F0EF5DFF9B61213D7'
        },
        artwork: {
          source: 'current-turn Canva generation converted to editable design, signed document-export thumbnail',
          jobId: '445eaaea-a76c-401c-968c-a57d4a7250fa',
          candidateId: 'dg-3a43d576-f550-4221-90c2-99302cdc3c56',
          designId: 'DAHLCIqiqRk',
          editUrl: 'https://www.canva.com/d/U9BhN-KLvi3uqPr',
          viewUrl: 'https://www.canva.com/d/O5PeTfHojXfyXHb',
          sourceSha256: 'CA0C73830FFBEDD2FD49CB326B1CFBFF5BDBF4E94E5F9F6F927A895C1B06C505'
        }
      }
    },
    'stickers-unicorn-sparkle-sticker-pack': {
      image: 'assets/images/shop/canva-test/stickers-unicorn-sparkle-sticker-pack-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-unicorn-sparkle-sticker-pack-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/iyN9OHzGMVDEnhJ',
        artwork: 'https://www.canva.com/d/1tNTx4QlkdLBEdC'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-032-unicorn-sparkle',
        applied: {
          source: 'current-turn Canva generation converted to editable design, signed document-export thumbnail',
          jobId: 'be57dbe2-da60-4f75-b3c0-08f48010d1b0',
          candidateId: 'dg-c19b65ba-5ea1-404b-83de-0537ef169ff9',
          designId: 'DAHLCO3dp0Q',
          editUrl: 'https://www.canva.com/d/iyN9OHzGMVDEnhJ',
          viewUrl: 'https://www.canva.com/d/rgbD-Ri4r4tgnsQ',
          sourceSha256: '45507A82492F03FA71C81A5773C8E1BA16C191653DE7352B887528EF91395E9E'
        },
        artwork: {
          source: 'current-turn Canva generation converted to editable design, signed document-export thumbnail',
          jobId: '0dc9b20b-1277-4fdc-a2a1-c1a9f3cb1c0b',
          candidateId: 'dg-2a2537da-50f6-4aee-9a00-f1c3e119d8c5',
          designId: 'DAHLCO2Mmgw',
          editUrl: 'https://www.canva.com/d/1tNTx4QlkdLBEdC',
          viewUrl: 'https://www.canva.com/d/2UVtZATWo0c5qfX',
          sourceSha256: '20C9B5C8A9F49C6486AACF76C781A9DB1331C004EB57B00F0290D3062C60B3B9'
        }
      }
    },
    'stickers-sports-season-sticker-sheet': {
      image: 'assets/images/shop/canva-test/stickers-sports-season-sticker-sheet-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-sports-season-sticker-sheet-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/Wvued8p5-4_dOZw',
        artwork: 'https://www.canva.com/d/hnvDrrJ2ZZahVOT'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-033-sports-season',
        applied: {
          source: 'current-turn Canva generation converted to editable design, signed document-export thumbnail',
          jobId: '610b0733-4896-40f8-8227-65a4d924587a',
          candidateId: 'dg-7c5c6ef0-1ea7-4ca0-9fe2-ed7148a9391a',
          designId: 'DAHLCJ7DORw',
          editUrl: 'https://www.canva.com/d/Wvued8p5-4_dOZw',
          viewUrl: 'https://www.canva.com/d/_YkHFLpDDvUgRlH',
          sourceSha256: 'D6F86B8AF06FAC2A16AC08F8F47D4A8A6573686E5AA989F1E979A8F3B74553C6'
        },
        artwork: {
          source: 'current-turn Canva generation converted to editable design, signed document-export thumbnail',
          jobId: '9fb136aa-a769-4d0d-81d2-66f3aa05f877',
          candidateId: 'dg-bf973bd9-1530-4114-b1ed-08c31dcb5b50',
          designId: 'DAHLCBh0jcc',
          editUrl: 'https://www.canva.com/d/hnvDrrJ2ZZahVOT',
          viewUrl: 'https://www.canva.com/d/5OfVZBdqtPk3-5z',
          sourceSha256: '3E861C66A1C87416FD0E8FBC53FBB3421A38392233BB679326875B21F09E7F20'
        }
      }
    },
    'stickers-teacher-reward-sticker-sheet': {
      image: 'assets/images/shop/canva-test/stickers-teacher-reward-sticker-sheet-applied.svg',
      artworkImage: 'assets/images/shop/canva-test/stickers-teacher-reward-sticker-sheet-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/L34HFQdEMcAp7hc',
        artwork: 'https://www.canva.com/d/xyAWsBWbpVpdB4s'
      },
      canvaTrace: {
        sourceBatch: '2026-05-29_batch-036-teacher-reward-existing-canva',
        applied: {
          source: 'existing owned Canva design signed document-export thumbnail',
          designId: 'DAHLAMZoOPs',
          editUrl: 'https://www.canva.com/d/L34HFQdEMcAp7hc',
          viewUrl: 'https://www.canva.com/d/xIfwD4qY7eKgZss',
          sourceSha256: 'ACEEB3587FFB26275337604174B9B7E656F1E5DA297CCB59F480564F4EDCE5A4'
        },
        artwork: {
          source: 'existing owned Canva design signed document-export thumbnail cropped locally to remove non-product promo text',
          designId: 'DAHLAAazY6k',
          editUrl: 'https://www.canva.com/d/xyAWsBWbpVpdB4s',
          viewUrl: 'https://www.canva.com/d/n7q_qflybS-_vAq',
          sourceSha256: '58332FDA99F41E497D22048B262484AB0698EFF87A48F88D9E99AB2E83AAF10D'
        }
      }
    },
    'fleet-wrap-package': {
      image: 'assets/images/shop/generated/custom-services/fleet-wrap-package-applied.svg',
      artworkImage: 'assets/images/shop/generated/custom-services/fleet-wrap-package-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/0AyZRjXTD_Bzk-X',
        artwork: 'https://www.canva.com/d/a2SG2H0sWs7Mibh'
      }
    },
    'storefront-signage-starter': {
      image: 'assets/images/shop/generated/custom-services/storefront-signage-starter-applied.svg',
      artworkImage: 'assets/images/shop/generated/custom-services/storefront-signage-starter-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/sb0PwQk7KRw7old',
        artwork: 'https://www.canva.com/d/yf6C3BfWHT5NqbS'
      }
    },
    'food-truck-branding-kit': {
      image: 'assets/images/shop/generated/custom-services/food-truck-branding-kit-applied.svg',
      artworkImage: 'assets/images/shop/generated/custom-services/food-truck-branding-kit-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/KSMAy5I9LF8YmRX',
        artwork: 'https://www.canva.com/d/4_2G573tIwzxyfN'
      }
    },
    'window-graphics-decals': {
      image: 'assets/images/shop/generated/custom-services/window-graphics-decals-applied.svg',
      artworkImage: 'assets/images/shop/generated/custom-services/window-graphics-decals-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/X1iskQqzcjempw9',
        artwork: 'https://www.canva.com/d/uGu2UlhCcAWfyAK'
      }
    },
    'business-card-brochure-set': {
      image: 'assets/images/shop/generated/custom-services/business-card-brochure-set-applied.svg',
      artworkImage: 'assets/images/shop/generated/custom-services/business-card-brochure-set-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/rF8UUaJnnkm_ri0',
        artwork: 'https://www.canva.com/d/ZQbV0EcLlOvKVau'
      }
    },
    'banner-event-display-bundle': {
      image: 'assets/images/shop/generated/custom-services/banner-event-display-bundle-applied.svg',
      artworkImage: 'assets/images/shop/generated/custom-services/banner-event-display-bundle-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/0fnVkglxGy5Q6rh',
        artwork: 'https://www.canva.com/d/3qZsx1cAczwh0ua'
      }
    },
    'lobby-wall-graphics': {
      image: 'assets/images/shop/generated/custom-services/lobby-wall-graphics-applied.svg',
      artworkImage: 'assets/images/shop/generated/custom-services/lobby-wall-graphics-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/UUikta5reuWbrv3',
        artwork: 'https://www.canva.com/d/-T6jl6kjMmaABRW'
      }
    },
    'contractor-trailer-graphics': {
      image: 'assets/images/shop/generated/custom-services/contractor-trailer-graphics-applied.svg',
      artworkImage: 'assets/images/shop/generated/custom-services/contractor-trailer-graphics-artwork.svg',
      canvaDesigns: {
        applied: 'https://www.canva.com/d/41bSyPSdd3crOAm',
        artwork: 'https://www.canva.com/d/vhFDHKvqSkP6Wp5'
      }
    }
  };

  products.forEach(product => {
    const imageBase = 'assets/images/shop/generated/' + product.category + '/' + product.id;
    const canvaTestDeck = canvaTestDecks[product.id];
    product.image = canvaTestDeck?.image || imageBase + '-applied.svg';
    product.artworkImage = canvaTestDeck?.artworkImage || imageBase + '-artwork.svg';
    product.canvaDeck = Boolean(canvaTestDeck);
    if (canvaTestDeck?.canvaDesigns) product.canvaDesigns = canvaTestDeck.canvaDesigns;
    if (canvaTestDeck?.canvaTrace) product.canvaTrace = canvaTestDeck.canvaTrace;
    product.gallery = [
      {
        src: product.image,
        label: 'Applied',
        alt: product.name + ' shown applied in a realistic setting'
      },
      {
        src: product.artworkImage,
        label: 'Artwork',
        alt: product.name + ' standalone print-ready graphic'
      }
    ];
  });

  window.tridicoShopProducts = products;
})();
