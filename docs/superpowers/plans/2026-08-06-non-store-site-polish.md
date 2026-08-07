# TridicoDesign.com Non-Store Site Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace unfinished marketing-site placeholders and internal copy with real Tridico work, customer-facing language, and responsive polish without touching the web store.

**Architecture:** Keep the existing static HTML, shared CSS, and vanilla JavaScript architecture. Apply source-only substitutions in non-store pages, load a dedicated `assets/css/site-polish.css` override only on the pages in scope, and protect the boundary with Node tests that scan top-level non-store HTML. The dedicated file avoids modifying Terra's concurrent `assets/css/styles.css` work.

**Tech Stack:** Static HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner, Windows `npm.cmd`, GitHub Pages artifact builder.

## Global Constraints

- Keep the existing black, red, yellow, and white visual identity.
- Do not modify `shop.html`, `assets/js/shop-products.js`, shop product imagery, store generators, store tests, or cart, checkout, account, login, and store-specific behavior.
- Do not introduce a framework, a new component system, or a form backend.
- Use only existing real Tridico project photography from `assets/images/work/`.
- Do not leave visible `IMAGE SLOT`, `MAP SLOT`, `REPLACE WITH REAL PROJECT PHOTO`, design-brief, site-architecture, or static-hosting language.
- Preserve existing semantic headings, labels, focus behavior, and the support assistant's accessible name.
- Use `npm.cmd` for package scripts on this Windows machine.
- Stage and commit only the files named in each task; concurrent Terra store changes are user-owned and must remain unmodified and unstaged.
- Do not modify the dirty shared `assets/css/styles.css`; place every new non-store override in `assets/css/site-polish.css`.

---

### Task 1: Add the Non-Store Placeholder Guardrail

**Files:**
- Create: `tests/non-store-polish.test.js`

**Interfaces:**
- Consumes: top-level `*.html` files from the repository root.
- Produces: a Node test that fails when a non-store root page references `assets/images/placeholders/`.

- [ ] **Step 1: Write the failing repository test**

```js
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
```

- [ ] **Step 2: Run the focused test and confirm the intended failure**

Run: `node --test tests/non-store-polish.test.js`

Expected: two intentional failures: current placeholder-bearing pages appear in the first test's `offenders`, and every page in `polishedPages` appears in the second test's `offenders` because the isolated stylesheet has not been linked yet.

- [ ] **Step 3: Commit only the failing guardrail**

```powershell
git add -- tests/non-store-polish.test.js
git commit -m "Test non-store pages for placeholder art"
```

---

### Task 2: Finish the Homepage and Services Hub

**Files:**
- Modify: `index.html`
- Modify: `services.html`

**Interfaces:**
- Consumes: existing project images in `assets/images/work/` and the guardrail from Task 1.
- Produces: customer-ready homepage and services hub with no placeholder references.

- [ ] **Step 1: Replace every homepage and services-hub image slot**

Use this exact source and alternative-text map in both files wherever the named placeholder occurs:

