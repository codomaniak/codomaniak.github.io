/**
 * Benny Greb binary alphabet (A–P) — from Binary Letters (16th-Note Grid).md
 *
 * Kit patterns (obsidian-drum-notation):
 *   Unit `X-g-g-x-` = 8 slots
 *   Grid 16: one bar = unit × 2  (16 slots; one char = one 16th)
 *   Grid 32: one bar = unit × 4  (32 slots; one char = one 32nd)
 *
 * Stroke glyphs: full | · down ↓ · tap . · up ↑
 */

const STROKE_GLYPH = {
  full: '|',
  down: '↓',
  up: '↑',
  tap: '.'
};

const STROKE_LABEL = {
  full: 'Full',
  down: 'Down',
  up: 'Up',
  tap: 'Tap'
};

function parseOneHand(str) {
  return str.split('-').map(s => s.trim().toLowerCase());
}

function parseTwoHands(str) {
  return str.split('-').map(token => {
    const t = token.trim();
    const hand = t[0].toUpperCase();
    const stroke = t.slice(1).toLowerCase();
    return { hand, stroke };
  });
}

/** One-beat unit (8 chars) → Grid 16 bar (×2) and Grid 32 bar (×4). */
function barsFromUnit(unit) {
  return {
    pattern16: unit.repeat(2),
    pattern32: unit.repeat(4)
  };
}

const BINARY_LETTERS = [
  {
    id: 'A', greb: 'X . . .', unit: 'X-g-g-x-',
    ...barsFromUnit('X-g-g-x-'),
    oneHand: parseOneHand('full-tap-tap-up'),
    twoHands: parseTwoHands('Rdown-Ldown-Rup-Lup')
  },
  {
    id: 'B', greb: '. X . .', unit: 'g-X-x-x-',
    ...barsFromUnit('g-X-x-x-'),
    oneHand: parseOneHand('up-down-tap-up'),
    twoHands: parseTwoHands('Rtap-Ldown-Rup-Lup')
  },
  {
    id: 'C', greb: '. . X .', unit: 'g-x-X-x-',
    ...barsFromUnit('g-x-X-x-'),
    oneHand: parseOneHand('tap-up-down-up'),
    twoHands: parseTwoHands('Rup-Ltap-Rfull-Ltap')
  },
  {
    id: 'D', greb: '. . . X', unit: 'g-g-x-X-',
    ...barsFromUnit('g-g-x-X-'),
    oneHand: parseOneHand('tap-tap-up-down'),
    twoHands: parseTwoHands('Rtap-Lup-Rtap-Lfull')
  },
  {
    id: 'E', greb: 'X X . .', unit: 'X-X-x-x-',
    ...barsFromUnit('X-X-x-x-'),
    oneHand: parseOneHand('full-down-tap-up'),
    twoHands: parseTwoHands('Rdown-Ldown-Rup-Lup')
  },
  {
    id: 'F', greb: '. X X .', unit: 'x-X-X-x-',
    ...barsFromUnit('x-X-X-x-'),
    oneHand: parseOneHand('up-full-down-up'),
    twoHands: parseTwoHands('Rup-Ldown-Rfull-Lup')
  },
  {
    id: 'G', greb: '. . X X', unit: 'x-x-X-X-',
    ...barsFromUnit('x-x-X-X-'),
    oneHand: parseOneHand('tap-up-full-down'),
    twoHands: parseTwoHands('Rup-Lup-Rfull-Lfull')
  },
  {
    id: 'H', greb: 'X . . X', unit: 'X-x-x-X-',
    ...barsFromUnit('X-x-x-X-'),
    oneHand: parseOneHand('down-tap-up-down'),
    twoHands: parseTwoHands('Rdown-Lup-Rup-Lfull')
  },
  {
    id: 'I', greb: 'X . X .', unit: 'X-x-X-x-',
    ...barsFromUnit('X-x-X-x-'),
    oneHand: parseOneHand('down-up-down-up'),
    twoHands: parseTwoHands('Rfull-Ltap-Rfull-Lup')
  },
  {
    id: 'J', greb: '. X . X', unit: 'x-X-x-X-',
    ...barsFromUnit('x-X-x-X-'),
    oneHand: parseOneHand('up-down-up-down'),
    twoHands: parseTwoHands('Rtap-Lfull-Rup-Lfull')
  },
  {
    id: 'K', greb: 'X X X .', unit: 'X-X-X-x-',
    ...barsFromUnit('X-X-X-x-'),
    oneHand: parseOneHand('full-full-down-up'),
    twoHands: parseTwoHands('Rfull-Ldown-Rfull-Lup')
  },
  {
    id: 'L', greb: '. X X X', unit: 'x-X-X-X-',
    ...barsFromUnit('x-X-X-X-'),
    oneHand: parseOneHand('up-full-full-down'),
    twoHands: parseTwoHands('Rup-Lfull-Rdown-Lup')
  },
  {
    id: 'M', greb: 'X . X X', unit: 'X-x-X-X-',
    ...barsFromUnit('X-x-X-X-'),
    oneHand: parseOneHand('down-up-full-full'),
    twoHands: parseTwoHands('Rfull-Lup-Rfull-Lfull')
  },
  {
    id: 'N', greb: 'X X . X', unit: 'X-X-x-X-',
    ...barsFromUnit('X-X-x-X-'),
    oneHand: parseOneHand('full-down-up-full'),
    twoHands: parseTwoHands('Rfull-Lfull-Rup-Lfull')
  },
  {
    id: 'O', greb: 'X X X X', unit: 'X-X-X-X-',
    ...barsFromUnit('X-X-X-X-'),
    oneHand: parseOneHand('full-full-full-full'),
    twoHands: parseTwoHands('Rfull-Lfull-Rfull-Lfull')
  },
  {
    id: 'P', greb: '. . . .', unit: 'x-x-x-x-',
    ...barsFromUnit('x-x-x-x-'),
    oneHand: parseOneHand('tap-tap-tap-tap'),
    twoHands: parseTwoHands('Rtap-Ltap-Rtap-Ltap')
  }
];

