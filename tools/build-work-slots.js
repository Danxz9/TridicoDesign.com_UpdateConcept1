#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const writeFiles = process.argv.includes("--write");

const repoRoot = path.resolve(__dirname, "..");
const sourceRoot = path.resolve(repoRoot, "..", "..", "Updated Portfolio");
const facebookRoot = path.join(sourceRoot, "FaceBook");
const oldRoot = path.join(sourceRoot, "Old");
const workHtmlPath = path.join(repoRoot, "work.html");
const workImagesRoot = path.join(repoRoot, "assets", "images", "work");
const generatedRoot = path.join(workImagesRoot, "work-slots");

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const secondaryOrder = ["design", "production"];
const tertiaryOrder = [
  "xl-vehicles",
  "specialty-wraps",
  "vehicle",
  "signage",
  "branding",
  "print",
  "interior",
  "contractors",
  "dealerships",
  "restaurants",
  "schools",
];

const facebookTitleOverrides = new Map(
  Object.entries({
    "01_featured_projects/acuratrio": "Acura Trio Specialty Wraps",
    "01_featured_projects/acuratrio/mdx": "Acura MDX Specialty Wrap",
    "01_featured_projects/acuratrio/nsx": "Columbus Crew Acura NSX Specialty Wrap",
    "01_featured_projects/acuratrio/rdx": "Acura RDX Specialty Wrap",
    "01_featured_projects/yokohamaracer": "Yokohama Pikes Peak Race Car Wrap",
    "02_fleet_contractor_vehicle_wraps/basements": "Advanced Basement Solutions Truck Wrap",
    "02_fleet_contractor_vehicle_wraps/jacobsrestoration": "Jacobs Restoration Fleet Wrap",
    "02_fleet_contractor_vehicle_wraps/landscape": "Landscape Fleet Vehicle Wrap",
    "02_fleet_contractor_vehicle_wraps/muthroofing": "Muth Roofing Fleet Wrap",
    "02_fleet_contractor_vehicle_wraps/nicklaus": "The Nicklaus Group Vehicle Graphics",
    "02_fleet_contractor_vehicle_wraps/viaquest": "ViaQuest Fleet Wrap",
    "02_fleet_contractor_vehicle_wraps/wascoautosupplies": "Wasco Auto Supplies Box Truck Wrap",
    "03_food_truck_trailer_wraps/britt'ssweetshop": "Britt's Sweet Shop Food Trailer Wrap",
    "03_food_truck_trailer_wraps/cookiedough": "Cookie Dough Food Trailer Wrap",
    "03_food_truck_trailer_wraps/parker jane": "Parker Jane Food Trailer Wrap",
    "03_food_truck_trailer_wraps/tasteofphilipines": "Taste of the Philippines Food Truck",
    "04_dealership_automotive_retail_graphics/beats5000": "Beats 5000 Vehicle Graphics",
    "04_dealership_automotive_retail_graphics/bluehotrod": "Blue Hot Rod Vehicle Graphics",
    "04_dealership_automotive_retail_graphics/humanesociety": "Humane Society Vehicle Graphics",
    "04_dealership_automotive_retail_graphics/i60_dealershipentrance": "Performance Impact 60 Dealership Entrance",
    "04_dealership_automotive_retail_graphics/jeep": "Jeep Retail Graphics",
    "04_dealership_automotive_retail_graphics/onegoal": "One Goal Vehicle Graphics",
    "04_dealership_automotive_retail_graphics/pelotonia": "Pelotonia Vehicle Graphics",
    "04_dealership_automotive_retail_graphics/rise": "Rise Vehicle Graphics",
    "05_commercial_signs_banners_displays": "Commercial Signs, Banners & Displays",
    "05_commercial_signs_banners_displays/hiddencreek": "Hidden Creek Landscaping Sign",
    "05_commercial_signs_banners_displays/millcreek": "Millcreek Signage",
    "05_commercial_signs_banners_displays/shiftroofing": "Shift Roofing Signage",
    "06_wall_window_interior_branding/dave'scosmicsubs": "Dave's Cosmic Subs Interior Branding",
    "06_wall_window_interior_branding/elevators": "Elevator Graphics",
    "06_wall_window_interior_branding/interiorwalldisplay": "Interior Wall Display",
    "06_wall_window_interior_branding/kidsandmonkeys": "Kids Room Wall Graphics",
    "06_wall_window_interior_branding/sbcbrewingcompany": "SBC Brewing Company Interior & Window Branding",
    "06_wall_window_interior_branding/toyotawindowanddesk": "Toyota Window and Desk Graphics",
    "07_print_marketing_materials": "Sat Track GPS Marketing Collateral",
    "08_logo_brand_illustration": "Polaris Wealth Management Brand Identity",
    "09_product_pop_sales_displays/hondaperformanceneonyellow": "Honda Performance Zone POP Display",
    "10_color_change_specialty_wraps/acura": "Acura Specialty Wrap",
    "10_color_change_specialty_wraps/acura/granturismo": "Acura Gran Turismo Specialty Wrap",
    "10_color_change_specialty_wraps/acura/integra": "Acura Integra Specialty Wrap",
    "10_color_change_specialty_wraps/bmw/fieldsautoworks": "Fields Auto Works BMW Specialty Wrap",
    "10_color_change_specialty_wraps/chuglife": "Chug Life Minivan Specialty Wrap",
    "10_color_change_specialty_wraps/hondapassport": "Honda Passport Rally Vehicle Wrap",
    "10_color_change_specialty_wraps/jaguar": "Jaguar Specialty Wrap",
    "10_color_change_specialty_wraps/porsche": "Porsche Specialty Wrap",
    "10_color_change_specialty_wraps/racecar": "Race Car Specialty Wrap",
    "10_color_change_specialty_wraps/yellowsportscar": "Yellow Sports Car Specialty Wrap",
    "11_unique_projects/bicycle": "Bicycle Graphics",
    "11_unique_projects/helmet": "Impact 60 Helmet Graphics",
    "11_unique_projects/ohiometalwalldisplay": "Ohio Metal Wall Display",
    "12_xl_vehicle_wraps/hondamarysvillemotorsportstrailer": "Honda Marysville Motorsports Trailer",
    "12_xl_vehicle_wraps/hondamotorsportsmarysvillered": "Honda Marysville Motorsports Red Trailer",
    "12_xl_vehicle_wraps/hondaracing": "Honda Racing XL Vehicle Wrap",
    "12_xl_vehicle_wraps/kidsonbikeslargetrailer": "Kids on Bikes Large Trailer Wrap",
    "13_event_graphics/cancer": "Breast Cancer Awareness Vehicle Graphics",
    "13_event_graphics/snagdj": "Snag DJ Event Trailer Graphics",
    "14_window_displays/60yearsentrance": "60 Years Entrance Window Graphics",
    "14_window_displays/hondawindow": "Honda Used Car Center Window Graphics",
  })
);

function ensurePathExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`${label} was not found: ${targetPath}`);
  }
}

function isImageFile(filePath) {
  return imageExtensions.has(path.extname(filePath).toLowerCase());
}

function byNaturalName(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function toWebPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativeKey(filePath, basePath) {
  return toWebPath(path.relative(basePath, filePath)).toLowerCase();
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function slugify(value) {
  const slug = normalizeTitle(value).replace(/\s+/g, "-");
  return slug || "work-slot";
}

function htmlEscape(value) {
  return normalizeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripTags(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function titleFromSegment(segment) {
  return normalizeText(segment)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
}

function titleFromFacebookPath(relPath) {
  const normalizedRel = relPath.toLowerCase();
  const override = facebookTitleOverrides.get(normalizedRel);
  if (override) {
    return override;
  }

  const parts = relPath.split("/");
  return titleFromSegment(parts[parts.length - 1].replace(/^\d+_/, ""));
}

function directImages(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dirPath, entry.name))
    .filter(isImageFile)
    .sort(byNaturalName);
}

function walkImages(dirPath) {
  const files = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }).sort((a, b) => byNaturalName(a.name, b.name));
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkImages(fullPath));
    } else if (entry.isFile() && isImageFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function inferCategories(title, categoryText, relKey) {
  const text = `${title} ${categoryText} ${relKey}`.toLowerCase();
  const categories = new Set();

  if (/xl|large trailer|honda racing|motorsports trailer|shoreline.*truck|12_xl/.test(text)) {
    categories.add("xl-vehicles");
  }
  if (
    /specialty|color change|chug|passport|gran turismo|integra|jaguar|porsche|sports car|race car|racer|range rover|10_color|yokohama|acura/.test(
      text
    )
  ) {
    categories.add("specialty-wraps");
  }
  if (
    /vehicle|wrap|truck|trailer|car|racer|fleet|shuttle|van|jeep|bmw|honda|acura|ford|ram|ridgeline|range rover|motorsports|cdjr/.test(
      text
    )
  ) {
    categories.add("vehicle");
  }
  if (/sign|banner|display|entrance|pop|metal|directional|window display|05_commercial|09_product|14_window/.test(text)) {
    categories.add("signage");
  }
  if (/brand|logo|illustration|identity|corporate|08_logo/.test(text)) {
    categories.add("branding");
  }
  if (/print|brochure|mailer|ad design|business card|marketing|collateral|07_print/.test(text)) {
    categories.add("print");
  }
  if (/interior|window|wall|elevator|room|desk|06_wall/.test(text)) {
    categories.add("interior");
  }
  if (
    /roof|restoration|construction|basement|landscape|contractor|nicklaus|shift|ganim|engie|coldwell|lunsford|muth|jacobs|wasco|02_fleet/.test(
      text
    )
  ) {
    categories.add("contractors");
  }
  if (/dealership|chapman|ford|honda|toyota|acura|cdjr|dodge|jeep|performance|used car|04_dealership/.test(text)) {
    categories.add("dealerships");
  }
  if (/food|diner|subs|brewing|cookie|sweet|philippines|parker jane|britt|sbc|root juice|ice cream|beer tube|03_food/.test(text)) {
    categories.add("restaurants");
  }
  if (/school|kids|maryhaven|run4kids|monkey/.test(text)) {
    categories.add("schools");
  }
  if (!categories.size) {
    categories.add("branding");
  }

  return categories;
}

function inferSecondaryCategories(sectionName, categories) {
  const text = `${sectionName} ${Array.from(categories).join(" ")}`.toLowerCase();
  const secondary = new Set();

  if (text.includes("design")) {
    secondary.add("design");
  }
  if (text.includes("production")) {
    secondary.add("production");
  }
  if (!secondary.size) {
    secondary.add("design");
    secondary.add("production");
  }

  return secondary;
}

function parseLeadingOrder(relPath) {
  const firstPart = relPath.split("/")[0] || "";
  const match = firstPart.match(/^(\d+)/);
  return match ? Number(match[1]) : 999;
}

function collectFacebookPackages() {
  const packagesByPath = new Map();
  let sequence = 0;

  function addPackage(dirPath, images) {
    let packageDir = dirPath;
    if (/^not[ _-]?ideal$/i.test(path.basename(dirPath))) {
      packageDir = path.dirname(dirPath);
    }

    const relPath = relativeKey(packageDir, facebookRoot);
    if (!packagesByPath.has(relPath)) {
      const title = titleFromFacebookPath(relPath);
      const secondary = new Set(["design", "production"]);
      const categoryText = relPath.split("/").map(titleFromSegment).join(" ");
      const categories = inferCategories(title, categoryText, relPath);
      for (const item of secondary) {
        categories.add(item);
      }

      packagesByPath.set(relPath, {
        source: "facebook",
        title,
        relPath,
        order: parseLeadingOrder(relPath) * 1000 + sequence,
        categories,
        images: [],
      });
      sequence += 1;
    }

    const packageRecord = packagesByPath.get(relPath);
    for (const imagePath of images) {
      packageRecord.images.push({
        sourcePath: imagePath,
        sourceLabel: "facebook",
      });
    }
  }

  function visit(dirPath) {
    const images = directImages(dirPath);
    if (images.length) {
      addPackage(dirPath, images);
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true }).sort((a, b) => byNaturalName(a.name, b.name));
    for (const entry of entries) {
      if (entry.isDirectory()) {
        visit(path.join(dirPath, entry.name));
      }
    }
  }

  visit(facebookRoot);

  return Array.from(packagesByPath.values()).sort((a, b) => a.order - b.order || byNaturalName(a.title, b.title));
}

