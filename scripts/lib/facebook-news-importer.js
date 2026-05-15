const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DEFAULT_FACEBOOK_PAGE_URL = "https://www.facebook.com/TridicoDesignSolutionsLlc";
const DEFAULT_SOURCE_PAGE_NAME = "Tridico Design";
const DEFAULT_MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const DEFAULT_IMAGE_LIMIT = 6;
const DEFAULT_PLACEHOLDER_IMAGE = {
  id: "img_tridico_facebook_news_placeholder",
  src: "assets/images/placeholders/hero-project-montage.svg",
  width: 1200,
  height: 750,
  alt: "Tridico Design news update placeholder image.",
  caption: "Tridico Design update.",
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonFile(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function truncate(value, maxLength) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) {
    return text;
  }
  const clipped = text.slice(0, Math.max(0, maxLength - 3)).trim();
  const boundary = clipped.lastIndexOf(" ");
  const clean = (boundary > maxLength * 0.6 ? clipped.slice(0, boundary) : clipped).replace(/[.,;:!?-]+$/g, "");
  return `${clean}...`;
}

function normalizeParagraphText(value) {
  const rawLines = String(value || "")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const lines = [];
  for (const line of rawLines) {
    if (isFacebookCommentBoundary(line)) {
      break;
    }
    if (!isFacebookUiLine(line)) {
      lines.push(line);
    }
  }

  const paragraphs = [];
  for (const line of lines) {
    if (!paragraphs.includes(line)) {
      paragraphs.push(line);
    }
  }
  return paragraphs.join("\n\n");
}

function normalizeFlatText(value) {
  return normalizeParagraphText(value).replace(/\s+/g, " ").trim();
}

function isFacebookUiLine(line) {
  return /^(like|comment|share|send|follow|message|see more|all reactions:?|photos|videos|reels|about|mentions|reviews|author|reply|·)$/i.test(line) ||
    /^\d+$/i.test(line) ||
    /^\d+\s*[wdhm]$/i.test(line) ||
    /^\d{1,2}:\d{2}\s*\/\s*\d{1,2}:\d{2}$/i.test(line) ||
    /^\d+\s*(comments?|shares?|likes?)$/i.test(line) ||
    /^view\s+\d+\s+more\s+comments?$/i.test(line) ||
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}\s+at\s+\d{1,2}:\d{2}\s*(AM|PM)$/i.test(line) ||
    /^most relevant$/i.test(line);
}

function isFacebookCommentBoundary(line) {
  return /^all reactions:?$/i.test(line) ||
    /^view\s+more\s+comments?/i.test(line) ||
    /^view\s+\d+\s+more\s+comments?/i.test(line) ||
    /^comments?$/i.test(line) ||
    /^most relevant$/i.test(line);
}

function firstSentence(value) {
  const text = normalizeFlatText(value);
  const match = text.match(/^(.{20,}?[\.\?!])\s/);
  return match ? match[1] : text;
}

function generateTitle(text) {
  const normalized = normalizeParagraphText(text);
  const [firstLine] = normalized.split(/\n{2,}/).filter(Boolean);
  if (firstLine && firstLine.length <= 80 && /[a-z0-9]/i.test(firstLine)) {
    return firstLine;
  }

  const sentence = firstSentence(normalized);
  if (sentence && /[a-z0-9]/i.test(sentence)) {
    return truncate(sentence, 80);
  }

  return "Tridico Design Update";
}

function generateExcerpt(text) {
  const flat = normalizeFlatText(text);
  return flat ? truncate(flat, 160) : "A public Tridico Design project or company update.";
}

function hashString(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function normalizeSourceUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value, DEFAULT_FACEBOOK_PAGE_URL);
    url.hash = "";
    for (const param of [...url.searchParams.keys()]) {
      if (!["story_fbid", "id", "fbid", "set", "v"].includes(param)) {
        url.searchParams.delete(param);
      }
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return String(value).trim();
  }
}

function normalizeImageUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value, DEFAULT_FACEBOOK_PAGE_URL);
    url.hash = "";
    return url.toString();
  } catch {
    return String(value).trim();
  }
}

