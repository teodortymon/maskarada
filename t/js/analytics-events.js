// GoatCounter custom-event tracking for the Maskarada site.
//
// Pageviews ("which pages are visited") are counted automatically by count.js —
// this file adds three CLICK events so the GoatCounter dashboard shows, broken
// down by the page they happened on, how often people:
//   - click a "Kup bilet" ticket link  -> event path  buy-ticket<page>
//   - click a phone (tel:) link         -> event path  call<page>
//   - click an e-mail (mailto:) link    -> event path  email<page>
//
// The current page path is appended to each event so GoatCounter's Events list
// groups by type (the prefix) AND by page (the suffix), e.g.
//   buy-ticket/t/repertuar/   45
//   call/t/kontakt/           12
//   email/w/kontakt.html       3
//
// NOTE: "buy-ticket" is a *click* on the booking link (booking intent). The
// purchase itself completes on biletomat.pl, off our site, and cannot be seen
// from here — so treat these as "how many people started a booking", not sales.
//
// Loaded from all three head includes (header_t / header_w / header_i). Kept as
// a static file (not inline) because several pages are Markdown and markdown
// mangles multi-line inline <script>.

(function () {
  "use strict";

  // Hosts that mean "buying a ticket" even when the link has no buy-* class.
  var TICKET_HOSTS = ["biletomat.pl", "kicket.com", "ewejsciowki.pl"];

  function send(prefix) {
    // count.js loads async; by the time a human clicks it is almost always
    // ready. Guard anyway so an early click is a silent no-op, never an error.
    if (!(window.goatcounter && window.goatcounter.count)) return;
    var page = location.pathname; // e.g. /t/repertuar/  (query string dropped)
    window.goatcounter.count({
      path: prefix + page,
      title: prefix + " " + page,
      event: true,
    });
  }

  function isTicketLink(a) {
    if (a.classList.contains("pc-buy") || a.classList.contains("ksf-buy")) {
      return true;
    }
    try {
      var host = new URL(a.href, location.href).hostname.replace(/^www\./, "");
      return TICKET_HOSTS.indexOf(host) !== -1;
    } catch (e) {
      return false;
    }
  }

  // Capture phase, so this runs even if the biletomat embedded-manager stops
  // propagation on the ticket links before the bubble phase reaches us.
  document.addEventListener(
    "click",
    function (e) {
      var target = e.target;
      var a = target && target.closest ? target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (href.indexOf("tel:") === 0) {
        send("call");
      } else if (href.indexOf("mailto:") === 0) {
        send("email");
      } else if (isTicketLink(a)) {
        send("buy-ticket");
      }
    },
    true
  );
})();
