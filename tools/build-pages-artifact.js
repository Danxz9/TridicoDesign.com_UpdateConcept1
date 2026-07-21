#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const publicRootFiles = new Set([
  ".nojekyll",
  "apple-touch-icon.png",
  "favicon.ico",
  "favicon.png",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "CNAME",
]);

function resolveOutputRoot(repoRoot, outputRoot) {
  const resolvedRepoRoot = path.resolve(repoRoot);
  const canonicalOutputRoot = path.join(resolvedRepoRoot, "_site");
  const resolvedOutputRoot = path.resolve(outputRoot || canonicalOutputRoot);

  if (resolvedOutputRoot === resolvedRepoRoot) {
    throw new Error("The pages artifact output cannot be the repository root.");
  }

  const relativeOutput = path.relative(resolvedRepoRoot, resolvedOutputRoot);
  if (relativeOutput.startsWith(`..${path.sep}`) || relativeOutput === ".." || path.isAbsolute(relativeOutput)) {
    throw new Error("The pages artifact output must be inside the repository.");
  }

  if (resolvedOutputRoot !== canonicalOutputRoot) {
    throw new Error("The pages artifact output must be the canonical _site directory.");
  }

  return { resolvedRepoRoot, resolvedOutputRoot };
}

function assertOutputIsNotLink(outputRoot) {
  let outputStats;
  try {
    outputStats = fs.lstatSync(outputRoot);
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  if (outputStats.isSymbolicLink()) {
    throw new Error("The pages artifact output cannot be a symbolic link or reparse point.");
  }
}

function assertPublicTreeHasNoLinks(sourceDirectory) {
  let sourceStats;
  try {
    sourceStats = fs.lstatSync(sourceDirectory);
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }

  if (sourceStats.isSymbolicLink()) {
    throw new Error(`The pages artifact source cannot contain a symbolic link or reparse point: ${sourceDirectory}`);
  }
  if (!sourceStats.isDirectory()) {
    return false;
  }

  for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
    const entryPath = path.join(sourceDirectory, entry.name);
    const entryStats = fs.lstatSync(entryPath);
    if (entry.isSymbolicLink() || entryStats.isSymbolicLink()) {
      throw new Error(`The pages artifact source cannot contain a symbolic link or reparse point: ${entryPath}`);
    }
    if (entryStats.isDirectory()) {
      assertPublicTreeHasNoLinks(entryPath);
    }
  }

  return true;
}

function copyFile(sourcePath, outputRoot, relativePath) {
  const destinationPath = path.join(outputRoot, relativePath);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
}

function buildPagesArtifact({ repoRoot = path.resolve(__dirname, ".."), outputRoot } = {}) {
  const { resolvedRepoRoot, resolvedOutputRoot } = resolveOutputRoot(repoRoot, outputRoot);
  const rootEntries = fs.readdirSync(resolvedRepoRoot, { withFileTypes: true });
  const rootFiles = rootEntries
    .filter((entry) => entry.isFile() && (path.extname(entry.name).toLowerCase() === ".html" || publicRootFiles.has(entry.name)))
    .map((entry) => entry.name);
  const publicDirectories = ["assets", "news"].filter((directoryName) =>
    assertPublicTreeHasNoLinks(path.join(resolvedRepoRoot, directoryName))
  );

  assertOutputIsNotLink(resolvedOutputRoot);
  fs.rmSync(resolvedOutputRoot, { recursive: true, force: true });
  fs.mkdirSync(resolvedOutputRoot, { recursive: true });

  for (const fileName of rootFiles) {
    copyFile(path.join(resolvedRepoRoot, fileName), resolvedOutputRoot, fileName);
  }

  for (const directoryName of publicDirectories) {
    const sourceDirectory = path.join(resolvedRepoRoot, directoryName);
    fs.cpSync(sourceDirectory, path.join(resolvedOutputRoot, directoryName), { recursive: true });
  }

  return resolvedOutputRoot;
}

function main() {
  const outputRoot = buildPagesArtifact();
  console.log(`GitHub Pages artifact created at ${outputRoot}`);
}

if (require.main === module) {
  main();
}

module.exports = { buildPagesArtifact };
