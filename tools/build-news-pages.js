const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const siteBase = "https://danxz9.github.io/TridicoDesign.com_UpdateConcept1";
const facebookUrl = process.env.FACEBOOK_PAGE_URL || "https://www.facebook.com/TridicoDesignSolutionsLlc";
const today = "2026-05-14";
const importedFacebookPostsPath = path.join(repoRoot, "assets", "data", "news-facebook-posts.json");

const categories = [
  {
    label: "Vehicle Wraps",
    slug: "vehicle-wraps",
    description: "Vehicle wrap updates, fleet graphics, trailer graphics, decals, and mobile brand visibility.",
    servicePage: "vehicle-wraps.html",
  },
  {
    label: "Signage",
    slug: "signage",
    description: "Storefront signs, window graphics, wall graphics, banners, displays, and environmental signage.",
    servicePage: "signage.html",
  },
  {
    label: "Printing",
    slug: "printing",
    description: "Printed collateral, decals, marketing materials, banners, and production-ready brand pieces.",
    servicePage: "printing.html",
  },
  {
    label: "Branding",
    slug: "branding",
    description: "Logo systems, identity work, branded environments, launch packages, and design direction.",
    servicePage: "branding-materials.html",
  },
  {
    label: "Installations",
    slug: "installations",
    description: "On-site installation notes, surface preparation, finishing details, and before/after project updates.",
    servicePage: "installation.html",
  },
  {
    label: "Company Updates",
    slug: "company-updates",
    description: "Tridico Design announcements, shop updates, service notes, and business news.",
    servicePage: "about.html",
  },
  {
    label: "Behind the Scenes",
    slug: "behind-the-scenes",
    description: "Production process, install preparation, design checks, fabrication details, and project planning.",
    servicePage: "process.html",
  },
];

const tagLabels = [
  "fleet branding",
  "box truck",
  "semi truck",
  "pickup truck",
  "food truck",
  "storefront",
  "wall graphics",
  "decals",
  "banners",
  "design",
  "print",
  "install",
  "local business",
  "project spotlight",
  "before after",
];

const manualSource = {
  sourcePlatform: "manual",
  sourceLabel: "Tridico Design",
  sourceUrl: `${siteBase}/news/`,
};

