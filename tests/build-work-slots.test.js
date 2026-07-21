const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");
const { resolvePortfolioSource } = require("../tools/build-work-slots");

test("portfolio source resolver uses the canonical local portfolio by default", () => {
  assert.equal(
    resolvePortfolioSource(repoRoot, {}),
    path.join(repoRoot, "_project", "reference", "updated-portfolio")
  );
});

test("portfolio source resolver honors a non-empty environment override", () => {
  const configuredSource = path.join(repoRoot, "fixtures", "portfolio-source");

  assert.equal(
    resolvePortfolioSource(repoRoot, { TRIDICO_PORTFOLIO_SOURCE: configuredSource }),
    configuredSource
  );
});

test("portfolio source resolver honors a whitespace-only non-empty environment override literally", () => {
  assert.equal(resolvePortfolioSource(repoRoot, { TRIDICO_PORTFOLIO_SOURCE: "   " }), "   ");
});
