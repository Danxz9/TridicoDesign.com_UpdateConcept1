#!/usr/bin/env node

const { spawnSync } = require("child_process");
const path = require("path");

const {
  DEFAULT_FACEBOOK_PAGE_URL,
  buildNewsPostFromCandidate,
  downloadImagesForCandidate,
  filterCandidatesByDate,
  findExistingImport,
  hashCandidate,
  inferSourcePostId,
  normalizeSourceUrl,
  readJsonFile,
  scrapeFacebookPosts,
  writeJsonFile,
} = require("./lib/facebook-news-importer");

const repoRoot = path.resolve(__dirname, "..");
const importedPostsPath = path.join(repoRoot, "assets", "data", "news-facebook-posts.json");
const registryPath = path.join(repoRoot, "assets", "data", "news-facebook-import-registry.json");

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      continue;
    }
    const [rawKey, inlineValue] = arg.slice(2).split("=");
    const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
    } else if (argv[index + 1] && !argv[index + 1].startsWith("--")) {
      args[key] = argv[index + 1];
      index += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function numberFrom(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function loadImportedData(pageUrl) {
  return readJsonFile(importedPostsPath, {
    generatedAt: null,
    source: "facebook",
    sourcePlatform: "facebook",
    sourcePageName: "Tridico Design",
    pageUrl,
    posts: [],
  });
}

function loadRegistry(pageUrl) {
  return readJsonFile(registryPath, {
    generatedAt: null,
    source: "facebook",
    sourcePlatform: "facebook",
    sourcePageName: "Tridico Design",
    pageUrl,
    records: [],
  });
}

function indexExisting(posts, registryRecords) {
  const bySourcePostId = new Map();
  const bySourceUrl = new Map();
  const byContentHash = new Map();

  for (const post of posts || []) {
    if (post.sourcePostId) {
      bySourcePostId.set(String(post.sourcePostId), post);
    }
    const sourceUrl = normalizeSourceUrl(post.sourceUrl);
    if (sourceUrl) {
      bySourceUrl.set(sourceUrl, post);
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
    const sourceUrl = normalizeSourceUrl(record.sourceUrl);
    if (sourceUrl && !bySourceUrl.has(sourceUrl)) {
      bySourceUrl.set(sourceUrl, registryPost);
    }
    if (record.contentHash && !byContentHash.has(record.contentHash)) {
      byContentHash.set(record.contentHash, registryPost);
    }
  }

  return { bySourcePostId, bySourceUrl, byContentHash };
}

function findExisting(candidate, indexes) {
  const sourceUrl = normalizeSourceUrl(candidate.sourceUrl || candidate.permalinkUrl || "");
  const sourcePostId = candidate.sourcePostId || inferSourcePostId(sourceUrl);
  const contentHash = candidate.sourceContentHash || hashCandidate({ ...candidate, sourceUrl });

  if (sourcePostId && indexes.bySourcePostId.has(sourcePostId)) {
    return { post: indexes.bySourcePostId.get(sourcePostId), sourceUrl, sourcePostId, contentHash };
  }
  if (sourceUrl && indexes.bySourceUrl.has(sourceUrl)) {
    return { post: indexes.bySourceUrl.get(sourceUrl), sourceUrl, sourcePostId, contentHash };
  }
  if (contentHash && indexes.byContentHash.has(contentHash)) {
    return { post: indexes.byContentHash.get(contentHash), sourceUrl, sourcePostId, contentHash };
  }

  return { post: null, sourceUrl, sourcePostId, contentHash };
}

function updateRegistry(registry, post, now) {
  const record = {
    sourcePostId: post.sourcePostId,
    sourceUrl: post.sourceUrl,
    contentHash: post.sourceContentHash || post.contentHash,
    importedSlug: post.slug,
    dateImported: post.dateImported,
    lastSeenAt: now.toISOString(),
  };
  const index = registry.records.findIndex((item) => {
    return (
      (record.sourcePostId && item.sourcePostId === record.sourcePostId) ||
      (record.sourceUrl && normalizeSourceUrl(item.sourceUrl) === normalizeSourceUrl(record.sourceUrl))
    );
  });
  if (index >= 0) {
    registry.records[index] = { ...registry.records[index], ...record };
  } else {
    registry.records.push(record);
  }
}

async function importCandidates(candidates, config, importedData, registry) {
  const now = new Date();
  const posts = [...(importedData.posts || [])];
  const indexes = indexExisting(posts, registry.records || []);
  const stats = {
    candidatePostsFound: candidates.length,
    imported: 0,
    updated: 0,
    skippedDuplicates: 0,
    skippedMissingContent: 0,
    imageDownloadsAttempted: 0,
    imageDownloadsSucceeded: 0,
    imageDownloadsFailed: 0,
    warnings: [],
    dryRunCreates: [],
    dryRunUpdates: [],
  };

  for (const candidate of candidates) {
    const text = String(candidate.text || "").trim();
    const sourceContentHash = candidate.sourceContentHash || hashCandidate(candidate);
    const existing = findExisting({ ...candidate, sourceContentHash }, indexes);
    const existingHash = existing.post?.sourceContentHash || existing.post?.contentHash;

    if (!text && !(candidate.images || []).length) {
      stats.skippedMissingContent += 1;
      continue;
    }

    if (existing.post && existingHash === sourceContentHash) {
      stats.skippedDuplicates += 1;
      continue;
    }

    const imageRecords = await downloadImagesForCandidate(
      { ...candidate, sourceUrl: existing.sourceUrl, sourcePostId: existing.sourcePostId, sourceContentHash },
      {
        repoRoot,
        noImages: config.noImages,
        dryRun: config.dryRun,
        stats,
      }
    );

    const post = buildNewsPostFromCandidate(
      { ...candidate, sourceUrl: existing.sourceUrl, sourcePostId: existing.sourcePostId, sourceContentHash },
      {
        repoRoot,
        pageUrl: config.pageUrl,
        existingPost: existing.post,
        images: imageRecords,
        now,
        autoPublish: config.autoPublish,
      }
    );

    if (config.dryRun) {
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
        posts[index] = { ...posts[index], ...post, slug: posts[index].slug, id: posts[index].id };
      } else {
        posts.push(post);
      }
      stats.updated += 1;
    } else {
      posts.push(post);
      stats.imported += 1;
    }

    updateRegistry(registry, post, now);
    indexes.bySourcePostId.set(post.sourcePostId, post);
    indexes.bySourceUrl.set(normalizeSourceUrl(post.sourceUrl), post);
    indexes.byContentHash.set(post.sourceContentHash || post.contentHash, post);
  }

  if (!config.dryRun) {
    importedData.generatedAt = now.toISOString();
    importedData.source = "facebook";
    importedData.sourcePlatform = "facebook";
    importedData.sourcePageName = "Tridico Design";
    importedData.pageUrl = config.pageUrl;
    importedData.posts = posts.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));

    registry.generatedAt = now.toISOString();
    registry.source = "facebook";
    registry.sourcePlatform = "facebook";
    registry.sourcePageName = "Tridico Design";
    registry.pageUrl = config.pageUrl;
    registry.records = (registry.records || []).sort((a, b) => new Date(b.lastSeenAt || 0) - new Date(a.lastSeenAt || 0));

    writeJsonFile(importedPostsPath, importedData);
    writeJsonFile(registryPath, registry);
  }

  return stats;
}

