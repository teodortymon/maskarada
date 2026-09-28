---
# Maintainer doc, not site content — keep Eleventy from publishing it.
permalink: false
eleventyExcludeFromCollections: true
---

# Bootstrap: keep, trim, or replace? (Issue #54)

Decision document, 2026-07-19. Analysis only — no code was changed. All numbers
were measured on this branch (`v2`, Bootstrap 5.3.x) with `sass --style
compressed` and `gzip -9`-equivalent (`gzip -c | wc -c`).

**TL;DR — recommendation:** stay on Bootstrap but finish trimming it
(option A: drop 3 dead SCSS modules, prune the utilities API, add PurgeCSS to
the prod build, replace the CDN `bootstrap.bundle.min.js` with a modal-only
payload or a native `<dialog>`). That gets ~90 % of the payload win of any
migration for a few hours of low-risk work. Treat vanilla CSS (option D) as the
*direction of travel* — new components are already written that way — and
revisit full removal only when the remaining Bootstrap class usage has shrunk
to the point where it is a mechanical cleanup. Do **not** adopt Pico/Bulma or
Tailwind.

---

## 1. Current-state inventory

### How Bootstrap enters the site

| Entry point | What | Where |
|---|---|---|
| CSS | Modular SCSS import (already selective, not the full bundle) | `scss/styles.scss` → compiled to `css/styles.css` |
| JS | **Full** `bootstrap.bundle.min.js` 5.3.2 (incl. Popper) from jsDelivr CDN | `_includes/header_t.html` |

The SCSS side was already partially optimised (a previous class audit produced
the current selective module list). The JS side was not: the whole bundle is
loaded although exactly one plugin is used.

### What is genuinely used

- **Bootstrap JS: only Modal.** The entire dynamic surface is
  `data-bs-toggle="modal"` (5 sites: `_includes/play_card.html`,
  `t/index.md` ×2, `t/repertuar.md`, `t/comments`) and one
  `data-bs-dismiss="modal"` in `_includes/spektakl_modal.html`. No carousel, no
  collapse (the header nav is custom flexbox, no toggler), no dropdown, no
  tooltip/popover — so **Popper is 100 % dead weight**. The photo lightbox is
  already vanilla JS (`_includes/lightbox.html`).
- **CSS components:** modal (`spektakl_modal.html`), card (~18 uses), buttons
  (`btn`, `btn-outline-primary`, `btn-check` toggle filters, `btn-group`,
  `btn-close`), badge (2), `ratio`/`ratio-16x9` (video embeds), `nav-link`
  (header), bare `.navbar` (4 uses, as a flex wrapper only — no
  toggler/collapse machinery).
- **Layout:** `container`/`container-fluid` (~23), grid `row`/`col-*` (~15
  `col-*` uses, `g-3`/`g-4` gutters) — mostly inside the play modal and
  gallery grids.
- **Utilities:** roughly 20 distinct classes total: spacing (`my-2`, `my-4`,
  `mt-*`, `mb-*`, `ms-2`), flex (`d-flex`, `justify-content-center`,
  `align-items-*`), `text-center`, `text-bg-primary`, `img-fluid`, `rounded`,
  `shadow-sm`, `stretched-link`, `list-unstyled`, `fade`.
- **Theming:** `$theme-colors`, `$body-bg`, `$card-bg` overrides in
  `scss/styles.scss`.

### What is dead weight