function inferSourcePostId(sourceUrl) {
  const normalized = normalizeSourceUrl(sourceUrl);
  if (!normalized) {
    return "";
  }

  try {
    const url = new URL(normalized);
    const params = url.searchParams;
    for (const key of ["story_fbid", "fbid", "v"]) {
      const value = params.get(key);
      if (value) {
        return slugify(value).slice(0, 80);
      }
    }

    const pathParts = url.pathname.split("/").filter(Boolean);
    const postIndex = pathParts.findIndex((part) => ["posts", "videos", "permalink", "photos"].includes(part));
    if (postIndex >= 0 && pathParts[postIndex + 1]) {
      return slugify(pathParts.slice(postIndex + 1).join("-")).slice(0, 80);
    }

    const pfbid = normalized.match(/(pfbid[a-z0-9]+)/i);
    if (pfbid) {
      return slugify(pfbid[1]).slice(0, 80);
    }
  } catch {
    // Fall through to hash.
  }

  return `url-${hashString(normalized).slice(0, 16)}`;
}

function parsePublishedDate(candidate, now = new Date()) {
  const inputs = [candidate.dateISO, candidate.dateText].filter(Boolean);
  for (const input of inputs) {
    const parsed = Date.parse(input);
    if (!Number.isNaN(parsed)) {
      return { iso: new Date(parsed).toISOString(), approximate: false };
    }

    const monthDay = String(input).match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}\b/i);
    if (monthDay) {
      const withYear = `${monthDay[0]} ${now.getUTCFullYear()}`;
      const parsedWithYear = Date.parse(withYear);
      if (!Number.isNaN(parsedWithYear)) {
        return { iso: new Date(parsedWithYear).toISOString(), approximate: true };
      }
    }
  }

  return { iso: now.toISOString(), approximate: true };
}

function hashCandidate(candidate) {
  const text = normalizeFlatText(candidate.text || candidate.caption || "");
  const firstImage = stableImageIdentity(filterImages(candidate.images || [])[0]?.src || "");
  const parsedDate = candidate.dateISO ? Date.parse(candidate.dateISO) : Number.NaN;
  const date = Number.isNaN(parsedDate) ? "" : new Date(parsedDate).toISOString();
  const url = normalizeSourceUrl(candidate.sourceUrl || candidate.permalinkUrl || "");
  return hashString([text, date, firstImage, url].join("\n"));
}

function stableImageIdentity(src) {
  if (!src) {
    return "";
  }
  try {
    const url = new URL(src, DEFAULT_FACEBOOK_PAGE_URL);
    url.hash = "";
    url.search = "";
    return url.toString();
  } catch {
    return String(src).split("?")[0];
  }
}

function generateSlug(datePublished, title, sourcePostId) {
  const datePart = new Date(datePublished).toISOString().slice(0, 10);
  const titlePart = slugify(title).slice(0, 72) || "tridico-design-update";
  const idPart = slugify(sourcePostId).slice(0, 28) || hashString(title).slice(0, 10);
  return slugify(`${datePart}-${titlePart}-${idPart}`);
}

function imageUrlLooksMeaningful(src) {
  if (!src || /^data:/i.test(src) || /^blob:/i.test(src)) {
    return false;
  }

  const lowered = src.toLowerCase();
  const blocked = [
    "emoji",
    "reaction",
    "rsrc.php",
    "static.xx.fbcdn.net",
    "profile",
    "avatar",
    "sprite",
    "spacer",
    "pixel",
    "tracking",
    "safe_image.php",
  ];

  return !blocked.some((token) => lowered.includes(token));
}

