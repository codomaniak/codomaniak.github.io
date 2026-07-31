# Interactive Book — Demo site

Self-contained demo for presentation and test-drive.

## Contents

- `index.html` — Chapters I–III reader (cover, hamburger menu, in-text vocabulary highlights, Cornell notes)
- `flashcards.html` — vocabulary flashcards + quiz preview
- `images/` — vertical / square / horizontal covers
- `data/book.demo.json` — demo book + 26 glossary terms

## Student UI notes

- Glossary **list** is hidden; highlighted words in the text still show definitions on hover/click.
- Chapters and Light/Dark design live in the **hamburger menu**.
- Mobile uses the **vertical** cover; tablet/default uses **square**; wide screens use **horizontal**.

## Run locally

```bash
cd demo-site
python3 -m http.server 5173
```

Regenerate from the main project:

```bash
node scripts/pack-demo-site.mjs
```