- **Imported SCSS modules with no matching markup:** `tables` (zero table
  classes anywhere), `list-group` (only referenced from a CSS rule in
  `t/index.md`; no markup emits the class), `placeholders` (the "Wideo
  wkrótce" box is a custom `.video-placeholder`, not Bootstrap's).
- **The utilities API is the single biggest CSS cost** (~69 KB raw / ~8 KB gz —
  see table) because it generates every utility at every breakpoint, while the
  templates use ~20 of them.
- **Popper + 7 unused JS plugins** in the CDN bundle.
- Practically the whole of `reboot`/`type`/grid variants beyond the handful of
  breakpoints actually written.

### Measured byte costs

| Variant (CSS unless noted) | raw | gzip |
|---|---:|---:|
| Full `@import "bootstrap"` (for reference) | 230.2 KB | 31.3 KB |
| **Shipped today** — `css/styles.css` (selective modules + custom partials) | **172.2 KB** | **25.2 KB** |
| Same minus the custom partials (Bootstrap share alone) | 163.1 KB | 23.2 KB |
| Minus dead modules (tables, list-group, placeholders) | 144.2 KB | 20.8 KB |
| Minus the utilities API (isolates its cost) | 94.2 KB | 15.3 KB |
| **PurgeCSS over the built `_site/`** (what the pages actually need) | **30.4 KB** | **7.3 KB** |
| `bootstrap.bundle.min.js` (CDN, shipped today) | 80.5 KB | 23.8 KB |
| `bootstrap.min.js` (no Popper — Modal doesn't need it) | 60.5 KB | 16.6 KB |
| Modal-only custom ESM build (estimate) | ~15 KB | ~5 KB |
| Native `<dialog>` replacement (estimate) | ~1 KB | ~0.5 KB |

So ~82 % of the shipped CSS and ~95 % of the shipped framework JS is unused.
Total realistic saving: **~35–40 KB gzip per page** (25.2→~8 CSS, 23.8→~0–5 JS).

Context that keeps this honest: the site is 17 HTML pages, and each page also
loads the Facebook SDK, the Kicket ticket embed, Google Fonts (Montserrat), a
YoungSerif `@font-face`, and image-heavy galleries. Bootstrap is *not* the
biggest item on the wire — but it is the biggest item **we fully control**,
and 49 KB gzip of framework for ~20 utilities + a modal is a poor ratio.

Also relevant to any decision: the codebase is visibly drifting to custom CSS
anyway. All recent components (`pc-*` play cards, `ksf-*` calendar, `lb-*`
lightbox, `ig-*`/`fb-*` social cards, `bottom-banner`, the whole
`site-header`) are hand-written classes in `scss/_play-card.scss`,
`scss/_spektakle.scss`, `lay/style.css` and inline `<style>` blocks. Bootstrap
has become a base layer (reset, grid, modal, a few utilities), not the design
system.

---

## 2. Directions

### A. Stay on Bootstrap, trim aggressively

Drop the 3 dead modules; prune `$utilities` (Bootstrap's utilities API is
configurable — disable responsive variants / unused properties) or add
PurgeCSS as a `css-prod` post-step; replace the CDN bundle with either a small
custom ESM build importing only `bootstrap/js/dist/modal` or (better) a native
`<dialog>`; self-host the result to also drop a third-party origin from the CSP.

- **Pros:** ~35 KB gzip/page saved; hours of work; no visual change; zero
  retraining; keeps SCSS variables/theming; PurgeCSS keeps paying as templates
  change; reversible at every step.
- **Cons:** still Bootstrap — the conceptual dependency stays; PurgeCSS needs a
  safelist for JS-toggled classes (`modal-open`, `show`, `fade`, `hdr-hide`,
  lightbox `open`, …) and content globs that include `t/js/`; Sass
  `@import`-deprecation churn will eventually force a `@use` migration anyway.
- **Effort:** ~0.5–1 day including safelist testing across all 17 pages.

### B. Lighter classful/classless framework (Pico.css, Bulma-lite, etc.)

- **Pros:** small (Pico ~10 KB gz); classless flavours would clean the markup.
- **Cons:** worst of both worlds *for this codebase*: every template and the
  raw-HTML markdown pages (`t/index.md`, `t/repertuar.md` contain Bootstrap
  classes inline) must be rewritten — the full cost of a migration — yet you
  land on another framework's opinions, and Pico has no modal/JS story or grid
  matching the current `col-*` usage. The custom `pc-*`/`ksf-*` design system
  would fight a second base theme.
- **Effort:** ~1–2 weeks. **Not recommended.**

### C. Utility-first (Tailwind)

- **Pros:** final payload comparable to purged Bootstrap (~10 KB gz); good
  11ty integration; utilities-in-markup matches how some templates are written.
- **Cons:** total re-templating of layouts, includes, `_s2` plays *and*
  Markdown-embedded HTML; a second build chain next to the existing Sass one
  (or a Sass→PostCSS swap); the hand-rolled SCSS components would need
  translating or exempting; TinaCMS-edited content with raw classes becomes a
  hazard; the payload end-state is no better than A. High cost, no unique win
  for a 17-page content site.
- **Effort:** 2–4 weeks. **Not recommended.**

### D. Vanilla/custom CSS (modern features) + tiny JS

Replace Bootstrap entirely: a light reset, CSS grid/flex for layout (native
`display: grid` replaces `row`/`col-*`; `aspect-ratio` replaces `ratio`),
custom properties for the palette, a ~20-line utility sheet for the spacing
and flex helpers actually used, native `<dialog>` for the play modal, keep the
existing vanilla lightbox.

- **Pros:** aligns with the codebase's actual trajectory (everything new is
  already custom); smallest possible end-state (~8–10 KB gz CSS, ~1 KB JS,
  zero framework, zero CDN origin); no deprecation treadmill; full design
  freedom for the v2 "paper cut-out" direction.
- **Cons:** the *old* surface is the cost: play modal markup (7 Bootstrap
  classes deep), card/btn/btn-check filter UI, grid in modals and galleries,
  and Bootstrap classes baked into Markdown content pages; `<dialog>` needs
  its own open/close/scroll-lock wiring and focus-trap care; visual-regression
  risk across all pages; reboot removal changes base typography subtly
  everywhere.
- **Effort:** ~1–2 weeks spread over normal feature work if done component by
  component (grid → dialog → buttons/cards → utilities → drop imports);
  risky as a big-bang.

### E. Do nothing

Defensible — the site is fast and static, and third-party embeds dominate the
waterfall. But 49 KB gzip/page for a modal and 20 utilities is free money left
on the table, and A is nearly free to execute. **Not preferred.**

---

## 3. Recommendation

**Do A now; drift toward D deliberately; skip B and C.**

Reasoning: the measured gap between "trimmed Bootstrap" (~8 KB gz CSS + 0–5 KB
JS) and "full vanilla rewrite" (~8–10 KB gz CSS + ~1 KB JS) is a rounding
error, but the effort gap is hours vs weeks. Meanwhile every new component is
already being written outside Bootstrap, so the dependency shrinks naturally;
forcing a rewrite of the *old* surface (modal, cards, grid, Markdown-embedded
classes) buys almost no bytes and real regression risk today. The one place a
framework swap would pay — the modal — can be taken piecemeal via `<dialog>`
inside step A's follow-up.

### Sequenced next steps

1. **Drop dead SCSS modules** (`tables`, `list-group`, `placeholders` in
   `scss/styles.scss`): −2.4 KB gz, five minutes, no risk (verify the
   `t/index.md` `.list-group-item` rule really has no markup first).
2. **Kill Popper immediately**: swap the CDN `bootstrap.bundle.min.js` for
   `bootstrap.min.js` (−7 KB gz, one line) as a stopgap.
3. **Add PurgeCSS to `css-prod`** (new mise task step): content =
   `_site/**/*.html` + `t/js/**/*.js` + inline-script includes; safelist
   `show`, `fade`, `modal-open`, `modal-backdrop`, `hdr-hide`, `open`,
   `active`, `collapsing?`. Ship after eyeballing all 17 pages and the modal /
   filter / lightbox flows. CSS 25.2 → ~8 KB gz.
4. **Replace Bootstrap Modal with `<dialog>`** in `spektakl_modal.html` +
   `play_card.html` + the two Markdown call sites; then delete the Bootstrap
   `<script>` tag entirely and the `modal`/`transitions`/`close` SCSS imports.
   JS 23.8 → ~0 KB gz; also removes the jsDelivr origin from `_headers` CSP.
5. **House rule going forward:** no new Bootstrap classes in new components
   (already the de-facto practice); prefer native CSS.
6. **Revisit in ~6–12 months:** if remaining usage is just grid + a few
   utilities, do the final D cleanup as one small chore branch.

### Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| PurgeCSS strips a JS-toggled or CMS-authored class | Medium | Safelist above; TinaCMS content lives in the repo, so `_site` globs cover it; visual pass over all 17 pages + `mise run preview` |
| `<dialog>` behaviour gaps (scroll-lock, focus trap, ESC, backdrop click) | Medium | Small tested helper; keep Bootstrap modal until parity is verified on mobile |
| Sass `@import` deprecation forces `@use` rewrite of `scss/styles.scss` | High (eventually) | Orthogonal to this decision; do it whenever `sass` starts erroring |
| Trimmed utility missed by the audit (used only in a rarely-built page) | Low | PurgeCSS is generated from the real build output, not the audit |
| Team/CMS editors paste Bootstrap-flavoured HTML into content | Low | Purge safelist review in PR checklist |

### Open question

Whether step 4 (`<dialog>`) should land before or after the pending v2 design
intensity decision — if the play modal gets redesigned anyway, fold the
`<dialog>` swap into that redesign instead of doing it twice.