function runNewsBuild() {
  const result = spawnSync(process.execPath, ["tools/build-news-pages.js"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error("News page generation failed after Facebook import.");
  }
}

function printSummary(summary) {
  console.log("Facebook News Import Summary");
  console.log(`mode: ${summary.mode}`);
  console.log(`page URL: ${summary.pageUrl}`);
  console.log(`candidate posts found: ${summary.candidatePostsFound}`);
  console.log(`imported: ${summary.imported}`);
  console.log(`updated: ${summary.updated}`);
  console.log(`skipped duplicates: ${summary.skippedDuplicates}`);
  console.log(`skipped missing content: ${summary.skippedMissingContent}`);
  console.log(`image downloads attempted: ${summary.imageDownloadsAttempted}`);
  console.log(`image downloads succeeded: ${summary.imageDownloadsSucceeded}`);
  console.log(`image downloads failed: ${summary.imageDownloadsFailed}`);
  if (summary.dryRun) {
    console.log(`dry-run creates: ${summary.dryRunCreates.length}`);
    console.log(`dry-run updates: ${summary.dryRunUpdates.length}`);
    for (const post of [...summary.dryRunCreates, ...summary.dryRunUpdates].slice(0, 10)) {
      console.log(`- ${post.slug}: ${post.title}`);
    }
  }
  for (const warning of summary.warnings) {
    console.warn(`warning: ${warning}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const mode = args.mode || "sync";
  const pageUrl = args.pageUrl || process.env.FACEBOOK_PAGE_URL || DEFAULT_FACEBOOK_PAGE_URL;
  const defaultLimit = mode === "backfill" ? 150 : 20;
  const limit = numberFrom(args.limit || process.env.FACEBOOK_NEWS_IMPORT_LIMIT, defaultLimit);
  const maxScrolls = numberFrom(args.maxScrolls || process.env.FACEBOOK_NEWS_MAX_SCROLLS, mode === "backfill" ? 80 : 12);
  const dryRun = Boolean(args.dryRun);
  const noImages = Boolean(args.noImages);
  const autoPublish = String(process.env.NEWS_AUTO_PUBLISH || "true").toLowerCase() !== "false";
  const since = args.since || process.env.FACEBOOK_NEWS_SINCE;
  const until = args.until;

  const importedData = loadImportedData(pageUrl);
  const registry = loadRegistry(pageUrl);
  const scrape = await scrapeFacebookPosts({ pageUrl, limit, maxScrolls, mode });
  const candidates = filterCandidatesByDate(scrape.candidates, { since, until }).slice(0, limit);
  const stats = await importCandidates(
    candidates,
    { pageUrl, mode, dryRun, noImages, autoPublish },
    importedData,
    registry
  );

  const summary = {
    mode,
    pageUrl,
    dryRun,
    ...stats,
    warnings: [...(scrape.warnings || []), ...(stats.warnings || [])],
  };

  printSummary(summary);

  if (scrape.blocked) {
    return;
  }

  if (!dryRun && (stats.imported || stats.updated)) {
    runNewsBuild();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
