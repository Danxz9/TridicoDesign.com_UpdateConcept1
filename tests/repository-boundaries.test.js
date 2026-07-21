const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");

function readRootFile(fileName) {
  return fs.readFileSync(path.join(repoRoot, fileName), "utf8");
}

test("repository configuration builds and deploys only the Pages artifact", () => {
  const packageJson = JSON.parse(readRootFile("package.json"));
  const workflow = readRootFile(".github/workflows/pages.yml");

  assert.equal(packageJson.scripts["build:pages"], "node tools/build-pages-artifact.js");
  assert.match(workflow, /actions\/setup-node@v\d+/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run build:pages/);
  assert.match(workflow, /path: _site/);
  assert.doesNotMatch(workflow, /include-hidden-files:/);
  assert.doesNotMatch(workflow, /path: \./);
});

test("repository documentation protects the local project corpus and canonical workspace", () => {
  const gitignore = readRootFile(".gitignore");
  const agents = readRootFile("AGENTS.md");
  const readme = readRootFile("README.md");

  assert.match(gitignore, /^\/_project\/$/m);
  assert.match(gitignore, /^\/_site\/$/m);
  assert.match(agents, /_project\/00_START_HERE\.md/);
  assert.match(agents, /must never be force-added or published/i);
  assert.match(agents, /_project\/reference\/updated-portfolio/);
  assert.match(agents, /npm\.cmd/);
  assert.match(agents, /fetch\/divergence checks/i);
  assert.match(readme, /Canonical Workspace/i);
  assert.match(readme, /npm run build:pages/);
});
