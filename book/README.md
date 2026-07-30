# Interactive Book — Demo site

Self-contained demo for presentation and test-drive.

## Contents

- `index.html` — Chapters I–III reader (glossary highlights, Cornell notes)
- `flashcards.html` — vocabulary flashcards + quiz preview
- `data/book.demo.json` — demo book + 26 glossary terms
- `styles.css`, `flashcards.css`, `app.js`, `flashcards.js`, `theme.js`

## Run locally

```bash
cd demo-site
python3 -m http.server 5173
```

Open:

- http://localhost:5173/
- http://localhost:5173/flashcards.html

## Hosting

Upload the entire `demo-site` folder to any static host (Netlify, GitHub Pages, nginx, etc.).
No build step required. Google Fonts load from the CDN (needs network).

Regenerate this folder from the main project:

```bash
node scripts/pack-demo-site.mjs
```
