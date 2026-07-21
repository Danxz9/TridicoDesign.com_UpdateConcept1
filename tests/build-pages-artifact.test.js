const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { buildPagesArtifact } = require("../tools/build-pages-artifact");

function writeFile(rootPath, relativePath, contents = relativePath) {
  const filePath = path.join(rootPath, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

test("pages artifact includes only the website's public files", (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tridico-pages-"));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));

  for (const fileName of [
    "index.html",
    "about.html",
    ".nojekyll",
    "apple-touch-icon.png",
    "favicon.ico",
    "favicon.png",
    "robots.txt",
    "sitemap.xml",
    "site.webmanifest",
    "CNAME",
  ]) {
    writeFile(fixtureRoot, fileName);
  }
  writeFile(fixtureRoot, "assets/css/styles.css");
  writeFile(fixtureRoot, "news/example.html");
  writeFile(fixtureRoot, "_project/private-notes.md");
  writeFile(fixtureRoot, ".github/workflows/pages.yml");
  writeFile(fixtureRoot, "AGENTS.md");
  writeFile(fixtureRoot, "README.md");
  writeFile(fixtureRoot, "DESIGN_NOTES.md");
  writeFile(fixtureRoot, "docs/notes.md");
  writeFile(fixtureRoot, "scripts/deploy.js");
  writeFile(fixtureRoot, "tests/build.test.js");
  writeFile(fixtureRoot, "tools/build.js");
  writeFile(fixtureRoot, "node_modules/example/index.js");
  writeFile(fixtureRoot, "package.json");
  writeFile(fixtureRoot, "_site/stale.html");

  const outputRoot = buildPagesArtifact({ repoRoot: fixtureRoot });

  for (const publicFile of [
    "index.html",
    "about.html",
    ".nojekyll",
    "apple-touch-icon.png",
    "favicon.ico",
    "favicon.png",
    "robots.txt",
    "sitemap.xml",
    "site.webmanifest",
    "CNAME",
    "assets/css/styles.css",
    "news/example.html",
  ]) {
    assert.ok(fs.existsSync(path.join(outputRoot, publicFile)), `${publicFile} should be published`);
  }

  for (const privateFile of [
    "_project/private-notes.md",
    ".github/workflows/pages.yml",
    "AGENTS.md",
    "README.md",
    "DESIGN_NOTES.md",
    "docs/notes.md",
    "scripts/deploy.js",
    "tests/build.test.js",
    "tools/build.js",
    "node_modules/example/index.js",
    "package.json",
    "stale.html",
  ]) {
    assert.ok(!fs.existsSync(path.join(outputRoot, privateFile)), `${privateFile} should stay private`);
  }
});

test("pages artifact refuses to recreate the repository or an external directory", (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tridico-pages-"));
  const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tridico-pages-external-"));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(externalRoot, { recursive: true, force: true }));

  assert.throws(() => buildPagesArtifact({ repoRoot: fixtureRoot, outputRoot: fixtureRoot }), /repository root/i);
  assert.throws(() => buildPagesArtifact({ repoRoot: fixtureRoot, outputRoot: externalRoot }), /inside the repository/i);
});

test("pages artifact rejects noncanonical in-repository output paths without touching their contents", (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tridico-pages-"));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));

  for (const directoryName of ["_project", "assets", "news"]) {
    const sentinelPath = path.join(fixtureRoot, directoryName, "sentinel.txt");
    writeFile(fixtureRoot, path.join(directoryName, "sentinel.txt"), `${directoryName} sentinel`);

    assert.throws(
      () => buildPagesArtifact({ repoRoot: fixtureRoot, outputRoot: path.join(fixtureRoot, directoryName) }),
      /canonical.*_site/i
    );
    assert.equal(fs.readFileSync(sentinelPath, "utf8"), `${directoryName} sentinel`);
  }
});

test("pages artifact rejects an existing _site junction without following it", (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tridico-pages-"));
  const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tridico-pages-external-"));
  const siteRoot = path.join(fixtureRoot, "_site");
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(externalRoot, { recursive: true, force: true }));

  fs.writeFileSync(path.join(externalRoot, "sentinel.txt"), "external sentinel");
  fs.symlinkSync(externalRoot, siteRoot, "junction");

  assert.throws(() => buildPagesArtifact({ repoRoot: fixtureRoot }), /symbolic link or reparse point/i);
  assert.ok(fs.lstatSync(siteRoot).isSymbolicLink());
  assert.equal(fs.readFileSync(path.join(externalRoot, "sentinel.txt"), "utf8"), "external sentinel");
});

test("pages artifact rejects a top-level public directory junction before creating an artifact", (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tridico-pages-"));
  const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tridico-pages-external-"));
  const siteRoot = path.join(fixtureRoot, "_site");
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(externalRoot, { recursive: true, force: true }));

  fs.writeFileSync(path.join(externalRoot, "sentinel.txt"), "external assets sentinel");
  fs.symlinkSync(externalRoot, path.join(fixtureRoot, "assets"), "junction");

  assert.throws(() => buildPagesArtifact({ repoRoot: fixtureRoot }), /symbolic link or reparse point/i);
  assert.ok(fs.lstatSync(path.join(fixtureRoot, "assets")).isSymbolicLink());
  assert.equal(fs.readFileSync(path.join(externalRoot, "sentinel.txt"), "utf8"), "external assets sentinel");
  assert.ok(!fs.existsSync(siteRoot), "no artifact should be created after an unsafe source preflight");
});

test("pages artifact rejects a nested public-tree junction before creating an artifact", (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tridico-pages-"));
  const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tridico-pages-external-"));
  const siteRoot = path.join(fixtureRoot, "_site");
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(externalRoot, { recursive: true, force: true }));

  writeFile(fixtureRoot, "news/local.txt", "local content");
  fs.writeFileSync(path.join(externalRoot, "sentinel.txt"), "external news sentinel");
  fs.symlinkSync(externalRoot, path.join(fixtureRoot, "news", "linked-source"), "junction");

  assert.throws(() => buildPagesArtifact({ repoRoot: fixtureRoot }), /symbolic link or reparse point/i);
  assert.ok(fs.lstatSync(path.join(fixtureRoot, "news", "linked-source")).isSymbolicLink());
  assert.equal(fs.readFileSync(path.join(externalRoot, "sentinel.txt"), "utf8"), "external news sentinel");
  assert.ok(!fs.existsSync(siteRoot), "no artifact should be created after an unsafe source preflight");
});
