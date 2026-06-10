/* ----------------------------------------------------------------------------
   Site-wide animation toggle ("calm mode").

   Every page includes this script (before its own page script, if it has
   one). It maintains a single boolean — are animations enabled? — exposed
   as window.SiteAnimations.enabled.

   The preference is resolved in this order (first match wins):
     1. ?animations=off / ?animations=on in the URL   (shareable links)
     2. localStorage from an earlier visit            (sticky for the reader)
     3. the OS "prefers reduced motion" setting       (off if reduced)
     4. default: on

   When animations are OFF, <body> gets the class "no-anim". Everything
   visual (hiding blobs, stopping keyframes/transitions, legible fonts,
   plain backgrounds) is handled in CSS under that class. So adding a new
   page only takes:
     - <script src="site.js"></script> at the end of <body>
     - if the page has its own decorations, a body.no-anim { ... } rule
       in styles.css describing its calm variant

   Toggle UI: a fixed control in the top-right corner of every page.

   Static-host friendly: no server required (works on GitHub Pages). Links
   between pages stay relative, and the ?animations=off parameter is
   carried onto internal links so the preference survives navigation even
   when localStorage is unavailable.
---------------------------------------------------------------------------- */

(function () {
  const KEY = "sandolore-animations"; // localStorage value: "on" | "off"
  const PARAM = "animations";         // URL parameter:      "on" | "off"

  // --- Resolve the preference ------------------------------------------------
  const fromUrl = new URL(window.location.href).searchParams.get(PARAM);
  if (fromUrl === "on" || fromUrl === "off") store(fromUrl);

  let enabled;
  const stored = read();
  if (stored === "on" || stored === "off") {
    enabled = stored === "on";
  } else {
    enabled = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function store(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode */ }
  }
  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  // --- Build the toggle UI ---------------------------------------------------
  const control = document.createElement("div");
  control.className = "anim-control anim-fixed";

  const sw = document.createElement("button");
  sw.type = "button";
  sw.className = "anim-switch";
  sw.setAttribute("role", "switch");
  sw.setAttribute("aria-label", "Animations");
  const knob = document.createElement("span");
  knob.className = "anim-knob";
  sw.appendChild(knob);

  const caption = document.createElement("span");
  caption.className = "anim-caption";

  control.appendChild(sw);
  control.appendChild(caption);

  document.body.appendChild(control);

  sw.addEventListener("click", () => set(!enabled));

  // --- Apply the preference --------------------------------------------------
  function set(on) {
    enabled = on;
    store(on ? "on" : "off");
    apply();
  }

  function apply() {
    document.body.classList.toggle("no-anim", !enabled);
    sw.setAttribute("aria-checked", String(enabled));
    caption.textContent = enabled ? "disable animations" : "enable animations";

    // The SVG turbulence filters animate via SMIL, which keeps computing even
    // when nothing on screen uses the filter — pause them outright.
    document.querySelectorAll("svg.warp-defs").forEach((svg) => {
      if (enabled) svg.unpauseAnimations();
      else svg.pauseAnimations();
    });

    syncUrl();
    syncLinks();
    window.dispatchEvent(
      new CustomEvent("animations-change", { detail: { enabled } })
    );
  }

  // Keep ?animations=off in the address bar while animations are disabled, so
  // the current URL can always be copied and sent to a reader as a link that
  // opens the site without animations. The parameter is removed when on.
  function syncUrl() {
    const url = new URL(window.location.href);
    if (enabled) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, "off");
    history.replaceState(null, "", url);
  }

  // Carry the preference onto internal links so it survives navigation even
  // when localStorage is unavailable. External links are left untouched.
  function syncLinks() {
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || /^(#|mailto:|tel:)/.test(href)) return;
      const target = new URL(href, window.location.href);
      if (target.origin !== window.location.origin) return;
      const base = href.split("#")[0].split("?")[0];
      a.setAttribute(
        "href",
        base + (enabled ? "" : "?" + PARAM + "=off") + target.hash
      );
    });
  }

  window.SiteAnimations = {
    get enabled() { return enabled; },
    set: set,
  };

  apply();
})();
