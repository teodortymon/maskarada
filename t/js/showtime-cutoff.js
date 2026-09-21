/*
 * showtime-cutoff.js — client-side, because the site is static.
 *
 * The Eleventy build filters "upcoming vs past" against build-time `now`, but
 * GitHub Pages only rebuilds on push, so between deploys that clock is stale:
 * plays that have already happened linger, and nothing can know it is now
 * inside the "2h before curtain" online-sales window. Both are decided here, in
 * the browser, against the real current time.
 *
 * Two jobs:
 *   1. PAST  — a showtime whose start time has passed is removed from the page
 *              (upcoming list, calendar, modals) and any container it emptied
 *              (day section, month, rail chip, play card) is pruned too.
 *   2. CLOSED — our online seller (Biletomat) shuts ~2h before curtain, so an
 *              online "buy" row inside that window swaps to the "sales closed —
 *              call to reserve" state (see _includes/sales_closed.html). Weekday
 *              rows are already phone-only, so only weekend buy rows can close.
 *
 * TIMEZONE: showtimes are authored as Europe/Warsaw wall-clock (stored with a
 * `Z` suffix but formatted in UTC on build, so data-showtime is the intended
 * local wall-clock, e.g. "2026-09-28T09:30"). We compare wall-clock to
 * wall-clock: "now" is reduced to Warsaw wall-clock and both sides are parsed in
 * the same (browser-local) frame, so the browser's own offset cancels and DST
 * never skews the 2h window.
 *
 * This file is loaded `defer` from _layouts/t.html, so it runs after the DOM is
 * parsed but BEFORE DOMContentLoaded — i.e. before the Kalendarz's inline
 * category-filter listener, which then operates on the already-pruned DOM.
 */
(function () {
  "use strict";

  var CUTOFF_MS = 2 * 60 * 60 * 1000; // online sales close 2h before curtain

  // Current time reduced to Europe/Warsaw wall-clock, read back as a local
  // timestamp so it is comparable with Date.parse(data-showtime).
  function warsawNowMs() {
    try {
      var parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Warsaw",
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).formatToParts(new Date());
      var p = {};
      parts.forEach(function (x) {
        p[x.type] = x.value;
      });
      var h = p.hour === "24" ? "00" : p.hour; // some engines emit 24 at midnight
      return Date.parse(p.year + "-" + p.month + "-" + p.day + "T" + h + ":" + p.minute + ":" + p.second);
    } catch (e) {
      // No Intl / unknown zone: fall back to the device clock. Worst case the
      // 2h window is off by the device's offset from Warsaw — still degrades to
      // "roughly right" rather than breaking the page.
      return Date.now();
    }
  }

  var NOW = warsawNowMs();

  function showtimeMs(el) {
    return Date.parse(el.getAttribute("data-showtime"));
  }

  // ---- 1. Remove past showtimes, then prune whatever they emptied ----------
  function prunePast() {
    document.querySelectorAll("[data-showtime]").forEach(function (el) {
      var t = showtimeMs(el);
      if (!isNaN(t) && NOW >= t) {
        el.remove();
      }
    });

    // Kalendarz: drop day sections with no shows left, then their rail chips,
    // empty rail groups, and empty month blocks.
    document.querySelectorAll(".ksf-day-sec").forEach(function (sec) {
      if (!sec.querySelector(".ksf-stub")) sec.remove();
    });
    document.querySelectorAll('.ksf-rail-day[href^="#d"]').forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (!document.getElementById(id)) a.remove();
    });
    document.querySelectorAll(".ksf-rail-group").forEach(function (g) {
      if (!g.querySelector(".ksf-rail-day")) g.remove();
    });
    document.querySelectorAll(".ksf-month-block").forEach(function (b) {
      if (!b.querySelector(".ksf-day-sec")) b.remove();
    });

    // Homepage / Spektakle: a play card whose showtimes have all passed is gone.
    document.querySelectorAll(".pcard").forEach(function (card) {
      var list = card.querySelector(".pc-tickets");
      if (list && !list.querySelector(".pc-ticket")) {
        var col = card.closest('[class*="col-"]');
        (col || card).remove();
      }
    });

    revealEmptyStates();
  }

  // If pruning emptied a whole view, surface the site's existing "nothing
  // scheduled" wording instead of a blank page.
  function revealEmptyStates() {
    // Kalendarz — the bar + months are gone; show a message once.
    var bar = document.querySelector(".ksf-bar");
    if (bar && !document.querySelector(".ksf-stub")) {
      bar.style.display = "none";
      if (!document.getElementById("ksf-allpast")) {
        var msg = document.createElement("p");
        msg.id = "ksf-allpast";
        msg.className = "text-center my-4";
        msg.innerHTML = "<i>Aktualnie nie mamy zaplanowanych spektakli. Zajrzyj wkrótce!</i>";
        bar.parentNode.insertBefore(msg, bar.nextSibling);
      }
    }
    // Homepage — the "Najbliższe spektakle" row is empty.
    var row = document.querySelector(".page-main .row");
    if (row && row.querySelector) {
      var homeCards = document.querySelectorAll(".page-main .pcard");
      if (row.children.length === 0 && homeCards.length === 0 && !document.getElementById("home-allpast")) {
        var hm = document.createElement("p");
        hm.id = "home-allpast";
        hm.className = "text-center my-4";
        hm.innerHTML = '<i>Brak zaplanowanych spektakli. Zajrzyj do <a href="repertuar.html">Kalendarza</a>.</i>';
        row.parentNode.insertBefore(hm, row.nextSibling);
      }
    }
  }

  // ---- 2. Toggle the sales-closed state on online buy rows -----------------
  function applyClosed() {
    document.querySelectorAll("[data-showtime]").forEach(function (el) {
      var buy = el.querySelector(".pc-buy, .ksf-buy");
      if (!buy) return; // weekday/phone/"wkrótce" rows never "close"
      var t = showtimeMs(el);
      if (isNaN(t)) return;
      el.classList.toggle("is-sales-closed", NOW < t && NOW >= t - CUTOFF_MS);
    });
  }

  prunePast();
  applyClosed();
})();
