#!/usr/bin/env node
'use strict';

/**
 * Sync binary + ternary letter markdown tables → alphabet-data.js
 *
 * Usage (from project root):
 *   node scripts/sync-alphabet.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BINARY_MD_PATH = path.join(ROOT, 'Binary Letters (16th-Note Grid).md');
const TERNARY_MD_PATH = path.join(ROOT, 'Ternary Letters (16th-Note Grid).md');
const OUT_PATH = path.join(ROOT, 'alphabet-data.js');

function parseTable(md, kind) {
  const rows = [];
  for (const line of md.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 5) continue;
    if (cells[0] === 'Letter' || cells[0].startsWith(':')) continue;
    const pattern = cells[2];
    if (kind === 'binary') {
      rows.push({
        id: cells[0],
        greb: cells[1],
        pattern,
        unit: deriveUnit(pattern),
        grid: 16,
        oneHand: cells[3],
        twoHands: cells[4]
      });
      continue;
    }
    rows.push({
      id: cells[0],
      greb: cells[1],
      pattern,
      unit: deriveUnit(pattern),
      grid: 12,
      oneHand: cells[3],
      twoHands: cells[4]
    });
  }
  return rows;
}

function deriveUnit(barPattern) {
  if (barPattern.length % 2 !== 0) {
    throw new Error(`bar pattern length must be even: "${barPattern}"`);
  }
  return barPattern.slice(0, barPattern.length / 2);
}

function jsString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function letterEntry(row) {
  const greb = jsString(row.greb);
  const unitJs = jsString(row.unit);
  const patternJs = jsString(row.pattern);
  const oneHand = jsString(row.oneHand);
  const twoHands = jsString(row.twoHands);

  return `  {
    id: '${row.id}', greb: '${greb}', hits: parseGrebHits('${greb}'), unit: '${unitJs}',
    grid: ${row.grid},
    pattern: '${patternJs}',
    oneHand: parseOneHand('${oneHand}'),
    twoHands: parseTwoHands('${twoHands}')
  }`;
}

function buildAlphabetDataJs(rows) {
  const lettersBlock = rows.map(letterEntry).join(',\n');

  return `/**
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
  return String(greb).trim().split(/\\s+/).map(s => s.toUpperCase() === 'X');
}

const BINARY_LETTERS = [
${lettersBlock}
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
 * Hand marks sit on sounding slots; \`-\` aligns with rest slots.
 */
function stickingUnit(letter, handMode) {
  const L = LETTER_BY_ID[letter];
  if (!L) return '--------';
  const hand = handMode === 'left' ? 'L' : 'R';
  if (handMode === 'two') {
    return L.twoHands.map(s => \`\${s.hand}-\`).join('');
  }
  return L.oneHand.map(() => \`\${hand}-\`).join('');
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
    parts.push(letter + (bars > 1 ? \`×\${bars}\` : ''));
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
    \`Title: \${title} (\${parts.join(' ')})\`,
    \`Tempo: \${tempo}\`,
    \`Time: \${t}\`,
    \`Grid: \${g}\`,
    'Legend: used',
    countLine,
    \`ST | \${stBars.join(' | ')}\`,
    \`SD | \${sdBars.join(' | ')}\`
  ].join('\\n');
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
`;
}

function main() {
  const binaryMd = fs.readFileSync(BINARY_MD_PATH, 'utf8');
  const ternaryMd = fs.readFileSync(TERNARY_MD_PATH, 'utf8');
  const rows = [
    ...parseTable(binaryMd, 'binary'),
    ...parseTable(ternaryMd, 'ternary')
  ];
  if (rows.length === 0) {
    console.error('No letter rows found in source markdown tables.');
    process.exit(1);
  }

  const expected = 'ABCDEFGHIJKLMNOPQRSTUVWX';
  const ids = rows.map(r => r.id).join('');
  if (ids !== expected) {
    console.warn(`Warning: expected letters ${expected}, got ${ids}`);
  }

  fs.writeFileSync(OUT_PATH, buildAlphabetDataJs(rows));
  console.log(`Synced ${rows.length} letters → ${path.relative(ROOT, OUT_PATH)}`);
}

main();
