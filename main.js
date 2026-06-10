/* ----------------------------------------------------------------------------
   Homepage interaction.

   The ink layers are positioned by percentage of the frame (recovered from the
   original artwork). They are decorative <img>s with pointer-events disabled;
   all hover/click logic is done on the frame using per-layer alpha hit-testing,
   so only the actual painted shape of a blob responds — never its transparent
   bounding box.

   Light forms (left)  -> nonfiction.html
   Dark forms  (right) -> writing.html
---------------------------------------------------------------------------- */

// Geometry recovered from the original spread (percent of frame).
// z-order = array order (later = on top). Halves first, then individual blobs.
const LAYERS = [
  { file: "left_01.webp",      side: "left",  type: "half", left: 1.608,  top: 1.862,  width: 98.505, height: 96.949 },
  { file: "right_01.webp",     side: "right", type: "half", left: 47.692, top: 9.685,  width: 51.459, height: 90.379 },
  { file: "left-blob-1.webp",  side: "left",  type: "blob", left: 2.947,  top: 81.201, width: 21.461, height: 17.633 },
  { file: "left-blob-2.webp",  side: "left",  type: "blob", left: 27.597, top: 51.775, width: 5.016,  height: 7.140  },
  { file: "left-blob-3.webp",  side: "left",  type: "blob", left: 28.937, top: 11.174, width: 9.067,  height: 9.856  },
  { file: "right-blob-1.webp", side: "right", type: "blob", left: 70.466, top: 79.711, width: 28.406, height: 19.242 },
  { file: "right-blob-2.webp", side: "right", type: "blob", left: 47.692, top: 70.399, width: 25.512, height: 29.501 },
  { file: "right-blob-3.webp", side: "right", type: "blob", left: 78.236, top: 73.751, width: 4.630,  height: 7.174  },
  { file: "right-blob-4.webp", side: "right", type: "blob", left: 63.500, top: 16.762, width: 5.450,  height: 4.358  },
];

const DEST = { left: "nonfiction.html", right: "writing.html" };
const ASSET_DIR = "assets/homepage/web/";
const ALPHA_THRESHOLD = 24;   // 0-255; below this a pixel is "not the blob"
const HITMAP_MAX = 220;       // px; resolution of the offscreen alpha map

const frame = document.getElementById("frame");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The big corner links that react to hovering the stains.
const cornerLinks = {
  left: document.querySelector(".corner-art"),
  right: document.querySelector(".corner-writing"),
};

// Build the layer elements and their alpha hit-maps. ------------------------
const records = []; // { el, side, type, hitmap:{w,h,data} | null }

LAYERS.forEach((spec, i) => {
  const el = document.createElement("div");
  el.className = "layer";
  el.dataset.type = spec.type;
  el.style.left = spec.left + "%";
  el.style.top = spec.top + "%";
  el.style.width = spec.width + "%";
  el.style.height = spec.height + "%";

  const img = new Image();
  img.alt = "";
  img.draggable = false;
  img.src = ASSET_DIR + spec.file;

  const rec = { el, side: spec.side, type: spec.type, hitmap: null };
  img.addEventListener("load", () => { rec.hitmap = buildHitmap(img); });

  el.appendChild(img);
  // Insert before the contact link so the link stays on top.
  frame.insertBefore(el, frame.querySelector(".contact-link"));
  records.push(rec);
});

function buildHitmap(img) {
  const ratio = img.naturalWidth / img.naturalHeight || 1;
  let w = HITMAP_MAX, h = Math.round(HITMAP_MAX / ratio);
  if (h > HITMAP_MAX) { h = HITMAP_MAX; w = Math.round(HITMAP_MAX * ratio); }
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  try {
    ctx.drawImage(img, 0, 0, w, h);
    return { w, h, data: ctx.getImageData(0, 0, w, h).data };
  } catch (e) {
    return null; // canvas tainted (shouldn't happen for same-origin assets)
  }
}

// Return the topmost layer whose painted pixel is under (clientX, clientY). --
function layerAt(clientX, clientY) {
  for (let i = records.length - 1; i >= 0; i--) {
    const rec = records[i];
    const r = rec.el.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) continue;
    const hm = rec.hitmap;
    if (!hm) continue;
    const u = Math.min(hm.w - 1, Math.max(0, Math.floor((clientX - r.left) / r.width * hm.w)));
    const v = Math.min(hm.h - 1, Math.max(0, Math.floor((clientY - r.top) / r.height * hm.h)));
    const alpha = hm.data[(v * hm.w + u) * 4 + 3];
    if (alpha > ALPHA_THRESHOLD) return rec;
  }
  return null;
}

// Hover handling. -----------------------------------------------------------
let hovered = null;

function setHovered(rec) {
  if (rec === hovered) return;
  if (hovered) hovered.el.classList.remove("is-hover");
  hovered = rec;
  if (hovered) hovered.el.classList.add("is-hover");
  frame.classList.toggle("can-click", !!hovered);

  // Grow the matching corner link (ART for left, FICTION for right).
  cornerLinks.left.classList.toggle("is-active", !!hovered && hovered.side === "left");
  cornerLinks.right.classList.toggle("is-active", !!hovered && hovered.side === "right");
}

// With animations disabled (site.js), the ink layers are hidden: the artwork
// is a plain image and the corner links are the only navigation.
function animationsOff() {
  return document.body.classList.contains("no-anim");
}

frame.addEventListener("pointermove", (e) => {
  if (e.pointerType === "touch") return; // avoid sticky hover on touch
  if (animationsOff() || e.target.closest(".anim-control")) {
    setHovered(null);
    return;
  }
  setHovered(layerAt(e.clientX, e.clientY));
});
frame.addEventListener("pointerleave", () => setHovered(null));

// Click / tap routing. ------------------------------------------------------
frame.addEventListener("click", (e) => {
  // Links and the animation toggle handle their own behaviour.
  if (e.target.closest("a, .anim-control")) return;
  if (animationsOff()) return;
  const rec = layerAt(e.clientX, e.clientY);
  if (rec) window.location.href = DEST[rec.side];
});
