/**
 * Benny Greb alphabet (A–X) — binary A–P + ternary Q–X
 * Regenerate: node scripts/sync-alphabet.js
 *
 * Kit patterns (obsidian-drum-notation):
 *   Binary: unit × 2 at Grid 16 (16 slots per bar)
 *   Ternary: unit × 2 at Grid 12 (12 slots per bar)
 *
 * Stroke glyphs: full | · down ↓ · tap - · up ↑
 */

const STROKE_GLYPH = {
  full: '|',
  down: '↓',
  up: '↑',
  tap: '-'
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
  return str.split('-').map((token, index) => {
    const t = token.trim();
    const hasHand = /^[RL]/i.test(t);
    const hand = hasHand ? t[0].toUpperCase() : (index % 2 === 0 ? 'R' : 'L');
    const stroke = hasHand ? t.slice(1).toLowerCase() : t.toLowerCase();
    return { hand, stroke };
  });
}

/** Greb X / . → accent hits for classic ● / - display */
function parseGrebHits(greb) {
  return String(greb).trim().split(/\s+/).map(s => s.toUpperCase() === 'X');
}

const BINARY_LETTERS = [
  {
    id: 'A', greb: 'X . . .', hits: parseGrebHits('X . . .'), unit: 'X-g-g-g-',
    grid: 16,
    pattern: 'X-g-g-g-X-g-g-g-',
    oneHand: parseOneHand('down-tap-tap-up'),
    twoHands: parseTwoHands('Rdown-Ltap-Rup-Ltap')
  },
  {
    id: 'B', greb: '. X . .', hits: parseGrebHits('. X . .'), unit: 'g-X-g-g-',
    grid: 16,
    pattern: 'g-X-g-g-g-X-g-g-',
    oneHand: parseOneHand('up-down-tap-tap'),
    twoHands: parseTwoHands('Rtap-Ldown-Rup-Lup')
  },
  {
    id: 'C', greb: '. . X .', hits: parseGrebHits('. . X .'), unit: 'g-g-X-g-',
    grid: 16,
    pattern: 'g-g-X-g-g-g-X-g-',
    oneHand: parseOneHand('tap-up-down-tap'),
    twoHands: parseTwoHands('Rup-Ltap-Rfull-Ltap')
  },
  {
    id: 'D', greb: '. . . X', hits: parseGrebHits('. . . X'), unit: 'g-g-g-X-',
    grid: 16,
    pattern: 'g-g-g-X-g-g-g-X-',
    oneHand: parseOneHand('tap-tap-up-down'),
    twoHands: parseTwoHands('Rtap-Lup-Rtap-Ldown')
  },
  {
    id: 'E', greb: 'X X . .', hits: parseGrebHits('X X . .'), unit: 'X-X-g-g-',
    grid: 16,
    pattern: 'X-X-g-g-X-X-g-g-',
    oneHand: parseOneHand('full-down-tap-up'),
    twoHands: parseTwoHands('Rdown-Ldown-Rup-Lup')
  },
  {
    id: 'F', greb: '. X X .', hits: parseGrebHits('. X X .'), unit: 'g-X-X-g-',
    grid: 16,
    pattern: 'g-X-X-g-g-X-X-g-',
    oneHand: parseOneHand('up-full-down-tap'),
    twoHands: parseTwoHands('Rup-Ldown-Rdown-Lup')
  },
  {
    id: 'G', greb: '. . X X', hits: parseGrebHits('. . X X'), unit: 'g-g-X-X-',
    grid: 16,
    pattern: 'g-g-X-X-g-g-X-X-',
    oneHand: parseOneHand('tap-up-full-down'),
    twoHands: parseTwoHands('Rup-Lup-Rdown-Ldown')
  },
  {
    id: 'H', greb: 'X . . X', hits: parseGrebHits('X . . X'), unit: 'X-g-g-X-',
    grid: 16,
    pattern: 'X-g-g-X-X-g-g-X-',
    oneHand: parseOneHand('down-tap-up-full'),
    twoHands: parseTwoHands('Rdown-Lup-Rup-Ldown')
  },
  {
    id: 'I', greb: 'X . X .', hits: parseGrebHits('X . X .'), unit: 'X-g-X-g-',
    grid: 16,
    pattern: 'X-g-X-g-X-g-X-g-',
    oneHand: parseOneHand('down-up-down-up'),
    twoHands: parseTwoHands('Rfull-Ltap-Rfull-Ltap')
  },
  {
    id: 'J', greb: '. X . X', hits: parseGrebHits('. X . X'), unit: 'g-X-g-X-',
    grid: 16,
    pattern: 'g-X-g-X-g-X-g-X-',
    oneHand: parseOneHand('up-down-up-down'),
    twoHands: parseTwoHands('Rtap-Lfull-Rup-Lfull')
  },
  {
    id: 'K', greb: 'X X X .', hits: parseGrebHits('X X X .'), unit: 'X-X-X-g-',
    grid: 16,
    pattern: 'X-X-X-g-X-X-X-g-',
    oneHand: parseOneHand('full-full-down-up'),
    twoHands: parseTwoHands('Rfull-Ldown-Rfull-Lup')
  },
  {
    id: 'L', greb: '. X X X', hits: parseGrebHits('. X X X'), unit: 'g-X-X-X-',
    grid: 16,
    pattern: 'g-X-X-X-g-X-X-X-',
    oneHand: parseOneHand('up-full-full-down'),
    twoHands: parseTwoHands('Rup-Lfull-Rdown-Lfull')
  },
  {
    id: 'M', greb: 'X . X X', hits: parseGrebHits('X . X X'), unit: 'X-g-X-X-',
    grid: 16,
    pattern: 'X-g-X-X-X-g-X-X-',
    oneHand: parseOneHand('down-up-full-full'),
    twoHands: parseTwoHands('Rfull-Lup-Rfull-Ldown')
  },
  {
    id: 'N', greb: 'X X . X', hits: parseGrebHits('X X . X'), unit: 'X-X-g-X-',
    grid: 16,
    pattern: 'X-X-g-X-X-X-g-X-',
    oneHand: parseOneHand('full-down-up-full'),
    twoHands: parseTwoHands('Rdown-Lfull-Rup-Lfull')
  },
  {
    id: 'O', greb: 'X X X X', hits: parseGrebHits('X X X X'), unit: 'X-X-X-X-',
    grid: 16,
    pattern: 'X-X-X-X-X-X-X-X-',
    oneHand: parseOneHand('full-full-full-full'),
    twoHands: parseTwoHands('Rfull-Lfull-Rfull-Lfull')
  },
  {
    id: 'P', greb: '. . . .', hits: parseGrebHits('. . . .'), unit: 'g-g-g-g-',
    grid: 16,
    pattern: 'g-g-g-g-g-g-g-g-',
    oneHand: parseOneHand('tap-tap-tap-tap'),
    twoHands: parseTwoHands('Rtap-Ltap-Rtap-Ltap')
  },
  {
    id: 'Q', greb: 'X . .', hits: parseGrebHits('X . .'), unit: 'X-g-g-',
    grid: 12,
    pattern: 'X-g-g-X-g-g-',
    oneHand: parseOneHand('down-tap-up'),
    twoHands: parseTwoHands('down-tap-tap')
  },
  {
    id: 'R', greb: '. X .', hits: parseGrebHits('. X .'), unit: 'g-X-g-',
    grid: 12,
    pattern: 'g-X-g-g-X-g-',
    oneHand: parseOneHand('up-down-tap'),
    twoHands: parseTwoHands('tap-down-tap')
  },
  {
    id: 'S', greb: '. . X', hits: parseGrebHits('. . X'), unit: 'g-g-X-',
    grid: 12,
    pattern: 'g-g-X-g-g-X-',
    oneHand: parseOneHand('tap-up-down'),
    twoHands: parseTwoHands('up-tap-down')
  },
  {
    id: 'T', greb: 'X X .', hits: parseGrebHits('X X .'), unit: 'X-X-g-',
    grid: 12,
    pattern: 'X-X-g-X-X-g-',
    oneHand: parseOneHand('full-down-up'),
    twoHands: parseTwoHands('down-down-up')
  },
  {
    id: 'U', greb: '. X X', hits: parseGrebHits('. X X'), unit: 'g-X-X-',
    grid: 12,
    pattern: 'g-X-X-g-X-X-',
    oneHand: parseOneHand('up-full-down'),
    twoHands: parseTwoHands('up-down-down')
  },
  {
    id: 'V', greb: 'X . X', hits: parseGrebHits('X . X'), unit: 'X-g-X-',
    grid: 12,
    pattern: 'X-g-X-X-g-X-',
    oneHand: parseOneHand('down-up-down'),
    twoHands: parseTwoHands('down-up-down')
  },
  {
    id: 'W', greb: 'X X X', hits: parseGrebHits('X X X'), unit: 'X-X-X-',
    grid: 12,
    pattern: 'X-X-X-X-X-X-',
    oneHand: parseOneHand('full-full-full'),
    twoHands: parseTwoHands('full-full-full')
  },
  {
    id: 'X', greb: '. . .', hits: parseGrebHits('. . .'), unit: 'g-g-g-',
    grid: 12,
    pattern: 'g-g-g-g-g-g-',
    oneHand: parseOneHand('tap-tap-tap'),
    twoHands: parseTwoHands('tap-tap-tap')
  }
];

