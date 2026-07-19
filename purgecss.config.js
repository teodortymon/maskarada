/**
 * PurgeCSS config — production-only CSS trim (issue #53).
 *
 * Runs AFTER Eleventy as the last step of `npm run build` (see package.json
 * `css-purge`): it rewrites _site/css/styles.css in place so the shipped file
 * contains only selectors that actually appear in the built site. The source
 * css/styles.css and the dev build (`mise run dev`) are never purged.
 *
 * Content globs scan the BUILT output, so Liquid-assembled classes, inline
 * <script>/<style> blocks in markdown pages, and the vendored JS under
 * _site/t/js and _site/w/js are all covered.
 *
 * Safelist: classes added at RUNTIME by JS never appear in the static HTML,
 * so they must be listed here or they get purged and the UI breaks silently.
 * Current runtime togglers:
 *   - Bootstrap Modal plugin: modal-open (on <body>), modal-backdrop, fade,
 *     show, modal-static; greedy /^modal/ covers the rest of the modal tree.
 *   - Site header auto-hide: hdr-hide (header_t.html inline script).
 *   - Vanilla lightbox: open (lightbox.html), lyt-* (lite-youtube-embed).
 *   - Generic state classes (active, disabled, collapsed, show/showing/hiding,
 *     collapse/collapsing, visually-hidden) kept defensively — cheap, and a
 *     missed dynamic class = broken UI.
 * If you add JS that toggles a class, ADD IT HERE.
 */
module.exports = {
  content: [
    // Built output — what the pages actually render (Liquid-assembled
    // classes, TinaCMS content, inline scripts/styles all included).
    "_site/**/*.html",
    "_site/t/js/**/*.js",
    "_site/w/js/**/*.js",
    // Source templates too: conditional Liquid branches may render on no
    // CURRENT page (e.g. play_media.html's video-placeholder d-flex box only
    // shows for plays without a video) but must not break when content
    // changes. Costs a few hundred bytes, prevents silent breakage.
    "_layouts/**/*.html",
    "_includes/**/*.html",
    "_s2/**/*.md",
    "t/**/*.md",
    "index.html",
  ],
  css: ["_site/css/styles.css"],
  output: "_site/css/",
  safelist: {
    standard: [
      // Bootstrap Modal runtime classes
      "modal-open",
      "modal-backdrop",
      "modal-static",
      "fade",
      "show",
      "showing",
      "hiding",
      // generic Bootstrap state classes (toggled by JS / aria)
      "active",
      "disabled",
      "collapsed",
      "collapse",
      "collapsing",
      "visually-hidden",
      "visually-hidden-focusable",
      // site JS togglers
      "hdr-hide",
      "open",
      "lyt-activated",
      "lyt-playbtn",
      "lyt-visually-hidden",
    ],
    greedy: [
      // anything modal-related, present or future (dialog sizes, fullscreen…)
      /^modal/,
      // .btn-check sibling-state selectors (:checked + .btn-outline-*)
      /^btn-check/,
      // lite-youtube-embed injects lyt-* nodes at runtime
      /^lyt-/,
    ],
  },
};
