# Vendored drum notation embed

Built from [vkamolov/obsidian-drum-notation](https://github.com/vkamolov/obsidian-drum-notation) (MIT).

Files used by `planner.html`:

- `drum-notation-embed.js` — IIFE exposing `window.DrumNotationEmbed.mount(host)`
- `drum-notation-embed.css` — engraving styles

Mounted **in-page** (not iframe) so it works with `file://` and local static servers.

## Rebuild

```bash
# In a clone of obsidian-drum-notation, use vendor/drum-notation/src/embed-lib.ts
# vite lib build → IIFE, then:
cp dist-lib/drum-notation-embed.js dist-lib/drum-notation-embed.css \
  /path/to/drums/vendor/drum-notation/
```

See `LICENSE` and `THIRD_PARTY_NOTICES.md`.