const facebookSource = {
  sourcePlatform: "facebook",
  sourceLabel: "Facebook",
  sourceUrl: facebookUrl,
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeDate(date) {
  return new Date(date).toISOString();
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(relativePath, content) {
  const fullPath = path.join(repoRoot, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, "utf8");
  generatedFiles.push(relativePath.replace(/\\/g, "/"));
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readJsonIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function updateFile(relativePath, transform) {
  const fullPath = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(fullPath, "utf8");
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(fullPath, after, "utf8");
    generatedFiles.push(relativePath.replace(/\\/g, "/"));
  }
}

function pageUrl(pathname) {
  const cleaned = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteBase}${cleaned}`;
}

function assetUrl(src) {
  return `${siteBase}/${src.replace(/^\.\//, "")}`;
}

function image(id, src, width, height, alt, caption) {
  return {
    id,
    src,
    width,
    height,
    alt,
    caption,
  };
}

function createPost(input) {
  const category = categories.find((item) => item.label === input.category);
  if (!category) {
    throw new Error(`Unknown category: ${input.category}`);
  }

  const tags = input.tags || [];
  const tagSlugs = tags.map(slugify);
  const featuredImage = input.featuredImage;
  const source = input.sourcePlatform === "facebook" ? facebookSource : manualSource;
  const isImported = input.sourcePlatform === "facebook";
  const canonicalUrl = pageUrl(`/news/${input.slug}/`);
  const description = input.seoDescription || input.excerpt;

  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle,
    excerpt: input.excerpt,
    body: input.body.trim(),
    contentFormat: input.contentFormat,
    category: input.category,
    categorySlug: category.slug,
    tags,
    tagSlugs,
    topic: input.topic || input.category,
    serviceType: input.serviceType,
    projectType: input.projectType,
    industry: input.industry,
    location: input.location || "Central Ohio",
    author: input.author || "Tridico Design",
    datePublished: normalizeDate(input.datePublished),
    dateUpdated: input.dateUpdated ? normalizeDate(input.dateUpdated) : undefined,
    dateImported: isImported ? normalizeDate(input.dateImported || today) : undefined,
    readingTime: input.readingTime || "2 min read",
    featuredImage,
    thumbnailImage: input.thumbnailImage || featuredImage,
    images: input.images || [featuredImage].filter(Boolean),
    source: input.source || source.sourcePlatform,
    sourcePlatform: source.sourcePlatform,
    sourceLabel: input.sourceLabel || source.sourceLabel,
    sourcePageName: input.sourcePageName,
    sourceUrl: input.sourceUrl || source.sourceUrl,
    sourcePostId: input.sourcePostId,
    sourceContentHash: input.sourceContentHash,
    relatedPostIds: input.relatedPostIds || [],
    priority: input.priority || 50,
    popularityScore: input.popularityScore || input.priority || 50,
    isFeatured: Boolean(input.isFeatured),
    isPinned: Boolean(input.isPinned),
    isTrending: Boolean(input.isTrending),
    isImported,
    status: input.status || "published",
    seo: {
      title: input.seoTitle || `${input.title} | Tridico Design News`,
      description,
      canonicalUrl,
      ogImage: featuredImage ? assetUrl(featuredImage.src) : undefined,
      noindex: false,
      structuredDataType: input.structuredDataType || "Article",
    },
    importMeta: isImported
      ? {
          isImported: true,
          sourcePlatform: "facebook",
          sourcePageName: "Tridico Design",
          sourceUrl: input.sourceUrl || facebookUrl,
          sourcePostId: input.sourcePostId,
          sourceContentHash: input.sourceContentHash || input.contentHash,
          dateImported: normalizeDate(input.dateImported || today),
          lastSeenAt: normalizeDate(input.lastSeenAt || today),
          originalPublishedAt: normalizeDate(input.datePublished),
          datePublishedIsApproximate: Boolean(input.datePublishedIsApproximate),
          importNotes:
            "Public Tridico-owned project update represented in the local Tridico News design with source attribution. No private data, tokens, logins, API access, or external embeds are used.",
        }
      : undefined,
    contentHash: input.contentHash || `${input.sourcePlatform || "manual"}-${input.slug}`,
  };
}

const posts = [
  createPost({
    id: "news_2026_05_10_honda_passport_rally_wrap",
    slug: "honda-passport-rally-vehicle-wrap",
    title: "Honda Passport Rally Vehicle Wrap Built for Trail Visibility",
    subtitle: "A project spotlight on bold vehicle graphics with outdoor-ready impact.",
    excerpt:
      "A Honda Passport wrap project shows how scale, contrast, and clean install details turn a vehicle into a moving brand moment.",
    body: `
This project update highlights a Honda Passport rally wrap designed to read quickly in motion and hold up visually in outdoor settings. The design uses a strong color story, large graphic fields, and clear vehicle contours so the finished wrap feels integrated with the body lines instead of simply placed on top.

For Tridico, vehicle wrap work starts with the viewing distance and surface geometry. Door breaks, handles, wheel arches, and curves all affect where brand marks and visual energy should land. The result needs to look intentional from a distance while staying clean up close.

This type of project is useful for businesses that want their vehicle to act as both transportation and a high-value brand surface. A wrap can support events, field work, service routes, dealership promotions, and everyday local visibility without relying on a temporary sign setup.
`,
    contentFormat: "social-import",
    category: "Vehicle Wraps",
    tags: ["fleet branding", "decals", "project spotlight", "before after"],
    serviceType: "Vehicle Wraps",
    projectType: "Specialty Vehicle Wrap",
    industry: "Automotive",
    datePublished: "2026-05-10T09:00:00-04:00",
    readingTime: "3 min read",
    featuredImage: image(
      "img_honda_passport_rally_hero",
      "assets/images/work/honda-passport-rally-vehicle-wrap-01-forest-trail.jpg",
      2048,
      1365,
      "Honda Passport with rally-inspired Tridico vehicle wrap on a forest trail.",
      "A high-visibility vehicle wrap project from Tridico Design."
    ),
    images: [
      image(
        "img_honda_passport_rally_hero",
        "assets/images/work/honda-passport-rally-vehicle-wrap-01-forest-trail.jpg",
        2048,
        1365,
        "Honda Passport with rally-inspired Tridico vehicle wrap on a forest trail.",
        "A high-visibility vehicle wrap project from Tridico Design."
      ),
      image(
        "img_honda_passport_rally_action",
        "assets/images/work/honda-passport-rally-vehicle-wrap-04-action-side.jpg",
        1080,
        608,
        "Side view of Honda Passport rally vehicle graphics in motion.",
        "Side graphics designed for quick recognition."
      ),
      image(
        "img_honda_passport_rally_collage",
        "assets/images/work/honda-passport-rally-vehicle-wrap-06-event-collage.jpg",
        1080,
        1080,
        "Collage of Honda Passport wrap details and event-ready graphics.",
        "Wrap details and finished views."
      ),
    ],
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-honda-passport-rally-wrap",
    sourceContentHash: "facebook-honda-passport-rally-wrap-2026-05-10",
    isPinned: true,
    isFeatured: true,
    isTrending: true,
    priority: 100,
    popularityScore: 96,
    relatedPostIds: [
      "news_2026_04_29_jacobs_restoration_fleet_wrap",
      "news_2026_05_02_cookie_dough_food_trailer",
      "news_2026_04_19_fleet_wrap_rollout",
    ],
  }),
  createPost({
    id: "news_2026_05_07_sbc_brewing_branding",
    slug: "sbc-brewing-company-interior-and-window-branding",
    title: "SBC Brewing Company Branding Carries From Windows to Interior Graphics",
    subtitle: "A visual system for a hospitality space with public-facing storefront impact.",
    excerpt:
      "Window graphics, interior brand moments, and clean production details help SBC Brewing Company feel consistent from street view to guest experience.",
    body: `
SBC Brewing Company needed visual pieces that could work at more than one distance. Storefront windows need to be legible from outside, while interior graphics should support the mood of the space without overwhelming the room.

The Tridico approach connects brand expression, material choice, print production, and installation planning. The goal is a finished system that looks intentional from the sidewalk, from the entry, and from inside the business.

For restaurants, breweries, retail storefronts, and hospitality spaces, the best graphics often do more than decorate. They guide attention, reinforce identity, and make the location feel finished on opening day and every day after.
`,
    contentFormat: "social-import",
    category: "Branding",
    tags: ["storefront", "wall graphics", "design", "install", "local business", "project spotlight"],
    serviceType: "Branding",
    projectType: "Storefront Brand System",
    industry: "Food and Beverage",
    datePublished: "2026-05-07T09:00:00-04:00",
    readingTime: "3 min read",
    featuredImage: image(
      "img_sbc_brewing_cover",
      "assets/images/work/sbc-brewing-company-01-cover.jpg",
      2048,
      1536,
      "SBC Brewing Company branded window and interior graphics by Tridico Design.",
      "Storefront and interior branding for SBC Brewing Company."
    ),
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-sbc-brewing-branding",
    sourceContentHash: "facebook-sbc-brewing-branding-2026-05-07",
    isFeatured: true,
    isTrending: true,
    priority: 94,
    popularityScore: 91,
    relatedPostIds: [
      "news_2026_04_24_honda_used_car_window_graphics",
      "news_2026_05_03_hidden_creek_sign",
      "news_2026_04_21_storefront_signage_checklist",
    ],
  }),
  createPost({
    id: "news_2026_05_03_hidden_creek_sign",
    slug: "hidden-creek-landscaping-sign",
    title: "Hidden Creek Landscaping Signage Designed for Clear Local Recognition",
    excerpt:
      "A signage project for Hidden Creek Landscaping shows how clean hierarchy and durable production help a local brand get noticed.",
    body: `
A strong sign has to work quickly. For Hidden Creek Landscaping, the priority was readable branding, a polished finish, and a visual presence that fits a service business seen by customers in the real world.

Tridico signage projects bring design, print or fabrication, material planning, and installation details into one workflow. That reduces the chance of a sign looking good on screen but losing clarity once it is produced and placed.

For local service businesses, signage is often the first impression before anyone speaks to the company. Clear identity, strong contrast, and correct scale make the difference between a sign that simply exists and a sign that works.
`,
    contentFormat: "social-import",
    category: "Signage",
    tags: ["storefront", "banners", "design", "local business", "project spotlight"],
    serviceType: "Signage",
    projectType: "Exterior Signage",
    industry: "Local Services",
    datePublished: "2026-05-03T09:00:00-04:00",
    readingTime: "2 min read",
    featuredImage: image(
      "img_hidden_creek_sign",
      "assets/images/work/hidden-creek-landscaping-sign-01-cover.jpg",
      2012,
      2048,
      "Hidden Creek Landscaping sign produced by Tridico Design.",
      "Signage project for Hidden Creek Landscaping."
    ),
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-hidden-creek-sign",
    sourceContentHash: "facebook-hidden-creek-sign-2026-05-03",
    isFeatured: true,
    priority: 90,
    popularityScore: 88,
    relatedPostIds: [
      "news_2026_04_28_honda_performance_zone_display",
      "news_2026_04_24_honda_used_car_window_graphics",
      "news_2026_04_21_storefront_signage_checklist",
    ],
  }),
  createPost({
    id: "news_2026_05_02_cookie_dough_food_trailer",
    slug: "cookie-dough-food-trailer-wrap",
    title: "Cookie Dough Food Trailer Wrap Turns a Mobile Setup Into a Brand Destination",
    excerpt:
      "A food trailer wrap pairs expressive graphics with practical readability for customers approaching from across an event or parking lot.",
    body: `
Food trailers need to do more than look fun. They need to communicate what is being sold, make the line easy to find, and create a memorable image that people can recognize again later.

This trailer wrap uses large-scale graphics, clear panels, and a brand-forward composition that works from multiple angles. Tridico's production and install process keeps the finished result aligned with the trailer shape and daily use.

For mobile food businesses, a wrap can become the storefront. It supports social photos, event discovery, repeat recognition, and a more professional customer experience at every stop.
`,
    contentFormat: "social-import",
    category: "Vehicle Wraps",
    tags: ["food truck", "decals", "design", "install", "local business", "project spotlight"],
    serviceType: "Vehicle Wraps",
    projectType: "Food Trailer Wrap",
    industry: "Food and Beverage",
    datePublished: "2026-05-02T09:00:00-04:00",
    readingTime: "2 min read",
    featuredImage: image(
      "img_cookie_dough_trailer",
      "assets/images/work/cookie-dough-food-trailer-wrap-01-cover.jpg",
      1936,
      1244,
      "Cookie dough food trailer wrapped with bold Tridico-designed graphics.",
      "Food trailer graphics designed for event visibility."
    ),
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-cookie-dough-food-trailer",
    sourceContentHash: "facebook-cookie-dough-food-trailer-2026-05-02",
    isTrending: true,
    priority: 84,
    popularityScore: 87,
    relatedPostIds: [
      "news_2026_05_10_honda_passport_rally_wrap",
      "news_2026_04_25_honda_marysville_trailer_graphics",
      "news_2026_04_19_fleet_wrap_rollout",
    ],
  }),
  createPost({
    id: "news_2026_04_30_polaris_brand_identity",
    slug: "polaris-wealth-management-brand-identity",
    title: "Polaris Wealth Management Identity Work Built for Trust and Clarity",
    excerpt:
      "Brand identity work for Polaris Wealth Management focuses on a polished visual system that can carry across print, signage, and digital touchpoints.",
    body: `
Professional-service brands need to feel stable before a customer reads a full paragraph. The Polaris Wealth Management identity work centers on a refined mark, clean presentation, and a system that can scale across business materials.

Tridico branding projects are built with production in mind. A logo or identity system should work on printed collateral, signage, apparel, office graphics, vehicle applications, and digital placements without losing clarity.

The value is not just a single graphic. It is a consistent visual foundation that helps every future piece of communication look like it belongs to the same business.
`,
    contentFormat: "social-import",
    category: "Branding",
    tags: ["design", "print", "local business", "project spotlight"],
    serviceType: "Branding",
    projectType: "Brand Identity",
    industry: "Professional Services",
    datePublished: "2026-04-30T09:00:00-04:00",
    readingTime: "3 min read",
    featuredImage: image(
      "img_polaris_brand_identity",
      "assets/images/work/polaris-wealth-management-brand-identity.jpg",
      1500,
      1125,
      "Polaris Wealth Management brand identity materials by Tridico Design.",
      "Brand identity work for Polaris Wealth Management."
    ),
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-polaris-brand-identity",
    sourceContentHash: "facebook-polaris-brand-identity-2026-04-30",
    priority: 80,
    popularityScore: 82,
    relatedPostIds: [
      "news_2026_05_07_sbc_brewing_branding",
      "news_2026_04_26_sat_track_print_marketing",
      "news_2026_04_17_design_to_installation_checks",
    ],
  }),
  createPost({
    id: "news_2026_04_29_jacobs_restoration_fleet_wrap",
    slug: "jacobs-restoration-fleet-wrap",
    title: "Jacobs Restoration Fleet Wrap Keeps Service Vehicles Consistent",
    excerpt:
      "A fleet wrap update shows how consistent graphics help service vehicles feel like part of one professional system.",
    body: `
Fleet graphics are strongest when each vehicle feels connected to the same brand family. For Jacobs Restoration, the wrap approach emphasizes consistency, clear service recognition, and a finish that can stand up to daily work.

Tridico plans fleet work around repeatability. Colors, typography, vehicle placement, and production specs need to be controlled so each new vehicle can join the fleet without looking improvised.

This kind of wrap program is especially useful for restoration, construction, trades, delivery, and service companies whose vehicles are seen across job sites and neighborhoods every day.
`,
    contentFormat: "social-import",
    category: "Vehicle Wraps",
    tags: ["fleet branding", "box truck", "pickup truck", "decals", "local business", "project spotlight"],
    serviceType: "Vehicle Wraps",
    projectType: "Fleet Wrap",
    industry: "Construction",
    datePublished: "2026-04-29T09:00:00-04:00",
    readingTime: "2 min read",
    featuredImage: image(
      "img_jacobs_restoration_fleet",
      "assets/images/work/jacobs-restoration-fleet-wrap-01-cover.jpg",
      2048,
      1576,
      "Jacobs Restoration fleet vehicle wrap by Tridico Design.",
      "Consistent fleet graphics for a local service business."
    ),
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-jacobs-restoration-fleet-wrap",
    sourceContentHash: "facebook-jacobs-restoration-fleet-wrap-2026-04-29",
    isTrending: true,
    priority: 78,
    popularityScore: 89,
    relatedPostIds: [
      "news_2026_05_10_honda_passport_rally_wrap",
      "news_2026_04_27_advanced_basement_truck_wrap",
      "news_2026_04_19_fleet_wrap_rollout",
    ],
  }),
  createPost({
    id: "news_2026_04_28_honda_performance_zone_display",
    slug: "honda-performance-zone-pop-display",
    title: "Honda Performance Zone Display Brings Print and Signage Together",
    excerpt:
      "A point-of-purchase display project combines print production, structure, and visual hierarchy for a branded customer-facing zone.",
    body: `
Displays need to work in crowded environments. The Honda Performance Zone project uses a clear branded presence, strong print surfaces, and a structure that supports quick recognition inside a retail or event setting.

Tridico's role in display work includes design translation, production planning, print quality, and practical finishing details. Each part needs to hold up visually once installed, not just as a proof on a screen.

For businesses with showrooms, counters, retail spaces, or events, display graphics can focus attention and make a product or service area feel intentional.
`,
    contentFormat: "social-import",
    category: "Signage",
    tags: ["banners", "print", "design", "install", "project spotlight"],
    serviceType: "Signage",
    projectType: "Point of Purchase Display",
    industry: "Automotive",
    datePublished: "2026-04-28T09:00:00-04:00",
    readingTime: "2 min read",
    featuredImage: image(
      "img_honda_performance_zone_display",
      "assets/images/work/honda-performance-zone-pop-display-01-cover.jpg",
      1536,
      2048,
      "Honda Performance Zone point-of-purchase display produced by Tridico Design.",
      "Display graphics and signage for a branded retail zone."
    ),
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-honda-performance-zone-display",
    sourceContentHash: "facebook-honda-performance-zone-display-2026-04-28",
    priority: 76,
    popularityScore: 81,
    relatedPostIds: [
      "news_2026_05_03_hidden_creek_sign",
      "news_2026_04_26_sat_track_print_marketing",
      "news_2026_04_17_design_to_installation_checks",
    ],
  }),
  createPost({
    id: "news_2026_04_27_advanced_basement_truck_wrap",
    slug: "advanced-basement-solutions-truck-wrap",
    title: "Advanced Basement Solutions Truck Wrap Adds Job-Site Brand Visibility",
    excerpt:
      "A contractor truck wrap gives Advanced Basement Solutions a cleaner presence on the road, in neighborhoods, and at active job sites.",
    body: `
A contractor vehicle is often parked where potential customers can see it. For Advanced Basement Solutions, the truck wrap creates a clean brand impression while keeping the service message readable.

The design balances identity, contact clarity, and vehicle shape. Tridico's installation process also matters because wraps on work trucks have to handle daily use while still looking professional.

For contractors and trade businesses, truck graphics can turn routine travel and job-site parking into steady local visibility.
`,
    contentFormat: "social-import",
    category: "Vehicle Wraps",
    tags: ["pickup truck", "decals", "local business", "project spotlight"],
    serviceType: "Vehicle Wraps",
    projectType: "Contractor Truck Wrap",
    industry: "Construction",
    datePublished: "2026-04-27T09:00:00-04:00",
    readingTime: "2 min read",
    featuredImage: image(
      "img_advanced_basement_wrap",
      "assets/images/work/advanced-basement-solutions-contractor-truck-wrap.jpg",
      2048,
      1536,
      "Advanced Basement Solutions contractor truck wrap by Tridico Design.",
      "Contractor truck wrap for local service visibility."
    ),
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-advanced-basement-truck-wrap",
    sourceContentHash: "facebook-advanced-basement-truck-wrap-2026-04-27",
    priority: 74,
    popularityScore: 80,
    relatedPostIds: [
      "news_2026_04_29_jacobs_restoration_fleet_wrap",
      "news_2026_05_10_honda_passport_rally_wrap",
      "news_2026_04_19_fleet_wrap_rollout",
    ],
  }),
  createPost({
    id: "news_2026_04_26_sat_track_print_marketing",
    slug: "sat-track-gps-marketing-collateral",
    title: "Sat-Track GPS Marketing Collateral Keeps Sales Materials Consistent",
    excerpt:
      "Printed marketing collateral for Sat-Track GPS shows how sales pieces can carry a brand system beyond the screen.",
    body: `
Printed materials still matter when customers need something clear, portable, and easy to review. The Sat-Track GPS project focuses on a coordinated set of marketing pieces that feel connected to the same brand system.

Tridico print work balances design, production accuracy, paper or material choice, and finishing. Those details affect whether a piece feels temporary or trustworthy in a sales conversation.

For businesses with trade shows, sales meetings, product sheets, mailers, or leave-behind materials, print can support credibility when it is designed and produced as part of the larger brand.
`,
    contentFormat: "social-import",
    category: "Printing",
    tags: ["print", "design", "local business", "project spotlight"],
    serviceType: "Printing",
    projectType: "Marketing Collateral",
    industry: "Technology",
    datePublished: "2026-04-26T09:00:00-04:00",
    readingTime: "2 min read",
    featuredImage: image(
      "img_sat_track_print",
      "assets/images/work/sat-track-gps-print-marketing.jpg",
      1500,
      1125,
      "Sat-Track GPS printed marketing collateral designed and produced by Tridico Design.",
      "Printed collateral system for Sat-Track GPS."
    ),
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-sat-track-print-marketing",
    sourceContentHash: "facebook-sat-track-print-marketing-2026-04-26",
    priority: 72,
    popularityScore: 76,
    relatedPostIds: [
      "news_2026_04_30_polaris_brand_identity",
      "news_2026_04_28_honda_performance_zone_display",
      "news_2026_04_17_design_to_installation_checks",
    ],
  }),
  createPost({
    id: "news_2026_04_25_honda_marysville_trailer_graphics",
    slug: "honda-marysville-motorsports-trailer",
    title: "Honda Marysville Motorsports Trailer Graphics Built for Event Presence",
    excerpt:
      "Trailer graphics for Honda Marysville Motorsports give a large mobile surface the structure and polish needed for events and transport.",
    body: `
Trailers create a major brand surface, especially for motorsports, events, dealerships, and teams. The Honda Marysville Motorsports trailer graphics use scale and placement to make the brand readable while the trailer is parked or moving.

Large-format vehicle graphics require attention to panel seams, installation direction, viewing angles, and the way graphics interact with the trailer frame. Tridico plans these details before production so the finished piece looks controlled.

For organizations that travel to shows, races, events, or customer locations, trailer graphics can make the setup feel complete before any booth or table is built.
`,
    contentFormat: "social-import",
    category: "Vehicle Wraps",
    tags: ["semi truck", "fleet branding", "decals", "project spotlight"],
    serviceType: "Vehicle Wraps",
    projectType: "Trailer Graphics",
    industry: "Automotive",
    datePublished: "2026-04-25T09:00:00-04:00",
    readingTime: "2 min read",
    featuredImage: image(
      "img_honda_marysville_trailer",
      "assets/images/work/honda-marysville-motorsports-trailer-01-side.jpg",
      960,
      720,
      "Honda Marysville Motorsports trailer graphics installed by Tridico Design.",
      "Trailer graphics for event and transport visibility."
    ),
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-honda-marysville-trailer",
    sourceContentHash: "facebook-honda-marysville-trailer-2026-04-25",
    priority: 70,
    popularityScore: 74,
    relatedPostIds: [
      "news_2026_05_10_honda_passport_rally_wrap",
      "news_2026_05_02_cookie_dough_food_trailer",
      "news_2026_04_19_fleet_wrap_rollout",
    ],
  }),
  createPost({
    id: "news_2026_04_24_honda_used_car_window_graphics",
    slug: "honda-used-car-center-window-graphics",
    title: "Honda Used Car Center Window Graphics Improve Storefront Readability",
    excerpt:
      "Window graphics for the Honda Used Car Center help organize a glass storefront with clear branded messaging.",
    body: `
Window graphics can transform a blank glass surface into a useful communication area. For the Honda Used Car Center, the graphics support brand visibility while keeping the storefront clear and intentional.

Tridico window graphic projects consider sunlight, viewing distance, installation alignment, and how the graphic reads from both outside and inside. Good execution depends on the design and the install working together.

For dealerships, retail locations, offices, gyms, and service counters, window graphics can promote key messages without adding bulky fixtures to the space.
`,
    contentFormat: "social-import",
    category: "Installations",
    tags: ["storefront", "wall graphics", "decals", "install", "project spotlight"],
    serviceType: "Installations",
    projectType: "Window Graphics Installation",
    industry: "Automotive",
    datePublished: "2026-04-24T09:00:00-04:00",
    readingTime: "2 min read",
    featuredImage: image(
      "img_honda_used_car_window",
      "assets/images/work/honda-used-car-center-window-graphics-01-cover.jpg",
      960,
      720,
      "Honda Used Car Center window graphics installed by Tridico Design.",
      "Installed window graphics for a dealership storefront."
    ),
    sourcePlatform: "facebook",
    sourcePostId: "tridico-fb-honda-used-car-window-graphics",
    sourceContentHash: "facebook-honda-used-car-window-graphics-2026-04-24",
    priority: 68,
    popularityScore: 73,
    relatedPostIds: [
      "news_2026_05_07_sbc_brewing_branding",
      "news_2026_04_21_storefront_signage_checklist",
      "news_2026_04_17_design_to_installation_checks",
    ],
  }),
  createPost({
    id: "news_2026_04_21_storefront_signage_checklist",
    slug: "storefront-signage-prep-checklist",
    title: "Storefront Signage Prep Checklist Before Production Starts",
    excerpt:
      "A practical checklist for planning storefront signage so design, production, permitting, surfaces, and installation are aligned early.",
    body: `
A storefront sign project moves faster when the important details are known early. Dimensions, viewing distance, mounting surface, lighting, local requirements, and brand files all affect the final recommendation.

Before production starts, Tridico looks for practical constraints that can change the design. Glass, brick, metal, painted surfaces, installation height, power access, and landlord rules can all influence materials and placement.

The strongest signage projects begin with a clear goal: what the customer should notice, where they should look from, and what action the sign should support. That clarity helps the finished piece work as more than decoration.
`,
    contentFormat: "case-study",
    category: "Signage",
    tags: ["storefront", "banners", "design", "install", "local business"],
    serviceType: "Signage",
    projectType: "Planning Guide",
    industry: "Retail",
    datePublished: "2026-04-21T09:00:00-04:00",
    readingTime: "3 min read",
    featuredImage: image(
      "img_storefront_signage_prep",
      "assets/images/work/hidden-creek-landscaping-sign-01-cover.jpg",
      2012,
      2048,
      "Storefront signage example produced by Tridico Design.",
      "Storefront signage planning starts with measurements, material choices, and viewing distance."
    ),
    sourcePlatform: "manual",
    isTrending: true,
    priority: 82,
    popularityScore: 84,
    relatedPostIds: [
      "news_2026_05_03_hidden_creek_sign",
      "news_2026_04_24_honda_used_car_window_graphics",
      "news_2026_04_17_design_to_installation_checks",
    ],
  }),
  createPost({
    id: "news_2026_04_19_fleet_wrap_rollout",
    slug: "how-to-plan-a-fleet-wrap-rollout",
    title: "How to Plan a Fleet Wrap Rollout Without Losing Consistency",
    excerpt:
      "Fleet wrap rollouts work best when brand rules, vehicle templates, production specs, and installation timing are controlled from the start.",
    body: `
Fleet graphics can become inconsistent when each vehicle is treated like a separate project. A better rollout starts with a repeatable system for logo placement, colors, vehicle measurements, service messaging, and install scheduling.

Tridico plans fleet work around the vehicles already in use and the vehicles likely to be added later. That means the first design needs enough structure to repeat across trucks, vans, trailers, and different model years.

For growing businesses, consistency is not just a visual preference. It helps customers recognize the company faster, makes new vehicles easier to add, and keeps field teams looking professional across locations.
`,
    contentFormat: "case-study",
    category: "Vehicle Wraps",
    tags: ["fleet branding", "box truck", "pickup truck", "decals", "local business"],
    serviceType: "Vehicle Wraps",
    projectType: "Planning Guide",
    industry: "Local Services",
    datePublished: "2026-04-19T09:00:00-04:00",
    readingTime: "4 min read",
    featuredImage: image(
      "img_fleet_wrap_rollout",
      "assets/images/work/jacobs-restoration-fleet-wrap-01-cover.jpg",
      2048,
      1576,
      "Fleet vehicle wrap example produced by Tridico Design.",
      "Fleet wrap planning depends on repeatable graphics and controlled installation details."
    ),
    sourcePlatform: "manual",
    isTrending: true,
    priority: 86,
    popularityScore: 90,
    relatedPostIds: [
      "news_2026_04_29_jacobs_restoration_fleet_wrap",
      "news_2026_04_27_advanced_basement_truck_wrap",
      "news_2026_05_10_honda_passport_rally_wrap",
    ],
  }),
  createPost({
    id: "news_2026_04_18_connected_design_print_install",
    slug: "connected-design-print-installation-workflow",
    title: "Shop Update: One Workflow for Design, Print, and Installation",
    excerpt:
      "A company update on how Tridico keeps design intent, production details, and installation planning connected from the start.",
    body: `
Tridico projects often move across several practical stages: design, material selection, print production, finishing, and installation. Keeping those stages connected helps the final piece match the original goal instead of changing shape at every handoff.

That workflow matters for wraps, signage, branding materials, print collateral, and installed graphics. A design choice can affect production, a production detail can affect installation, and an install surface can affect how the artwork should be prepared.

The News and Project Updates section gives customers a clearer look at that process through recent project stories, planning notes, and public updates from Tridico Design.
`,
    contentFormat: "company-update",
    category: "Company Updates",
    tags: ["design", "print", "install", "local business"],
    serviceType: "Design",
    projectType: "Company Update",
    industry: "Local Services",
    datePublished: "2026-04-18T09:00:00-04:00",
    readingTime: "2 min read",
    featuredImage: image(
      "img_connected_design_print_install",
      "assets/images/work/sat-track-gps-print-marketing.jpg",
      1500,
      1125,
      "Printed marketing materials prepared as part of a connected Tridico production workflow.",
      "Tridico connects design, print production, and installation planning."
    ),
    sourcePlatform: "manual",
    priority: 78,
    popularityScore: 72,
    relatedPostIds: [
      "news_2026_04_17_design_to_installation_checks",
      "news_2026_04_26_sat_track_print_marketing",
      "news_2026_04_21_storefront_signage_checklist",
    ],
  }),
  createPost({
    id: "news_2026_04_17_design_to_installation_checks",
    slug: "from-design-to-installation-what-tridico-checks",
    title: "From Design to Installation: What Tridico Checks Before a Project Leaves the Shop",
    excerpt:
      "A behind-the-scenes look at the checks that connect design, print production, finishing, and installation quality.",
    body: `
The best finished graphics depend on decisions made before production. Tridico checks file quality, dimensions, material fit, surface conditions, color expectations, and installation requirements before a project leaves the shop.

Those checks help reduce surprises. A design may need different spacing for a vehicle curve, a sign may need different material for an outdoor setting, and a printed piece may need finishing that changes how the artwork should be prepared.

This design-to-installation process is one reason customers can bring one project to Tridico instead of coordinating separate design, print, and install vendors.
`,
    contentFormat: "company-update",
    category: "Behind the Scenes",
    tags: ["design", "print", "install", "before after"],
    serviceType: "Installations",
    projectType: "Process Note",
    industry: "Local Services",
    datePublished: "2026-04-17T09:00:00-04:00",
    readingTime: "3 min read",
    featuredImage: image(
      "img_design_install_checks",
      "assets/images/work/sat-track-gps-print-marketing.jpg",
      1500,
      1125,
      "Printed marketing materials prepared by Tridico Design before finishing.",
      "Quality checks connect design, production, and installation."
    ),
    sourcePlatform: "manual",
    priority: 88,
    popularityScore: 79,
    relatedPostIds: [
      "news_2026_04_21_storefront_signage_checklist",
      "news_2026_04_19_fleet_wrap_rollout",
      "news_2026_04_26_sat_track_print_marketing",
    ],
  }),
];

function normalizeImportedFacebookInput(input) {
  return {
    ...input,
    source: "facebook",
    sourcePlatform: "facebook",
    sourceLabel: input.sourceLabel || "Facebook",
    sourcePageName: input.sourcePageName || "Tridico Design",
    category: categories.some((category) => category.label === input.category) ? input.category : "Company Updates",
    tags: Array.isArray(input.tags) && input.tags.length ? input.tags : ["local business"],
    contentFormat: input.contentFormat || "social-import",
    author: input.author || "Tridico Design",
    sourceUrl: input.sourceUrl || facebookUrl,
    dateImported: input.dateImported || today,
    status: input.status || "published",
    readingTime: input.readingTime || "1 min read",
    featuredImage: input.featuredImage || input.images?.[0],
    thumbnailImage: input.thumbnailImage || input.featuredImage || input.images?.[0],
    images: Array.isArray(input.images) ? input.images : [input.featuredImage].filter(Boolean),
    sourceContentHash: input.sourceContentHash || input.contentHash,
    contentHash: input.contentHash || input.sourceContentHash,
  };
}

function loadImportedFacebookPosts() {
  const importedData = readJsonIfExists(importedFacebookPostsPath, { posts: [] });
  if (!Array.isArray(importedData.posts)) {
    return [];
  }

  return importedData.posts
    .filter((post) => post && post.slug && post.title && post.datePublished)
    .map((post) => createPost(normalizeImportedFacebookInput(post)));
}

posts.push(...loadImportedFacebookPosts());

function getPublishedPosts() {
  const seenSlugs = new Set();
  const seenSourceKeys = new Set();
  const result = [];

  for (const post of posts) {
    if (post.status !== "published") {
      continue;
    }

    const sourceKey = post.sourcePostId
      ? `${post.sourcePlatform}:${post.sourcePostId}`
      : post.contentHash;

    if (seenSlugs.has(post.slug) || seenSourceKeys.has(sourceKey)) {
      continue;
    }

    seenSlugs.add(post.slug);
    seenSourceKeys.add(sourceKey);
    result.push(post);
  }

  return result.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));
}