const LETTER_BY_ID = Object.fromEntries(BINARY_LETTERS.map(l => [l.id, l]));
const ALL_LETTER_IDS = BINARY_LETTERS.map(l => l.id);

function strokeGlyph(stroke) {
  return STROKE_GLYPH[stroke] || '?';
}

function letterGrid(letter) {
  const L = LETTER_BY_ID[letter];
  return L && L.grid ? L.grid : 16;
}

function letterSubdivisionCount(letter) {
  const L = LETTER_BY_ID[letter];
  return L ? L.oneHand.length : 4;
}

function letterSubdivisionLabels(letter) {
  return letterSubdivisionCount(letter) === 3
    ? ['1', 'ka', 'ta']
    : ['1', 'e', '&', 'a'];
}

/**
 * Sticking for one pattern unit.
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

function repeatToLength(str, len) {
  if (!len) return str;
  let out = str;
  while (out.length < len) out += str;
  return out.slice(0, len);
}

/** One full bar of sticking (matches letter pattern length). */
function stickingBar(letter, handMode, time) {
  const L = LETTER_BY_ID[letter];
  const t = time || '4/4';
  const unit = stickingUnit(letter, handMode);
  const raw = L ? repeatToLength(unit, L.pattern.length) : unit.repeat(2);
  if (typeof NotationHeaders !== 'undefined') {
    return NotationHeaders.fitPatternToBar(raw, t, letterGrid(letter));
  }
  return raw;
}