| Placeholder | Real image source | Replacement alt text |
|---|---|---|
| `hero-project-montage.svg` | `assets/images/work/acura-trio-four-car-wrap.jpg` | `Four Acura vehicles with coordinated custom graphics` |
| `service-graphic-design.svg` | `assets/images/work/work-slots/old/maryhaven-brochure-mailer/02-02-maryhaven-brochure-spread.jpg` | `Designed Maryhaven brochure and mailer spread` |
| `service-printing.svg` | `assets/images/work/work-slots/old/service-department-banners/04-01-chapman-bans-3.jpg` | `Large-format dealership banners installed at a service entrance` |
| `service-branding.svg` | `assets/images/work/sat-track-gps-print-marketing.jpg` | `Coordinated Sat Track GPS print marketing materials` |
| `service-signage.svg` | `assets/images/work/work-slots/facebook/millcreek-signage/01-1018441160075471.jpg` | `Installed Millcreek exterior business sign` |
| `service-wraps.svg` | `assets/images/work/honda-passport-rally-vehicle-wrap-01-forest-trail.jpg` | `Honda Passport rally vehicle with a full custom wrap` |
| `service-installation.svg` | `assets/images/work/chapman-ford-dealership-entrance-graphics-01-driveway.jpg` | `Finished Chapman Ford dealership entrance graphics` |
| `portfolio-fleet-wrap.svg` | `assets/images/work/work-slots/old/fleet-parts-truck/01-01-perf-cjd-delaware-2.jpg` | `Fleet parts delivery truck with branded graphics` |
| `portfolio-food-truck.svg` | `assets/images/work/work-slots/old/sweet-retreat-ice-cream-trailer/05-01-sweet-retreat-1.jpg` | `Sweet Retreat ice cream trailer graphics` |
| `portfolio-dealership-signage.svg` | `assets/images/work/work-slots/old/service-department-banners/05-02-chapman-bans-2.jpg` | `Service department banners installed at a dealership` |
| `portfolio-contractor-wrap.svg` | `assets/images/work/jacobs-restoration-fleet-wrap-01-cover.jpg` | `Jacobs Restoration contractor box truck wrap` |
| `portfolio-storefront-sign.svg` | `assets/images/work/sbc-brewing-company-02.jpg` | `SBC Brewing Company storefront graphics` |
| `portfolio-interior-wall.svg` | `assets/images/work/ohio-metal-wall-display-03-conference-room.jpg` | `Custom Ohio metal wall display in a conference room` |
| `industry-contractors.svg` | `assets/images/work/advanced-basement-solutions-contractor-truck-wrap.jpg` | `Advanced Basement Solutions contractor truck wrap` |
| `industry-restaurants.svg` | `assets/images/work/cookie-dough-food-trailer-wrap-01-cover.jpg` | `Colorful Cookie Dough food vehicle wrap` |
| `industry-auto.svg` | `assets/images/work/chapman-ford-dealership-vehicle-graphics.jpg` | `Chapman Ford dealership vehicle graphics` |
| `industry-schools.svg` | `assets/images/work/work-slots/old/goddard-schools/01-01-goddard2.jpg` | `Goddard School graphics and signage` |
| `industry-retail.svg` | `assets/images/work/sbc-brewing-company-01-cover.jpg` | `SBC Brewing Company storefront branding` |
| `industry-office.svg` | `assets/images/work/ohio-metal-wall-display-02-installed-office.jpg` | `Custom metal wall display installed in an office` |

Add `width="1600" height="1000"` to hero and card images that do not already declare intrinsic dimensions.

- [ ] **Step 2: Replace the homepage's internal-facing copy**

Apply these exact replacements in `index.html`:

| Current | Replacement |
|---|---|
| `The site is organized around what customers actually need: clear services, industry-specific examples, a simple quote flow, and a proof-to-production process that reduces confusion.` | `From the first idea to the final installation, Tridico keeps design, print, signs, wraps, and branding materials moving through one coordinated process.` |
| `The customer path` | `Built around your project` |
| `This layout makes the next action obvious without turning every section into a sales pitch.` | `Whether you need consistent fleet graphics, a more visible storefront, campaign materials, or a logo that works across real surfaces, Tridico can carry the work from idea to finished product.` |
| `Featured work system` | `Featured Work` |
| `A portfolio that sells capability, not clutter.` | `See how ideas become finished business graphics.` |
| `Each project card is designed to show the service, the industry, and the outcome. Replace the labeled image slots with final project photography.` | `Browse examples of vehicle wraps, signs, print, and interior graphics across a range of industries.` |
| `Attention grabber` | `Before & After` |
| `Before-and-after proof is stronger than decoration.` | `See what coordinated vehicle branding can change.` |
| `Customer-oriented navigation` | `Solutions by Business Type` |
| `Customers should recognize their own business within one scroll.` | `Find ideas that fit your business.` |
| `Tridico’s site should serve business owners, dealership teams, contractors, restaurants, schools, offices, gyms, and vehicle/fleet customers without forcing them to decode design jargon.` | `From contractors and restaurants to dealerships, schools, retailers, offices, and fleets, Tridico creates graphics for the way your business works.` |
| `A calm, visible process makes buyers more comfortable.` | `Know what happens at every step.` |

Replace the four internal-site path bullets with:

```html
<li>Clear next steps from quote through completion.</li>
<li>Design, print, signs, wraps, and installation working together.</li>
<li>Solutions shaped around your business and application.</li>
<li>Proof approval before production begins.</li>
```

Replace the process paragraph with:

```html
<p>From intake and proofing through production and installation, you’ll know what we need from you and what comes next.</p>
```

- [ ] **Step 3: Replace the misleading comparison slider with an honest two-photo transformation**