function isMeaningfulImage(image) {
  if (!image || !imageUrlLooksMeaningful(image.src)) {
    return false;
  }

  const alt = String(image.alt || "").toLowerCase();
  if (/(profile picture|avatar|emoji|reaction|sticker|icon|like|comment|share|tridico design'?s profile)/i.test(alt)) {
    return false;
  }

  const width = Number(image.width || image.naturalWidth || 0);
  const height = Number(image.height || image.naturalHeight || 0);
  if (width && height) {
    if (width < 120 || height < 120) {
      return false;
    }
    if (width * height < 20000) {
      return false;
    }
  }

  return true;
}

function filterImages(images, limit = DEFAULT_IMAGE_LIMIT) {
  const seen = new Set();
  const result = [];
  for (const image of images || []) {
    const src = normalizeImageUrl(image.src || image.currentSrc || "");
    if (!src || seen.has(src) || !isMeaningfulImage({ ...image, src })) {
      continue;
    }
    seen.add(src);
    result.push({
      src,
      alt: image.alt || "",
      width: Number(image.width || image.naturalWidth || 0) || undefined,
      height: Number(image.height || image.naturalHeight || 0) || undefined,
    });
    if (result.length >= limit) {
      break;
    }
  }
  return result;
}

function inferCategoryAndTags(text) {
  const haystack = normalizeFlatText(text).toLowerCase();
  const categoryRules = [
    { category: "Vehicle Wraps", terms: ["wrap", "vehicle", "fleet", "truck", "trailer", "van", "car", "semi", "food truck"] },
    { category: "Signage", terms: ["sign", "signage", "storefront", "window graphics", "wall graphics", "banner", "display"] },
    { category: "Printing", terms: ["print", "printed", "decal", "decals", "collateral", "business card", "brochure"] },
    { category: "Branding", terms: ["brand", "branding", "logo", "identity"] },
    { category: "Installations", terms: ["install", "installation", "installed", "onsite", "on-site"] },
    { category: "Behind the Scenes", terms: ["shop", "process", "behind the scenes", "production", "prep"] },
  ];

  const match = categoryRules.find((rule) => rule.terms.some((term) => haystack.includes(term)));
  const category = match ? match.category : "Company Updates";
  const tagMap = [
    ["fleet branding", ["fleet", "vehicles"]],
    ["box truck", ["box truck"]],
    ["semi truck", ["semi"]],
    ["pickup truck", ["pickup"]],
    ["food truck", ["food truck", "trailer"]],
    ["storefront", ["storefront"]],
    ["wall graphics", ["wall graphics", "wall wrap"]],
    ["decals", ["decal", "decals"]],
    ["banners", ["banner", "banners"]],
    ["design", ["design", "layout", "artwork"]],
    ["print", ["print", "printed", "printing"]],
    ["install", ["install", "installed", "installation"]],
    ["local business", ["local", "business", "company"]],
    ["project spotlight", ["project", "spotlight", "finished", "completed"]],
    ["before after", ["before", "after"]],
  ];

  const tags = tagMap
    .filter(([, terms]) => terms.some((term) => haystack.includes(term)))
    .map(([label]) => label);

  if (!tags.includes("project spotlight") && ["Vehicle Wraps", "Signage", "Printing", "Branding", "Installations"].includes(category)) {
    tags.unshift("project spotlight");
  }
  if (!tags.length) {
    tags.push("local business");
  }

  return { category, tags: [...new Set(tags)].slice(0, 6) };
}

function estimateReadingTime(text) {
  const words = normalizeFlatText(text).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function buildNewsPostFromCandidate(candidate, options = {}) {
  const now = options.now || new Date();
  const existingPost = options.existingPost;
  const autoPublish = options.autoPublish !== false;
  const sourceUrl = normalizeSourceUrl(candidate.sourceUrl || candidate.permalinkUrl || options.pageUrl || DEFAULT_FACEBOOK_PAGE_URL);
  const sourcePostId = candidate.sourcePostId || inferSourcePostId(sourceUrl) || `hash-${hashString(sourceUrl || candidate.text).slice(0, 16)}`;
  const text = normalizeParagraphText(candidate.text || candidate.caption || "");
  const title = generateTitle(text);
  const excerpt = generateExcerpt(text);
  const published = parsePublishedDate(candidate, now);
  const sourceContentHash = candidate.sourceContentHash || hashCandidate({ ...candidate, sourceUrl });
  const slug = existingPost?.slug || generateSlug(published.iso, title, sourcePostId);
  const id = existingPost?.id || `news_fb_${new Date(published.iso).toISOString().slice(0, 10).replace(/-/g, "_")}_${slugify(sourcePostId).slice(0, 40)}`;
  const categoryAndTags = inferCategoryAndTags(text);
  const localImages = options.images && options.images.length ? options.images : [];
  const existingImages = existingPost?.images && existingPost.images.length ? existingPost.images : [];
  const images = localImages.length
    ? localImages
    : existingImages.length
      ? existingImages
      : [{ ...DEFAULT_PLACEHOLDER_IMAGE, id: `img_${slug}_placeholder` }];

  return {
    id,
    slug,
    title,
    excerpt,
    body: text || "A public Tridico Design project or company update.",
    contentFormat: "social-import",
    category: categoryAndTags.category,
    tags: categoryAndTags.tags,
    source: "facebook",
    sourcePlatform: "facebook",
    sourceLabel: "Facebook",
    sourcePageName: DEFAULT_SOURCE_PAGE_NAME,
    sourceUrl,
    sourcePostId,
    sourceContentHash,
    datePublished: published.iso,
    datePublishedIsApproximate: published.approximate,
    dateImported: existingPost?.dateImported || now.toISOString(),
    lastSeenAt: now.toISOString(),
    readingTime: estimateReadingTime(text),
    featuredImage: images[0],
    thumbnailImage: images[0],
    images,
    sourceImages: filterImages(candidate.images || []),
    attachmentTitle: candidate.attachmentTitle,
    status: autoPublish ? "published" : "draft",
    priority: existingPost?.priority || 70,
    popularityScore: existingPost?.popularityScore || 70,
    isFeatured: Boolean(existingPost?.isFeatured),
    isPinned: Boolean(existingPost?.isPinned),
    isTrending: Boolean(existingPost?.isTrending),
    contentHash: sourceContentHash,
  };
}

function indexExistingPosts(posts, registryRecords) {
  const bySourcePostId = new Map();
  const bySourceUrl = new Map();
  const byContentHash = new Map();

  for (const post of posts || []) {
    if (post.sourcePostId) {
      bySourcePostId.set(String(post.sourcePostId), post);
    }
    const normalizedUrl = normalizeSourceUrl(post.sourceUrl);
    if (normalizedUrl) {
      bySourceUrl.set(normalizedUrl, post);
    }
    const contentHash = post.sourceContentHash || post.contentHash;
    if (contentHash) {
      byContentHash.set(contentHash, post);
    }
  }

  for (const record of registryRecords || []) {
    const registryPost = {
      slug: record.importedSlug,
      sourcePostId: record.sourcePostId,
      sourceUrl: record.sourceUrl,
      sourceContentHash: record.contentHash,
      contentHash: record.contentHash,
      dateImported: record.dateImported,
    };
    if (record.sourcePostId && !bySourcePostId.has(record.sourcePostId)) {
      bySourcePostId.set(record.sourcePostId, registryPost);
    }
    const normalizedUrl = normalizeSourceUrl(record.sourceUrl);
    if (normalizedUrl && !bySourceUrl.has(normalizedUrl)) {
      bySourceUrl.set(normalizedUrl, registryPost);
    }
    if (record.contentHash && !byContentHash.has(record.contentHash)) {
      byContentHash.set(record.contentHash, registryPost);
    }
  }

  return { bySourcePostId, bySourceUrl, byContentHash };
}

function findExistingImport(candidate, indexes) {
  const sourceUrl = normalizeSourceUrl(candidate.sourceUrl || candidate.permalinkUrl || "");
  const sourcePostId = candidate.sourcePostId || inferSourcePostId(sourceUrl);
  const contentHash = candidate.sourceContentHash || hashCandidate({ ...candidate, sourceUrl });

  if (sourcePostId && indexes.bySourcePostId.has(sourcePostId)) {
    return { post: indexes.bySourcePostId.get(sourcePostId), matchType: "sourcePostId", contentHash };
  }
  if (sourceUrl && indexes.bySourceUrl.has(sourceUrl)) {
    return { post: indexes.bySourceUrl.get(sourceUrl), matchType: "sourceUrl", contentHash };
  }
  if (contentHash && indexes.byContentHash.has(contentHash)) {
    return { post: indexes.byContentHash.get(contentHash), matchType: "contentHash", contentHash };
  }

  return { post: null, matchType: "new", contentHash };
}

function mergeImportedPosts(existingPosts, registryRecords, candidates, options = {}) {
  const now = options.now || new Date();
  const posts = [...(existingPosts || [])];
  const registry = [...(registryRecords || [])];
  const indexes = indexExistingPosts(posts, registry);
  const stats = {
    imported: 0,
    updated: 0,
    skippedDuplicates: 0,
    skippedMissingContent: 0,
    dryRunCreates: [],
    dryRunUpdates: [],
  };

  for (const candidate of candidates || []) {
    const text = normalizeFlatText(candidate.text || candidate.caption || "");
    const images = filterImages(candidate.images || []);
    if (!text && !images.length) {
      stats.skippedMissingContent += 1;
      continue;
    }

    const sourceUrl = normalizeSourceUrl(candidate.sourceUrl || candidate.permalinkUrl || options.pageUrl || DEFAULT_FACEBOOK_PAGE_URL);
    const sourcePostId = candidate.sourcePostId || inferSourcePostId(sourceUrl);
    const sourceContentHash = candidate.sourceContentHash || hashCandidate({ ...candidate, sourceUrl });
    const existing = findExistingImport({ ...candidate, sourceUrl, sourcePostId, sourceContentHash }, indexes);
    const sameHash = existing.post && (existing.post.sourceContentHash || existing.post.contentHash) === sourceContentHash;

    if (sameHash) {
      stats.skippedDuplicates += 1;
      continue;
    }

    const post = buildNewsPostFromCandidate(
      { ...candidate, sourceUrl, sourcePostId, sourceContentHash },
      { ...options, existingPost: existing.post, now }
    );

    if (options.dryRun) {
      if (existing.post) {
        stats.dryRunUpdates.push(post);
      } else {
        stats.dryRunCreates.push(post);
      }
      continue;
    }

    if (existing.post) {
      const index = posts.findIndex((item) => item.slug === existing.post.slug || item.sourcePostId === existing.post.sourcePostId);
      if (index >= 0) {
        posts[index] = { ...posts[index], ...post, slug: posts[index].slug };
      } else {
        posts.push(post);
      }
      stats.updated += 1;
    } else {
      posts.push(post);
      stats.imported += 1;
    }

    const registryRecord = {
      sourcePostId,
      sourceUrl,
      contentHash: sourceContentHash,
      importedSlug: post.slug,
      dateImported: post.dateImported,
      lastSeenAt: now.toISOString(),
    };
    const registryIndex = registry.findIndex((record) => {
      return (
        (sourcePostId && record.sourcePostId === sourcePostId) ||
        (sourceUrl && normalizeSourceUrl(record.sourceUrl) === sourceUrl)
      );
    });
    if (registryIndex >= 0) {
      registry[registryIndex] = { ...registry[registryIndex], ...registryRecord };
    } else {
      registry.push(registryRecord);
    }

    indexes.bySourcePostId.set(sourcePostId, post);
    indexes.bySourceUrl.set(sourceUrl, post);
    indexes.byContentHash.set(sourceContentHash, post);
  }

  return { posts, registry, stats };
}

function findPermalink(links, pageUrl) {
  const candidates = links
    .map((href) => normalizeSourceUrl(href))
    .filter(Boolean)
    .filter((href) => {
      const lowered = href.toLowerCase();
      return (
        lowered.includes("story_fbid=") ||
        lowered.includes("/posts/") ||
        lowered.includes("/permalink/") ||
        lowered.includes("/photos/") ||
        lowered.includes("/videos/") ||
        lowered.includes("pfbid")
      );
    });

  return candidates[0] || normalizeSourceUrl(pageUrl);
}

function extractPostsFromDom(root, options = {}) {
  const pageUrl = options.pageUrl || DEFAULT_FACEBOOK_PAGE_URL;
  const containers = Array.from(
    root.querySelectorAll('[role="article"], article, [data-pagelet*="FeedUnit"], [aria-posinset]')
  );
  const posts = [];
  const seen = new Set();

  for (const container of containers) {
    const rawText = container.textContent || "";
    const text = normalizeParagraphText(rawText);
    const anchors = Array.from(container.querySelectorAll("a[href]"));
    const links = anchors.map((anchor) => anchor.getAttribute("href")).filter(Boolean);
    const permalinkUrl = findPermalink(links, pageUrl);
    const sourcePostId = inferSourcePostId(permalinkUrl);
    const dateNode =
      container.querySelector("time[datetime]") ||
      container.querySelector("abbr[title]") ||
      anchors.find((anchor) => /(\d{4}|yesterday|today|at\s+\d)/i.test(anchor.textContent || anchor.getAttribute("aria-label") || ""));
    const dateISO = dateNode?.getAttribute?.("datetime") || "";
    const dateText = dateNode?.getAttribute?.("title") || dateNode?.getAttribute?.("aria-label") || dateNode?.textContent || "";
    const images = filterImages(
      Array.from(container.querySelectorAll("img")).map((img) => ({
        src: img.getAttribute("src") || img.getAttribute("data-src") || "",
        alt: img.getAttribute("alt") || "",
        width: img.getAttribute("width") || img.naturalWidth,
        height: img.getAttribute("height") || img.naturalHeight,
      }))
    );

    if (!text && !images.length) {
      continue;
    }

    const key = sourcePostId || permalinkUrl || hashString(`${text}${images[0]?.src || ""}`);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    posts.push({
      sourceUrl: permalinkUrl,
      permalinkUrl,
      sourcePostId,
      text,
      dateISO,
      dateText: normalizeFlatText(dateText),
      images,
    });
  }

  return posts;
}

async function scrapeFacebookPosts(options = {}) {
  const pageUrl = options.pageUrl || DEFAULT_FACEBOOK_PAGE_URL;
  const limit = Number(options.limit || 20);
  const maxScrolls = Number(options.maxScrolls || 12);
  const warnings = [];
  const candidates = [];
  const seen = new Set();
  let browser;

  try {
    const { chromium } = require("playwright");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1366, height: 1100 },
      locale: "en-US",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2500);

    let stagnantScrolls = 0;
    for (let scroll = 0; scroll <= maxScrolls; scroll += 1) {
      const batch = await page.evaluate((browserPageUrl) => {
        const normalizeSourceUrl = (value) => {
          if (!value) return "";
          try {
            const url = new URL(value, browserPageUrl);
            url.hash = "";
            for (const param of [...url.searchParams.keys()]) {
              if (!["story_fbid", "id", "fbid", "set", "v"].includes(param)) {
                url.searchParams.delete(param);
              }
            }
            return url.toString().replace(/\/$/, "");
          } catch {
            return String(value).trim();
          }
        };
        const slugify = (value) =>
          String(value || "")
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/&/g, " and ")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        const inferSourcePostId = (sourceUrl) => {
          const normalized = normalizeSourceUrl(sourceUrl);
          if (!normalized) return "";
          try {
            const url = new URL(normalized);
            for (const key of ["story_fbid", "fbid", "v"]) {
              const value = url.searchParams.get(key);
              if (value) return slugify(value).slice(0, 80);
            }
            const pathParts = url.pathname.split("/").filter(Boolean);
            const postIndex = pathParts.findIndex((part) => ["posts", "videos", "permalink", "photos"].includes(part));
            if (postIndex >= 0 && pathParts[postIndex + 1]) {
              return slugify(pathParts.slice(postIndex + 1).join("-")).slice(0, 80);
            }
            const pfbid = normalized.match(/(pfbid[a-z0-9]+)/i);
            if (pfbid) return slugify(pfbid[1]).slice(0, 80);
          } catch {
            return "";
          }
          return "";
        };
        const isUiLine = (line) =>
          /^(like|comment|share|send|follow|message|see more|all reactions|photos|videos|reels|about|mentions|reviews)$/i.test(line) ||
          /^\d+\s*(comments?|shares?|likes?)$/i.test(line) ||
          /^view\s+\d+\s+more\s+comments?$/i.test(line) ||
          /^most relevant$/i.test(line);
        const normalizeText = (value) => {
          const lines = String(value || "")
            .replace(/\r/g, "\n")
            .replace(/\u00a0/g, " ")
            .split(/\n+/)
            .map((line) => line.replace(/\s+/g, " ").trim())
            .filter(Boolean)
            .filter((line) => !isUiLine(line));
          return [...new Set(lines)].join("\n\n");
        };
        const imageUrlLooksMeaningful = (src) => {
          if (!src || /^data:/i.test(src) || /^blob:/i.test(src)) return false;
          const lowered = src.toLowerCase();
          return !["emoji", "reaction", "rsrc.php", "static.xx.fbcdn.net", "profile", "avatar", "sprite", "spacer", "pixel", "tracking", "safe_image.php"].some((token) => lowered.includes(token));
        };
        const isMeaningfulImage = (image) => {
          if (!imageUrlLooksMeaningful(image.src)) return false;
          if (/(profile picture|avatar|emoji|reaction|sticker|icon|like|comment|share)/i.test(image.alt || "")) return false;
          if (image.width && image.height) {
            if (image.width < 120 || image.height < 120) return false;
            if (image.width * image.height < 20000) return false;
          }
          return true;
        };
        const normalizeImageUrl = (value) => {
          if (!value) return "";
          try {
            const url = new URL(value, browserPageUrl);
            url.hash = "";
            return url.toString();
          } catch {
            return String(value).trim();
          }
        };
        const filterImages = (images) => {
          const seen = new Set();
          const result = [];
          for (const image of images) {
            const src = normalizeImageUrl(image.src || "");
            if (!src || seen.has(src) || !isMeaningfulImage({ ...image, src })) continue;
            seen.add(src);
            result.push({ src, alt: image.alt || "", width: image.width || undefined, height: image.height || undefined });
            if (result.length >= 6) break;
          }
          return result;
        };
        const findPermalink = (links) => {
          const candidates = links
            .map((href) => normalizeSourceUrl(href))
            .filter(Boolean)
            .filter((href) => {
              const lowered = href.toLowerCase();
              return lowered.includes("story_fbid=") || lowered.includes("/posts/") || lowered.includes("/permalink/") || lowered.includes("/photos/") || lowered.includes("/videos/") || lowered.includes("pfbid");
            });
          return candidates[0] || normalizeSourceUrl(browserPageUrl);
        };
        const containers = Array.from(document.querySelectorAll('[role="article"], article, [data-pagelet*="FeedUnit"], [aria-posinset]'));
        return containers
          .map((container) => {
            const text = normalizeText(container.innerText || container.textContent || "");
            const anchors = Array.from(container.querySelectorAll("a[href]"));
            const links = anchors.map((anchor) => anchor.href).filter(Boolean);
            const permalinkUrl = findPermalink(links);
            const sourcePostId = inferSourcePostId(permalinkUrl);
            const dateNode =
              container.querySelector("time[datetime]") ||
              container.querySelector("abbr[title]") ||
              anchors.find((anchor) => /(\d{4}|yesterday|today|at\s+\d)/i.test(anchor.textContent || anchor.getAttribute("aria-label") || ""));
            const images = filterImages(
              Array.from(container.querySelectorAll("img")).map((img) => ({
                src: img.currentSrc || img.src || img.getAttribute("src") || "",
                alt: img.alt || "",
                width: img.naturalWidth || Number(img.getAttribute("width")) || 0,
                height: img.naturalHeight || Number(img.getAttribute("height")) || 0,
              }))
            );
            return {
              sourceUrl: permalinkUrl,
              permalinkUrl,
              sourcePostId,
              text,
              dateISO: dateNode?.getAttribute?.("datetime") || "",
              dateText: normalizeText(dateNode?.getAttribute?.("title") || dateNode?.getAttribute?.("aria-label") || dateNode?.textContent || "").replace(/\s+/g, " "),
              images,
            };
          })
          .filter((post) => post.text || post.images.length);
      }, pageUrl);

      let newCount = 0;
      for (const post of batch) {
        const key = post.sourcePostId || normalizeSourceUrl(post.sourceUrl) || hashCandidate(post);
        if (!seen.has(key)) {
          seen.add(key);
          candidates.push(post);
          newCount += 1;
        }
      }

      if (candidates.length >= limit) {
        break;
      }
      if (newCount === 0) {
        stagnantScrolls += 1;
      } else {
        stagnantScrolls = 0;
      }
      if (stagnantScrolls >= 5) {
        warnings.push("Stopped scrolling because no new public posts were discovered after several attempts.");
        break;
      }

      await page.mouse.wheel(0, 2600);
      await page.waitForTimeout(1500);
    }

    const pageText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
    if (!candidates.length && /log in|sign up|temporarily blocked|not available/i.test(pageText)) {
      return {
        candidates: [],
        warnings: ["Facebook public page content could not be loaded. No login/API fallback is used by design."],
        blocked: true,
      };
    }

    return { candidates: candidates.slice(0, limit), warnings, blocked: false };
  } catch (error) {
    return {
      candidates: [],
      warnings: [`Facebook public page content could not be loaded. No login/API fallback is used by design. ${error.message}`],
      blocked: true,
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

function mimeToExtension(mimeType) {
  const normalized = String(mimeType || "").split(";")[0].trim().toLowerCase();
  if (normalized === "image/jpeg") return ".jpg";
  if (normalized === "image/png") return ".png";
  if (normalized === "image/webp") return ".webp";
  if (normalized === "image/gif") return ".gif";
  return "";
}

async function downloadImagesForCandidate(candidate, options = {}) {
  const images = filterImages(candidate.images || []);
  const stats = options.stats;
  if (options.noImages || options.dryRun || !images.length) {
    return [];
  }

  const repoRoot = options.repoRoot || process.cwd();
  const postId = slugify(candidate.sourcePostId || inferSourcePostId(candidate.sourceUrl) || hashCandidate(candidate)).slice(0, 80);
  const outputDir = path.join(repoRoot, "assets", "images", "news", "facebook", postId);
  const saved = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    if (stats) stats.imageDownloadsAttempted += 1;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(image.src, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 TridicoDesignPublicNewsImporter/1.0",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const extension = mimeToExtension(contentType);
      if (!extension) {
        throw new Error(`Unsupported image MIME type: ${contentType || "unknown"}`);
      }

      const contentLength = Number(response.headers.get("content-length") || 0);
      if (contentLength > DEFAULT_MAX_IMAGE_BYTES) {
        throw new Error(`Image exceeds ${DEFAULT_MAX_IMAGE_BYTES} bytes`);
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > DEFAULT_MAX_IMAGE_BYTES) {
        throw new Error(`Image exceeds ${DEFAULT_MAX_IMAGE_BYTES} bytes`);
      }

      ensureDir(outputDir);
      const fileName = `image-${String(index + 1).padStart(2, "0")}${extension}`;
      const outputPath = path.join(outputDir, fileName);
      fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
      const src = path.relative(repoRoot, outputPath).replace(/\\/g, "/");
      saved.push({
        id: `img_${postId}_${index + 1}`,
        src,
        width: image.width || 1200,
        height: image.height || 800,
        alt: image.alt || "Tridico Design Facebook news image",
        caption: "Public Tridico Design project update image.",
        sourceUrl: image.src,
      });
      if (stats) stats.imageDownloadsSucceeded += 1;
    } catch (error) {
      if (stats) {
        stats.imageDownloadsFailed += 1;
        stats.warnings.push(`Image download failed for ${image.src}: ${error.message}`);
      }
    }
  }

  return saved;
}

function filterCandidatesByDate(candidates, options = {}) {
  const since = options.since ? Date.parse(options.since) : null;
  const until = options.until ? Date.parse(options.until) : null;
  if (!since && !until) {
    return candidates;
  }

  return candidates.filter((candidate) => {
    const parsed = Date.parse(candidate.dateISO || candidate.dateText || "");
    if (Number.isNaN(parsed)) {
      return true;
    }
    if (since && parsed < since) {
      return false;
    }
    if (until && parsed > until) {
      return false;
    }
    return true;
  });
}

module.exports = {
  DEFAULT_FACEBOOK_PAGE_URL,
  DEFAULT_PLACEHOLDER_IMAGE,
  buildNewsPostFromCandidate,
  downloadImagesForCandidate,
  ensureDir,
  estimateReadingTime,
  extractPostsFromDom,
  filterCandidatesByDate,
  filterImages,
  generateExcerpt,
  generateSlug,
  generateTitle,
  hashCandidate,
  hashString,
  inferCategoryAndTags,
  inferSourcePostId,
  isMeaningfulImage,
  mergeImportedPosts,
  normalizeFlatText,
  normalizeImageUrl,
  normalizeParagraphText,
  normalizeSourceUrl,
  parsePublishedDate,
  readJsonFile,
  scrapeFacebookPosts,
  slugify,
  writeJsonFile,
};
