# Performance audit — July 2026 (issue #53)

Lighthouse 13.4 (headless Chrome, mobile emulation, simulated slow 4G) run
against the built `_site/` served locally. Re-run any time with
`mise run perf-audit` (reports land in `.lighthouse/`).

## Baseline scores (before fixes)

| Page               | Perf | A11y | Best practices | SEO | FCP   | LCP    | Page weight |
| ------------------ | ---- | ---- | -------------- | --- | ----- | ------ | ----------- |
| `/t/` (home)       | 64   | 91   | 100            | 91  | 4.1 s | 14.4 s | 5.2 MB      |
| `/t/spektakle.html`| 68   | —    | —              | —   | 3.0 s | 8.1 s  | 5.0 MB      |
| `/` (redirect)     | 68   | —    | —              | —   | 3.2 s | 7.7 s  | 5.2 MB      |

CLS was 0 and TBT 0 ms everywhere — the problems are pure network weight and
render-blocking, which is exactly what hurts on low/slow connections.

## What was making pages heavy

1. **Facebook Page Plugin (footer) — ~2.5–3 MB on every page.** The FB JS SDK
   loaded eagerly in `<head>` on every page; the plugin then pulled feed
   photos and two `fbcdn` MP4 videos (1.4 MB + 0.6 MB) even though the widget
   sits at the very bottom of the page. Single biggest cost by far.
2. **`t/lay/img/ig-avatar.png` — 287 KB** PNG (429×429 photo) displayed in a
   132 px circle in the footer, loaded eagerly.
3. **`t/lay/img/logo2.png` — 222 KB** PNG in the sticky header on every page,
   also reused as the favicon; flagged as unsized (no width/height).
4. **Render-blocking CSS — ~2.8 s of blocking on slow 4G**: `css/styles.css`
   (172 KB compiled Bootstrap, ~163 KB unused per Lighthouse), the Google
   Fonts stylesheet (~0.8 s), `t/lay/style.css`, `lite-yt-embed.css`.
5. Minor: Google Maps embed iframes missing `title` (a11y), `a.pc-buy`
   ticket anchors without crawlable hrefs (SEO), nav `color-contrast`.

## Fixes shipped in this branch

- **Lazy Facebook SDK** (`_includes/header_t.html`): the SDK is now injected
  only when the footer `.fb-page` widget scrolls within 600 px of the
  viewport (IntersectionObserver; eager fallback for ancient browsers, no-op
  on pages without the widget). Saves ~2.5–3 MB and removes the bfcache
  blocker for everyone who doesn't scroll to the footer.
- **Async Google Fonts CSS** (`header_t.html`): `media="print"
  onload="this.media='all'"` + `<noscript>` fallback — the font stylesheet no
  longer blocks first paint (font-display: swap was already set).
- **WebP for the two heavy chrome images** (originals kept as fallbacks,
  nothing deleted):
  - `t/lay/img/logo2.webp` (54 KB, q95) served via `<picture>`, PNG fallback;
    `width`/`height` added (fixes the unsized-image flag).
  - `t/lay/img/ig-avatar-264.webp` (13 KB, resized to 2× display size) via
    `<picture>` + `loading="lazy" decoding="async"`; PNG fallback intact.
- **Small favicon**: `t/lay/img/favicon-96.png` (7 KB) replaces the 222 KB
  logo PNG as `rel="icon"`.
- **Maps iframes**: `title` attributes added (`t/index.md`, `t/kontakt.md`,
  `w/kontakt.html`); they already had `loading="lazy"`.
- **Tooling**: `mise run perf-audit` file task added so audits are repeatable.

### Scores after fixes (same conditions)

| Page               | Perf        | A11y     | FCP           | LCP             | Page weight      | Requests  |
| ------------------ | ----------- | -------- | ------------- | --------------- | ---------------- | --------- |
| `/t/` (home)       | 64 → **84** | 91 → 95  | 4.1 → 2.7 s   | 14.4 → **3.8 s**| 5.2 → **1.6 MB** | 116 → 49  |
| `/t/spektakle.html`| 68 → **80** | —        | 3.0 → 2.9 s   | 8.1 → **4.4 s** | 5.0 → **1.4 MB** | —         |

The FB feed no longer loads at all before scrolling near the footer, which is
where most of the ~3.6 MB / 67-request drop on the homepage comes from.

## Follow-ups worth doing next (not in this PR)

1. **Trim Bootstrap** — `css/styles.css` is 172 KB minified with ~163 KB
   unused. Importing only the used Bootstrap modules in `scss/styles.scss`
   would cut ~100+ KB of render-blocking CSS. Medium effort, needs visual QA.
2. **Poster/gallery image pipeline** — the `t/lay/img/**` posters
   (`elfy2_big.png` 484 KB, `syrenka_big.jpg` 444 KB, `plakat_big.jpg` 356 KB,
   …) would benefit from a WebP/AVIF + responsive-srcset pass (e.g.
   `@11ty/eleventy-img`). Deliberately not done here — one-off conversions
   don't scale to ~1500 images and bulk-editing `t/lay/img` is risky
   (accidental-deletion history).
3. **Self-host the Montserrat subset** — removes the fonts.googleapis.com
   round-trips entirely (~1 s on slow 4G).
4. **Longer cache lifetimes** — `_headers` gives `/css/*`, `/t/lay/*`,
   `/t/js/*` only `max-age=86400`; fine while the redesign iterates, but
   worth raising (or versioning) once v2 stabilises.
5. **Crawlable ticket links** — the `a.pc-buy` anchors flagged by Lighthouse
   SEO; and the nav `color-contrast` flags (`#e0736f`/`#4a708e` on white).
6. **`kicket.com/embedded.js` loads on every page** (defer'd) but is only
   needed where the ticket widget can open — could be page-scoped.