In both `index.html` and, later, `vehicle-wraps.html`, use real photos of the same Honda Racing vehicle as a static pair instead of implying pixel-aligned comparison:

```html
<div class="project-compare reveal">
  <figure>
    <img src="assets/images/work/honda-racing-xl-vehicle-wrap-04-unwrapped-front.jpg" alt="Honda Racing motor coach before its full wrap" loading="lazy" decoding="async">
    <figcaption>Before</figcaption>
  </figure>
  <figure>
    <img src="assets/images/work/honda-racing-xl-vehicle-wrap-10-side-profile.jpg" alt="Honda Racing motor coach after its red and blue wrap" loading="lazy" decoding="async">
    <figcaption>After</figcaption>
  </figure>
</div>
```

Change comparison instructions to `Compare the same Honda Racing vehicle before and after its full red and blue wrap.` and `See wrap strategy` to `Explore Vehicle Wraps`.

- [ ] **Step 4: Replace the services hub's internal-facing copy**

Apply these exact replacements in `services.html`:

| Current | Replacement |
|---|---|
| `Tridico Design is structured for customers who need ideas converted into durable, visible, tangible marketing materials.` | `Bring Tridico your idea, and the team will help turn it into durable, visible marketing materials—from design and print to signs, wraps, and installation.` |
| `Service architecture` | `Ways We Can Help` |
| `Six service categories, organized around customer decisions.` | `Choose the service that fits your project.` |
| `Customer types` | `Who We Work With` |
| `The old customer-fit content now lives inside Services.` | `Graphics built for the way your business works.` |
| `What makes the service pages work` | `Plan Your Project` |
| `Every page answers the same buyer questions.` | `Know what to expect before requesting a quote.` |
| `Customers often need more than one item.` | `Build a coordinated package.` |
| `Build this bundle` | `Request This Package` |

Use these replacement paragraphs in section order:

```html
<p>Need more than one? Tridico can coordinate design, production, and installation as one connected project.</p>
<p>Explore common needs by industry, then start a quote with the details you already have.</p>
<p>Start with your goal, application, measurements or vehicle details, existing artwork, and timeline. Tridico will help determine the right next steps.</p>
<p>Combine design, vehicles, signs, print, and interior graphics to keep your business consistent wherever customers see it.</p>
```

- [ ] **Step 5: Run the focused guardrail**

Run: `node --test tests/non-store-polish.test.js`

Expected: FAIL. The placeholder test must no longer list `index.html` or `services.html`; the isolated-stylesheet test remains intentionally red until Task 5.

- [ ] **Step 6: Commit only the homepage and services hub**

```powershell
git add -- index.html services.html
git commit -m "Polish homepage and services proof"
```

---

### Task 3: Finish the Six Service Detail Pages

**Files:**
- Modify: `graphic-design.html`
- Modify: `printing.html`
- Modify: `branding-materials.html`
- Modify: `signage.html`
- Modify: `vehicle-wraps.html`
- Modify: `installation.html`

**Interfaces:**
- Consumes: the image map and static `project-compare` markup from Task 2.
- Produces: six complete service pages with real hero images and direct quote language.

- [ ] **Step 1: Replace each hero image, description, CTA, section title, and meta description**