const publishedPosts = getPublishedPosts();
const tagRecords = tagLabels.map((label) => ({
  label,
  slug: slugify(label),
  description: `Updates tagged ${label}.`,
}));

const generatedFiles = [];

function prefixLocalUrls(html, prefix) {
  return html.replace(/\s(href|src)="([^"]+)"/g, (match, attr, url) => {
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:") ||
      url.startsWith("#") ||
      url.startsWith("data:") ||
      url.startsWith("javascript:")
    ) {
      return match;
    }

    return ` ${attr}="${prefix}${url}"`;
  });
}

function injectNewsNavigation(html, activeNews = false) {
  let output = html;

  if (!/href="news\/"/.test(output)) {
    output = output.replace(
      /(\s*<a class="nav-link" href="contact\.html">Contact<\/a>)/,
      `$1\n        <a class="nav-link" href="news/">News</a>`
    );
    output = output.replace(
      /(\s*<a href="contact\.html">Contact<\/a>)/,
      `$1\n      <a href="news/">News</a>`
    );
  }

  if (!/href="news\/">News<\/a><\/li>/.test(output)) {
    output = output.replace(
      /(\s*<li><a href="resources\.html">Resources<\/a><\/li>)/,
      `$1\n        <li><a href="news/">News</a></li>`
    );
  }

  if (activeNews) {
    output = output
      .replace(
        /<a class="nav-link" href="news\/">News<\/a>/g,
        `<a class="nav-link active" href="news/" aria-current="page">News</a>`
      )
      .replace(
        /<a href="news\/">News<\/a>/g,
        `<a class="active" href="news/" aria-current="page">News</a>`
      );
  }

  return output;
}

