## Notes for agents

Content lives in three folders, one text file per piece (`.txt`, UTF-8).
Files are shown on the site in **alphabetical filename order**, so name them
with a number prefix (`01-`, `02-`, …; gaps are fine):

- `assets/fiction/` — line 1: title, blank line, then the story.
- `assets/sumflux/` — line 1: title, blank line, then the story.
- `assets/nonfiction/` — line 1: title, line 2: description, blank line,
  then the text.

After adding/removing/renaming any file, **always run**:

```
python3 scripts/build-manifests.py
```

and commit the updated `manifest.json` files together with the text. The
site reads only the manifests (GitHub Pages cannot list folders), so a text
without a rebuilt manifest will not appear.

Then push to a new branch and open a pull request against `main`, ready for
review (not draft), with a plain-language description the maintainer can
understand. Do not push directly to `main`.

Other conventions:

- The animation preference is handled by `site.js` (one boolean, body class
  `no-anim`, URL parameter `?animations=off`, localStorage). Every page must
  include `<script src="site.js"></script>`.
- The story pages share `stories.js` — `initStoryPage({ dir, hasDescription })`.
  A new section = a new folder + one HTML page calling `initStoryPage`, an
  entry in `scripts/build-manifests.py`, and calm-mode CSS if it adds
  decorations.
- Keep everything working without JavaScript build steps: plain HTML/CSS/JS,
  relative links only (the site lives under a sub-path on GitHub Pages).
