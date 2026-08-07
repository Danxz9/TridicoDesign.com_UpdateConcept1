const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { parseHTML } = require("linkedom");

const {
  buildNewsPostFromCandidate,
  deduplicateImportedPosts,
  extractPostsFromDom,
  filterImages,
  generateExcerpt,
  generateSlug,
  generateTitle,
  hashCandidate,
  inferSourcePostId,
  isVerifiedFacebookPostUrl,
  mergeImportedPosts,
  normalizeSourceUrl,
  parsePublishedDate,
  planListingMedia,
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

test("image filtering treats Facebook CDN host and query variants as one image", () => {
  const images = filterImages([
    {
      src: "https://scontent-iad6-1.xx.fbcdn.net/v/t39.30808-6/737422202_1561398535779728_4246175415937789071_n.jpg?quality=90",
      width: 1200,
      height: 800,
    },
    {
      src: "https://scontent-sjc3-1.xx.fbcdn.net/v/t39.30808-6/737422202_1561398535779728_4246175415937789071_n.jpg?quality=70",
      width: 590,
      height: 590,
    },
  ]);

  assert.equal(images.length, 1);
});

test("month and day Facebook dates use the current year instead of JavaScript's 2001 fallback", () => {
  const published = parsePublishedDate(
    { dateText: "Jul 4" },
    new Date("2026-08-07T12:00:00.000Z")
  );

  assert.equal(published.iso.slice(0, 10), "2026-07-04");
  assert.equal(published.approximate, true);
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
    [{ text: "Original post text", dateISO: "2026-05-12T12:00:00.000Z", sourceUrl: existing[0].sourceUrl, sourcePostId: "123", sourceContentHash: existing[0].sourceContentHash }],
    { dryRun: true, now: new Date("2026-05-14T00:00:00.000Z") }
  );
  assert.equal(duplicate.stats.skippedDuplicates, 1);

  const changed = mergeImportedPosts(
    existing,
    [],
    [{ text: "Changed post text", dateISO: "2026-05-12T12:00:00.000Z", sourceUrl: existing[0].sourceUrl, sourcePostId: "123", sourceContentHash: "new-hash" }],
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

test("post extraction rejects page-wide content without a verifiable permalink", () => {
  const { document } = parseHTML(`
    <div role="article">
      <h2>Tridico Design</h2>
      <p>Page-wide text that must never become a news post.</p>
      <img src="https://scontent.example.com/page.jpg" width="1200" height="800">
    </div>
  `);

  assert.equal(
    isVerifiedFacebookPostUrl("https://www.facebook.com/TridicoDesignSolutionsLlc"),
    false
  );
  assert.deepEqual(
    extractPostsFromDom(document, {
      pageUrl: "https://www.facebook.com/TridicoDesignSolutionsLlc",
    }),
    []
  );
});

test("post extraction prefers scoped child posts over a nested feed wrapper", () => {
  const { document } = parseHTML(`
    <div role="article" id="feed-wrapper">
      <p>Unrelated feed chrome that must not leak into a post.</p>
      <div role="article" aria-posinset="1">
        <h2>Tridico Design</h2>
        <a href="https://www.facebook.com/TridicoDesignSolutionsLlc/posts/111">May 12, 2026</a>
        <p>First real project update.</p>
        <img src="https://scontent.example.com/first.jpg" width="1200" height="800">
      </div>
      <div role="article" aria-posinset="2">
        <h2>Tridico Design</h2>
        <a href="https://www.facebook.com/TridicoDesignSolutionsLlc/posts/222">May 13, 2026</a>
        <p>Second real project update.</p>
        <img src="https://scontent.example.com/second.jpg" width="1200" height="800">
      </div>
    </div>
  `);

  const posts = extractPostsFromDom(document, {
    pageUrl: "https://www.facebook.com/TridicoDesignSolutionsLlc",
  });

  assert.equal(posts.length, 2);
  assert.deepEqual(posts.map((post) => post.sourcePostId), ["111", "222"]);
  assert.deepEqual(posts.map((post) => post.text), ["First real project update.", "Second real project update."]);
  assert.deepEqual(posts.map((post) => post.images[0].src), [
    "https://scontent.example.com/first.jpg",
    "https://scontent.example.com/second.jpg",
  ]);
});

test("post extraction recognizes Facebook relative-time permalink labels", () => {
  const { document } = parseHTML(`
    <div role="article">
      <a href="https://www.facebook.com/TridicoDesignSolutionsLlc/posts/333">5h</a>
      <p>Fresh same-day project update.</p>
      <img src="https://scontent.example.com/fresh.jpg" width="1200" height="800">
    </div>
  `);

  const posts = extractPostsFromDom(document, {
    pageUrl: "https://www.facebook.com/TridicoDesignSolutionsLlc",
    now: new Date("2026-08-07T12:00:00.000Z"),
  });

  assert.equal(posts.length, 1);
  assert.equal(posts[0].dateText, "5h");
});

test("import repair collapses cloned posts and drops page-root records", () => {
  const first = buildNewsPostFromCandidate(
    {
      text: "Tridico Design\n\nHappy Friday!! Did you knowâ€¦ We also do shirts!!",
      dateISO: "2026-06-05T12:00:00.000Z",
      sourceUrl: "https://www.facebook.com/TridicoDesignSolutionsLlc/posts/111",
      sourcePostId: "111",
      images: [{ src: "https://scontent-iad.example.com/v/t39.30808-6/shirts_n.jpg?one=1", width: 1200, height: 800 }],
    },
    {
      now: new Date("2026-06-05T13:00:00.000Z"),
      images: [{ id: "first", src: "assets/images/news/facebook/111/image-01.jpg", width: 1200, height: 800, alt: "Shirts" }],
    }
  );
  const clone = buildNewsPostFromCandidate(
    {
      text: "Tridico Design\n\nHappy Friday!! Did you knowâ€¦ We also do shirts!!",
      dateISO: "2026-06-06T12:00:00.000Z",
      sourceUrl: "https://www.facebook.com/TridicoDesignSolutionsLlc/posts/222",
      sourcePostId: "222",
      images: [{ src: "https://scontent-sjc.example.com/v/t39.30808-6/shirts_n.jpg?two=2", width: 590, height: 590 }],
    },
    {
      now: new Date("2026-06-06T13:00:00.000Z"),
      images: [{ id: "clone", src: "assets/images/news/facebook/222/image-01.jpg", width: 590, height: 590, alt: "Shirts" }],
    }
  );
  const invalid = buildNewsPostFromCandidate(
    {
      text: "Whole page snapshot",
      dateISO: "2026-06-07T12:00:00.000Z",
      sourceUrl: "https://www.facebook.com/TridicoDesignSolutionsLlc",
    },
    { now: new Date("2026-06-07T13:00:00.000Z") }
  );

  const repaired = deduplicateImportedPosts(
    [clone, invalid, first],
    [
      { sourcePostId: "111", importedSlug: first.slug },
      { sourcePostId: "222", importedSlug: clone.slug },
      { sourcePostId: invalid.sourcePostId, importedSlug: invalid.slug },
    ]
  );

  assert.equal(repaired.posts.length, 1);
  assert.equal(repaired.posts[0].sourcePostId, "111");
  assert.equal(repaired.posts[0].title, "Happy Friday!! Did you know… We also do shirts!!");
  assert.equal(repaired.registry.length, 1);
  assert.deepEqual(new Set(repaired.removedPosts.map((post) => post.sourcePostId)), new Set(["222", invalid.sourcePostId]));
});

test("listing media planner never repeats the same image on adjacent cards", () => {
  const repeated = { src: "assets/images/shared.jpg" };
  const alternate = { src: "assets/images/alternate.jpg" };
  const planned = planListingMedia(
    [
      { id: "a", featuredImage: repeated, images: [repeated] },
      { id: "b", featuredImage: repeated, images: [repeated, alternate] },
      { id: "c", featuredImage: alternate, images: [alternate] },
    ],
    (image) => image.src
  );

  assert.equal(planned[0].listingImage.src, repeated.src);
  assert.equal(planned[1].listingImage.src, alternate.src);
  assert.equal(planned[2].listingImage, null);
});

test("generated News card sequences never contain adjacent repeated images", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const newsRoot = path.join(repoRoot, "news");
  const htmlFiles = [path.join(repoRoot, "news.html")];
  const pendingDirectories = [newsRoot];

  while (pendingDirectories.length) {
    const directory = pendingDirectories.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) pendingDirectories.push(absolute);
      if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(absolute);
    }
  }

  let sequenceCount = 0;
  let cardCount = 0;
  for (const htmlFile of htmlFiles) {
    const { document } = parseHTML(fs.readFileSync(htmlFile, "utf8"));
    const cardParents = new Set(
      Array.from(document.querySelectorAll("article[data-image-key]"), (card) => card.parentElement)
    );

    for (const parent of cardParents) {
      const cards = Array.from(parent.children).filter(
        (child) => child.matches?.("article[data-image-key]")
      );
      if (cards.length < 2) continue;
      sequenceCount += 1;
      cardCount += cards.length;
      let previousKey = "";
      for (const card of cards) {
        const imageKey = card.getAttribute("data-image-key") || "";
        assert.notEqual(
          imageKey && imageKey === previousKey,
          true,
          `${path.relative(repoRoot, htmlFile)} repeats image ${imageKey}`
        );
        previousKey = imageKey;
      }
    }
  }

  assert.ok(sequenceCount > 0, "expected generated News card sequences");
  assert.ok(cardCount > 0, "expected generated News cards");
});

test("slugify is ASCII and deterministic", () => {
  assert.equal(slugify("Tridico Design: Wrap & Signage!"), "tridico-design-wrap-and-signage");
});
