/* ----------------------------------------------------------------------------
   Shared story pages (Fiction, Non-Fiction, Sum Flux).

   Each page calls:

     initStoryPage({
       dir: "assets/fiction/",   // folder with the texts + manifest.json
       hasDescription: false,    // true -> each text has a description line,
     });                         //         shown on the card and in the popup

   The folder's manifest.json is written by scripts/build-manifests.py and
   lists every text found in the folder, in alphabetical filename order:

     { "items": [ { "title", "description", "preview", "body" }, ... ] }

   This script renders one card per item (title + preview + "read more"),
   and opens the full text in an accessible popup (role=dialog, focus is
   moved in and trapped, Escape / Back / clicking outside closes it, focus
   returns to the card that opened it).

   The popup markup and the SVG distortion filter for its drifting blobs are
   injected here so every page stays consistent without copy-pasting HTML.
---------------------------------------------------------------------------- */

"use strict";

function initStoryPage(config) {
  const dir = config.dir;
  const hasDescription = !!config.hasDescription;

  const grid = document.getElementById("story-grid");
  const main = document.querySelector("main");

  // --- Popup + filter markup -------------------------------------------------
  injectWarpFilter();
  const modal = injectModal();
  const modalTitle = modal.querySelector(".modal-title");
  const modalImage = modal.querySelector(".modal-image");
  const modalDesc = modal.querySelector(".modal-desc");
  const modalBody = modal.querySelector(".modal-body");
  const modalPanel = modal.querySelector(".modal-panel");

  let lastFocused = null;

  load();

  async function load() {
    let items = [];
    try {
      const res = await fetch(dir + "manifest.json", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.items)) items = data.items;
      }
    } catch (e) {
      // No manifest yet — treat as empty.
    }

    if (items.length === 0) {
      showEmpty();
      return;
    }
    items.forEach(renderCard);
  }

  function showEmpty() {
    grid.remove();
    const msg = document.createElement("p");
    msg.className = "page-empty";
    msg.textContent = "This page is empty for now, come back later.";
    main.appendChild(msg);
  }

  function renderCard(item) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "story-card";

    if (item.image) {
      const img = document.createElement("img");
      img.className = "story-card-img";
      img.src = item.image;
      img.alt = "";
      card.appendChild(img);
    }

    const title = document.createElement("h2");
    title.className = "story-title";
    title.textContent = item.title || "Untitled";

    const preview = document.createElement("p");
    preview.className = "story-preview";
    preview.textContent = item.preview || "";

    const more = document.createElement("span");
    more.className = "read-more";
    more.textContent = "read more →";

    card.appendChild(title);
    card.appendChild(preview);
    card.appendChild(more);
    card.addEventListener("click", () => openStory(item));
    grid.appendChild(card);
  }

  // --- Popup -----------------------------------------------------------------
  function openStory(item) {
    lastFocused = document.activeElement;

    modalTitle.textContent = item.title || "Untitled";

    if (item.image) {
      modalImage.src = item.image;
      modalImage.hidden = false;
    } else {
      modalImage.hidden = true;
    }

    if (hasDescription && item.description) {
      modalDesc.textContent = item.description;
      modalDesc.hidden = false;
    } else {
      modalDesc.hidden = true;
    }

    modalBody.replaceChildren();
    // Render the body as paragraphs split on blank lines.
    (item.body || "").split(/\n\s*\n/).forEach((para) => {
      const text = para.trim();
      if (!text) return;
      const p = document.createElement("p");
      p.textContent = text;
      modalBody.appendChild(p);
    });
    modalPanel.scrollTop = 0;

    modal.hidden = false;
    document.body.classList.add("modal-open");
    modalPanel.focus();
  }

  function closeStory() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus();
  }

  // Click anywhere outside the panel closes the popup.
  modal.addEventListener("click", (e) => {
    if (!e.target.closest(".modal-panel")) closeStory();
  });
  modal.querySelector(".modal-back").addEventListener("click", closeStory);

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") {
      closeStory();
      return;
    }
    // Keep Tab inside the popup while it is open.
    if (e.key === "Tab") {
      const focusables = modal.querySelectorAll(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // --- Injected markup --------------------------------------------------------
  function injectWarpFilter() {
    if (document.getElementById("blob-warp")) return;
    const holder = document.createElement("div");
    holder.innerHTML =
      '<svg class="warp-defs" width="0" height="0" aria-hidden="true" focusable="false">' +
      '<filter id="blob-warp" x="-30%" y="-30%" width="160%" height="160%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.006 0.010" numOctaves="2" seed="11" result="noise">' +
      '<animate attributeName="baseFrequency" dur="26s" repeatCount="indefinite" ' +
      'values="0.006 0.010; 0.013 0.017; 0.008 0.006; 0.006 0.010" ' +
      'calcMode="spline" keyTimes="0;0.4;0.7;1" ' +
      'keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"/>' +
      "</feTurbulence>" +
      '<feDisplacementMap in="SourceGraphic" in2="noise" xChannelSelector="R" yChannelSelector="G">' +
      '<animate attributeName="scale" dur="18s" repeatCount="indefinite" ' +
      'values="26; 58; 34; 26" calcMode="spline" keyTimes="0;0.4;0.7;1" ' +
      'keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"/>' +
      "</feDisplacementMap>" +
      "</filter>" +
      "</svg>";
    document.body.appendChild(holder.firstChild);
  }

  function injectModal() {
    const el = document.createElement("div");
    el.className = "modal";
    el.id = "modal";
    el.hidden = true;
    el.innerHTML =
      '<div class="modal-blobs" aria-hidden="true">' +
      '<img class="bg-blob mb1" src="assets/homepage/web/right-blob-2.webp" alt="">' +
      '<img class="bg-blob mb2" src="assets/homepage/web/right-blob-1.webp" alt="">' +
      '<img class="bg-blob mb3" src="assets/homepage/web/right-blob-3.webp" alt="">' +
      "</div>" +
      '<div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">' +
      '<button class="modal-back" type="button">&larr; Back</button>' +
      '<h2 class="modal-title" id="modal-title"></h2>' +
      '<img class="modal-image" alt="" hidden>' +
      '<p class="modal-desc" hidden></p>' +
      '<div class="modal-body"></div>' +
      "</div>";
    document.body.appendChild(el);
    return el;
  }
}
