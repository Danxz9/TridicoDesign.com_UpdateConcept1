#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const {
  deduplicateImportedPosts,
  readJsonFile,
  writeJsonFile,
} = require("../scripts/lib/facebook-news-importer");

const repoRoot = path.resolve(__dirname, "..");
const postsPath = path.join(repoRoot, "assets", "data", "news-facebook-posts.json");
const registryPath = path.join(repoRoot, "assets", "data", "news-facebook-import-registry.json");
const facebookAssetsRoot = path.join(repoRoot, "assets", "images", "news", "facebook");
const newsRoot = path.join(repoRoot, "news");

function isSafeChild(parent, target) {
  const relative = path.relative(parent, target);
  return Boolean(relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}

function assertSafeChild(parent, target, label) {
  if (!isSafeChild(parent, target)) {
    throw new Error(`Refusing unsafe ${label} path: ${target}`);
  }
}

function postAssetDirectories(post) {
  const directories = new Set();
  const images = [post.featuredImage, post.thumbnailImage, ...(post.images || [])].filter(Boolean);
  for (const image of images) {
    const src = String(image.src || "").replace(/\//g, path.sep);
    const absolute = path.resolve(repoRoot, src);
    if (!isSafeChild(facebookAssetsRoot, absolute)) {
      continue;
    }
    const relative = path.relative(facebookAssetsRoot, absolute).split(path.sep);
    if (relative.length > 1) {
      directories.add(path.join(facebookAssetsRoot, relative[0]));
    }
  }
  return directories;
}

function collectCleanupTargets(keptPosts, removedPosts) {
  const keptAssetDirectories = new Set(
    keptPosts.flatMap((post) => [...postAssetDirectories(post)])
  );
  const assetDirectories = new Set();
  const storyDirectories = new Set();

  for (const post of removedPosts) {
    for (const directory of postAssetDirectories(post)) {
      if (!keptAssetDirectories.has(directory)) {
        assertSafeChild(facebookAssetsRoot, directory, "Facebook asset");
        assetDirectories.add(directory);
      }
    }

    if (post.slug) {
      const storyDirectory = path.resolve(newsRoot, post.slug);
      assertSafeChild(newsRoot, storyDirectory, "News story");
      storyDirectories.add(storyDirectory);
    }
  }

  return { assetDirectories, storyDirectories };
}

function printSummary(result, targets, mode) {
  console.log("Facebook News Data Audit");
  console.log(`mode: ${mode}`);
  console.log(`kept posts: ${result.posts.length}`);
  console.log(`duplicate or invalid posts: ${result.removedPosts.length}`);
  console.log(`registry records after repair: ${result.registry.length}`);
  console.log(`stale asset directories: ${targets.assetDirectories.size}`);
  console.log(`stale story directories: ${targets.storyDirectories.size}`);
}

function main() {
  const write = process.argv.includes("--write");
  const importedData = readJsonFile(postsPath, { posts: [] });
  const registryData = readJsonFile(registryPath, { records: [] });
  const result = deduplicateImportedPosts(importedData.posts || [], registryData.records || []);
  const targets = collectCleanupTargets(result.posts, result.removedPosts);

  printSummary(result, targets, write ? "repair" : "check");

  if (!write) {
    if (result.removedPosts.length || result.registry.length !== (registryData.records || []).length) {
      process.exitCode = 1;
    }
    return;
  }

  const repairedAt = new Date().toISOString();
  writeJsonFile(postsPath, {
    ...importedData,
    generatedAt: repairedAt,
    posts: result.posts,
  });
  writeJsonFile(registryPath, {
    ...registryData,
    generatedAt: repairedAt,
    records: result.registry,
  });

  for (const directory of [...targets.storyDirectories, ...targets.assetDirectories]) {
    if (fs.existsSync(directory)) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }

  console.log("Facebook News data repaired. Run npm.cmd run news:build to regenerate News pages.");
}

main();