function getHeader(prefix, activeNews = true) {
  const indexHtml = readFile("index.html");
  const match = indexHtml.match(/<a class="skip-link"[\s\S]*?<\/header>/);
  if (!match) {
    throw new Error("Could not find site header in index.html");
  }

  return prefixLocalUrls(injectNewsNavigation(match[0], activeNews), prefix);
}

function getFooter(prefix) {
  const indexHtml = readFile("index.html");
  const match = indexHtml.match(/<footer class="site-footer"[\s\S]*?<\/footer>/);
  if (!match) {
    throw new Error("Could not find site footer in index.html");
  }

  return prefixLocalUrls(injectNewsNavigation(match[0], false), prefix);
}

function imageTag(img, prefix, className, loading = "lazy") {
  if (!img) {
    return "";
  }

  return `<img class="${className}" src="${prefix}${escapeHtml(img.src)}" width="${img.width}" height="${img.height}" alt="${escapeHtml(img.alt)}" loading="${loading}" decoding="async">`;
}

function postHref(post, prefix) {
  return `${prefix}news/${post.slug}/`;
}

function categoryHref(categorySlug, prefix) {
  return `${prefix}news/category/${categorySlug}/`;
}

function tagHref(tagSlug, prefix) {
  return `${prefix}news/tag/${tagSlug}/`;
}

function sourceHref(sourcePlatform, prefix) {
  return `${prefix}news/source/${sourcePlatform}/`;
}

function renderSourceBadge(post) {
  if (!post.isImported) {
    return `<span class="news-source-badge news-source-badge--manual">Tridico</span>`;
  }

  return `<span class="news-source-badge">Facebook</span>`;
}

function renderMeta(post, prefix) {
  const items = [
    `<a href="${categoryHref(post.categorySlug, prefix)}">${escapeHtml(post.category)}</a>`,
    `<time datetime="${escapeHtml(post.datePublished)}">${formatDate(post.datePublished)}</time>`,
    renderSourceBadge(post),
  ];

  if (post.serviceType) {
    items.push(`<span>${escapeHtml(post.serviceType)}</span>`);
  }

  return `<div class="news-meta">
    ${items.join("\n    ")}
  </div>`;
}

function renderCard(post, prefix, options = {}) {
  const variant = options.variant || "standard";
  const loading = options.loading || "lazy";
  const tagSummary = post.tags.join(" ");

  return `<article class="news-card news-card--${variant}" data-news-item data-category="${escapeHtml(post.categorySlug)}" data-source="${escapeHtml(post.sourcePlatform)}" data-tags="${escapeHtml(tagSummary)}" data-title="${escapeHtml(post.title)}" data-excerpt="${escapeHtml(post.excerpt)}" data-date="${escapeHtml(post.datePublished)}" data-priority="${post.priority || 0}">
    <a class="news-card__media" href="${postHref(post, prefix)}" aria-label="Read ${escapeHtml(post.title)}">
      ${imageTag(post.thumbnailImage || post.featuredImage, prefix, "news-card__image", loading)}
    </a>
    <div class="news-card__body">
      ${renderMeta(post, prefix)}
      <h3><a href="${postHref(post, prefix)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.excerpt)}</p>
      <div class="news-card__tags" aria-label="Tags">
        ${post.tags.slice(0, 3).map((tag) => `<a href="${tagHref(slugify(tag), prefix)}">${escapeHtml(tag)}</a>`).join("")}
      </div>
    </div>
  </article>`;
}

function renderCompactCard(post, prefix) {
  return `<article class="news-compact-card">
    <a class="news-compact-card__media" href="${postHref(post, prefix)}" aria-label="Read ${escapeHtml(post.title)}">
      ${imageTag(post.thumbnailImage || post.featuredImage, prefix, "news-compact-card__image", "lazy")}
    </a>
    <div>
      <div class="news-compact-card__meta">${escapeHtml(post.category)} &middot; ${formatDate(post.datePublished)}</div>
      <h3><a href="${postHref(post, prefix)}">${escapeHtml(post.title)}</a></h3>
    </div>
  </article>`;
}

function renderTopicNav(prefix, activeSlug = "all") {
  const chips = [
    { label: "All", slug: "all", href: `${prefix}news/` },
    ...categories.map((category) => ({
      label: category.label,
      slug: category.slug,
      href: categoryHref(category.slug, prefix),
    })),
  ];

  return `<nav class="news-topic-nav" aria-label="News topics">
    <div class="container news-topic-nav__inner">
      ${chips
        .map((chip) => {
          const active = chip.slug === activeSlug;
          return `<a class="news-chip${active ? " active" : ""}" href="${chip.href}"${active ? ` aria-current="page"` : ""}>${escapeHtml(chip.label)}</a>`;
        })
        .join("")}
    </div>
  </nav>`;
}

function renderFilterBar(prefix, postsForCount, searchPage = false) {
  return `<form class="news-filter-bar" data-news-filter${searchPage ? ` data-news-search-page="true"` : ""} role="search" action="${prefix}news/search/" method="get">
    <div class="news-field news-field--search">
      <label for="news-search-input">Search updates</label>
      <input id="news-search-input" name="q" type="search" placeholder="Search wraps, signage, print, branding..." data-news-search autocomplete="off">
    </div>
    <div class="news-field">
      <label for="news-category-filter">Category</label>
      <select id="news-category-filter" data-news-category>
        <option value="all">All categories</option>
        ${categories.map((category) => `<option value="${category.slug}">${escapeHtml(category.label)}</option>`).join("")}
      </select>
    </div>
    <div class="news-field">
      <label for="news-source-filter">Source</label>
      <select id="news-source-filter" data-news-source>
        <option value="all">All sources</option>
        <option value="manual">Tridico authored</option>
        <option value="facebook">Public page updates</option>
      </select>
    </div>
    <div class="news-field">
      <label for="news-sort-filter">Sort</label>
      <select id="news-sort-filter" data-news-sort>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="featured">Featured first</option>
      </select>
    </div>
    <div class="news-filter-actions">
      <button class="btn btn-primary" type="submit">Search</button>
      <button class="btn btn-outline" type="button" data-news-reset>Reset</button>
    </div>
    <p class="news-result-count" data-news-count aria-live="polite">Showing ${postsForCount.length} updates</p>
  </form>`;
}

