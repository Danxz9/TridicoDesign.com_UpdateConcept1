const assert = require("node:assert/strict");
const { readdir, readFile } = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const { parseHTML } = require("linkedom");

const repositoryRoot = path.resolve(__dirname, "..");
const polishedPages = [
  "about.html",
  "branding-materials.html",
  "contact.html",
  "graphic-design.html",
  "index.html",
  "installation.html",
  "printing.html",
  "process.html",
  "quote.html",
  "resources.html",
  "services.html",
  "signage.html",
  "upload-artwork.html",
  "vehicle-wraps.html",
  "work.html",
];

async function readRootPages() {
  const pageNames = (await readdir(repositoryRoot))
    .filter((name) => name.endsWith(".html"))
    .sort();

  return Promise.all(
    pageNames.map(async (pageName) => {
      const html = await readFile(path.join(repositoryRoot, pageName), "utf8");
      return { pageName, document: parseHTML(html).document };
    }),
  );
}

function extractBalancedBlock(css, openingBraceIndex) {
  let depth = 0;

  for (let index = openingBraceIndex; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(openingBraceIndex + 1, index);
  }

  return null;
}

test("non-store root pages use real imagery instead of placeholder artwork", async () => {
  const offenders = [];

  for (const { pageName, document } of await readRootPages()) {
    const imagePaths = [
      ...[...document.querySelectorAll("img[src]")].map((image) => image.getAttribute("src")),
      ...[...document.querySelectorAll("source[srcset]")].map((source) => source.getAttribute("srcset")),
    ];
    if (imagePaths.some((imagePath) => imagePath.includes("assets/images/placeholders/"))) {
      offenders.push(pageName);
    }
  }

  assert.deepEqual(offenders, []);
});

test("only polished root pages load the isolated override stylesheet after support styles", async () => {
  const polishConsumers = [];

  for (const { pageName, document } of await readRootPages()) {
    const stylesheets = [...document.querySelectorAll('link[rel~="stylesheet"]')];
    const polishIndexes = stylesheets
      .map((link, index) => (link.getAttribute("href") === "assets/css/site-polish.css" ? index : -1))
      .filter((index) => index !== -1);

    if (polishIndexes.length > 0) {
      polishConsumers.push(pageName);
      assert.equal(polishIndexes.length, 1, `${pageName} should load site-polish.css once`);
      const supportIndex = stylesheets.findIndex(
        (link) => link.getAttribute("href") === "assets/css/support-assistant.css",
      );
      assert.ok(supportIndex >= 0, `${pageName} should load support-assistant.css`);
      assert.equal(
        polishIndexes[0],
        supportIndex + 1,
        `${pageName} should load site-polish.css immediately after support-assistant.css`,
      );
    }
  }

  assert.deepEqual(polishConsumers, polishedPages);
});

test("mobile non-store support root retains viewport width", async () => {
  const css = await readFile(
    path.join(repositoryRoot, "assets", "css", "site-polish.css"),
    "utf8",
  );
  const mobileStart = css.indexOf("@media (max-width: 680px)");
  assert.ok(mobileStart >= 0, "expected the max-width 680px media query");
  const mobileOpeningBrace = css.indexOf("{", mobileStart);
  const mobileBody = extractBalancedBlock(css, mobileOpeningBrace);
  assert.ok(mobileBody, "expected a balanced max-width 680px media block");
  const mobileRootRule = mobileBody.match(
    /body:not\(\.vehicle-shop-page\) \.tdsa-root \{(?<declarations>[^}]*)\}/,
  );

  assert.ok(mobileRootRule, "expected the non-store mobile .tdsa-root rule");
  assert.match(
    mobileRootRule.groups.declarations,
    /^\s*left: max\(\.6rem, env\(safe-area-inset-left\)\);\s*$/m,
  );
  assert.doesNotMatch(mobileRootRule.groups.declarations, /^\s*left:\s*auto;\s*$/m);
  const laterCss = css.slice(mobileOpeningBrace + mobileBody.length + 2);
  assert.doesNotMatch(
    laterCss,
    /body:not\(\.vehicle-shop-page\) \.tdsa-root \{[^}]*\bleft:\s*auto;/,
    "no later .tdsa-root rule should undo the mobile left inset",
  );
});

test("dark hero contexts keep eyebrow and kicker text yellow", async () => {
  const css = await readFile(
    path.join(repositoryRoot, "assets", "css", "site-polish.css"),
    "utf8",
  );

  assert.match(
    css,
    /body:not\(\.vehicle-shop-page\) :is\(\.hero, \.page-hero, \.dark-panel, \.cta-band\) :is\(\.eyebrow, \.kicker\) \{\s*color: var\(--yellow\);\s*\}/,
  );
});

test("project comparison media preserves full photos in figure-owned 4:3 frames", async () => {
  const css = await readFile(
    path.join(repositoryRoot, "assets", "css", "site-polish.css"),
    "utf8",
  );

  assert.match(
    css,
    /body:not\(\.vehicle-shop-page\) \.project-compare figure \{[^}]*\baspect-ratio: 4 \/ 3;/,
  );
  assert.match(
    css,
    /body:not\(\.vehicle-shop-page\) \.project-compare img \{[^}]*\bheight: 100%;[^}]*\bobject-fit: contain;/,
  );
  assert.doesNotMatch(
    css,
    /@media \(max-width: 680px\) \{[\s\S]*?\.project-compare img \{\s*height: 260px;/,
  );
});
