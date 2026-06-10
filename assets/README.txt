# Assets

## homepage/
Do not touch, this is handled by the code.

## fiction/ and sumflux/
One text file per story:
  - first line: the title
  - jump a line
  - then the story

## nonfiction/
One text file per piece:
  - first line: the title
  - second line: the description (one line)
  - jump a line
  - then the text

For all three folders:
  - Stories appear on the site in alphabetical order of the file names,
    so name files like 01-something.txt, 02-other.txt (gaps are fine).
  - To remove a story, delete its file. To reorder, rename the files.
  - IMPORTANT: after any change, run  python3 scripts/build-manifests.py
    and commit the manifest.json files too — otherwise the site won't
    see the change. (If you ask Claude to do it, it knows this.)