function resolveOldImage(sectionDir, projectDir, image) {
  const localFile = typeof image === "string" ? image : image && image.local_file;
  if (!localFile) {
    return null;
  }

  const normalizedFile = String(localFile).replace(/[\\/]+/g, path.sep);
  const candidates = [];
  if (path.isAbsolute(normalizedFile)) {
    candidates.push(normalizedFile);
  }
  candidates.push(path.resolve(sectionDir, normalizedFile));
  candidates.push(path.resolve(projectDir, normalizedFile));
  candidates.push(path.resolve(projectDir, path.basename(normalizedFile)));

  const directMatch = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (directMatch) {
    return directMatch;
  }

  if (!image || typeof image === "string" || (!image.sha256 && !image.bytes)) {
    return null;
  }

  const possibleMatches = walkImages(projectDir).filter((candidate) => {
    if (image.bytes && fs.statSync(candidate).size !== image.bytes) {
      return false;
    }
    return image.sha256 ? sha256File(candidate) === image.sha256 : true;
  });

  return possibleMatches.length ? possibleMatches[0] : null;
}

function collectOldProjects() {
  const records = [];
  const sections = [
    { name: "Design", sortOffset: 0 },
    { name: "Production", sortOffset: 50000 },
  ];

  for (const section of sections) {
    const sectionDir = path.join(oldRoot, section.name);
    const indexPath = path.join(sectionDir, "index.json");
    const index = readJson(indexPath);

    for (const project of index.projects || []) {
      const projectDir = path.join(sectionDir, project.folder);
      const metadataPath = project.metadata_file
        ? path.join(sectionDir, project.metadata_file)
        : path.join(projectDir, "metadata.json");
      let imagePaths = [];

      if (fs.existsSync(metadataPath)) {
        const metadata = readJson(metadataPath);
        imagePaths = (metadata.images || [])
          .map((image) => resolveOldImage(sectionDir, projectDir, image))
          .filter(Boolean);
      }

      if (!imagePaths.length && fs.existsSync(projectDir)) {
        imagePaths = walkImages(projectDir);
      }

      const uniqueImagePaths = Array.from(new Set(imagePaths));
      if (!uniqueImagePaths.length) {
        continue;
      }

      const sourceCategories = new Set(project.categories || []);
      const title = normalizeText(project.title);
      const relKey = relativeKey(projectDir, oldRoot);
      const categories = inferCategories(title, Array.from(sourceCategories).join(" "), relKey);
      const secondary = inferSecondaryCategories(section.name, sourceCategories);
      for (const item of secondary) {
        categories.add(item);
      }

      records.push({
        source: "old",
        section: section.name,
        title,
        relPath: relKey,
        order: 100000 + section.sortOffset + Number(project.order || records.length),
        categories,
        images: uniqueImagePaths.map((imagePath) => ({
          sourcePath: imagePath,
          sourceLabel: "old",
        })),
      });
    }
  }

  return records.sort((a, b) => a.order - b.order || byNaturalName(a.title, b.title));
}