const LETTER_BY_ID = Object.fromEntries(BINARY_LETTERS.map(l => [l.id, l]));
const ALL_LETTER_IDS = BINARY_LETTERS.map(l => l.id);
const GRID_OPTIONS = [16, 32];

function strokeGlyph(stroke) {
  return STROKE_GLYPH[stroke] || '?';
}

/**
 * Sticking for one pattern unit (8 chars, matches `X-g-g-x-`).
 * Hand marks sit on sounding slots; `-` aligns with rest slots.
 */
function stickingUnit(letter, handMode) {
  const L = LETTER_BY_ID[letter];
  if (!L) return '--------';
  const hand = handMode === 'left' ? 'L' : 'R';
  if (handMode === 'two') {
    return L.twoHands.map(s => `${s.hand}-`).join('');
  }
  return L.oneHand.map(() => `${hand}-`).join('');
}

/** One full bar of sticking for the chosen grid. */
function stickingBar(letter, handMode, grid) {
  const unit = stickingUnit(letter, handMode);
  return grid === 32 ? unit.repeat(4) : unit.repeat(2);
}

/** One full bar of kit pattern for the chosen grid. */
function patternBar(letter, grid) {
  const L = LETTER_BY_ID[letter];
  if (!L) return grid === 32 ? '-'.repeat(32) : '-'.repeat(16);
  return grid === 32 ? L.pattern32 : L.pattern16;
}

/**
 * Build drums-notation source.
 * Uses full-bar patterns from the letters table; repeats for barsPerLetter.
 */
function buildAlphabetNotation({
  letters,
  tempo = 80,
  barsPerLetter = 1,
  handMode = 'one',
  grid = 16,
  title = 'Greb alphabet',
  maxBars = 4
}) {
  const g = grid === 32 ? 32 : 16;
  let barsBuilt = 0;
  const sdBars = [];
  const stBars = [];
  const parts = [];

  for (const letter of letters) {
    if (barsBuilt >= maxBars) break;
    const bars = Math.min(barsPerLetter, maxBars - barsBuilt);
    const sd = patternBar(letter, g);
    const st = stickingBar(letter, handMode, g);
    for (let i = 0; i < bars; i++) {
      sdBars.push(sd);
      stBars.push(st);
    }
    parts.push(letter + (bars > 1 ? `×${bars}` : ''));
    barsBuilt += bars;
  }

  return [
    `Title: ${title} (${parts.join(' ')})`,
    `Tempo: ${tempo}`,
    'Time: 4/4',
    `Grid: ${g}`,
    'Legend: used',
    'Count: 1 e & a 2 e & a 3 e & a 4 e & a',
    `ST | ${stBars.join(' | ')}`,
    `SD | ${sdBars.join(' | ')}`
  ].join('\n');
}

function sanitizeLetterWord(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-P]/g, '')
    .split('');
}

function buildSequence(mode, word) {
  if (mode === 'alpha') return ALL_LETTER_IDS.slice();
  if (mode === 'word') {
    const letters = sanitizeLetterWord(word);
    return letters.length ? letters : ['A'];
  }
  const arr = ALL_LETTER_IDS.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