| File | Hero image and alt | Hero paragraph | Hero CTA | Service list heading | Meta description |
|---|---|---|---|---|---|
| `graphic-design.html` | `assets/images/work/work-slots/old/maryhaven-brochure-mailer/02-02-maryhaven-brochure-spread.jpg`; `Designed Maryhaven brochure and mailer spread` | `Graphic design gives signs, wraps, print pieces, ads, and brand materials a clear, consistent foundation. Tridico can shape the concept and prepare it for production.` | `Request a Design Quote` | `Graphic Design Services` | `Graphic design for logos, advertising, print, signs, wraps, and production-ready brand materials from Tridico Design.` |
| `printing.html` | `assets/images/work/work-slots/old/service-department-banners/04-01-chapman-bans-3.jpg`; `Large-format dealership banners installed at a service entrance` | `From business cards and brochures to decals, banners, displays, and large-format graphics, Tridico produces practical print materials that support your business.` | `Request a Print Quote` | `Print Products and Formats` | `Printing for business cards, brochures, decals, banners, displays, and large-format business graphics from Tridico Design.` |
| `branding-materials.html` | `assets/images/work/sat-track-gps-print-marketing.jpg`; `Coordinated Sat Track GPS print marketing materials` | Keep the existing customer-facing hero paragraph. | `Request a Branding Quote` | `Branding Materials and Applications` | `Coordinated logos, stationery, marketing pieces, signs, wraps, and other brand materials from Tridico Design.` |
| `signage.html` | `assets/images/work/work-slots/facebook/millcreek-signage/01-1018441160075471.jpg`; `Installed Millcreek exterior business sign` | `Tridico helps you choose signs, banners, decals, and displays based on where they will be used, how far they need to be seen from, and how they will be installed.` | `Request a Sign Quote` | `Signs, Displays, and Graphics` | `Custom business signs, banners, decals, displays, storefront graphics, and installation planning from Tridico Design.` |
| `vehicle-wraps.html` | `assets/images/work/honda-passport-rally-vehicle-wrap-01-forest-trail.jpg`; `Honda Passport rally vehicle with a full custom wrap` | `Tell us the vehicle type, desired coverage, design goals, available photos, and timeline. Tridico can help with design, production, and installation.` | `Request a Vehicle Wrap Quote` | `Wrap and Vehicle Graphic Options` | `Custom vehicle wraps, fleet graphics, partial wraps, decals, and installation from Tridico Design.` |
| `installation.html` | `assets/images/work/chapman-ford-dealership-entrance-graphics-01-driveway.jpg`; `Finished Chapman Ford dealership entrance graphics` | `Tridico considers the surface, placement, alignment, and finishing details that turn your graphics into a clean, completed installation.` | `Request an Installation Quote` | `Installation Services` | `Professional installation for signs, decals, wall graphics, vehicle graphics, and other finished business graphics from Tridico Design.` |

Add `width="1600" height="1000"` to each hero image.

- [ ] **Step 2: Replace the repeated editorial copy on all six pages**

Replace each exact phrase wherever it occurs:

| Current | Replacement |
|---|---|
| `Best quote inputs` | `What Helps Us Quote Accurately` |
| `Good inputs prevent back-and-forth and help Tridico recommend the right product, material, size, and production path.` | `A few project details help us recommend the right product, material, size, and production approach.` |
| `Most projects connect across services.` | `Complete the project in one place.` |
| `A customer looking at one service often needs another. Keep related options visible without creating clutter.` | `Bring related design, production, and installation needs together for a consistent finished result.` |
| `Start Quote` | `Request a Quote` |

- [ ] **Step 3: Convert the vehicle-wrap comparison to the real static pair**

Use the `project-compare` markup from Task 2 in `vehicle-wraps.html`. Apply these copy replacements:

| Current | Replacement |
|---|---|
| `Wrap proof` | `Before & After` |
| `Show transformation first.` | `See the difference a wrap can make.` |
| Existing slider instruction | `Compare the same Honda Racing vehicle before and after its full red and blue wrap.` |

- [ ] **Step 4: Run the focused guardrail**

Run: `node --test tests/non-store-polish.test.js`

Expected: FAIL. The placeholder test may still list process, quote, resources, and artwork pages, but none of the six service-detail pages; the isolated-stylesheet test remains intentionally red until Task 5.

- [ ] **Step 5: Commit only the six service pages**

```powershell
git add -- graphic-design.html printing.html branding-materials.html signage.html vehicle-wraps.html installation.html
git commit -m "Finish service detail pages"
```

---

### Task 4: Finish Portfolio, Process, About, and Lead-Capture Pages

**Files:**
- Modify: `work.html`
- Modify: `process.html`
- Modify: `about.html`
- Modify: `quote.html`
- Modify: `contact.html`
- Modify: `upload-artwork.html`
- Modify: `resources.html`

**Interfaces:**
- Consumes: existing work photos and the non-store placeholder guardrail.
- Produces: complete supporting pages, accurate email-form expectations, and a real directions link.

- [ ] **Step 1: Replace the portfolio's prototype copy**

Apply these exact replacements in `work.html`:

| Current | Replacement |
|---|---|
| `A portfolio structure for Tridico Design LLC organized by service, industry, and business outcome.` | `Explore Tridico Design vehicle wraps, signage, branding, print, interior graphics, and other completed work.` |
| `Organized by service, industry, and business outcome.` | `See Tridico work across vehicles, signs, print, branding, and interior graphics.` |
| `Quote Similar Project` | `Request Similar Work` |
| `Start Similar Project` | `Start a Similar Project` |
| `See More` | `Show More Projects` |
| `Case study format` | `From Need to Finished Result` |
| `Use fewer projects with more context.` | `See how each piece supports the business goal.` |
| `Recommended template` | `Typical Project Plan` |
| `Plain service vehicle → branded mobile advertisement` | `From plain service vehicle to branded mobile advertising` |
| `Result: Consistent visibility across every mile` | `Goal: Consistent visibility on the road` |
| `Create a Case Study Quote` | `Plan a Similar Project` |

Use this body copy in the closing case-study section:

```html
<p>A successful project connects the customer’s goal, the surface, the design, the materials, and the finished result.</p>
```

- [ ] **Step 2: Replace process placeholders with authentic examples**

Use this exact map in `process.html`:

| Step | Image and alt |
|---|---|
| Hero and Discovery | `assets/images/work/hidden-creek-landscaping-sign-02-concept-sketch.jpg`; `Early concept sketch for Hidden Creek landscaping signs` |
| Design & Proof | `assets/images/work/work-slots/old/maryhaven-brochure-mailer/02-02-maryhaven-brochure-spread.jpg`; `Designed Maryhaven brochure spread prepared for review` |
| Production | `assets/images/work/honda-racing-xl-vehicle-wrap-12-shop-wide.jpg`; `Honda Racing vehicles in the Tridico shop during wrap production` |
| Installation / Delivery | `assets/images/work/chapman-ford-dealership-entrance-graphics-01-driveway.jpg`; `Completed dealership entrance graphics after installation` |

Replace process copy exactly:

| Current | Replacement |
|---|---|
| `The process page is designed to reduce customer uncertainty. It explains what the customer needs to provide and how Tridico moves from design to production.` | `Share what you know, review a clear proof, and approve the work before it moves into production or installation.` |
| `Start Step 1` | `Request a Quote` |
| `Better inputs create better outcomes.` | `A few details help us get started.` |
| `This checklist helps the quote and design process move faster.` | `Use the checklist below to prepare what you have; Tridico can help with the rest.` |

- [ ] **Step 3: Replace about-page design-brief language**

Use this exact content in the main about section:

```html
<p class="kicker">Design-to-Print Solutions</p>
<h2>One partner from the first concept to the finished product.</h2>
<p>Tridico combines graphic design and print production to create logos, ads, marketing packages, signs, banners, decals, vehicle wraps, and other tangible brand materials.</p>
<p>The approach balances creative thinking with practical production details, so the design works on the surface, at the size, and in the setting where it will be used.</p>
```

Apply these exact replacements without changing unverified proof statistics or testimonial wording:

| Current | Replacement |
|---|---|
| `Quality and attention through the finished product.` | `Attention to detail through the finished product.` |
| `Budget-sensitive solutions without generic design.` | `Thoughtful solutions shaped around your goals and budget.` |
| `Customer confidence` | `Customer Feedback` |
| `Testimonials belong near proof, not buried.` | `What customers say about Tridico.` |

Remove the sentence `Short customer proof helps local buyers trust the process before asking for a quote.`

- [ ] **Step 4: Finish the quote page and state file behavior accurately**

Set the quote hero image to `assets/images/work/yokohama-racer-work-hero.jpg` with alt `Yokohama race car with a finished Tridico wrap` and intrinsic `width="1600" height="1000"`.

Apply these exact replacements:

| Current | Replacement |
|---|---|
| Existing quote-flow hero paragraph | `Tell us what you’re planning, what the finished piece needs to do, and any sizes, quantities, vehicle details, artwork, or deadlines you already know.` |
| `Include this if you have it.` | `Helpful Project Details` |
| `For GitHub Pages static hosting, the form opens an email draft. Attach files manually or paste a transfer link.` | `Files are not attached automatically. After continuing, add them to the email draft or paste a share link in Project Details.` |
| `Open Email Quote Request` | `Continue to Email` |
| `Prefer direct contact?` | `Prefer to talk it through?` |

Add adjacent helper text: `Your email app will open a draft for you to review and send.`

- [ ] **Step 5: Replace the faux map with a real directions card**

In `contact.html`, replace the `map-placeholder` div with:

```html
<a class="location-card" href="https://www.google.com/maps/search/?api=1&amp;query=8626+Cotter+Street+Lewis+Center+OH+43035" target="_blank" rel="noopener">
  <span>Visit Tridico Design</span>
  <strong>8626 Cotter Street<br>Lewis Center, OH 43035</strong>
  <small>Open directions in Google Maps</small>
</a>
```

Apply these exact contact replacements:

| Current | Replacement |
|---|---|
| Existing direct-contact instruction | `Call or email with time-sensitive questions, quote details, artwork questions, or help planning a project.` |
| `Weekdays 9am – 5pm` | `Monday–Friday, 9:00 a.m.–5:00 p.m.` |
| `Open Email Message` | `Continue to Email` |

Add adjacent helper text: `Your email app will open a draft for you to review and send.`

- [ ] **Step 6: Finish the artwork and resources pages**

In `upload-artwork.html`, set the hero image to `assets/images/work/work-slots/old/maryhaven-brochure-mailer/02-02-maryhaven-brochure-spread.jpg` with alt `Designed Maryhaven brochure spread prepared for artwork review` and apply:

| Current | Replacement |
|---|---|
| `Upload Artwork` | `Send Artwork` |
| Existing hero paragraph | `Already have artwork? Send your files and project details for print, signs, decals, wraps, or production review.` |
| `Artifacts for existing order` | `Files for an existing order` |
| `Order ID Info` | `Job or Order Details` |
| `Upload files` | `Artwork Files` |
| Existing static-hosting field note | `Selected files are not attached automatically. Add them to the email draft that opens, or paste a Dropbox, Google Drive, WeTransfer, or similar link below.` |
| `Open Artwork Email` | `Continue to Email` |

Set the job-details placeholder to `Job name, order ID, new project, or not sure` and add `Your email app will open a draft for you to review and send.`

In `resources.html`, set the hero image to `assets/images/work/sat-track-gps-print-marketing.jpg` with alt `Coordinated Sat Track GPS print marketing materials`, replace the hero paragraph with `Use these quick tips to prepare files, plan your project, and request a more accurate quote.`, change all `Guide` and `Checklist` badges to `Quick Tip`, and use link labels `Send Your Artwork`, `Plan a Vehicle Wrap`, and `Plan a Sign Project` in card order.

- [ ] **Step 7: Run the guardrails and verify the placeholder behavior is green**

Run: `node --test tests/non-store-polish.test.js`

Expected: the placeholder-artwork test passes with no non-store root HTML referencing `assets/images/placeholders/`; the isolated-stylesheet test remains intentionally red until Task 5.

- [ ] **Step 8: Commit only the supporting pages**

```powershell
git add -- work.html process.html about.html quote.html contact.html upload-artwork.html resources.html
git commit -m "Finish non-store supporting pages"
```

---

### Task 5: Apply Isolated Responsive and Accessibility Polish

**Files:**
- Create: `assets/css/site-polish.css`
- Modify: `index.html`
- Modify: `services.html`
- Modify: `graphic-design.html`
- Modify: `printing.html`
- Modify: `branding-materials.html`
- Modify: `signage.html`
- Modify: `vehicle-wraps.html`
- Modify: `installation.html`
- Modify: `work.html`
- Modify: `process.html`
- Modify: `about.html`
- Modify: `quote.html`
- Modify: `contact.html`
- Modify: `upload-artwork.html`
- Modify: `resources.html`

**Interfaces:**
- Consumes: `project-compare` and `location-card` markup from Tasks 2–4.
- Produces: a non-store-only stylesheet with responsive typography, image crops, accessible targets, and reduced support-launcher overlap.

- [ ] **Step 1: Create the isolated non-store stylesheet**

Create `assets/css/site-polish.css` with this complete content; do not modify `assets/css/styles.css` or `assets/css/support-assistant.css`:

```css
/* Non-store polish: preserve Terra's vehicle-shop surface. */
body:not(.vehicle-shop-page) main .hero h1 {
  font-size: clamp(3.25rem, 5vw, 4.75rem);
  line-height: .98;
  text-wrap: balance;
}
body:not(.vehicle-shop-page) main .page-hero h1 {
  max-width: 100%;
  font-size: clamp(2.75rem, 4.25vw, 4rem);
  line-height: 1;
  overflow-wrap: normal;
  text-wrap: balance;
}
body:not(.vehicle-shop-page) .page-hero-grid > * { min-width: 0; }
body:not(.vehicle-shop-page) main :is(.section-intro, .split-grid, .cta-grid) h2 {
  font-size: clamp(2rem, 3.2vw, 3rem);
  line-height: 1.08;
  text-wrap: balance;
}
body:not(.vehicle-shop-page) main :is(.quote-aside, .contact-panel, .resource-card, .timeline-item) h2 {
  font-size: clamp(1.4rem, 2vw, 1.85rem);
  line-height: 1.15;
}
body:not(.vehicle-shop-page) .page-hero-grid > img {
  width: 100%;
  aspect-ratio: 16 / 10;
  max-height: clamp(240px, 42vw, 420px);
  object-fit: cover;
  object-position: center;
}
body:not(.vehicle-shop-page) :is(.eyebrow, .kicker) { color: var(--red-dark); }
body:not(.vehicle-shop-page) :is(.legal, .resource-card, .contact-panel) a:not(.btn) {
  text-decoration: underline;
  text-underline-offset: .18em;
}
body:not(.vehicle-shop-page) .filter-btn,
body:not(.vehicle-shop-page) .portfolio-info .text-link,
body:not(.vehicle-shop-page) .portfolio-carousel-arrow { min-height: 44px; }
body:not(.vehicle-shop-page) .portfolio-carousel-arrow { width: 44px; }
body:not(.vehicle-shop-page) .portfolio-carousel-arrow:focus-visible {
  outline: 3px solid var(--yellow);
  outline-offset: 2px;
}
body:not(.vehicle-shop-page) .project-compare {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
body:not(.vehicle-shop-page) .project-compare figure {
  position: relative;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--ink);
}
body:not(.vehicle-shop-page) .project-compare img {
  width: 100%;
  height: clamp(260px, 34vw, 520px);
  object-fit: cover;
}
body:not(.vehicle-shop-page) .project-compare figcaption {
  position: absolute;
  left: .8rem;
  bottom: .8rem;
  padding: .4rem .65rem;
  border-radius: 999px;
  background: var(--yellow);
  color: var(--ink);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .06em;
}
body:not(.vehicle-shop-page) .location-card {
  display: grid;
  gap: .55rem;
  min-height: 260px;
  align-content: end;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border-radius: var(--radius);
  color: #fff;
  background: linear-gradient(135deg, rgba(8, 8, 8, .95), rgba(188, 17, 24, .9)), url("../images/work/chapman-ford-dealership-entrance-graphics-01-driveway.jpg") center / cover;
  box-shadow: var(--shadow);
}
body:not(.vehicle-shop-page) .location-card span,
body:not(.vehicle-shop-page) .location-card small { color: var(--yellow); }
body:not(.vehicle-shop-page) .location-card strong { font-size: clamp(1.25rem, 2vw, 1.7rem); }
body:not(.vehicle-shop-page) .tdsa-close,
body:not(.vehicle-shop-page) .tdsa-chip,
body:not(.vehicle-shop-page) .tdsa-action { min-height: 44px; }
body:not(.vehicle-shop-page) .tdsa-close { min-width: 44px; }

@media (max-width: 1180px) and (min-width: 1051px) {
  body:not(.vehicle-shop-page) .desktop-nav,
  body:not(.vehicle-shop-page) .header-actions { display: none; }
  body:not(.vehicle-shop-page) .menu-toggle { display: block; }
}

@media (max-width: 680px) {
  body:not(.vehicle-shop-page) main :is(.hero, .page-hero) h1 {
    max-width: 100%;
    font-size: clamp(2.15rem, 10vw, 2.75rem);
    overflow-wrap: anywhere;
  }
  body:not(.vehicle-shop-page) :is(.hero-grid, .page-hero-grid) {
    gap: 1.5rem;
    padding-block: 2.5rem;
  }
  body:not(.vehicle-shop-page) .page-hero-grid > img { max-height: 260px; }
  body:not(.vehicle-shop-page) .project-compare { grid-template-columns: 1fr; }
  body:not(.vehicle-shop-page) .project-compare img { height: 260px; }
  body:not(.vehicle-shop-page) .tdsa-root {
    right: max(.6rem, env(safe-area-inset-right));
    bottom: max(.6rem, env(safe-area-inset-bottom));
    left: auto;
  }
  body:not(.vehicle-shop-page) .tdsa-launcher {
    width: 52px;
    min-height: 52px;
    padding: 4px;
    gap: 0;
  }
  body:not(.vehicle-shop-page) .tdsa-launcher__text { display: none; }
  body:not(.vehicle-shop-page) .tdsa-panel {
    height: min(680px, calc(100dvh - 5.5rem));
    min-height: 0;
    max-height: calc(100dvh - 5.5rem);
  }
}
```

