// Play-card date unfold — masonry reflow.
//
// The "+N kolejnych terminów" ghost button unfolds a card's extra showtimes via
// a pure-CSS checkbox toggle (see scss/_upcoming-dates.scss). On the Spektakle
// page the cards sit in a Masonry grid whose item positions are absolute and
// measured once, so a card growing taller would slide UNDER its lower neighbour.
// Re-laying-out Masonry after each toggle re-measures the card and pushes the
// rest of the grid down. No-ops on pages without a Masonry grid (e.g. Teraz).
(function () {
  "use strict";

  function relayout() {
    var grid = document.querySelector("[data-masonry]");
    if (!grid || !window.Masonry) return;
    var m = window.Masonry.data(grid);
    if (m) m.layout();
  }

  document.addEventListener("change", function (ev) {
    var t = ev.target;
    if (t && t.classList && t.classList.contains("pc-more-toggle")) {
      // Let the revealed rows lay out first, then re-measure the grid.
      requestAnimationFrame(relayout);
    }
  });
})();
