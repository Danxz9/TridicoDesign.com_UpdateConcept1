const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { parseHTML } = require("linkedom");

const {
  buildNewsPostFromCandidate,
  extractPostsFromDom,
  filterImages,
  generateExcerpt,
  generateSlug,
  generateTitle,
  hashCandidate,
  inferSourcePostId,
  mergeImportedPosts,
  normalizeSourceUrl,
  slugify,
} = require("../scripts/lib/facebook-news-importer");

test("slug generation keeps date, title, and source id", () => {
  const slug = generateSlug("2026-05-12T12:00:00.000Z", "Fleet Wrap Finished Today!", "1234567890");
  assert.equal(slug, "2026-05-12-fleet-wrap-finished-today-1234567890");
});

test("title and excerpt generation use post text without raw HTML", () => {
  const text = "This is a longer Tridico Design update about a storefront sign that is ready for installation. It has more context.\n\nSecond paragraph.";
  assert.equal(generateTitle(text), "This is a longer Tridico Design update about a storefront sign that is...");
  assert.equal(
    generateExcerpt(text),
    "This is a longer Tridico Design update about a storefront sign that is ready for installation. It has more context. Second paragraph."
  );
});

test("source URL normalization keeps Facebook post identity but removes tracking", () => {
  const normalized = normalizeSourceUrl("https://www.facebook.com/TridicoDesignSolutionsLlc/posts/123/?mibextid=abc&__cft__=x");
  assert.equal(normalized, "https://www.facebook.com/TridicoDesignSolutionsLlc/posts/123");
  assert.equal(inferSourcePostId(normalized), "123");
});

test("content hashing is stable for equivalent candidates", () => {
  const a = hashCandidate({
    text: "Project update",
    dateISO: "2026-05-12T12:00:00.000Z",
    sourceUrl: "https://www.facebook.com/TridicoDesignSolutionsLlc/posts/123",
    images: [{ src: "https://scontent.example.com/a.jpg", width: 1000, height: 800 }],
  });
  const b = hashCandidate({
    text: "Project update",
    dateISO: "2026-05-12T12:00:00.000Z",
    sourceUrl: "https://www.facebook.com/TridicoDesignSolutionsLlc/posts/123?mibextid=tracking",
    images: [{ src: "https://scontent.example.com/a.jpg", width: 1000, height: 800 }],
  });
  assert.equal(a, b);
});

test("image filtering removes icons and profile-style images", () => {
  const images = filterImages([
    { src: "https://static.xx.fbcdn.net/images/emoji.php/v9/t00/1/16/1f44d.png", width: 16, height: 16, alt: "Like" },
    { src: "https://scontent.example.com/profile.jpg", width: 80, height: 80, alt: "Tridico Design profile picture" },
    { src: "https://scontent.example.com/project.jpg?quality=90", width: 1200, height: 800, alt: "Finished wrap" },
  ]);
  assert.equal(images.length, 1);
  assert.equal(images[0].src, "https://scontent.example.com/project.jpg?quality=90");
});

test("registry merge skips duplicate source posts and updates changed hashes", () => {
  const existing = [
    buildNewsPostFromCandidate(
      {
        text: "Original post text",
        dateISO: "2026-05-12T12:00:00.000Z",
        sourceUrl: "https://www.facebook.com/TridicoDesignSolutionsLlc/posts/123",
        sourcePostId: "123",
        sourceContentHash: "old-hash",
      },
      { now: new Date("2026-05-13T00:00:00.000Z") }
    ),
  ];
  const duplicate = mergeImportedPosts(
    existing,
    [{ sourcePostId: "123", sourceUrl: existing[0].sourceUrl, contentHash: existing[0].sourceContentHash, importedSlug: existing[0].slug }],
    [{ text: "Original post text", sourceUrl: existing[0].sourceUrl, sourcePostId: "123", sourceContentHash: existing[0].sourceContentHash }],
    { dryRun: true, now: new Date("2026-05-14T00:00:00.000Z") }
  );
  assert.equal(duplicate.stats.skippedDuplicates, 1);

  const changed = mergeImportedPosts(
    existing,
    [],
    [{ text: "Changed post text", sourceUrl: existing[0].sourceUrl, sourcePostId: "123", sourceContentHash: "new-hash" }],
    { dryRun: true, now: new Date("2026-05-14T00:00:00.000Z") }
  );
  assert.equal(changed.stats.dryRunUpdates.length, 1);
});

test("synthetic Facebook-like HTML fixture extracts one post and ignores UI images", () => {
  const fixturePath = path.join(__dirname, "fixtures", "facebook-post-fragment.html");
  const html = fs.readFileSync(fixturePath, "utf8");
  const { document } = parseHTML(html);
  const posts = extractPostsFromDom(document, {
    pageUrl: "https://www.facebook.com/TridicoDesignSolutionsLlc",
  });

  assert.equal(posts.length, 1);
  assert.equal(posts[0].sourcePostId, "123456789012345");
  assert.equal(posts[0].images.length, 1);
  assert.match(posts[0].text, /Fresh fleet wrap/);
});

test("slugify is ASCII and deterministic", () => {
  assert.equal(slugify("Tridico Design: Wrap & Signage!"), "tridico-design-wrap-and-signage");
});