- [ ] **Step 2: Link the isolated stylesheet only from the 15 pages in scope**

In every HTML file listed under this task, insert this tag immediately after the existing `assets/css/support-assistant.css` link:

```html
<link rel="stylesheet" href="assets/css/site-polish.css">
```

Do not add the tag to `shop.html`, `support-assistant-snippet.html`, generated news routes, or any store-owned page.

- [ ] **Step 3: Run both focused guardrails**

Run: `node --test tests/non-store-polish.test.js`

Expected: PASS; no non-store root page references placeholder artwork and every page in `polishedPages` loads the isolated stylesheet.

- [ ] **Step 4: Confirm the CSS remains isolated from Terra's store work**

Run:

```powershell
git diff -- assets/css/site-polish.css
rg -n "vehicle-shop-page|shop-|cart|checkout|account" assets/css/site-polish.css
git diff --cached --name-only
```

Expected: all selectors in the new file are guarded by `body:not(.vehicle-shop-page)`; no `.shop-*`, cart, checkout, or account rule exists; `assets/css/styles.css` is absent from this task's staged files.

- [ ] **Step 5: Commit only the isolated stylesheet and its non-store links**

```powershell
git add -- assets/css/site-polish.css index.html services.html graphic-design.html printing.html branding-materials.html signage.html vehicle-wraps.html installation.html work.html process.html about.html quote.html contact.html upload-artwork.html resources.html
git commit -m "Polish non-store responsive layouts"
```

---

### Task 6: Verify the Finished Non-Store Site

**Files:**
- Verify: all files from Tasks 1–5
- Build output: `_site/` (generated and ignored)

**Interfaces:**
- Consumes: completed HTML, CSS, and test changes.
- Produces: passing automated checks and matched desktop/mobile visual evidence.

- [ ] **Step 1: Scan for unfinished public language and placeholder references**

Run:

```powershell
rg -n --glob '*.html' --glob '!shop.html' --glob '!support-assistant-snippet.html' "assets/images/placeholders/|IMAGE SLOT|MAP SLOT|REPLACE WITH REAL PROJECT PHOTO|GitHub Pages|Static GitHub Pages|customer path|service architecture|Featured work system|Attention grabber|Customer-oriented navigation|old customer-fit|Recommended template" .
```

Expected: no matches in top-level non-store pages. Generated news pages are outside this focused scan and must not be edited directly.

- [ ] **Step 2: Run repository checks**

Run:

```powershell
node --test tests/non-store-polish.test.js
npm.cmd test
npm.cmd run build:pages
```

Expected: every command exits 0; the guardrail passes; the full suite passes; `_site/` builds successfully.

- [ ] **Step 3: Start a hidden local preview of the built artifact**

Run a hidden `python -m http.server 4173 --directory _site` process and record its PID so it can be stopped after browser verification.

- [ ] **Step 4: Compare matching desktop and mobile browser captures**

At 1440×1000 and 390×844, inspect at least:

- `index.html`: real service, portfolio, industry, and transformation images; no launcher overlap.
- `services.html`: hero and cards are real; mobile title fits.
- one service page: hero crop, CTA, service headings, and transformation pair.
- `work.html`: portfolio controls remain usable and closing copy is customer-facing.
- `quote.html`: real hero, accurate file note, and email CTA.
- `contact.html`: directions card is visible and keyboard-focusable.

Check browser console output after loading each page. Expected: no uncaught errors, broken image requests, clipped headings, or obscured primary calls to action.

- [ ] **Step 5: Confirm protected store work remains outside the polish diff**

Run:

```powershell
git diff origin/main...HEAD --name-only
git status --short
```

Expected: this polish's commits contain only the named non-store HTML, CSS, test, spec, and plan files. Concurrent store changes may remain in the working tree but are not staged or committed by this work.

- [ ] **Step 6: Commit the implementation plan and any final source-only corrections**

```powershell
git add -- docs/superpowers/plans/2026-08-06-non-store-site-polish.md
git commit -m "Document non-store site polish plan"
```

Do not push or deploy; the user did not request publication.
