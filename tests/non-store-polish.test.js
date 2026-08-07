const assert = require("node:assert/strict");
const { readdir, readFile } = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const excludedPages = new Set(["shop.html", "support-assistant-snippet.html"]);
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

test("non-store root pages use real imagery instead of placeholder artwork", async () => {
  const pageNames = (await readdir(repositoryRoot))
    .filter((name) => name.endsWith(".html") && !excludedPages.has(name))
    .sort();
  const offenders = [];

  for (const pageName of pageNames) {
    const html = await readFile(path.join(repositoryRoot, pageName), "utf8");
    if (html.includes("assets/images/placeholders/")) {
      offenders.push(pageName);
    }
  }

  assert.deepEqual(offenders, []);
});

test("polished non-store pages load the isolated override stylesheet", async () => {
  const offenders = [];

  for (const pageName of polishedPages) {
    const html = await readFile(path.join(repositoryRoot, pageName), "utf8");
    if (!html.includes('href="assets/css/site-polish.css"')) {
      offenders.push(pageName);
    }
  }

  assert.deepEqual(offenders, []);
});
