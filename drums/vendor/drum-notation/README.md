# Vendored drum notation embed

Built from [vkamolov/obsidian-drum-notation](https://github.com/vkamolov/obsidian-drum-notation) (MIT).

Files used by `planner.html` / `alphabet.html`:

- `load-notation-engine.js` — fetch + blob inject (works when hosts serve `.js` as `text/plain`)
- `drum-notation-embed.js` — IIFE exposing `window.DrumNotationEmbed.mount(host)` (**must be deployed**)
- `drum-notation-embed.css` — engraving styles (**must be deployed**)

Mounted **in-page** (not iframe).

## Deploy checklist

Copy the whole `vendor/drum-notation/` folder to the host (especially the ~780KB `drum-notation-embed.js`). If the engine file is missing, the UI shows the resolved URL and HTTP status.

## Rebuild

```bash
# In a clone of obsidian-drum-notation, use vendor/drum-notation/src/embed-lib.ts
# vite lib build → IIFE, then:
cp dist-lib/drum-notation-embed.js dist-lib/drum-notation-embed.css \
  /path/to/drums/vendor/drum-notation/
```

See `LICENSE` and `THIRD_PARTY_NOTICES.md`.
