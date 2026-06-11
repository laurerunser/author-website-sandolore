# Assets

## homepage/
Do not touch, this is handled by the code.

## fiction/, nonfiction/, sumflux/

Each text lives in its own subfolder.  The subfolder may also contain one image
file which will appear on the card and inside the popup.

  assets/fiction/01-dear-bruce/
    01-dear-bruce.txt   ← the story (required)
    cover.jpg           ← picture (optional; any of .jpg .jpeg .png .webp .gif)

Text-file formats (UTF-8):

  fiction/ and sumflux/   line 1: title,  rest: the story
  nonfiction/             line 1: title,  line 2: description (one line),  rest: the text

Blank lines after the title (and after the description) are tolerated.

Ordering and maintenance:
  - Texts appear on the site in alphabetical order of the subfolder names,
    so name folders like 01-something, 02-other (gaps are fine).
  - To remove a piece, delete its subfolder.  To reorder, rename the folders.
  - IMPORTANT: after any change, run  python3 scripts/build-manifests.py
    and commit the updated manifest.json — otherwise the site won't see
    the change.  (If you ask Claude to do it, it knows this.)
