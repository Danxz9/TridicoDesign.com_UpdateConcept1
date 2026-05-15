# Facebook News Import

The News system can import public posts from the Tridico Design Facebook Page and render them as local Tridico Design News stories. The importer does not use the Meta/Facebook API, admin access, account cookies, tokens, login, CAPTCHA bypass, or stealth plugins.

Default page:

```text
https://www.facebook.com/TridicoDesignSolutionsLlc
```

## Commands

Install dependencies once:

```bash
npm ci
npx playwright install chromium
```

Dry run recent public posts without writing files:

```bash
npm run news:fb:dry-run
```

Sync recent/new posts:

```bash
npm run news:fb:sync
```

Backfill older public posts:

```bash
npm run news:fb:backfill -- --limit 150 --max-scrolls 80
```

Optional filters:

```bash
npm run news:fb:backfill -- --since 2025-01-01 --until 2026-05-01
npm run news:fb:sync -- --limit 20 --no-images
```

## Configuration

Supported environment/config values:

```text
FACEBOOK_PAGE_URL
FACEBOOK_NEWS_IMPORT_LIMIT
FACEBOOK_NEWS_MAX_SCROLLS
FACEBOOK_NEWS_SINCE
NEWS_AUTO_PUBLISH
```

Defaults:

```text
FACEBOOK_PAGE_URL=https://www.facebook.com/TridicoDesignSolutionsLlc
FACEBOOK_NEWS_IMPORT_LIMIT=150 for backfill, 20 for sync
FACEBOOK_NEWS_MAX_SCROLLS=80 for backfill, 12 for sync
NEWS_AUTO_PUBLISH=true
```

## Storage

Imported Facebook records are stored separately from manual News records:

```text
assets/data/news-facebook-posts.json
assets/data/news-facebook-import-registry.json
assets/images/news/facebook/{sourcePostId}/image-01.jpg
```

`tools/build-news-pages.js` merges imported records with the existing manual News records and regenerates:

```text
news/
news/archive/
news/source/facebook/
news/category/
news/tag/
news/{slug}/
assets/data/news-posts.json
sitemap.xml
```

Manual News posts are not deleted or overwritten.

## Scheduling

This repo is a static GitHub Pages site, so scheduled importing runs through:

```text
.github/workflows/facebook-news-import.yml
```

The workflow runs every 6 hours and can also be started manually with `workflow_dispatch`. It installs dependencies, installs standard Playwright Chromium, runs `npm run news:fb:sync`, rebuilds News pages, and commits generated changes only when files changed. The commit message is:

```text
Import Facebook news posts
```

The normal GitHub Pages deployment workflow then publishes the committed changes.

## Limitations

Facebook public page markup is not a stable API. The importer uses layered public-browser extraction, but public access can be incomplete or blocked by login walls, regional behavior, rate limits, or Facebook markup changes. When that happens, the command logs:

```text
Facebook public page content could not be loaded. No login/API fallback is used by design.
```

Existing imported posts are preserved when a scrape fails. The importer does not attempt a login or any access-control workaround.

## Disable

Disable scheduled imports by disabling or deleting `.github/workflows/facebook-news-import.yml`. Manual News generation will still work through:

```bash
npm run build
```