function renderSidebar(prefix) {
  const popular = [...publishedPosts]
    .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
    .slice(0, 4);

  return `<aside class="news-sidebar" aria-label="News sidebar">
    <section class="news-sidebar-module">
      <h2>Popular Updates</h2>
      <div class="news-compact-list">
        ${popular.map((post) => renderCompactCard(post, prefix)).join("")}
      </div>
    </section>
    <section class="news-sidebar-module">
      <h2>Project Categories</h2>
      <ul class="news-category-list">
        ${categories
          .map((category) => {
            const count = publishedPosts.filter((post) => post.categorySlug === category.slug).length;
            return `<li><a href="${categoryHref(category.slug, prefix)}"><span>${escapeHtml(category.label)}</span><strong>${count}</strong></a></li>`;
          })
          .join("")}
      </ul>
    </section>
    <section class="news-sidebar-module news-sidebar-module--follow">
      <h2>Follow Tridico</h2>
      <p>See public project updates and shop notes from Tridico Design on Facebook.</p>
      <a class="btn btn-outline" href="${facebookUrl}" target="_blank" rel="noopener noreferrer">Open Facebook</a>
    </section>
    <section class="news-sidebar-module news-sidebar-module--quote">
      <h2>Request a Quote</h2>
      <p>Bring a wrap, sign, print, branding, or installation idea into one clear production process.</p>
      <a class="btn btn-primary" href="${prefix}quote.html">Start a Project</a>
    </section>
  </aside>`;
}

function renderLoadMore(total) {
  return `<div class="news-load-more-wrap">
    <button class="btn btn-outline btn-large" type="button" data-news-load-more data-total="${total}">Load more updates</button>
  </div>`;
}

function renderEmptyState(prefix) {
  return `<div class="news-empty-state" data-news-empty hidden>
    <h2>No matching updates yet</h2>
    <p>Try a different search, reset the filters, or browse project categories.</p>
    <div class="news-empty-actions">
      <a class="btn btn-primary" href="${prefix}news/">All News</a>
      <a class="btn btn-outline" href="${prefix}work.html">View Work</a>
    </div>
  </div>`;
}

function renderFooterCta(prefix) {
  return `<section class="news-footer-cta">
    <div class="container news-footer-cta__inner">
      <div>
        <p class="kicker">Seen enough to plan the next project?</p>
        <h2>Start with the wrap, sign, print piece, brand system, or installation you need finished.</h2>
      </div>
      <div class="news-footer-cta__actions">
        <a class="btn btn-primary btn-large" href="${prefix}quote.html">Start a Project</a>
        <a class="btn btn-outline btn-large" href="${prefix}work.html">View Work</a>
      </div>
    </div>
  </section>`;
}

function renderHeadLinks(prefix) {
  return `<link rel="shortcut icon" href="${prefix}favicon.ico" type="image/x-icon">
  <link rel="icon" href="${prefix}favicon.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png">
  <link rel="manifest" href="${prefix}site.webmanifest">
  <link rel="preload" href="${prefix}assets/css/styles.css" as="style">
  <link rel="stylesheet" href="${prefix}assets/css/styles.css">
  <link rel="stylesheet" href="${prefix}assets/css/news.css">
  <link rel="stylesheet" href="${prefix}assets/css/support-assistant.css">`;
}

function pageTemplate({
  prefix,
  title,
  description,
  canonical,
  bodyClass,
  main,
  ogImage,
  noindex = false,
  structuredData = [],
}) {
  const robots = noindex ? `\n  <meta name="robots" content="noindex,follow">` : "";
  const structured = structuredData.length
    ? `\n  <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#050505">
  <link rel="canonical" href="${escapeHtml(canonical)}">${robots}
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ""}
  ${renderHeadLinks(prefix)}${structured}
</head>
<body class="${escapeHtml(bodyClass)}">
${getHeader(prefix, true)}
${main}
${getFooter(prefix)}
<script src="${prefix}assets/js/app.js" defer></script>
<script src="${prefix}assets/js/news.js" defer></script>
<script src="${prefix}assets/js/support-assistant.js" defer></script>
</body>
</html>
`;
}

function buildFeaturedGrid(prefix) {
  const featured = [...publishedPosts]
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
      if (a.isFeatured !== b.isFeatured) return b.isFeatured - a.isFeatured;
      return (b.priority || 0) - (a.priority || 0);
    })
    .slice(0, 3);

  const [lead, ...secondary] = featured;

  return `<section class="news-section news-featured-section" aria-labelledby="featured-updates-heading">
    <div class="container">
      <div class="news-section-heading">
        <div>
          <p class="kicker">Featured Updates</p>
          <h2 id="featured-updates-heading">Recent project stories worth a closer look.</h2>
        </div>
        <a class="news-inline-link" href="${prefix}news/projects/">Browse project updates</a>
      </div>
      <div class="featured-news-grid">
        ${renderCard(lead, prefix, { variant: "lead", loading: "eager" })}
        <div class="featured-news-grid__secondary">
          ${secondary.map((post) => renderCard(post, prefix, { variant: "secondary", loading: "lazy" })).join("")}
        </div>
      </div>
    </div>
  </section>`;
}

function renderNewsLanding() {
  const prefix = "../";
  const latest = publishedPosts;
  const lead = publishedPosts[0];

  const main = `<main id="main" class="news-main">
  <section class="news-hero-band">
    <div class="container news-hero-grid">
      <div class="news-hero-copy">
        <p class="kicker">News</p>
        <h1>News &amp; Project Updates</h1>
        <p class="news-hero-lede">Recent wraps, signage, branding, print work, installations, and company updates from Tridico Design.</p>
        <div class="news-hero-actions">
          <a class="btn btn-primary btn-large" href="${prefix}quote.html">Start a Project</a>
          <a class="btn btn-outline btn-large" href="${prefix}work.html">View Work</a>
        </div>
      </div>
      <div class="news-hero-visual" aria-label="Latest featured Tridico update">
        ${imageTag(lead.featuredImage, prefix, "news-hero-visual__image", "eager")}
        <div class="news-hero-visual__caption">
          <span>Latest spotlight</span>
          <strong>${escapeHtml(lead.title)}</strong>
        </div>
      </div>
    </div>
  </section>
  ${renderTopicNav(prefix, "all")}
  ${buildFeaturedGrid(prefix)}
  <section class="news-section news-feed-section" aria-labelledby="latest-updates-heading" data-news-listing data-initial-count="8">
    <div class="container news-content-grid">
      <div class="news-feed-column">
        <div class="news-section-heading">
          <div>
            <p class="kicker">Latest Feed</p>
            <h2 id="latest-updates-heading">Latest Updates</h2>
          </div>
          <a class="news-inline-link" href="${prefix}news/archive/">Full archive</a>
        </div>
        ${renderFilterBar(prefix, latest)}
        <div class="latest-feed-list" data-news-list>
          ${latest.map((post, index) => renderCard(post, prefix, { loading: index < 2 ? "eager" : "lazy" })).join("")}
        </div>
        ${renderEmptyState(prefix)}
        ${renderLoadMore(latest.length)}
      </div>
      ${renderSidebar(prefix)}
    </div>
  </section>
  <section class="news-section news-archive-links" aria-labelledby="browse-news-heading">
    <div class="container">
      <div class="news-section-heading">
        <div>
          <p class="kicker">Browse</p>
          <h2 id="browse-news-heading">Find updates by source, tag, or service area.</h2>
        </div>
      </div>
      <div class="news-route-grid">
        <a href="${prefix}news/search/"><span>Search</span><strong>Search all news updates</strong></a>
        <a href="${prefix}news/source/facebook/"><span>Public Page</span><strong>Imported Tridico project updates</strong></a>
        <a href="${prefix}news/source/manual/"><span>Manual</span><strong>Tridico-authored guides and notes</strong></a>
        <a href="${prefix}news/archive/"><span>Archive</span><strong>Chronological news archive</strong></a>
      </div>
    </div>
  </section>
  ${renderFooterCta(prefix)}
</main>`;

  writeFile(
    "news/index.html",
    pageTemplate({
      prefix,
      title: "News & Project Updates | Tridico Design",
      description:
        "Recent wraps, signage, branding, print work, installations, and company updates from Tridico Design.",
      canonical: pageUrl("/news/"),
      bodyClass: "news-page",
      ogImage: lead.featuredImage ? assetUrl(lead.featuredImage.src) : undefined,
      main,
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "News & Project Updates",
          description:
            "Recent wraps, signage, branding, print work, installations, and company updates from Tridico Design.",
          url: pageUrl("/news/"),
          publisher: {
            "@type": "Organization",
            name: "Tridico Design LLC",
            url: siteBase,
          },
        },
      ],
    })
  );
}

function breadcrumbData(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function relatedPosts(post) {
  const byId = new Map(publishedPosts.map((item) => [item.id, item]));
  const selected = [];

  for (const id of post.relatedPostIds || []) {
    if (byId.has(id) && byId.get(id).id !== post.id) {
      selected.push(byId.get(id));
    }
  }

  for (const candidate of publishedPosts) {
    if (selected.length >= 3) {
      break;
    }
    if (
      candidate.id !== post.id &&
      candidate.categorySlug === post.categorySlug &&
      !selected.some((item) => item.id === candidate.id)
    ) {
      selected.push(candidate);
    }
  }

  for (const candidate of publishedPosts) {
    if (selected.length >= 3) {
      break;
    }
    if (candidate.id !== post.id && !selected.some((item) => item.id === candidate.id)) {
      selected.push(candidate);
    }
  }

  return selected.slice(0, 3);
}

function renderStoryPage(post) {
  const prefix = "../../";
  const related = relatedPosts(post);
  const bodyParagraphs = post.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const main = `<main id="main" class="news-main news-story-main">
  <article class="news-story">
    <div class="container news-story-container">
      <nav class="news-breadcrumb" aria-label="Breadcrumb">
        <a href="${prefix}index.html">Home</a>
        <span aria-hidden="true">/</span>
        <a href="${prefix}news/">News</a>
        <span aria-hidden="true">/</span>
        <a href="${categoryHref(post.categorySlug, prefix)}">${escapeHtml(post.category)}</a>
      </nav>
      <a class="news-back-link" href="${prefix}news/">Back to News</a>
      <header class="news-story-header">
        ${renderMeta(post, prefix)}
        <h1>${escapeHtml(post.title)}</h1>
        ${post.subtitle ? `<p class="news-story-subtitle">${escapeHtml(post.subtitle)}</p>` : `<p class="news-story-subtitle">${escapeHtml(post.excerpt)}</p>`}
      </header>
      <figure class="news-story-hero">
        ${imageTag(post.featuredImage, prefix, "news-story-hero__image", "eager")}
        ${post.featuredImage?.caption ? `<figcaption>${escapeHtml(post.featuredImage.caption)}</figcaption>` : ""}
      </figure>
      <div class="news-story-layout">
        <div class="news-story-body">
          ${bodyParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          ${
            post.isImported
              ? `<aside class="news-source-attribution">
                  <h2>Source Attribution</h2>
                  <p>Originally posted by Tridico Design on Facebook.</p>
                  <a href="${escapeHtml(post.sourceUrl || facebookUrl)}" target="_blank" rel="noopener noreferrer">View original post</a>
                </aside>`
              : ""
          }
          <div class="news-story-tags" aria-label="Story tags">
            ${post.tags.map((tag) => `<a href="${tagHref(slugify(tag), prefix)}">${escapeHtml(tag)}</a>`).join("")}
          </div>
        </div>
        <aside class="news-story-side" aria-label="Story actions">
          <div class="news-sidebar-module news-sidebar-module--quote">
            <h2>Start a Similar Project</h2>
            <p>Talk with Tridico about wraps, signage, print, branding, or installation for your business.</p>
            <a class="btn btn-primary" href="${prefix}quote.html">Start a Project</a>
          </div>
          <div class="news-sidebar-module">
            <h2>Story Details</h2>
            <dl class="news-story-details">
              <div><dt>Category</dt><dd><a href="${categoryHref(post.categorySlug, prefix)}">${escapeHtml(post.category)}</a></dd></div>
              <div><dt>Published</dt><dd>${formatDate(post.datePublished)}</dd></div>
              <div><dt>Read Time</dt><dd>${escapeHtml(post.readingTime)}</dd></div>
              <div><dt>Source</dt><dd><a href="${sourceHref(post.sourcePlatform, prefix)}">${escapeHtml(post.sourceLabel)}</a></dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  </article>
  ${
    post.images.length > 1
      ? `<section class="news-section news-gallery-section" aria-labelledby="story-gallery-heading">
          <div class="container">
            <div class="news-section-heading">
              <div>
                <p class="kicker">Gallery</p>
                <h2 id="story-gallery-heading">Project Views</h2>
              </div>
            </div>
            <div class="news-story-gallery">
              ${post.images
                .map(
                  (img, index) => `<figure>
                    ${imageTag(img, prefix, "news-story-gallery__image", index === 0 ? "eager" : "lazy")}
                    ${img.caption ? `<figcaption>${escapeHtml(img.caption)}</figcaption>` : ""}
                  </figure>`
                )
                .join("")}
            </div>
          </div>
        </section>`
      : ""
  }
  <section class="news-section related-news-section" aria-labelledby="related-news-heading">
    <div class="container">
      <div class="news-section-heading">
        <div>
          <p class="kicker">Related</p>
          <h2 id="related-news-heading">Related Updates</h2>
        </div>
        <a class="news-inline-link" href="${prefix}news/">All News</a>
      </div>
      <div class="related-news-grid">
        ${related.map((item) => renderCard(item, prefix, { variant: "related", loading: "lazy" })).join("")}
      </div>
    </div>
  </section>
  ${renderFooterCta(prefix)}
</main>`;

  writeFile(
    `news/${post.slug}/index.html`,
    pageTemplate({
      prefix,
      title: post.seo.title,
      description: post.seo.description,
      canonical: post.seo.canonicalUrl,
      bodyClass: "news-page news-story-page",
      ogImage: post.seo.ogImage,
      main,
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": post.seo.structuredDataType || "Article",
          headline: post.title,
          description: post.seo.description,
          image: post.seo.ogImage ? [post.seo.ogImage] : undefined,
          datePublished: post.datePublished,
          dateModified: post.dateUpdated || post.datePublished,
          author: {
            "@type": "Organization",
            name: "Tridico Design LLC",
          },
          publisher: {
            "@type": "Organization",
            name: "Tridico Design LLC",
            url: siteBase,
          },
          mainEntityOfPage: post.seo.canonicalUrl,
        },
        breadcrumbData([
          { name: "Home", url: siteBase },
          { name: "News", url: pageUrl("/news/") },
          { name: post.category, url: pageUrl(`/news/category/${post.categorySlug}/`) },
          { name: post.title, url: post.seo.canonicalUrl },
        ]),
      ],
    })
  );
}

