🔹 Binary Letters (16th-Note Grid)

After editing the table, run: `node scripts/sync-alphabet.js` (then reload `alphabet.html`).

These 16 letters (A through P) represent every possible combination of hits and rests within a single quarter-note beat divided into four 16th notes (1 e & a).

Stroke glyphs for the trainer: `|` full · `↓` down · `↑` up · `-` tap

Note: kit patterns use unit `X-g-g-x-` (8 slots). **Grid 16** bar = unit × 2 (16 slots). **Grid 32** bar = unit × 4 (32 slots). Same `Grid:` choice as Obsidian drum-notation.

| Letter | Greb's notation | pattern (Grid 16) | one hand stroke types | two hands stroke types |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A | X . . . | X-g-g-g-X-g-g-g- | down-tap-tap-up | Rdown-Ltap-Rtap-Lup |
| B | . X . . | g-X-g-g-g-X-g-g- | up-down-tap-tap | Rtap-Ldown-Rup-Lup |
| C | . . X . | g-g-X-g-g-g-X-g- | tap-up-down-tap | Rup-Ltap-Rfull-Ltap |
| D | . . . X | g-g-g-X-g-g-g-X- | tap-tap-up-down | Rtap-Lup-Rtap-Ldown |
| E | X X . . | X-X-g-g-X-X-g-g- | full-down-tap-up | Rdown-Ldown-Rup-Lup |
| F | . X X . | g-X-X-g-g-X-X-g- | up-full-down-tap | Rup-Ldown-Rdown-Lup |
| G | . . X X | g-g-X-X-g-g-X-X- | tap-up-full-down | Rup-Lup-Rdown-Ldown |
| H | X . . X | X-g-g-X-X-g-g-X- | down-tap-up-full | Rdown-Lup-Rup-Ldown |
| I | X . X . | X-g-X-g-X-g-X-g- | down-up-down-up | Rfull-Ltap-Rfull-Ltap |
| J | . X . X | g-X-g-X-g-X-g-X- | up-down-up-down | Rtap-Lfull-Rup-Lfull |
| K | X X X . | X-X-X-g-X-X-X-g- | full-full-down-up | Rfull-Ldown-Rfull-Lup |
| L | . X X X | g-X-X-X-g-X-X-X- | up-full-full-down | Rup-Lfull-Rdown-Lfull |
| M | X . X X | X-g-X-X-X-g-X-X- | down-up-full-full | Rfull-Lup-Rfull-Ldown |
| N | X X . X | X-X-g-X-X-X-g-X- | full-down-up-full | Rdown-Lfull-Rup-Lfull |
| O | X X X X | X-X-X-X-X-X-X-X- | full-full-full-full | Rfull-Lfull-Rfull-Lfull |
| P | . . . . | g-g-g-g-g-g-g-g- | tap-tap-tap-tap | Rtap-Ltap-Rtap-Ltap |

ABCD example (each letter × 2 beats):

```
| X-g-g-x-X-g-g-x-| g-X-x-x-g-X-x-x-| g-x-X-x-g-x-X-x-| g-g-x-X-g-g-x-X-|
```