function extractExistingTitleOrder(html) {
  const order = new Map();
  const cardPattern = /<article\b[\s\S]*?<\/article>/gi;
  let match;
  let index = 0;
  while ((match = cardPattern.exec(html))) {
    const titleMatch = match[0].match(/<h3>([\s\S]*?)<\/h3>/i);
    if (titleMatch) {
      order.set(normalizeTitle(stripTags(titleMatch[1])), index);
      index += 1;
    }
  }
  return order;
}

function mergePackages(records, existingOrder) {
  const slotsByTitle = new Map();

  for (const record of records) {
    const titleKey = normalizeTitle(record.title);
    if (!titleKey) {
      continue;
    }

    if (!slotsByTitle.has(titleKey)) {
      const existingRank = existingOrder.has(titleKey) ? existingOrder.get(titleKey) : null;
      slotsByTitle.set(titleKey, {
        title: record.title,
        titleKey,
        primarySource: record.source,
        sources: new Set([record.source]),
        relPaths: new Set([record.relPath]),
        categories: new Set(record.categories),
        images: [],
        imageSourcePaths: new Set(),
        sortRank: existingRank !== null ? existingRank : record.order,
      });
    }

    const slot = slotsByTitle.get(titleKey);
    slot.sources.add(record.source);
    slot.relPaths.add(record.relPath);
    for (const category of record.categories) {
      slot.categories.add(category);
    }
    slot.sortRank = Math.min(slot.sortRank, existingOrder.has(titleKey) ? existingOrder.get(titleKey) : record.order);

    for (const image of record.images) {
      const imageKey = path.resolve(image.sourcePath).toLowerCase();
      if (slot.imageSourcePaths.has(imageKey)) {
        continue;
      }
      slot.imageSourcePaths.add(imageKey);
      slot.images.push(image);
    }
  }

  return Array.from(slotsByTitle.values())
    .filter((slot) => slot.images.length)
    .sort((a, b) => a.sortRank - b.sortRank || byNaturalName(a.title, b.title));
}