/** One full bar of kit pattern for the letter's grid. */
function patternBar(letter, time) {
  const L = LETTER_BY_ID[letter];
  const t = time || '4/4';
  const g = letterGrid(letter);
  if (!L) {
    const len = typeof NotationHeaders !== 'undefined'
      ? NotationHeaders.slotsPerBar(t, g)
      : g;
    return '-'.repeat(len);
  }
  if (typeof NotationHeaders !== 'undefined') {
    return NotationHeaders.fitPatternToBar(L.pattern, t, g);
  }
  return L.pattern;
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
  time = '4/4',
  title = 'Greb alphabet',
  maxBars = 4
}) {
  const lead = letters[0] || 'A';
  const g = letterGrid(lead);
  const t = typeof NotationHeaders !== 'undefined'
    ? NotationHeaders.normalizeTime(time)
    : (['3/4', '6/8'].includes(time) ? time : '4/4');
  let barsBuilt = 0;
  const sdBars = [];
  const stBars = [];
  const parts = [];

  for (const letter of letters) {
    if (barsBuilt >= maxBars) break;
    const bars = Math.min(barsPerLetter, maxBars - barsBuilt);
    const sd = patternBar(letter, t);
    const st = stickingBar(letter, handMode, t);
    for (let i = 0; i < bars; i++) {
      sdBars.push(sd);
      stBars.push(st);
    }
    parts.push(letter + (bars > 1 ? `×${bars}` : ''));
    barsBuilt += bars;
  }

  const countLine = typeof NotationHeaders !== 'undefined'
    ? NotationHeaders.defaultCountLine(t)
    : (t === '6/8'
      ? 'Count: 1 & a 2 & a'
      : t === '3/4'
        ? 'Count: 1 e & a 2 e & a 3 e & a'
        : 'Count: 1 e & a 2 e & a 3 e & a 4 e & a');

  return [
    `Title: ${title} (${parts.join(' ')})`,
    `Tempo: ${tempo}`,
    `Time: ${t}`,
    `Grid: ${g}`,
    'Legend: used',
    countLine,
    `ST | ${stBars.join(' | ')}`,
    `SD | ${sdBars.join(' | ')}`
  ].join('\n');
}

function sanitizeLetterWord(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-X]/g, '')
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
