// Buy-ticket action LAYOUT switcher — issue #49 (temporary review aid).
//
// Colour is decided (flat coral outline); this sets html[data-btnlayout] so the
// layout variants (scss/_buy-layout.scss) can be flipped live. Precedence:
//   URL ?btn=<layout>  >  localStorage  >  default ("split").
// A ?btn= param also gives shareable links. Remove this file, the
// variant_switcher include and the _buy-layout partial once a layout is chosen.
(function () {
  "use strict";

  var KEY = "btnLayout";
  var DEFAULT = "split";
  var VARIANTS = ["split", "left", "center", "stacked"];

  function normalize(v) {
    return VARIANTS.indexOf(v) !== -1 ? v : null;
  }

  function apply(v) {
    document.documentElement.setAttribute("data-btnlayout", v);
    var panel = document.getElementById("btn-variant-switcher");
    if (!panel) return;
    var btns = panel.querySelectorAll("[data-variant]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("is-active", btns[i].getAttribute("data-variant") === v);
    }
  }

  // Resolve the initial variant before wiring the UI.
  var fromUrl = null;
  try {
    fromUrl = normalize(new URLSearchParams(window.location.search).get("btn"));
  } catch (e) {}
  var fromStore = null;
  try {
    fromStore = normalize(window.localStorage.getItem(KEY));
  } catch (e) {}
  var current = fromUrl || fromStore || DEFAULT;
  apply(current);
  if (fromUrl) {
    try {
      window.localStorage.setItem(KEY, fromUrl);
    } catch (e) {}
  }

  function wire() {
    var panel = document.getElementById("btn-variant-switcher");
    if (!panel) return;
    apply(current);
    panel.addEventListener("click", function (ev) {
      var t = ev.target.closest("[data-variant]");
      if (!t) return;
      var v = normalize(t.getAttribute("data-variant"));
      if (!v) return;
      current = v;
      apply(v);
      try {
        window.localStorage.setItem(KEY, v);
      } catch (e) {}
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