function orderedCategories(categories) {
  const ordered = [];
  for (const category of secondaryOrder) {
    if (categories.has(category)) {
      ordered.push(category);
    }
  }
  if (!ordered.some((category) => secondaryOrder.includes(category))) {
    ordered.push("design", "production");
  }

  const tertiary = tertiaryOrder.filter((category) => categories.has(category));
  if (!tertiary.length) {
    tertiary.push("branding");
  }

  return [...ordered, ...tertiary];
}

function slotLabel(categories) {
  if (categories.has("restaurants") && categories.has("vehicle")) {
    return "Food Truck / Trailer Wraps";
  }
  if (categories.has("xl-vehicles")) {
    return "XL Vehicle Wraps";
  }
  if (categories.has("specialty-wraps")) {
    return "Specialty Vehicle Wraps";
  }
  if (categories.has("vehicle")) {
    return "Vehicle Wraps";
  }
  if (categories.has("signage") && categories.has("interior")) {
    return "Interior / Window Graphics";
  }
  if (categories.has("signage")) {
    return "Signs / Displays";
  }
  if (categories.has("print")) {
    return "Print / Marketing";
  }
  if (categories.has("branding")) {
    return "Branding / Identity";
  }
  if (categories.has("interior")) {
    return "Interior / Window Graphics";
  }
  return "Portfolio Work";
}

function slotDescription(categories) {
  const pieces = [];
  if (categories.has("design") && categories.has("production")) {
    pieces.push("Design and production");
  } else if (categories.has("design")) {
    pieces.push("Design");
  } else if (categories.has("production")) {
    pieces.push("Production");
  }

  const detailLabels = [
    ["xl-vehicles", "XL vehicle wraps"],
    ["specialty-wraps", "Specialty wraps"],
    ["vehicle", "Vehicle graphics"],
    ["signage", "Signs and displays"],
    ["branding", "Branding"],
    ["print", "Print marketing"],
    ["interior", "Interior graphics"],
    ["contractors", "Contractor fleets"],
    ["dealerships", "Dealership graphics"],
    ["restaurants", "Restaurant and food service"],
    ["schools", "School and youth spaces"],
  ];

  for (const [category, label] of detailLabels) {
    if (categories.has(category) && !pieces.includes(label)) {
      pieces.push(label);
    }
    if (pieces.length >= 4) {
      break;
    }
  }

  return pieces.join(" / ") || "Portfolio work";
}

function prepareGeneratedAssets(slots) {
  if (!writeFiles) {
    return slots;
  }

  const resolvedGeneratedRoot = path.resolve(generatedRoot);
  const resolvedWorkImagesRoot = path.resolve(workImagesRoot);
  if (!resolvedGeneratedRoot.startsWith(`${resolvedWorkImagesRoot}${path.sep}`)) {
    throw new Error(`Refusing to remove unexpected generated asset path: ${resolvedGeneratedRoot}`);
  }

  fs.rmSync(generatedRoot, { recursive: true, force: true });
  fs.mkdirSync(generatedRoot, { recursive: true });

  const usedSlugs = new Set();
  let copiedImages = 0;

  for (const slot of slots) {
    let slug = slugify(slot.title);
    let uniqueSlug = slug;
    let slugCounter = 2;
    while (usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${slugCounter}`;
      slugCounter += 1;
    }
    usedSlugs.add(uniqueSlug);

    const sourceGroup = slot.sources.has("facebook") ? "facebook" : "old";
    const outputDir = path.join(generatedRoot, sourceGroup, uniqueSlug);
    fs.mkdirSync(outputDir, { recursive: true });

    const usedFileNames = new Set();
    slot.images = slot.images.map((image, index) => {
      const ext = path.extname(image.sourcePath).toLowerCase() || ".jpg";
      const rawName = path.basename(image.sourcePath, path.extname(image.sourcePath));
      const cleanName = slugify(rawName);
      let outputFileName = `${String(index + 1).padStart(2, "0")}-${cleanName}${ext}`;
      let fileCounter = 2;
      while (usedFileNames.has(outputFileName)) {
        outputFileName = `${String(index + 1).padStart(2, "0")}-${cleanName}-${fileCounter}${ext}`;
        fileCounter += 1;
      }
      usedFileNames.add(outputFileName);

      const outputPath = path.join(outputDir, outputFileName);
      fs.copyFileSync(image.sourcePath, outputPath);
      copiedImages += 1;

      return {
        ...image,
        outputPath,
        webPath: toWebPath(path.relative(repoRoot, outputPath)),
      };
    });
  }

  return { slots, copiedImages };
}

function renderCard(slot) {
  const categories = orderedCategories(slot.categories).join(" ");
  const title = htmlEscape(slot.title);
  const label = htmlEscape(slotLabel(slot.categories));
  const description = htmlEscape(slotDescription(slot.categories));
  const slides = slot.images
    .map((image, index) => {
      const activeClass = index === 0 ? " is-active" : "";
      return `        <a class="portfolio-slide${activeClass}" data-portfolio-slide href="quote.html"><img src="${htmlEscape(
        image.webPath
      )}" alt="${title} project image ${index + 1}" loading="lazy" decoding="async"></a>`;
    })
    .join("\n");
  const arrows =
    slot.images.length > 1
      ? `\n        <button type="button" class="portfolio-carousel-arrow portfolio-carousel-arrow--prev" data-portfolio-prev aria-label="Show previous ${title} image">&lt;</button>\n        <button type="button" class="portfolio-carousel-arrow portfolio-carousel-arrow--next" data-portfolio-next aria-label="Show next ${title} image">&gt;</button>`
      : "";

  return `      <article class="portfolio-card reveal" data-category="${htmlEscape(categories)}">
        <div class="portfolio-media portfolio-carousel portfolio-media--contain" data-portfolio-carousel aria-label="${title} project image gallery" tabindex="0">
${slides}${arrows}
        </div>
        <div class="portfolio-info">
          <span>${label}</span>
          <h3>${title}</h3>
          <p>${description}</p>
          <a class="text-link" href="quote.html">Start similar project <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg></a>
        </div>
      </article>`;
}

