# TridicoDesign.com — Website Overhaul Concept 2

This ZIP contains a complete static website concept designed for direct upload to a GitHub repository root.

## Concept direction

Concept 2 is the mainstream, highly modernized version: image-forward, bento-style sections, sticky mobile-first navigation, stronger conversion paths, faster portfolio scanning, and clearer service architecture.

## How to deploy on GitHub Pages

1. Unzip this package.
2. Upload all files and folders to the root of the GitHub repository.
3. For this preview repository, do not include `CNAME`; the site should resolve from the GitHub Pages project URL.
4. Enable GitHub Pages for the repository using the included workflow.
5. Replace placeholder images in `assets/images/placeholders/` with final assets or update the HTML references.

## Preserved front-end business data

- Business: Tridico Design
- Legal name used in terms: Tridico Design Solutions, LLC
- Address: 8626 Cotter Street, Lewis Center, OH 43035
- Email: ben@tridicodesign.com
- Phone: (614) 508-0815
- Hours: Weekdays 9am – 5pm
- Core services: graphic design, printing, branding, signage, vehicle wraps, on-site installation

## Static-site limitations

- The contact form opens a prefilled email draft. It does not store or send form submissions from a server.
- The shop and cart are static. Connect Shopify, Stripe, WooCommerce, Snipcart, or another commerce backend before accepting online orders.
- The terms page preserves the existing visible terms structure, but legal and pricing language should be reviewed before launch.

## Image replacement

Use `assets/image-manifest.json` for a structured image map. The separate text file `separately-generated-assets.txt` lists suggested files to generate or upload outside this ZIP.

## Files of note

- `index.html` — homepage
- `services/` — service overview and six service detail pages
- `portfolio/` — portfolio overview and four featured case study pages
- `design/` and `production/` — legacy portfolio-category pages retained for URL/navigation continuity
- `shop/` and `cart/` — static storefront shell
- `assets/css/styles.css` — full responsive styling
- `assets/js/main.js` — mobile nav, portfolio filters, reveal animation, mailto form behavior
- `assets/data/site-content.json` — editable business/service/product content
- `assets/data/portfolio.json` — editable portfolio data
