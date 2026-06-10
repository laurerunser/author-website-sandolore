# Sandolore Sykes — author website

A static site (plain HTML/CSS/JS), hosted on **GitHub Pages**. When a change
is merged into the `main` branch, the site rebuilds itself automatically —
no other action needed. It is usually live a minute or two after merging.

## The pages

| Page | What it is                                                      |
|---|-----------------------------------------------------------------|
| `index.html` | The homepage: black, two doors — **SUM FLUX** and **SANDOLORE** |
| `sumflux.html` | Sum Flux: description + story cards, from `assets/sumflux/`     |
| `sandolore.html` | The ink artwork, two doors - **FICTION** and **NON FICTION**    |
| `writing.html` | Fiction: story cards, from `assets/fiction/`                    |
| `nonfiction.html` | Non-Fiction: cards with descriptions, from `assets/nonfiction/` |

Every page has the animation toggle in the top-right corner. Sending someone
a link with `?animations=off` at the end (for example
`.../writing.html?animations=off`) opens the whole site without animations,
and it stays that way for them.

## How to add a text to the website (no coding needed)

Open **Claude Code** on this repository and say, for example:

> Claude, please add this story to the FICTION section of my website.
> Look at the end of the AGENT.md file for further instructions
> The title is "The Lighthouse". Here is the text: (paste the story)

or:

> Claude, please add this piece to the NON-FICTION section.
> Look at the end of the AGENT.md file for further instructions
> The title is "On Ink", the description is "A short essay about drawing
> with water". Here is the text: (paste the text)

or:

> Claude, please add this story to the SUM FLUX section.
> Look at the end of the AGENT.md file for further instructions
> The title is "Becoming". Here is the text: (paste the story)

You can also attach a file instead of pasting the text. Other useful asks:

> Claude, please remove the story called "The Lighthouse" from FICTION. 
> 

> Claude, please make "Becoming" appear first in SUM FLUX.
> Look at the end of the AGENT.md file for further instructions

Claude will make the change and open a **pull request** for you. Open the
link it gives you, press **Merge pull request**, then **Confirm merge** —
the site updates itself a minute or two later. If anything looks wrong on
the page, tell Claude and it will fix it.

## How to send a link with animations disabled

Go to the page you want to share and paste `?animations=off` at the end of it. 
The website will not show the user any animations, unless they choose to move the toggle.