function findGridBounds(html) {
  const gridOpenPattern = /<div class="portfolio-grid" data-filter-grid>/i;
  const openMatch = gridOpenPattern.exec(html);
  if (!openMatch) {
    throw new Error("Could not find portfolio grid in work.html");
  }

  const openStart = openMatch.index;
  const openEnd = openStart + openMatch[0].length;
  const divPattern = /<\/?div\b[^>]*>/gi;
  divPattern.lastIndex = openStart;

  let depth = 0;
  let match;
  while ((match = divPattern.exec(html))) {
    if (match[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) {
        return {
          contentStart: openEnd,
          closeStart: match.index,
        };
      }
    } else {
      depth += 1;
    }
  }

  throw new Error("Could not find closing tag for portfolio grid in work.html");
}

function rebuildWorkHtml(slots) {
  const html = fs.readFileSync(workHtmlPath, "utf8");
  const eol = html.includes("\r\n") ? "\r\n" : "\n";
  const bounds = findGridBounds(html);
  const cardsHtml = slots.map(renderCard).join("\n");
  const insertion = `${eol}${cardsHtml.replace(/\n/g, eol)}${eol}    `;
  const nextHtml = `${html.slice(0, bounds.contentStart)}${insertion}${html.slice(bounds.closeStart)}`;

  if (writeFiles) {
    fs.writeFileSync(workHtmlPath, nextHtml, "utf8");
  }

  return {
    html: nextHtml,
    cardCount: slots.length,
    slideCount: slots.reduce((sum, slot) => sum + slot.images.length, 0),
  };
}

function main() {
  ensurePathExists(sourceRoot, "Updated Portfolio folder");
  ensurePathExists(facebookRoot, "FaceBook folder");
  ensurePathExists(oldRoot, "Old folder");
  ensurePathExists(workHtmlPath, "work.html");

  const existingHtml = fs.readFileSync(workHtmlPath, "utf8");
  const existingOrder = extractExistingTitleOrder(existingHtml);
  const facebookRecords = collectFacebookPackages();
  const oldRecords = collectOldProjects();
  const sourceImageCount = [...facebookRecords, ...oldRecords].reduce((sum, record) => sum + record.images.length, 0);
  const slots = mergePackages([...facebookRecords, ...oldRecords], existingOrder);
  const assetResult = prepareGeneratedAssets(slots);
  const finalSlots = Array.isArray(assetResult) ? assetResult : assetResult.slots;
  const htmlResult = rebuildWorkHtml(finalSlots);
  const copiedImages = Array.isArray(assetResult) ? 0 : assetResult.copiedImages;

  const summary = {
    mode: writeFiles ? "write" : "dry-run",
    facebookPackages: facebookRecords.length,
    oldProjects: oldRecords.length,
    uniqueWorkSlots: htmlResult.cardCount,
    sourceImages: sourceImageCount,
    generatedSlides: htmlResult.slideCount,
    copiedImages,
    workHtml: workHtmlPath,
    generatedRoot,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main();