function renderListingPage({
  relativePath,
  prefix,
  title,
  h1,
  kicker,
  lede,
  canonical,
  description,
  postsForPage,
  activeTopic = "all",
  noindex = false,
}) {
  const safePosts = postsForPage;
  const main = `<main id="main" class="news-main">
  <section class="news-archive-hero">
    <div class="container">
      <p class="kicker">${escapeHtml(kicker)}</p>
      <h1>${escapeHtml(h1)}</h1>
      <p>${escapeHtml(lede)}</p>
    </div>
  </section>
  ${renderTopicNav(prefix, activeTopic)}
  <section class="news-section news-feed-section" data-news-listing data-initial-count="12" aria-labelledby="archive-results-heading">
    <div class="container news-content-grid">
      <div class="news-feed-column">
        <div class="news-section-heading">
          <div>
            <p class="kicker">Results</p>
            <h2 id="archive-results-heading">${safePosts.length} ${safePosts.length === 1 ? "Update" : "Updates"}</h2>
          </div>
          <a class="news-inline-link" href="${prefix}news/">All News</a>
        </div>
        ${renderFilterBar(prefix, safePosts, relativePath === "news/search/index.html")}
        <div class="latest-feed-list" data-news-list>
          ${safePosts.map((post, index) => renderCard(post, prefix, { loading: index < 2 ? "eager" : "lazy" })).join("")}
        </div>
        ${renderEmptyState(prefix)}
        ${renderLoadMore(safePosts.length)}
      </div>
      ${renderSidebar(prefix)}
    </div>
  </section>
  ${renderFooterCta(prefix)}
</main>`;

  writeFile(
    relativePath,
    pageTemplate({
      prefix,
      title,
      description,
      canonical,
      bodyClass: "news-page news-archive-page",
      ogImage: publishedPosts[0]?.featuredImage ? assetUrl(publishedPosts[0].featuredImage.src) : undefined,
      noindex,
      main,
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: h1,
          description,
          url: canonical,
          publisher: {
            "@type": "Organization",
            name: "Tridico Design LLC",
            url: siteBase,
          },
        },
        breadcrumbData([
          { name: "Home", url: siteBase },
          { name: "News", url: pageUrl("/news/") },
          { name: h1, url: canonical },
        ]),
      ],
    })
  );
}

function renderCategoryPages() {
  for (const category of categories) {
    const categoryPosts = publishedPosts.filter((post) => post.categorySlug === category.slug);
    renderListingPage({
      relativePath: `news/category/${category.slug}/index.html`,
      prefix: "../../../",
      title: `${category.label} News & Project Updates | Tridico Design`,
      h1: `${category.label} News & Project Updates`,
      kicker: "Category",
      lede: category.description,
      canonical: pageUrl(`/news/category/${category.slug}/`),
      description: `${category.description} Browse Tridico Design project updates and stories.`,
      postsForPage: categoryPosts,
      activeTopic: category.slug,
    });
  }
}

function renderTagPages() {
  for (const tag of tagRecords) {
    const tagPosts = publishedPosts.filter((post) => post.tagSlugs.includes(tag.slug));
    renderListingPage({
      relativePath: `news/tag/${tag.slug}/index.html`,
      prefix: "../../../",
      title: `${tag.label} Projects & Updates | Tridico Design`,
      h1: `${tag.label} Projects & Updates`,
      kicker: "Tag",
      lede: `Browse Tridico Design news and project updates tagged ${tag.label}.`,
      canonical: pageUrl(`/news/tag/${tag.slug}/`),
      description: `Browse Tridico Design news and project updates tagged ${tag.label}.`,
      postsForPage: tagPosts,
      activeTopic: "all",
    });
  }
}

function renderSourcePages() {
  const sourcePages = [
    {
      source: "facebook",
      label: "Public Page Updates",
      lede:
        "Public Tridico project updates represented as original local summaries with attribution and without external embeds.",
    },
    {
      source: "manual",
      label: "Tridico Authored Updates",
      lede: "Project guides, planning notes, and company updates written directly for the Tridico Design News section.",
    },
  ];

  for (const source of sourcePages) {
    renderListingPage({
      relativePath: `news/source/${source.source}/index.html`,
      prefix: "../../../",
      title: `${source.label} | Tridico Design`,
      h1: source.label,
      kicker: "Source",
      lede: source.lede,
      canonical: pageUrl(`/news/source/${source.source}/`),
      description: source.lede,
      postsForPage: publishedPosts.filter((post) => post.sourcePlatform === source.source),
      activeTopic: "all",
    });
  }
}

function renderArchiveAndSearchPages() {
  renderListingPage({
    relativePath: "news/archive/index.html",
    prefix: "../../",
    title: "News Archive | Tridico Design",
    h1: "News Archive",
    kicker: "Archive",
    lede: "Browse Tridico Design news and project updates in chronological order.",
    canonical: pageUrl("/news/archive/"),
    description: "Browse Tridico Design wraps, signage, printing, branding, installation, and company updates by date.",
    postsForPage: publishedPosts,
    activeTopic: "all",
  });

  renderListingPage({
    relativePath: "news/search/index.html",
    prefix: "../../",
    title: "Search News | Tridico Design",
    h1: "Search News",
    kicker: "Search",
    lede: "Search Tridico Design news by title, excerpt, category, tags, service type, or source.",
    canonical: pageUrl("/news/search/"),
    description: "Search Tridico Design news and project updates by service, category, tag, and source.",
    postsForPage: publishedPosts,
    activeTopic: "all",
    noindex: true,
  });
}

function renderOptionalServiceRoutes() {
  const routes = [
    {
      route: "projects",
      title: "Project Updates | Tridico Design",
      h1: "Project Updates",
      lede: "A curated stream of project-focused wraps, signage, branding, printing, and installation updates.",
      posts: publishedPosts.filter((post) => ["project-update", "case-study", "social-import"].includes(post.contentFormat)),
      activeTopic: "all",
    },
    {
      route: "company-updates",
      title: "Company Updates | Tridico Design",
      h1: "Company Updates",
      lede: "Company news, process notes, and Tridico Design updates.",
      posts: publishedPosts.filter((post) => post.categorySlug === "company-updates" || post.categorySlug === "behind-the-scenes"),
      activeTopic: "company-updates",
    },
    {
      route: "vehicle-wraps",
      title: "Vehicle Wrap News & Project Updates | Tridico Design",
      h1: "Vehicle Wrap News & Project Updates",
      lede: categories.find((item) => item.slug === "vehicle-wraps").description,
      posts: publishedPosts.filter((post) => post.categorySlug === "vehicle-wraps"),
      activeTopic: "vehicle-wraps",
    },
    {
      route: "signage",
      title: "Signage News & Project Updates | Tridico Design",
      h1: "Signage News & Project Updates",
      lede: categories.find((item) => item.slug === "signage").description,
      posts: publishedPosts.filter((post) => post.categorySlug === "signage"),
      activeTopic: "signage",
    },
    {
      route: "printing",
      title: "Printing News & Project Updates | Tridico Design",
      h1: "Printing News & Project Updates",
      lede: categories.find((item) => item.slug === "printing").description,
      posts: publishedPosts.filter((post) => post.categorySlug === "printing"),
      activeTopic: "printing",
    },
    {
      route: "branding",
      title: "Branding News & Project Updates | Tridico Design",
      h1: "Branding News & Project Updates",
      lede: categories.find((item) => item.slug === "branding").description,
      posts: publishedPosts.filter((post) => post.categorySlug === "branding"),
      activeTopic: "branding",
    },
    {
      route: "installations",
      title: "Installation News & Project Updates | Tridico Design",
      h1: "Installation News & Project Updates",
      lede: categories.find((item) => item.slug === "installations").description,
      posts: publishedPosts.filter((post) => post.categorySlug === "installations"),
      activeTopic: "installations",
    },
  ];

  for (const route of routes) {
    renderListingPage({
      relativePath: `news/${route.route}/index.html`,
      prefix: "../../",
      title: route.title,
      h1: route.h1,
      kicker: "News Route",
      lede: route.lede,
      canonical: pageUrl(`/news/${route.route}/`),
      description: route.lede,
      postsForPage: route.posts,
      activeTopic: route.activeTopic,
    });
  }
}

