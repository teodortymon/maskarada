const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const yaml = require("js-yaml");

/**
 * Eleventy config for the Maskarada v2 site (migrated off Jekyll).
 *
 * Design goals:
 *  - Mirror Jekyll's directory layout (_layouts / _includes / _data, root input).
 *  - Preserve flat `.html` output URLs (the site uses relative links + nav
 *    active-state derived from page.url, so pretty-URL dirs would break both).
 *  - Reproduce the Jekyll/Liquid features the templates rely on: the `s2` play
 *    collection, CSV data files, Ruby-strftime `date`, the `push` array filter,
 *    and the `bust_file_cache` filter (from jekyll-cache-bust).
 */
module.exports = function (eleventyConfig) {
  // ---------------------------------------------------------------------------
  // Flat `.html` permalinks — mirror Jekyll. Global data so a page's own
  // front-matter `permalink:` still wins over this default.
  // ---------------------------------------------------------------------------
  // Derive from inputPath (reliable) rather than filePathStem, which collapses
  // to "/index" for every index file when input is the project root ".".
  eleventyConfig.addGlobalData(
    "permalink",
    () => (data) => {
      const rel = data.page.inputPath
        .replace(/^\.\//, "")
        .replace(/\.[^./]+$/, "");
      return `${rel}.${data.page.outputFileExtension}`;
    }
  );

  // ---------------------------------------------------------------------------
  // `s2` play collection. Flattened so templates keep `s.title` / `s.video` /
  // `s.content` (Jekyll `site.s2` -> Eleventy `collections.s2`).
  // ---------------------------------------------------------------------------
  eleventyConfig.addCollection("s2", (api) =>
    api.getFilteredByGlob("./_s2/*.md").map((item) => {
      // Flatten front matter so templates keep `s.title`, `s.video`, etc.
      const play = { ...item.data, url: item.url };
      // `content` (the play description) is the rendered body. Expose it as a
      // lazy getter so `item.templateContent` is only read at render time — the
      // collection callback runs before content is ready (premature-use error).
      Object.defineProperty(play, "content", {
        enumerable: true,
        get: () => item.templateContent,
      });
      return play;
    })
  );

  // ---------------------------------------------------------------------------
  // YAML data files: Eleventy (unlike Jekyll) does not parse .yml/.yaml data
  // files out of the box. _data/spektakle/*.yml, dni_tygodnia.yml, etc. YAML
  // timestamps (e.g. 2026-07-08T09:30:00.000Z) become JS Dates, matching the
  // `date` filter below.
  // ---------------------------------------------------------------------------
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  // Match kramdown's typographic output (curly quotes, … for ...) in the
  // markdown-rendered play descriptions, so content reads identically to the
  // old Jekyll build.
  eleventyConfig.amendLibrary("md", (md) => md.set({ typographer: true }));

  // ---------------------------------------------------------------------------
  // CSV data files: _data/kostiumy/*.csv (rating,amount) and grupy_strojow.csv
  // (url,nazwa). Parsed to arrays of row objects, matching Jekyll's CSV loader.
  // ---------------------------------------------------------------------------
  eleventyConfig.addDataExtension("csv", (contents) => {
    const lines = contents.replace(/^﻿/, "").trim().split(/\r?\n/);
    if (lines.length === 0) return [];
    const cols = lines[0].split(",").map((c) => c.trim());
    return lines.slice(1).filter((l) => l.trim() !== "").map((line) => {
      const cells = line.split(",");
      const row = {};
      cols.forEach((c, i) => (row[c] = (cells[i] ?? "").trim()));
      return row;
    });
  });

  // ---------------------------------------------------------------------------
  // Ruby-strftime-compatible `date` filter (UTC — Jekyll config sets timezone
  // UTC and the event data carries explicit `Z` offsets). Replaces Jekyll's
  // built-in `date`; handles 'now'/'today', Date objects, ISO strings, numbers.
  // ---------------------------------------------------------------------------
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  const B = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const b = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const A = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const a = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  function toDate(input) {
    if (input == null) return new Date(NaN);
    if (input === "now" || input === "today") return new Date();
    if (input instanceof Date) return input;
    if (typeof input === "number") return new Date(input);
    return new Date(input);
  }

  function strftime(d, fmt) {
    return String(fmt).replace(/%-?[A-Za-z%]/g, (tok) => {
      switch (tok) {
        case "%Y": return d.getUTCFullYear();
        case "%y": return pad(d.getUTCFullYear() % 100);
        case "%m": return pad(d.getUTCMonth() + 1);
        case "%-m": return d.getUTCMonth() + 1;
        case "%d": return pad(d.getUTCDate());
        case "%-d": return d.getUTCDate();
        case "%e": return String(d.getUTCDate()).padStart(2, " ");
        case "%H": return pad(d.getUTCHours());
        case "%-H": return d.getUTCHours();
        case "%I": return pad(((d.getUTCHours() + 11) % 12) + 1);
        case "%M": return pad(d.getUTCMinutes());
        case "%-M": return d.getUTCMinutes();
        case "%S": return pad(d.getUTCSeconds());
        case "%s": return Math.floor(d.getTime() / 1000);
        case "%w": return d.getUTCDay();
        case "%R": return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
        case "%T": return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
        case "%p": return d.getUTCHours() < 12 ? "AM" : "PM";
        case "%B": return B[d.getUTCMonth()];
        case "%b": return b[d.getUTCMonth()];
        case "%A": return A[d.getUTCDay()];
        case "%a": return a[d.getUTCDay()];
        case "%j": {
          const start = Date.UTC(d.getUTCFullYear(), 0, 0);
          return pad(Math.floor((d.getTime() - start) / 86400000), 3);
        }
        case "%%": return "%";
        default: return tok;
      }
    });
  }

  eleventyConfig.addFilter("date", (input, fmt) => {
    const d = toDate(input);
    if (isNaN(d.getTime())) return input;
    if (fmt == null) return d.toUTCString();
    return strftime(d, fmt);
  });

  // ---------------------------------------------------------------------------
  // `push` — LiquidJS has no `push`. Non-mutating (matches Liquid `assign x =
  // x | push: item`). Also seed an array from `"" | split: "" | push: item`.
  // ---------------------------------------------------------------------------
  eleventyConfig.addFilter("push", (arr, item) =>
    Array.isArray(arr) ? [...arr, item] : [item]
  );

  // ---------------------------------------------------------------------------
  // `bust_file_cache` — jekyll-cache-bust replacement. Appends `?<md5>` of the
  // file (resolved relative to the project root, like the gem). No-op if the
  // file can't be read.
  // ---------------------------------------------------------------------------
  eleventyConfig.addFilter("bust_file_cache", (url) => {
    const rel = String(url).replace(/^\//, "");
    try {
      const buf = fs.readFileSync(path.join(__dirname, rel));
      const hash = crypto.createHash("md5").update(buf).digest("hex");
      return `${url}?v=${hash}`;
    } catch (e) {
      return url;
    }
  });

  // ---------------------------------------------------------------------------
  // Static assets copied verbatim into _site.
  // ---------------------------------------------------------------------------
  ["lay", "css", "_headers", "google958f145c78b1087b.html", "CNAME"].forEach((p) =>
    eleventyConfig.addPassthroughCopy(p)
  );
  // admin/ is the TinaCMS dev-mode shell (it just redirects to localhost:4001),
  // so it must NOT ship in production builds — but `tinacms dev` needs /admin
  // served locally. Eleventy v3 sets ELEVENTY_RUN_MODE ("build"|"serve"|"watch");
  // skip the copy only for one-shot builds. A production `tinacms build` step
  // can generate a real admin bundle and restore this passthrough later.
  if (process.env.ELEVENTY_RUN_MODE !== "build") {
    eleventyConfig.addPassthroughCopy("admin");
  }
  // Section asset trees (images, vendored JS, compiled costume galleries).
  eleventyConfig.addPassthroughCopy("t/lay");
  eleventyConfig.addPassthroughCopy("t/js");
  eleventyConfig.addPassthroughCopy("w/lay");
  eleventyConfig.addPassthroughCopy("w/js");
  eleventyConfig.addPassthroughCopy("w/kostiumy");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["html", "md", "liquid"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
  };
};
