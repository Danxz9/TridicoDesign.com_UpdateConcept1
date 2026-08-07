# TridicoDesign.com Non-Store Polish Design

## Goal

Turn the public-facing marketing site into a finished, customer-ready experience while preserving its established black, red, yellow, and white visual identity. The polish should make the work feel real, the copy sound like Tridico, and the mobile layouts remain clear and usable.

## Scope Boundary

This pass covers the homepage, services and service-detail pages, portfolio, process, about, contact, quote, artwork, and resources pages.

The following surfaces are intentionally excluded so Terra Ultra can overhaul them independently:

- `shop.html` and product catalog content
- cart, checkout, account, login, and store-specific behavior
- `assets/js/shop-products.js`
- shop product imagery, store generators, and store tests

The pass will not introduce a framework, a new component system, or a form backend.

## Chosen Direction

Use a focused proof-and-clarity polish rather than either a cosmetic CSS-only pass or a full redesign.

- Keep the existing type, color, button, card, and navigation language.
- Replace all visible non-store image-slot artwork with existing real Tridico project photography selected for the surrounding service or industry.
- Rewrite design-brief, site-architecture, and static-hosting language as direct customer-facing copy.
- Fix responsive typography where compact-page headings overflow on small screens.
- Reduce the support launcher footprint so it does not cover calls to action or project proof, while preserving its accessible name and function.
- Replace the faux map placeholder with an honest, linked Lewis Center location card.

## Page Treatment

### Homepage and Services

Real project images will provide the visual proof. Copy will explain what Tridico makes, how services work together, and what customers can do next. Internal phrases such as "customer path," "service architecture," "image slot," and "replace with real project photo" will not remain visible.

### Service Detail Pages

Each page will retain its current structure but receive a relevant project image and concrete service language. Repeated editorial headings will become useful labels such as "Graphic Design Services" and "What Helps Us Quote Accurately."

### Portfolio and Process

The existing portfolio corpus remains the source of truth. Supporting copy will describe completed work and project outcomes instead of explaining the intended page template. The process page will state what customers provide, what Tridico does, and when approval occurs.

### Contact, Quote, Artwork, and Resources

The contact page will link directly to directions rather than simulating an embedded map. Email-based forms will state accurately that selected files must be attached to the email draft or shared by link. Resource cards will be presented as quick planning tips unless a complete guide actually exists.

## Responsive and Accessibility Requirements

- Compact hero headings must fit at phone widths without horizontal clipping.
- The support launcher must not obscure primary calls to action at desktop or mobile sizes.
- Replacement images require natural, descriptive alternative text.
- Existing focus states, semantic headings, labels, and the support assistant's accessible name must remain intact.
- Navigation and form behavior must continue to work at current breakpoints.

## Verification

Add a repository test that scans non-store root HTML pages and fails if they reference `assets/images/placeholders/`. The test must explicitly exclude protected store surfaces.

Run the full test suite and static Pages build. Then compare before-and-after browser captures at matching desktop and mobile viewports, checking image crops, heading fit, spacing, button visibility, and browser console errors. No deployment is included in this task.