function renderRedirectPage() {
  writeFile(
    "news.html",
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>News & Project Updates | Tridico Design</title>
  <meta name="description" content="Recent wraps, signage, branding, print work, installations, and company updates from Tridico Design.">
  <link rel="canonical" href="${pageUrl("/news/")}">
  <meta http-equiv="refresh" content="0; url=news/">
</head>
<body>
  <main>
    <h1>News &amp; Project Updates</h1>
    <p><a href="news/">Continue to News &amp; Project Updates</a></p>
  </main>
</body>
</html>
`
  );
}

function writeNewsAssets() {
  writeFile(
    "assets/data/news-posts.json",
    `${JSON.stringify(
      {
        generatedAt: normalizeDate(today),
        siteBase,
        facebookUrl,
        categories,
        tags: tagRecords,
        posts: publishedPosts,
      },
      null,
      2
    )}\n`
  );

  writeFile(
    "assets/js/news.js",
    `(() => {
  const debounce = (fn, wait = 160) => {
    let timer;
    return (...args) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    };
  };

  const normalize = (value) => String(value || "").toLowerCase().trim();

  const initListing = (listing) => {
    const form = listing.querySelector("[data-news-filter]");
    const list = listing.querySelector("[data-news-list]");
    const empty = listing.querySelector("[data-news-empty]");
    const count = listing.querySelector("[data-news-count]");
    const loadMore = listing.querySelector("[data-news-load-more]");
    const reset = listing.querySelector("[data-news-reset]");
    const search = listing.querySelector("[data-news-search]");
    const category = listing.querySelector("[data-news-category]");
    const source = listing.querySelector("[data-news-source]");
    const sort = listing.querySelector("[data-news-sort]");

    if (!form || !list) return;

    const allItems = Array.from(list.querySelectorAll("[data-news-item]"));
    const initialCount = Number(listing.dataset.initialCount || 8);
    let visibleLimit = initialCount;

    const params = new URLSearchParams(window.location.search);
    if (form.dataset.newsSearchPage === "true" && params.get("q") && search) {
      search.value = params.get("q");
    }

    const apply = () => {
      const query = normalize(search?.value);
      const selectedCategory = category?.value || "all";
      const selectedSource = source?.value || "all";
      const selectedSort = sort?.value || "newest";

      let matches = allItems.filter((item) => {
        const haystack = normalize([
          item.dataset.title,
          item.dataset.excerpt,
          item.dataset.tags,
          item.dataset.category,
          item.dataset.source,
        ].join(" "));
        const categoryMatches = selectedCategory === "all" || item.dataset.category === selectedCategory;
        const sourceMatches = selectedSource === "all" || item.dataset.source === selectedSource;
        const queryMatches = !query || haystack.includes(query);
        return categoryMatches && sourceMatches && queryMatches;
      });

      matches.sort((a, b) => {
        if (selectedSort === "oldest") {
          return new Date(a.dataset.date) - new Date(b.dataset.date);
        }
        if (selectedSort === "featured") {
          return Number(b.dataset.priority || 0) - Number(a.dataset.priority || 0);
        }
        return new Date(b.dataset.date) - new Date(a.dataset.date);
      });

      matches.forEach((item) => list.appendChild(item));
      allItems.forEach((item) => {
        item.hidden = true;
      });

      matches.slice(0, visibleLimit).forEach((item) => {
        item.hidden = false;
      });

      if (empty) {
        empty.hidden = matches.length > 0;
      }

      if (count) {
        const shown = Math.min(visibleLimit, matches.length);
        count.textContent = matches.length
          ? \`Showing \${shown} of \${matches.length} updates\`
          : "No matching updates";
      }

      if (loadMore) {
        loadMore.hidden = visibleLimit >= matches.length;
      }
    };

    const resetLimitAndApply = () => {
      visibleLimit = initialCount;
      apply();
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      resetLimitAndApply();

      if (form.dataset.newsSearchPage === "true") {
        const url = new URL(window.location.href);
        const query = search?.value?.trim();
        if (query) {
          url.searchParams.set("q", query);
        } else {
          url.searchParams.delete("q");
        }
        window.history.replaceState({}, "", url);
      }
    });

    search?.addEventListener("input", debounce(resetLimitAndApply));
    category?.addEventListener("change", resetLimitAndApply);
    source?.addEventListener("change", resetLimitAndApply);
    sort?.addEventListener("change", resetLimitAndApply);

    reset?.addEventListener("click", () => {
      if (search) search.value = "";
      if (category) category.value = "all";
      if (source) source.value = "all";
      if (sort) sort.value = "newest";
      if (form.dataset.newsSearchPage === "true") {
        window.history.replaceState({}, "", window.location.pathname);
      }
      resetLimitAndApply();
      search?.focus();
    });

    loadMore?.addEventListener("click", () => {
      visibleLimit += 6;
      apply();
    });

    apply();
  };

  document.querySelectorAll("[data-news-listing]").forEach(initListing);
})();`
  );

  writeFile(
    "assets/css/news.css",
    `:root{
  --news-border:rgba(5,5,5,.12);
  --news-card:#fff;
  --news-soft:#f6f6f3;
  --news-ink:#101010;
  --news-muted:#5d6266;
  --news-accent:#d71920;
  --news-yellow:#ffd21a;
}

.news-main{background:#fafaf7;color:var(--news-ink)}
.news-main a{text-decoration:none}
.news-main .btn-outline{border-color:#141414;color:#141414;background:transparent}
.news-hero-band .btn-outline,.news-footer-cta .btn-outline{border-color:rgba(255,255,255,.4);color:#fff}
.news-main a:focus-visible,.news-main button:focus-visible,.news-main input:focus-visible,.news-main select:focus-visible{outline:3px solid var(--news-yellow);outline-offset:3px}
.news-main [hidden]{display:none!important}
.news-hero-band{background:linear-gradient(135deg,#050505 0%,#181818 58%,#2b1414 100%);color:#fff;padding:clamp(3rem,6vw,5.7rem) 0 clamp(2.5rem,5vw,4.5rem);position:relative;overflow:hidden}
.news-hero-band::after{content:"";position:absolute;left:0;right:0;bottom:0;height:6px;background:linear-gradient(90deg,var(--red),var(--yellow),#fff)}
.news-hero-grid{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.74fr);gap:clamp(1.5rem,4vw,3rem);align-items:center}
.news-hero-copy h1{color:#fff;font-size:clamp(3.1rem,8vw,6.8rem);line-height:.88;margin:.35rem 0 1rem;max-width:850px}
.news-hero-lede{font-size:clamp(1.05rem,2vw,1.35rem);color:rgba(255,255,255,.78);max-width:680px}
.news-hero-actions{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.8rem}
.news-hero-visual{background:#111;border:1px solid rgba(255,255,255,.18);border-radius:var(--radius-sm);overflow:hidden;box-shadow:var(--shadow);min-height:360px;display:grid;align-content:end}
.news-hero-visual__image{width:100%;height:100%;min-height:360px;object-fit:cover;aspect-ratio:4/3}
.news-hero-visual__caption{display:grid;gap:.25rem;background:rgba(0,0,0,.82);padding:1rem 1.1rem;margin-top:-94px;position:relative}
.news-hero-visual__caption span{color:var(--yellow);font-weight:900;text-transform:uppercase;letter-spacing:.11em;font-size:.76rem}
.news-hero-visual__caption strong{font-size:1rem;line-height:1.25}
.news-topic-nav{position:sticky;top:0;z-index:20;background:rgba(250,250,247,.96);backdrop-filter:saturate(140%) blur(12px);border-bottom:1px solid var(--news-border)}
.site-header + .news-main .news-topic-nav{top:0}
.news-topic-nav__inner{display:flex;gap:.55rem;overflow-x:auto;scroll-snap-type:x proximity;padding-block:.8rem;scrollbar-width:thin}
.news-chip{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.7rem 1rem;border:1px solid var(--news-border);border-radius:999px;background:#fff;color:#141414;font-weight:850;white-space:nowrap;scroll-snap-align:start;transition:background .16s ease,color .16s ease,border-color .16s ease,transform .16s ease}
.news-chip:hover,.news-chip:focus-visible{border-color:#050505;transform:translateY(-1px)}
.news-chip.active{background:#050505;color:#fff;border-color:#050505;box-shadow:inset 0 -3px 0 var(--yellow)}
.news-section{padding-block:clamp(2.7rem,5vw,4.5rem)}
.news-section-heading{display:flex;align-items:end;justify-content:space-between;gap:1.5rem;margin-bottom:1.4rem}
.news-section-heading h2{font-size:clamp(2rem,4vw,3.35rem);line-height:.96;margin:0;max-width:780px}
.news-inline-link{font-weight:900;color:#050505;border-bottom:3px solid var(--yellow);padding-bottom:.2rem}
.featured-news-grid{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(320px,.8fr);gap:1.25rem}
.featured-news-grid__secondary{display:grid;gap:1.25rem}
.news-card{background:var(--news-card);border:1px solid var(--news-border);border-radius:var(--radius-sm);overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,.07);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
.news-card:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(0,0,0,.11);border-color:rgba(5,5,5,.25)}
.news-card__media{display:block;background:#e9e8e2;overflow:hidden}
.news-card__image{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;transition:transform .18s ease}
.news-card:hover .news-card__image{transform:scale(1.025)}
.news-card__body{display:grid;gap:.72rem;padding:1.05rem}
.news-card h3{font-size:1.34rem;line-height:1.08;margin:0}
.news-card h3 a{color:#050505}
.news-card p{color:var(--news-muted);margin:0;line-height:1.55}
.news-meta{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap;color:#565656;font-weight:820;font-size:.79rem;text-transform:uppercase;letter-spacing:.055em}
.news-meta a{color:#050505}
.news-meta time::before,.news-meta span::before{content:"";display:inline-block;width:4px;height:4px;border-radius:50%;background:#a4a4a4;margin:0 .45rem .12rem 0}
.news-source-badge{display:inline-flex;align-items:center;border:1px solid rgba(24,119,242,.28);background:#edf4ff;color:#174ea6;border-radius:999px;padding:.22rem .48rem;text-transform:none;letter-spacing:0;font-size:.74rem}
.news-source-badge::before{display:none!important}
.news-source-badge--manual{border-color:rgba(5,5,5,.18);background:#f3f3ef;color:#1b1b1b}
.news-card__tags{display:flex;gap:.42rem;flex-wrap:wrap}
.news-card__tags a,.news-story-tags a{font-size:.78rem;font-weight:850;color:#050505;background:#f3f3ef;border:1px solid var(--news-border);border-radius:999px;padding:.42rem .62rem}
.news-card--lead .news-card__image{aspect-ratio:16/9}
.news-card--lead .news-card__body{padding:1.35rem}
.news-card--lead h3{font-size:clamp(1.7rem,3vw,2.45rem)}
.news-card--secondary{display:grid;grid-template-columns:170px minmax(0,1fr)}
.news-card--secondary .news-card__image{height:100%;aspect-ratio:1/1}
.news-card--secondary .news-card__body{padding:.95rem}
.news-card--secondary h3{font-size:1.05rem}
.news-card--secondary p{display:none}
.news-content-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:clamp(1.4rem,4vw,2.5rem);align-items:start}
.news-feed-column{min-width:0}
.news-filter-bar{display:grid;grid-template-columns:minmax(220px,1.4fr) minmax(150px,.8fr) minmax(140px,.7fr) minmax(140px,.7fr);gap:.8rem;align-items:end;background:#fff;border:1px solid var(--news-border);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1.2rem}
.news-field{display:grid;gap:.35rem}
.news-field label{font-weight:900;font-size:.82rem;color:#262626}
.news-field input,.news-field select{width:100%;min-height:46px;border:1px solid var(--news-border);border-radius:8px;padding:.75rem .85rem;background:#fff;color:#050505;font:inherit}
.news-filter-actions{grid-column:1/-1;display:flex;gap:.55rem;align-items:center;flex-wrap:wrap}
.news-result-count{grid-column:1/-1;margin:0;color:var(--news-muted);font-weight:750}
.latest-feed-list{display:grid;gap:1rem}
.latest-feed-list .news-card{display:grid;grid-template-columns:240px minmax(0,1fr)}
.latest-feed-list .news-card__image{height:100%;aspect-ratio:4/3}
.news-load-more-wrap{display:flex;justify-content:center;margin-top:1.35rem}
.news-empty-state{background:#fff;border:1px solid var(--news-border);border-radius:var(--radius-sm);padding:2rem;text-align:center}
.news-empty-state h2{font-size:1.8rem;margin:0 0 .6rem}
.news-empty-actions{display:flex;justify-content:center;gap:.7rem;flex-wrap:wrap;margin-top:1rem}
.news-sidebar{display:grid;gap:1rem;position:sticky;top:92px}
.news-sidebar-module{background:#fff;border:1px solid var(--news-border);border-radius:var(--radius-sm);padding:1rem;box-shadow:0 10px 28px rgba(0,0,0,.06)}
.news-sidebar-module h2{font-size:1.05rem;letter-spacing:.08em;text-transform:uppercase;margin:0 0 .85rem;color:#050505}
.news-sidebar-module p{color:var(--news-muted);line-height:1.55}
.news-sidebar-module--quote{background:#050505;color:#fff;border-color:#050505}
.news-sidebar-module--quote h2,.news-sidebar-module--quote p{color:#fff}
.news-compact-list{display:grid;gap:.85rem}
.news-compact-card{display:grid;grid-template-columns:82px minmax(0,1fr);gap:.75rem;align-items:center}
.news-compact-card__image{width:82px;height:72px;object-fit:cover;border-radius:8px}
.news-compact-card h3{font-size:.95rem;line-height:1.16;margin:.15rem 0 0}
.news-compact-card h3 a{color:#050505}
.news-compact-card__meta{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--news-muted);font-weight:850}
.news-category-list{list-style:none;margin:0;padding:0;display:grid;gap:.45rem}
.news-category-list a{display:flex;justify-content:space-between;gap:1rem;align-items:center;padding:.72rem .8rem;border:1px solid var(--news-border);border-radius:8px;color:#050505;font-weight:850;background:#fafaf7}
.news-category-list strong{background:var(--yellow);border-radius:999px;padding:.15rem .45rem}
.news-route-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.news-route-grid a{display:grid;gap:.35rem;background:#fff;border:1px solid var(--news-border);border-radius:var(--radius-sm);padding:1.1rem;color:#050505;min-height:132px}
.news-route-grid span{font-weight:950;color:var(--red);text-transform:uppercase;letter-spacing:.08em;font-size:.78rem}
.news-route-grid strong{font-size:1.2rem;line-height:1.18}
.news-footer-cta{background:#101010;color:#fff;padding-block:clamp(2.8rem,5vw,4.8rem)}
.news-footer-cta__inner{display:flex;justify-content:space-between;gap:2rem;align-items:center}
.news-footer-cta h2{color:#fff;font-size:clamp(2rem,4vw,3.4rem);line-height:1;max-width:760px}
.news-footer-cta__actions{display:flex;gap:.75rem;flex-wrap:wrap}
.news-archive-hero{background:#111;color:#fff;padding:clamp(2.7rem,5vw,4.3rem) 0}
.news-archive-hero h1{color:#fff;font-size:clamp(2.8rem,7vw,5.2rem);line-height:.92;margin:.3rem 0 .8rem}
.news-archive-hero p:not(.kicker){max-width:760px;color:rgba(255,255,255,.78);font-size:1.15rem}
.news-story-container{max-width:1160px}
.news-breadcrumb{display:flex;gap:.5rem;flex-wrap:wrap;color:var(--news-muted);font-weight:800;margin:1.4rem 0}
.news-breadcrumb a,.news-back-link{color:#050505;border-bottom:2px solid var(--yellow);font-weight:900}
.news-story-header{max-width:850px;margin:1.5rem auto 1.8rem;text-align:left}
.news-story-header h1{font-size:clamp(2.55rem,6vw,5.1rem);line-height:.94;margin:.65rem 0;color:#050505}
.news-story-subtitle{font-size:clamp(1.05rem,2vw,1.28rem);line-height:1.55;color:var(--news-muted)}
.news-story-hero{margin:0 auto 2rem;max-width:1160px}
.news-story-hero__image{width:100%;height:auto;max-height:650px;object-fit:cover;border-radius:var(--radius-sm);box-shadow:var(--shadow-soft);background:#e9e8e2}
.news-story-hero figcaption,.news-story-gallery figcaption{font-size:.9rem;color:var(--news-muted);margin-top:.55rem}
.news-story-layout{display:grid;grid-template-columns:minmax(0,760px) 310px;gap:clamp(1.4rem,4vw,2.5rem);align-items:start}
.news-story-body{font-size:1.08rem;line-height:1.72}
.news-story-body p{margin:0 0 1.25rem}
.news-source-attribution{background:#fff;border:1px solid var(--news-border);border-left:6px solid #1877f2;border-radius:var(--radius-sm);padding:1rem;margin:1.8rem 0}
.news-source-attribution h2{font-size:1.15rem;margin:0 0 .45rem}
.news-source-attribution a{font-weight:900;color:#174ea6}
.news-story-tags{display:flex;gap:.45rem;flex-wrap:wrap;margin-top:1.5rem}
.news-story-side{display:grid;gap:1rem;position:sticky;top:92px}
.news-story-details{display:grid;gap:.7rem;margin:0}
.news-story-details div{display:grid;gap:.15rem}
.news-story-details dt{font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--news-muted);font-weight:900}
.news-story-details dd{margin:0;font-weight:850}
.news-story-details a{color:#050505}
.news-story-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.news-story-gallery figure{margin:0;background:#fff;border:1px solid var(--news-border);border-radius:var(--radius-sm);padding:.65rem}
.news-story-gallery__image{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:8px}
.related-news-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.related-news-grid .news-card__image{aspect-ratio:4/3}

@media (max-width:1050px){
  .news-hero-grid,.news-content-grid,.news-story-layout{grid-template-columns:1fr}
  .news-sidebar,.news-story-side{position:static}
  .news-filter-bar{grid-template-columns:1fr 1fr}
  .news-filter-actions{grid-column:1/-1}
  .news-route-grid{grid-template-columns:repeat(2,1fr)}
  .news-footer-cta__inner{display:grid}
}

@media (max-width:720px){
  .news-hero-band{padding-top:2.2rem}
  .news-hero-copy h1{font-size:clamp(3rem,17vw,4.4rem)}
  .news-hero-actions,.news-footer-cta__actions{display:grid}
  .news-hero-visual{min-height:260px}
  .news-hero-visual__image{min-height:260px}
  .news-section-heading{display:grid;align-items:start}
  .featured-news-grid,.featured-news-grid__secondary,.related-news-grid,.news-story-gallery,.news-route-grid{grid-template-columns:1fr}
  .news-card--secondary,.latest-feed-list .news-card{grid-template-columns:1fr}
  .news-card--secondary .news-card__image,.latest-feed-list .news-card__image{height:auto;aspect-ratio:16/10}
  .news-filter-bar{grid-template-columns:1fr;padding:.85rem}
  .news-filter-actions{display:grid}
  .news-filter-actions .btn{width:100%}
  .news-topic-nav{top:0}
  .news-topic-nav__inner{padding-block:.7rem}
  .news-chip{min-height:44px}
  .news-story-header{text-align:left;margin-top:1rem}
  .news-story-body{font-size:1rem;line-height:1.66}
  .news-footer-cta h2{font-size:2rem}
}

@media (prefers-reduced-motion:reduce){
  .news-chip,.news-card,.news-card__image{transition:none!important}
  .news-card:hover,.news-chip:hover{transform:none}
  .news-card:hover .news-card__image{transform:none}
}`
  );

  const stylesPath = "assets/css/styles.css";
  updateFile(stylesPath, (css) => {
    if (css.includes("/* News navigation fit */")) {
      return css;
    }

    return `${css}

/* News navigation fit */
@media (min-width:1051px) and (max-width:1180px){
  .desktop-nav{gap:.08rem}
  .nav-link{padding:.7rem .55rem;font-size:.88rem}
  .header-actions .btn-small{padding:.65rem .82rem}
}
.mobile-panel a.active{color:#050505;background:var(--yellow)}
`;
  });
}

function updateRootPages() {
  const rootHtmlFiles = fs
    .readdirSync(repoRoot)
    .filter((file) => file.endsWith(".html") && file !== "news.html");

  for (const file of rootHtmlFiles) {
    updateFile(file, (html) => injectNewsNavigation(html, false));
  }
}

function updateSitemap() {
  const staticRoutes = [
    "/",
    "/work.html",
    "/services.html",
    "/industries.html",
    "/process.html",
    "/about.html",
    "/contact.html",
    "/vehicle-wraps.html",
    "/signage.html",
    "/branding-materials.html",
    "/printing.html",
    "/installation.html",
    "/resources.html",
    "/quote.html",
    "/upload-artwork.html",
    "/news/",
    "/news/archive/",
    "/news/search/",
    "/news/projects/",
    "/news/company-updates/",
    "/news/vehicle-wraps/",
    "/news/signage/",
    "/news/printing/",
    "/news/branding/",
    "/news/installations/",
    "/news/source/facebook/",
    "/news/source/manual/",
    ...categories.map((category) => `/news/category/${category.slug}/`),
    ...tagRecords.map((tag) => `/news/tag/${tag.slug}/`),
    ...publishedPosts.map((post) => `/news/${post.slug}/`),
  ];

  const uniqueRoutes = [...new Set(staticRoutes)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRoutes
  .map(
    (route) => `  <url>
    <loc>${pageUrl(route)}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  writeFile("sitemap.xml", xml);
}

function validateData() {
  const slugs = new Set();
  const sourceIds = new Set();

  for (const post of publishedPosts) {
    if (slugs.has(post.slug)) {
      throw new Error(`Duplicate slug: ${post.slug}`);
    }
    slugs.add(post.slug);

    if (post.sourcePostId) {
      const key = `${post.sourcePlatform}:${post.sourcePostId}`;
      if (sourceIds.has(key)) {
        throw new Error(`Duplicate source post id: ${key}`);
      }
      sourceIds.add(key);
    }

    for (const img of post.images) {
      if (!fs.existsSync(path.join(repoRoot, img.src))) {
        throw new Error(`Missing image for ${post.slug}: ${img.src}`);
      }
    }
  }
}

function build() {
  validateData();
  updateRootPages();
  writeNewsAssets();
  renderNewsLanding();
  publishedPosts.forEach(renderStoryPage);
  renderCategoryPages();
  renderTagPages();
  renderSourcePages();
  renderArchiveAndSearchPages();
  renderOptionalServiceRoutes();
  renderRedirectPage();
  updateSitemap();

  console.log("News build complete.");
  console.log(`Published posts: ${publishedPosts.length}`);
  console.log(`Files written: ${generatedFiles.length}`);
  for (const file of [...new Set(generatedFiles)].sort()) {
    console.log(`- ${file}`);
  }
}

build();
