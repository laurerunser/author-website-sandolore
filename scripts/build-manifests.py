#!/usr/bin/env python3
"""Scan the content folders and write a manifest.json in each one.

The website (stories.js) reads these manifests to know which texts exist —
GitHub Pages cannot list folder contents, so this script must be re-run
(and the manifests committed) whenever a text is added, removed or edited.

Sections and their text-file formats (.txt or .md, UTF-8):

  assets/fiction/      line 1: title,  rest: the story
  assets/sumflux/      line 1: title,  rest: the story
  assets/nonfiction/   line 1: title,  line 2: description,  rest: the text

Each text can live either directly in the section folder (old style) or inside
its own subfolder (new style).  The subfolder may also contain one image file
(.jpg/.jpeg/.png/.webp/.gif) which will be displayed on the card and in the
popup.  Example:

  assets/fiction/01-dear-bruce/
    01-dear-bruce.txt   ← the story
    cover.jpg           ← optional picture

Blank lines after the title (and after the description) are tolerated.
Texts appear on the site in alphabetical order of their filenames/folders.

Run from the repo root:   python3 scripts/build-manifests.py
"""
import json
import os
import re

SECTIONS = [
    {"dir": "assets/fiction", "has_description": False},
    {"dir": "assets/sumflux", "has_description": False},
    {"dir": "assets/nonfiction", "has_description": True},
]
TEXT_EXTS = {".txt", ".md"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def first_sentence(body: str) -> str:
    """Return the first sentence of the body (best-effort)."""
    text = " ".join(body.split())  # collapse whitespace/newlines
    if not text:
        return ""
    match = re.search(r"(.+?[.!?])(\s|$)", text)
    return match.group(1) if match else text


def parse(path: str, has_description: bool) -> dict:
    with open(path, encoding="utf-8") as fh:
        lines = fh.read().splitlines()

    def next_line():
        while lines and not lines[0].strip():
            lines.pop(0)
        return lines.pop(0).strip() if lines else ""

    title = re.sub(r"^#+\s*", "", next_line())  # tolerate a markdown "# "
    description = next_line() if has_description else ""

    while lines and not lines[0].strip():
        lines.pop(0)
    body = "\n".join(lines).strip()

    return {
        "title": title,
        "description": description,
        # The card preview: the description if there is one, else the
        # story's first sentence.
        "preview": description or first_sentence(body),
        "body": body,
    }


def build(section: dict) -> None:
    folder = section["dir"]
    os.makedirs(folder, exist_ok=True)

    items = []
    for name in sorted(os.listdir(folder)):
        full = os.path.join(folder, name)

        # Old style: plain text file directly in the section folder.
        if os.path.isfile(full) and os.path.splitext(name)[1].lower() in TEXT_EXTS:
            item = parse(full, section["has_description"])
            item["file"] = name
            item["image"] = None
            if item["title"] or item["body"]:
                items.append(item)
            continue

        # New style: subfolder containing a text file + optional image.
        if not os.path.isdir(full):
            continue

        text_file = None
        image_file = None
        for fname in sorted(os.listdir(full)):
            ext = os.path.splitext(fname)[1].lower()
            if text_file is None and ext in TEXT_EXTS:
                text_file = fname
            if image_file is None and ext in IMAGE_EXTS:
                image_file = fname

        if text_file is None:
            continue

        item = parse(os.path.join(full, text_file), section["has_description"])
        item["file"] = f"{name}/{text_file}"
        item["image"] = f"{folder}/{name}/{image_file}" if image_file else None
        if item["title"] or item["body"]:
            items.append(item)

    out = os.path.join(folder, "manifest.json")
    with open(out, "w", encoding="utf-8") as fh:
        json.dump({"items": items}, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print(f"Wrote {out}: {len(items)} item(s)")


if __name__ == "__main__":
    for section in SECTIONS:
        build(section)
