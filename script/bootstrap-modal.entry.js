// Entry point for the modal-only Bootstrap JS bundle (issue #53).
//
// The site uses exactly ONE Bootstrap plugin — Modal (declarative
// data-bs-toggle="modal" / data-bs-dismiss="modal"; no carousel, collapse,
// dropdown, tooltip or popover, so Popper and the other 7 plugins in
// bootstrap.bundle.min.js were pure dead weight; ~24 KB gz → ~7 KB gz).
//
// Importing bootstrap/js/dist/modal.js registers the data-API click handlers
// as a module side effect, so declarative modals work with no further wiring.
// Built by `npm run js-modal` (esbuild) into t/js/bootstrap-modal.min.js,
// which is committed AND regenerated on every `npm run build`.
// If you ever introduce another Bootstrap plugin, import it here too.
import Modal from "bootstrap/js/dist/modal.js";

// Expose the constructor for console debugging / future programmatic use,
// mirroring the global the CDN bundle used to provide.
window.bootstrap = Object.assign(window.bootstrap || {}, { Modal });
