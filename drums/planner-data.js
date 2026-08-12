const DOMAINS = [
  {
    id: 'technical',
    label: 'Technical Execution',
    tracks: ['rudiments', 'coordination', 'accents'],
    pace: 'slow',
    /** Share of a typical practice session (minutes guidance, not a hard cap) */
    sessionShare: 65,
    paceNote: 'Hardest domain. Each plan “month” often needs 6–10 weeks. Most pad/kit time goes here.'
  },
  {
    id: 'perception',
    label: 'Musical Perception',
    tracks: ['subdivision', 'adaptation'],
    pace: 'fast',
    sessionShare: 20,
    paceNote: 'Easier to advance early. Start day 1 in short blocks; months can finish on the printed timeline or sooner.'
  },
  {
    id: 'musicality',
    label: 'Musicality & Repertoire',
    tracks: ['versatility', 'improvisation'],
    pace: 'fast',
    sessionShare: 15,
    paceNote: 'Develop from the start via songs and fills. Short daily blocks; do not wait until technique is “done”.'
  }
];

const TRACK_META = {
  rudiments: { label: 'Rudiments', short: 'Rud.', color: '#3f6a9b', bg: '#eaf0fa', domain: 'technical', pace: 'slow' },
  coordination: { label: 'Coordination', short: 'Coord.', color: '#6a9b8a', bg: '#eaf5f0', domain: 'technical', pace: 'slow' },
  accents: { label: 'Greb accents', short: 'Greb', color: '#b85c38', bg: '#faf0ea', domain: 'technical', pace: 'slow' },
  subdivision: { label: 'Subdivision', short: 'Subdiv.', color: '#7a6a9b', bg: '#f0eaf8', domain: 'perception', pace: 'fast' },
  adaptation: { label: 'Listening', short: 'Listen.', color: '#9b7a6a', bg: '#f8f0ea', domain: 'perception', pace: 'fast' },
  versatility: { label: 'Versatility', short: 'Styles', color: '#9b8a6a', bg: '#f8f5ea', domain: 'musicality', pace: 'fast' },
  improvisation: { label: 'Improvisation', short: 'Solo', color: '#6a7a9b', bg: '#eaeff8', domain: 'musicality', pace: 'fast' }
};

/** Default minutes for a ~45–60 min session — user can edit in the planner */
const DEFAULT_SESSION_MIX = {
  technical: 35,
  perception: 12,
  musicality: 10
};

const ALL_TRACKS = Object.keys(TRACK_META);

const STATUS_TYPES = [
  { id: 'done', icon: '✅', label: 'Complete', desc: '≥90% checklist + milestone feel solid — move on when ready' },
  { id: 'partial', icon: '⚠️', label: 'Partial', desc: '40–89% done, or quality still shaky — extend this month' },
  { id: 'progress', icon: '🔄', label: 'In progress', desc: 'Currently working — under 40% or early in the month' }
];

const TECHNIQUE_TAGS = [
  'singles', 'doubles', 'paradiddle', 'accents', 'greb-letters', 'one-hand', 'two-hands',
  'down-up', 'full-tap-up', 'moeller', 'ghost-notes', 'hi-hat-foot', 'limb-envelope',
  '16ths-on-tom', 'clave', 'bolero', 'rumba', 'bossa', 'fills', 'half-time'
];

/** Empty by default — library/planner are templates; users add their own projects. */
const DEFAULT_PROJECTS = [];

function itemText(item) {
  return typeof item === 'string' ? item : item.text;
}

function itemTarget(item) {
  return typeof item === 'string' ? '' : (item.target || '');
}

function itemPass(item) {
  return typeof item === 'string' ? '' : (item.pass || '');
}

/** From DeepSeek: arrangement-map sections for Listening exercises */
const ARRANGEMENT_SECTIONS = [
  { key: 'intro', label: 'Intro' },
  { key: 'verse1', label: 'Verse 1' },
  { key: 'chorus1', label: 'Chorus 1' },
  { key: 'verse2', label: 'Verse 2' },
  { key: 'chorus2', label: 'Chorus 2' },
  { key: 'bridge', label: 'Bridge' },
  { key: 'solo', label: 'Solo' },
  { key: 'chorus3', label: 'Chorus 3' },
  { key: 'outro', label: 'Outro' }
];

const PRACTICE_PRINCIPLES = [
  'Technical work needs most of the session and a slower calendar — do not rush rudiments/coordination months.',
  'Perception and musicality start on day 1 in shorter blocks; they are easier to progress in parallel.',
  'Start new technical patterns at 40–60 BPM; raise by ~5 BPM only when clean.',
  'Greb accents: every letter starts at 40 BPM — one hand (R, then L), then two-hand stroke types; +5 BPM only when even.',
  'Advance a month only when Pass evidence is real (especially technical).',
  'Build a groove library first — songs are applications of a groove, not the starting point.'
];

const GROOVE_LEVELS = ['beginner', 'intermediate', 'advanced'];

/** Obsidian-compatible drums block (vkamolov/obsidian-drum-notation) */
function drumsNotation(lines) {
  return lines.filter(l => l !== null && l !== undefined).join('\n');
}

/**
 * Sample groove skeletons only (style/groove first). No personal song lists —
 * `applications` stay empty so the library is a reusable template.
 * `notation` uses the drums fence format from obsidian-drum-notation.
 */
const GROOVE_LIBRARY = [
  {
    name: 'Money beat',
    style: 'Rock / Pop',
    level: 'beginner',
    pattern: 'Kick 1 & 3 · Snare 2 & 4 · HH 8ths · HH foot 2 & 4',
    tempoRange: '60–100',
    notes: 'Core 4/4 skeleton. Same groove in countless songs with different energy.',
    source: '',
    notation: drumsNotation([
      'Title: Money beat',
      'Tempo: 80',
      'Time: 4/4',
      'Grid: 16',
      'Legend: used',
      'Count: 1 e & a 2 e & a 3 e & a 4 e & a',
      'HH | x-x-x-x-x-x-x-x-',
      'SD | ----o-------o---',
      'BD | o-------o-------',
      'HF | ----x-------x---'
    ]),
    applications: []
  },
  {
    name: 'Half-time rock',
    style: 'Rock / Pop',
    level: 'beginner',
    pattern: 'Kick on 1 · Snare on 3 · HH 8ths (or quarters)',
    tempoRange: '70–110',
    notes: 'Chorus/verse contrast tool. Songs often switch money beat ↔ half-time by section. Add your songs as applications.',
    source: '',
    notation: drumsNotation([
      'Title: Half-time rock',
      'Tempo: 90',
      'Time: 4/4',
      'Grid: 16',
      'Legend: used',
      'HH | x-x-x-x-x-x-x-x-',
      'SD | --------o-------',
      'BD | o---------------'
    ]),
    applications: []
  },
  {
    name: 'Basic funk 16ths',
    style: 'Funk',
    level: 'intermediate',
    pattern: 'HH 16ths · Snare 2 & 4 · syncopated kick · optional ghosts',
    tempoRange: '85–105',
    notes: 'Pocket first. Ghosts/kick change by song — skeleton stays 16th-HH funk.',
    source: '',
    notation: drumsNotation([
      'Title: Basic funk 16ths',
      'Tempo: 96',
      'Time: 4/4',
      'Grid: 16',
      'Legend: used',
      'HH | xxxxxxxxxxxxxxxx',
      'SD | ----o-------o---',
      'BD | o--o------o-----'
    ]),
    applications: []
  },
  {
    name: 'Rock shuffle',
    style: 'Blues-rock',
    level: 'intermediate',
    pattern: 'HH triplet lope · Snare 2 & 4 · Kick 1 & 3',
    tempoRange: '60–90',
    notes: 'Triplet feel inside 4/4 — not jazz ride language. Notation uses 12/8 for the lope.',
    source: '',
    notation: drumsNotation([
      'Title: Rock shuffle (12/8 feel)',
      'Tempo: 72',
      'Time: 12/8',
      'Grid: 16',
      'Legend: used',
      'HH | x-xx-xx-xx-xx-xx-xx-xx-x',
      'SD | --------o-------------o-',
      'BD | o-------------o---------'
    ]),
    applications: []
  },
  {
    name: 'Latin-rock / clave-lite',
    style: 'Latin-rock',
    level: 'beginner',
    pattern: 'Rock hands · feet lean samba/bolero · listen for kick/bass lock',
    tempoRange: '90–120',
    notes: 'Song vehicles before deep Afro-Cuban study. Attach your own Latin-rock applications.',
    source: '',
    notation: drumsNotation([
      'Title: Latin-rock clave-lite',
      'Tempo: 104',
      'Time: 4/4',
      'Grid: 16',
      'Legend: used',
      'HH | x-x-x-x-x-x-x-x-',
      'SD | ----o-------o---',
      'BD | o-----o-o-------'
    ]),
    applications: []
  },
  {
    name: 'Cuban rumba (guaguancó)',
    style: 'Rumba',
    level: 'advanced',
    pattern: 'Rumba clave 3-2 or 2-3 · interlocking conga/palitos language → kit adaptation',
    tempoRange: 'slow–medium',
    notes: 'Folkloric Cuban rumba (guaguancó / yambú / columbia). Clave is the heartbeat — more syncopated than son clave. From styles.md. Kit sketch only.',
    source: 'styles.md',
    notation: drumsNotation([
      'Title: Rumba clave 3-2 (kit sketch)',
      'Tempo: 88',
      'Time: 4/4',
      'Grid: 16',
      'Legend: used',
      'Comment: Clave on cowbell; kit adaptation — not folkloric purity',
      'CB | x--x--x---x-x---',
      'HH | x-x-x-x-x-x-x-x-',
      'SD | ----o-------o---',
      'BD | o-----o-o-------'
    ]),
    applications: []
  },
  {
    name: 'Flamenco rumba',
    style: 'Rumba',
    level: 'intermediate',
    pattern: 'Guitar rasgueado pulse · kit: straight-ish 4/4 with flamenco accents / light syncopation',
    tempoRange: 'medium–up',
    notes: 'Rumba catalana / gitana — Spanish guitar-driven. Same “rumba” name, different feel than Cuban folkloric. From styles.md.',
    source: 'styles.md',
    notation: drumsNotation([
      'Title: Flamenco rumba (kit sketch)',
      'Tempo: 112',
      'Time: 4/4',
      'Grid: 16',
      'Legend: used',
      'HH | x-x-x-xx-x-x-xx-',
      'SD | ----o-------o---',
      'BD | o---o---o---o---'
    ]),
    applications: []
  },
  {
    name: 'Ballroom rumba / bolero-rumba',
    style: 'Rumba',
    level: 'beginner',
    pattern: 'Slow romantic pulse · bolero-son feel · sparse kit / soft backbeat',
    tempoRange: 'slow',
    notes: 'Ballroom rumba from bolero-son — not Cuban folkloric rumba. Good slow listening/form practice. From styles.md.',
    source: 'styles.md',
    notation: drumsNotation([
      'Title: Ballroom rumba / bolero',
      'Tempo: 60',
      'Time: 4/4',
      'Grid: 16',
      'Legend: used',
      'RD | x---x---x---x---',
      'SD | ----g-------g---',
      'BD | o-------o-------'
    ]),
    applications: []
  },
  {
    name: 'Merengue',
    style: 'Merengue',
    level: 'intermediate',
    pattern: '2/4 marching pulse (umpa-umpa) · güira “ching-ching” · tambora language on kit',
    tempoRange: 'fast',
    notes: 'Dominican drive: relentless two-step. Accordion/sax hooks in orquesta style. From styles.md. Kit sketch.',
    source: 'styles.md',
    notation: drumsNotation([
      'Title: Merengue (kit sketch)',
      'Tempo: 140',
      'Time: 2/4',
      'Grid: 16',
      'Legend: used',
      'HH | xxxxxxxx',
      'SD | --o---o-',
      'BD | o-o-o-o-'
    ]),
    applications: []
  },
  {
    name: 'Mambo',
    style: 'Mambo',
    level: 'intermediate',
    pattern: 'Syncopated montuno energy · tumbao bass feel · timbale/cowbell + kit adaptation',
    tempoRange: 'medium–up',
    notes: 'Horn punches and piano montunos drive the feel; percussion denser than rock. From styles.md. Kit sketch.',
    source: 'styles.md',
    notation: drumsNotation([
      'Title: Mambo (kit sketch)',
      'Tempo: 120',
      'Time: 4/4',
      'Grid: 16',
      'Legend: used',
      'CB | x-x-x-x-x-x-x-x-',
      'HH | --x---x---x---x-',
      'SD | ----o-------o---',
      'BD | o--o--o--o--o---'
    ]),
    applications: []
  }
];

const EMPTY_DRUMS_NOTATION = drumsNotation([
  'Title: New groove',
  'Tempo: 80',
  'Time: 4/4',
  'Grid: 16',
  'Legend: used',
  'Count: 1 e & a 2 e & a 3 e & a 4 e & a',
  'HH | ----------------',
  'SD | ----------------',
  'BD | ----------------'
]);

const DRUM_NOTATION_DOCS = 'https://github.com/vkamolov/obsidian-drum-notation';
const DRUM_NOTATION_PLAYGROUND = 'https://vkamolov.github.io/obsidian-drum-notation/';

const PLANS = {
  rudiments: [
    { month: 1, title: 'Stroke Foundation — Singles, Doubles, Down-Up', focus: 'Slow ladders + stroke types. Stay at a BPM until even — do not race to 100.', milestone: 'Singles & doubles even at 80 BPM; apply Full/Down/Tap/Up (or Down-Up) on a simple groove.', weeks: [
      { week: 1, topic: 'Singles + accent grid', items: [
        { text: 'Singles R-L / L-R at 40 BPM — 5 min', target: '40 BPM', pass: 'Even volume, relaxed grip' },
        { text: 'Singles 40 → 60 BPM — 5 min', target: '60 BPM', pass: 'No rushing into 60' },
        { text: 'Accent grid 1-2!-3-4 / 1!-2-3-4… at 40 BPM — 5 min', target: '40 BPM', pass: 'Clear accent vs tap' }
      ]},
      { week: 2, topic: 'Doubles ladder (slow)', items: [
        { text: 'Doubles RRLL at 40 BPM — 5 min', target: '40 BPM', pass: '2nd stroke as strong as 1st' },
        { text: 'Doubles 40 → 60 BPM — 5 min', target: '60 BPM', pass: 'Evenness holds' },
        { text: 'Doubles 60 → 72 BPM — 5 min', target: '72 BPM', pass: 'Optional stop if uneven' }
      ]},
      { week: 3, topic: 'Doubles to 80 + stroke types', items: [
        { text: 'Doubles hold at 72–80 BPM — 5 min', target: '80 BPM', pass: 'Clean 8 bars' },
        { text: 'Full / Down / Tap / Up strokes at 40 BPM — 5 min', target: '40 BPM', pass: 'Name each stroke while playing' },
        { text: 'Down-Up on pad, then simple rock groove — 5 min', target: '40–60 BPM', pass: 'Groove still steady' }
      ]},
      { week: 4, topic: 'Paradiddle intro + kit transfer', items: [
        { text: 'Paradiddle RLRR LRLL at 60 BPM — 5 min', target: '60 BPM', pass: 'Even diddles' },
        { text: 'Doubles + Down-Up on kit groove — 5 min', target: '60 BPM', pass: 'No limb collapse' },
        { text: 'Record 30s doubles at best clean BPM — 5 min', target: 'your max clean', pass: 'Listen back; note BPM in day log' }
      ]}
    ]},
    { month: 2, title: 'Expand to 13 Essential Rudiments', focus: 'Stick height control and rudimental phrasing in musical groups.', milestone: 'Play 13 rudiments cleanly at 80–100 BPM with controlled stick heights and dynamic accents.', weeks: [
      { week: 1, topic: 'Single Paradiddle-Diddle', items: ['Paradiddle-diddle slow (60 BPM) — 5 min', 'Speed up gradually (70–90 BPM) — 10 min', 'Move accents to different notes — 5 min'] },
      { week: 2, topic: 'Double Paradiddle', items: ['Double paradiddle slow — 5 min', 'Speed up to 80 BPM — 10 min', 'Accents on first note of each group — 5 min'] },
      { week: 3, topic: 'Flam Accent & Flam Tap', items: ['Flam accent (alternating hands) — 5 min', 'Flam tap — 5 min', 'Combine both into 4-bar phrase — 10 min'] },
      { week: 4, topic: 'Drag Paradiddle & Single Ratamacue', items: ['Drag paradiddle (slow) — 5 min', 'Single ratamacue — 10 min', 'Play both in sequence — 5 min'] }
    ]},
    { month: 3, title: 'All 26 Rudiments — Part 1 (Rolls & Diddles)', focus: 'Roll-based and diddle-based rudiments with even volume and alternating sticking.', milestone: 'Play all roll-based rudiments with consistent volume, proper alternating sticking, and controlled acceleration.', weeks: [
      { week: 1, topic: '5-, 7-, 9-Stroke Rolls', items: ['5-stroke roll — 5 min', '7-stroke roll — 5 min', '9-stroke roll — 10 min', 'Play all in sequence — 5 min'] },
      { week: 2, topic: '10-, 11-, 13-Stroke Rolls', items: ['10-stroke roll — 5 min', '11-stroke roll — 5 min', '13-stroke roll — 10 min', 'Sequence all rolls — 5 min'] },
      { week: 3, topic: '15- & 17-Stroke Rolls', items: ['15-stroke roll — 5 min', '17-stroke roll — 5 min', 'Alternate between rolls — 10 min', 'Full roll sequence — 5 min'] },
      { week: 4, topic: 'Review roll-based rudiments', items: ['Warm-up: singles + doubles — 10 min', 'All rolls slowly (60–80 BPM) — 15 min', 'Increase speed gradually — 5 min'] }
    ]},
    { month: 4, title: 'All 26 Rudiments — Part 2 (Flam & Drag Families)', focus: 'Complete remaining flam-based and drag-based patterns.', milestone: 'All 26 standard American rudiments at 80–100 BPM with proper dynamics and sticking.', weeks: [
      { week: 1, topic: 'Flam Paradiddle & Flam Paradiddle-Diddle', items: ['Flam paradiddle — 5 min', 'Flam paradiddle-diddle — 10 min', 'Alternate between both — 5 min'] },
      { week: 2, topic: 'Flam Drag & Flamacue', items: ['Flam drag — 5 min', 'Flamacue — 10 min', 'Both in sequence with accents — 10 min'] },
      { week: 3, topic: 'Drag Paradiddle #1 & #2', items: ['Drag paradiddle #1 — 5 min', 'Drag paradiddle #2 — 10 min', 'Alternate between both — 10 min'] },
      { week: 4, topic: 'Single, Double, Triple Ratamacue', items: ['Single ratamacue — 5 min', 'Double ratamacue — 5 min', 'Triple ratamacue — 10 min', 'All three in sequence — 5 min'] }
    ]},
    { month: 5, title: 'Applying Rudiments to the Drum Set', focus: 'Orchestrate rudiments around toms, cymbals, and snare within grooves.', milestone: 'Move rudiments fluidly around the kit and use them as fills or phrases in a groove context.', weeks: [
      { week: 1, topic: 'Rudiments around the kit', items: ['Single strokes around the kit — 5 min', 'Paradiddles snare → toms — 10 min', 'Double stroke rolls on different surfaces — 5 min'] },
      { week: 2, topic: 'Rudiments as fills', items: ['Groove + roll fill — 5 min', 'Groove + paradiddle fill — 10 min', 'Groove + flam/drag fill — 5 min'] },
      { week: 3, topic: 'Rudiments with feet', items: ['Feet-only groove — 5 min', 'Add hand rudiments over groove — 10 min', 'Add flams and drags — 5 min'] },
      { week: 4, topic: 'Rudimental phrasing', items: ['Warm-up with singles — 5 min', 'Create 8-bar phrases (3–4 rudiments) — 15 min', 'Record and evaluate — 5 min'] }
    ]},
    { month: 6, title: 'Advanced — Swiss Rudiments & Hybrids', focus: 'Swiss and hybrid rudiments applied melodically and improvisationally.', milestone: 'Play Swiss and hybrid rudiments with speed and control; use them melodically in improvisation.', weeks: [
      { week: 1, topic: 'Swiss Army Triplet', items: ['Swiss triplet slow (60 BPM) — 5 min', 'Increase to 80 BPM — 10 min', 'Move around the kit — 10 min'] },
      { week: 2, topic: 'Swiss Paradiddle & Swiss Flam', items: ['Swiss paradiddle — 5 min', 'Swiss flam — 10 min', 'Combine into 4-bar phrase — 10 min'] },
      { week: 3, topic: 'Hybrid Rudiments', items: ['Herta — 5 min', 'Book Report — 5 min', 'Cheese — 10 min', 'Pataflafla — 5 min'] },
      { week: 4, topic: 'Melodic rudimental soloing', items: ['Compose structured solo — 10 min', 'Improvise with rudiments — 15 min', 'Record, listen, refine — 5 min'] }
    ]}
  ],
  coordination: [
    { month: 1, title: 'Foundation & Limb Separation', focus: 'Money beat, hi-hat foot, limb envelopes, accents+kick — prove each limb before speeding up.', milestone: '4-limb money beat at 60 BPM + hi-hat foot 2&4; move one 16th to tom; accents+kick hold the groove.', weeks: [
      { week: 1, topic: 'Money beat build', items: [
        { text: 'Kick quarters + snare 2&4 — 5 min', target: '60 BPM', pass: 'Solid pulse' },
        { text: 'Add hi-hat 8ths — 5 min', target: '60 BPM', pass: 'Hands even' },
        { text: 'Full money beat 8 bars continuous — 5 min', target: '60 BPM', pass: 'No limb dropouts' }
      ]},
      { week: 2, topic: 'Hi-hat foot + envelopes', items: [
        { text: 'Add hi-hat foot on 2&4 — 5 min', target: '60 BPM', pass: 'Chick lands with snare' },
        { text: 'Limb envelope patterns (RF/RFL style) at 40 BPM — 5 min', target: '40 BPM', pass: 'Say limbs while playing' },
        { text: 'Move one 16th to tom inside groove — 5 min', target: '40 BPM', pass: 'Groove never stops' }
      ]},
      { week: 3, topic: 'Accents + kick', items: [
        { text: 'Hand accents + kick on 1&3 at 40 BPM — 5 min', target: '40 BPM', pass: 'Kick independent of accents' },
        { text: 'Same at 54–60 BPM — 5 min', target: '60 BPM', pass: 'Still clean' },
        { text: 'Money beat with kick variations (1, 2&, 3, 4&) — 5 min', target: '60 BPM', pass: '4 reps without stopping' }
      ]},
      { week: 4, topic: 'Stabilize & song transfer', items: [
        { text: '4-limb groove 60 → 80 BPM — 5 min', target: '80 BPM', pass: 'Only if 60 is easy' },
        { text: 'Apply envelope or accents+kick to a song groove — 10 min', target: 'song tempo', pass: 'Name the song in day log' },
        { text: 'Play 1 min without metronome — 5 min', target: 'internal pulse', pass: 'Check vs click after' }
      ]}
    ]},
    { month: 2, title: 'Ostinato & Hand Independence', focus: 'Steady foot foundation while hands play different rhythms.', milestone: 'Maintain a consistent foot ostinato while playing syncopated and varied hand patterns.', weeks: [
      { week: 1, topic: 'Foot ostinato (samba/bossa)', items: ['Feet only — get ostinato solid — 5 min', 'Add hands: 8th notes on ride — 10 min', 'Add snare backbeats on 2&4 — 5 min'] },
      { week: 2, topic: 'Syncopated hands over feet', items: ['Feet ostinato (70 BPM) — 5 min', 'Hands: syncopated patterns — 10 min', 'Increase tempo to 90 BPM — 5 min'] },
      { week: 3, topic: 'Snare drum independence', items: ['Feet only — 5 min', 'Hands: 2 bars ride, 2 bars snare — 10 min', 'Hands improvise between ride, snare, toms — 5 min'] },
      { week: 4, topic: 'Melody with hands, time with feet', items: ['Feet only — 5 min', 'Paradiddle over foot ostinato — 10 min', 'Invent 4-bar hand pattern — 5 min'] }
    ]},
    { month: 3, title: 'Polyrhythmic Foundation (2:3 & 3:2)', focus: 'Playing 2 against 3 and 3 against 2 between hands and feet.', milestone: 'Play 2:3 and 3:2 polyrhythms confidently, isolated and within a groove.', weeks: [
      { week: 1, topic: '2:3 Polyrhythm', items: ['Isolate each part — 5 min', 'Combine at 60 BPM — 10 min', 'Increase to 70–80 BPM — 5 min'] },
      { week: 2, topic: '3:2 Polyrhythm', items: ['Hands only: triplets — 5 min', 'Feet only: 8ths — 5 min', 'Combine at 60 BPM — 10 min', 'Alternate 4 bars each — 5 min'] },
      { week: 3, topic: 'Polyrhythms in a groove', items: ['2 bars groove + 2 bars polyrhythm — 10 min', '1 bar groove + 1 bar polyrhythm — 10 min'] },
      { week: 4, topic: 'Polyrhythm with 4 limbs', items: ['Each limb separately — 5 min', 'Combine 2 limbs at a time — 10 min', 'All 4 limbs slowly (50–60 BPM) — 10 min'] }
    ]},
    { month: 4, title: 'Broken Time & Syncopation', focus: 'Syncopated accents, displaced backbeats, and broken grooves.', milestone: 'Play syncopated broken grooves with displaced accents while maintaining internal pulse.', weeks: [
      { week: 1, topic: 'Displaced snare drum', items: ['Standard rock beat — 5 min', 'Snare on & of 1 and 3 — 10 min', 'Snare on 3 or & of 4 — 5 min'] },
      { week: 2, topic: 'Syncopated bass drum', items: ['Kick syncopation alone — 5 min', 'Add hi-hat + snare ghost notes — 10 min', 'Add backbeats on 2&4 — 5 min'] },
      { week: 3, topic: 'Broken hi-hat pattern', items: ['Hi-hat pattern alone — 5 min', 'Add kick and snare — 10 min', 'Trade broken vs steady hi-hat — 5 min'] },
      { week: 4, topic: 'Combine broken elements', items: ['Build the groove slowly — 10 min', 'With metronome (80 BPM) — 10 min', 'Without metronome, feel the pocket — 5 min'] }
    ]},
    { month: 5, title: 'Latin & Afro-Cuban Coordination', focus: 'Clave, cascara, son, rumba — the other coordination.', milestone: 'Play Latin grooves with correct clave and cascara while maintaining foot independence.', weeks: [
      { week: 1, topic: 'Son Clave coordination', items: ['Feet only: bass drum pattern — 5 min', 'Hands only: son clave — 10 min', 'Combine hands and feet (70 BPM) — 10 min'] },
      { week: 2, topic: 'Cascara pattern', items: ['Cascara hands only — 5 min', 'Add feet (kick on 2&, 4) — 10 min', 'Add hi-hat foot on clave beats — 10 min'] },
      { week: 3, topic: 'Rumba / Afro-Cuban feel', items: ['Hands-only rumba — 5 min', 'Feet only (clave on kick) — 10 min', 'Combine all 4 limbs — 10 min'] },
      { week: 4, topic: 'Bossa Nova / Samba feet', items: ['Feet only (samba ostinato) — 5 min', 'Hands: simple patterns — 10 min', 'Hands improvise over feet — 10 min'] }
    ]},
    { month: 6, title: 'Advanced — Polyrhythmic & Metric Modulation', focus: 'Layer complex polyrhythms, metric modulation, complete limb autonomy.', milestone: 'Play complex polyrhythms, shift time feels, and improvise with complete limb independence.', weeks: [
      { week: 1, topic: 'Layer polyrhythms', items: ['Feet polyrhythm (4:3) — 5 min', 'Hands polyrhythm (5:4) — 5 min', 'Combine slowly (50 BPM) — 10 min', 'Increase tempo — 5 min'] },
      { week: 2, topic: 'Metric modulation', items: ['4/4 groove — 5 min', 'Shift to triplet feel (3/4) — 10 min', 'Alternate every 4 bars — 10 min'] },
      { week: 3, topic: 'Complete limb autonomy', items: ['Each limb separately — 5 min', 'Combine 2, then 3, then 4 limbs — 10 min', '16-bar phrase with changing patterns — 10 min'] },
      { week: 4, topic: 'Soloing & improvisation', items: ['Compose structured solo — 10 min', 'Improvise freely — 15 min', 'Record and evaluate — 5 min'] }
    ]}
  ],
  /**
   * Benny Greb Language of Drumming — binary alphabet (A–P).
   * One beat of 16ths (1 e & a); train one hand (R/L) then two-hand stroke types.
   * Always start new material at 40 BPM. Use alphabet.html for live letter drills.
   */
  accents: [
    { month: 1, title: 'Single accents — A–D at 40 BPM', focus: 'Letters with one accented 16th. Full / Down / Tap / Up on every slot. One hand first.', milestone: 'A–D clean one-hand R and L at 40→50 BPM; two-hand stroke types at 40 BPM for A–D.', weeks: [
      { week: 1, topic: 'Letter A (X . . .) — one hand', items: [
        { text: 'A right hand only — stroke types at 40 BPM — 5 min', target: '40 BPM', pass: 'Name ↓ - - ↑ while playing; even taps' },
        { text: 'A left hand only at 40 BPM — 5 min', target: '40 BPM', pass: 'Same clarity as R' },
        { text: 'A R then L: 4 bars each × 4 — 5 min', target: '40 BPM', pass: 'No rushing into the accent' }
      ]},
      { week: 2, topic: 'Letters B & C — one hand', items: [
        { text: 'B (. X . .) R + L at 40 BPM — 5 min', target: '40 BPM', pass: 'Accent lands on e' },
        { text: 'C (. . X .) R + L at 40 BPM — 5 min', target: '40 BPM', pass: 'Accent lands on &' },
        { text: 'A→B→C cycle (2 bars each) R, then L — 5 min', target: '40 BPM', pass: 'Clean letter changes' }
      ]},
      { week: 3, topic: 'Letter D + A–D review', items: [
        { text: 'D (. . . X) R + L at 40 BPM — 5 min', target: '40 BPM', pass: 'Accent on a' },
        { text: 'A–D alphabet once R, once L at 40 BPM — 5 min', target: '40 BPM', pass: 'Each letter × 2 bars' },
        { text: 'A–D raise to 45–50 BPM (only if 40 is easy) — 5 min', target: '50 BPM', pass: 'Stop if taps get loud' }
      ]},
      { week: 4, topic: 'A–D two-hand stroke types', items: [
        { text: 'A–D two hands (R/L stroke types) at 40 BPM — 8 min', target: '40 BPM', pass: 'Hands match letter table' },
        { text: 'Random A–D one hand (Alphabet trainer) — 5 min', target: '40 BPM', pass: 'Log best clean BPM' },
        { text: 'A–D on kit (snare or HH) one hand — 5 min', target: '40 BPM', pass: 'Stroke heights still clear' }
      ]}
    ]},
    { month: 2, title: 'Double accents — E–H', focus: 'Two accents per beat. Keep ghosts/taps quiet; Full vs Down vs Up intentional.', milestone: 'E–H clean one-hand R/L at 40–50 BPM; two-hand versions at 40 BPM; A–H continuous at 40.', weeks: [
      { week: 1, topic: 'Letters E & F', items: [
        { text: 'E (X X . .) R + L at 40 BPM — 5 min', target: '40 BPM', pass: '| ↓ - ↑ feel clear' },
        { text: 'F (. X X .) R + L at 40 BPM — 5 min', target: '40 BPM', pass: 'Taps stay soft' },
        { text: 'E↔F alternation 2 bars each — 5 min', target: '40 BPM', pass: 'Both hands' }
      ]},
      { week: 2, topic: 'Letters G & H', items: [
        { text: 'G (. . X X) R + L at 40 BPM — 5 min', target: '40 BPM', pass: 'Late-beat accents solid' },
        { text: 'H (X . . X) R + L at 40 BPM — 5 min', target: '40 BPM', pass: 'Outer accents (1 + a)' },
        { text: 'E–H one-hand run at 40 BPM — 5 min', target: '40 BPM', pass: '2 bars per letter' }
      ]},
      { week: 3, topic: 'E–H two hands + ladder', items: [
        { text: 'E–H two-hand stroke types at 40 BPM — 8 min', target: '40 BPM', pass: 'Match table sticking' },
        { text: 'E–H one hand 40 → 45 → 50 — 5 min', target: '50 BPM', pass: '+5 only when even' },
        { text: 'Random E–H in Alphabet trainer — 5 min', target: '40–50 BPM', pass: 'Log BPM' }
      ]},
      { week: 4, topic: 'A–H combined', items: [
        { text: 'A→H one hand R at 40 BPM — 5 min', target: '40 BPM', pass: 'Full pass without restart' },
        { text: 'A→H one hand L at 40 BPM — 5 min', target: '40 BPM', pass: 'Same quality as R' },
        { text: 'A–H two hands at 40 BPM — 5 min', target: '40 BPM', pass: 'Stroke types correct' }
      ]}
    ]},
    { month: 3, title: 'Triple & full — I–P', focus: 'Finish the binary alphabet. I/J (on–off), K–N (three accents), O (all), P (all taps).', milestone: 'All 16 letters A–P one-hand R and L at 40 BPM; two-hand A–P at 40; A→P once at 45–50 if clean.', weeks: [
      { week: 1, topic: 'Letters I & J (ostinato feel)', items: [
        { text: 'I (X . X .) R + L at 40 BPM — 5 min', target: '40 BPM', pass: '↓ ↑ ↓ ↑ even' },
        { text: 'J (. X . X) R + L at 40 BPM — 5 min', target: '40 BPM', pass: 'Up–down–up–down' },
        { text: 'I↔J two hands at 40 BPM — 5 min', target: '40 BPM', pass: 'No tension' }
      ]},
      { week: 2, topic: 'Letters K–N (three accents)', items: [
        { text: 'K & L one hand R+L at 40 BPM — 5 min', target: '40 BPM', pass: 'Rest slot is a real tap/up' },
        { text: 'M & N one hand R+L at 40 BPM — 5 min', target: '40 BPM', pass: 'Clear ghost vs accent' },
        { text: 'K–N two hands at 40 BPM — 5 min', target: '40 BPM', pass: 'Table sticking' }
      ]},
      { week: 3, topic: 'Letters O & P + full alphabet', items: [
        { text: 'O (all accents) R + L at 40 BPM — 5 min', target: '40 BPM', pass: 'Four equal Fulls, not rushed' },
        { text: 'P (all taps) R + L at 40 BPM — 5 min', target: '40 BPM', pass: 'Quiet even taps — control' },
        { text: 'A→P one hand R then L at 40 BPM — 8 min', target: '40 BPM', pass: '2 bars/letter; log time' }
      ]},
      { week: 4, topic: 'A–P two hands + first ladder', items: [
        { text: 'A→P two-hand stroke types at 40 BPM — 8 min', target: '40 BPM', pass: 'Full alphabet once' },
        { text: 'A→P one hand at 45–50 BPM — 5 min', target: '50 BPM', pass: 'Only if 40 is easy' },
        { text: 'Random A–P (Alphabet trainer) — 5 min', target: '40 BPM', pass: 'Survives surprises' }
      ]}
    ]},
    { month: 4, title: 'Letter combinations (2-letter words)', focus: 'Join two letters into 2-beat cells (e.g. AB, EI, OP). Still start each new pair at 40 BPM.', milestone: 'Play chosen 2-letter pairs one-hand and two-hands at 40–60 BPM; invent 4 pairs and loop them.', weeks: [
      { week: 1, topic: 'Adjacent pairs A–H', items: [
        { text: 'Pairs AB, BC, CD, DE — one hand at 40 BPM — 8 min', target: '40 BPM', pass: '2 bars each letter' },
        { text: 'Same pairs two hands at 40 BPM — 5 min', target: '40 BPM', pass: 'Stroke types hold' },
        { text: 'Raise one easy pair to 50 BPM — 5 min', target: '50 BPM', pass: 'Even across the join' }
      ]},
      { week: 2, topic: 'Wide pairs & contrasts', items: [
        { text: 'Pairs AP, EO, IJ, KP — one hand at 40 BPM — 8 min', target: '40 BPM', pass: 'Contrast still clear' },
        { text: 'Same pairs two hands — 5 min', target: '40 BPM', pass: 'No collapse on P/O' },
        { text: 'Loop one pair 1 min continuous — 5 min', target: '40–50 BPM', pass: 'Log which pair' }
      ]},
      { week: 3, topic: 'Word loops (4 letters)', items: [
        { text: 'Word ABCD one hand R at 40 BPM — 5 min', target: '40 BPM', pass: 'Each letter × 1–2 bars' },
        { text: 'Word EFGH / IJKL same format — 8 min', target: '40 BPM', pass: 'Both hands eventually' },
        { text: 'MNOP one hand then two hands — 5 min', target: '40 BPM', pass: 'O and P stay controlled' }
      ]},
      { week: 4, topic: 'Your word bank', items: [
        { text: 'Write 4 personal 2–4 letter words — practice sheet — 5 min', target: '—', pass: 'Words listed in month notes' },
        { text: 'Practice your words one hand at 40→50 — 8 min', target: '50 BPM', pass: 'All four playable' },
        { text: 'Your words two hands at 40 BPM — 5 min', target: '40 BPM', pass: 'Use Alphabet trainer Word mode later if enabled' }
      ]}
    ]},
    { month: 5, title: 'Hand independence & kit transfer', focus: 'One-hand letters while the other limb keeps time; move accents onto kit voices.', milestone: 'Letter under HH 8ths or kick quarters at 40–60 BPM; orchestrate A–H on kit without losing stroke types.', weeks: [
      { week: 1, topic: 'Letter + foot pulse', items: [
        { text: 'A–D one hand + kick quarters at 40 BPM — 8 min', target: '40 BPM', pass: 'Kick independent of accents' },
        { text: 'E–H same with HH foot 2&4 — 5 min', target: '40 BPM', pass: 'Chick stays' },
        { text: 'Raise one letter+feet to 50 BPM — 5 min', target: '50 BPM', pass: 'Still clean' }
      ]},
      { week: 2, topic: 'Two hands as groove language', items: [
        { text: 'I / J two hands as HH/snare idea at 40 BPM — 5 min', target: '40 BPM', pass: 'Musical, not stiff' },
        { text: 'Money beat; replace one beat with letter A–D — 8 min', target: '40–60 BPM', pass: 'Groove returns after letter' },
        { text: 'Record 30s groove+letter — 5 min', target: 'your tempo', pass: 'Listen back' }
      ]},
      { week: 3, topic: 'Orchestration', items: [
        { text: 'A–H accents on snare, taps on HH — 8 min', target: '40–50 BPM', pass: 'Heights still intentional' },
        { text: 'Move letter accents to floor tom / ride — 5 min', target: '40 BPM', pass: 'Pattern still readable' },
        { text: 'Fill: 1 bar letter word → 1 bar groove — 5 min', target: '50–60 BPM', pass: 'Land on 1' }
      ]},
      { week: 4, topic: 'Song / project transfer', items: [
        { text: 'Apply one Greb letter inside a song groove — 10 min', target: 'song tempo', pass: 'Name song + letter in day log' },
        { text: 'A→P warmup one hand at 40 then 60 — 5 min', target: '60 BPM', pass: 'Only clean letters' },
        { text: 'Two-hand word from month 4 on kit — 5 min', target: '40–50 BPM', pass: 'Pass if musical' }
      ]}
    ]},
    { month: 6, title: 'Fluency — random, speed ladder, phrases', focus: 'Call any letter or short word cold. Build honest BPM ladders; phrase musically.', milestone: 'Random A–P one-hand at 60 BPM; two-hand A–P at 50; improvise 8 bars mixing ≥4 letters.', weeks: [
      { week: 1, topic: 'Cold calls', items: [
        { text: 'Random A–P one hand R at 40→50→60 — 8 min', target: '60 BPM', pass: 'No freeze on letter' },
        { text: 'Random A–P one hand L same ladder — 5 min', target: '60 BPM', pass: 'Match R quality' },
        { text: 'Random two-hand at 40–50 — 5 min', target: '50 BPM', pass: 'Stroke types automatic' }
      ]},
      { week: 2, topic: 'Speed ladder (honest)', items: [
        { text: 'Pick 4 hard letters; ladder 40→80 by +5 — 10 min', target: 'max clean', pass: 'Stop at first dirty BPM; log it' },
        { text: 'Same letters two hands at max clean −10 — 5 min', target: 'under max', pass: 'Relaxed' },
        { text: 'Full A→P at best clean one-hand BPM — 5 min', target: 'logged BPM', pass: 'Write BPM in notes' }
      ]},
      { week: 3, topic: 'Phrasing', items: [
        { text: '8-bar phrase using ≥4 letters — compose — 5 min', target: '40–60 BPM', pass: 'Write letter sequence' },
        { text: 'Play phrase one hand then two hands — 8 min', target: '50–60 BPM', pass: 'Sounds like music' },
        { text: 'Phrase as kit fill into groove — 5 min', target: 'song tempo', pass: 'Back to groove on 1' }
      ]},
      { week: 4, topic: 'Capstone', items: [
        { text: 'A→P R + L + two hands at 40 (control check) — 5 min', target: '40 BPM', pass: 'Still beautiful when slow' },
        { text: '2-min Alphabet trainer session (random) — 10 min', target: 'your ladder', pass: 'Record or log BPM' },
        { text: 'Reflect: hardest letters & next goal — 5 min', target: '—', pass: 'Notes written' }
      ]}
    ]}
  ],
  subdivision: [
    { month: 1, title: 'Foundational Subdivisions', focus: 'Build a rock-solid internal clock. Feel and play quarters, 8ths, 16ths, and triplets.', milestone: 'Clearly hear and play all basic subdivisions against a steady pulse, and switch between them without losing time.', weeks: [
      { week: 1, topic: 'Quarter & 8th Notes', items: ['Quarter notes only (R hand) — 5 min', '8th notes (alternating R/L) — 5 min', 'Switch between quarters and 8ths every 2 bars — 5 min'] },
      { week: 2, topic: '16th Notes', items: ['Single 16ths (alternating) — 5 min', 'Double 16ths (RRLL) — 5 min', 'Paradiddle 16ths (RLLR LRRL) — 5 min'] },
      { week: 3, topic: 'Triplets', items: ['Triplets on snare (R L R L R L) — 5 min', 'Alternate: 2 bars 16ths → 2 bars triplets — 5 min', 'Accent the 1st note of each triplet — 5 min'] },
      { week: 4, topic: 'Mixed Subdivisions', items: ['Warm-up with 8ths — 5 min', 'Cycle: 8ths → 16ths → triplets — 10 min', 'Metronome on 2 & 4 (offbeat) — 5 min'] }
    ]},
    { month: 2, title: 'Subdivision with Feet & Polyrhythm Awareness', focus: 'Add feet to subdivisions. Start hearing polyrhythms by splitting time between limbs.', milestone: 'Aware of how polyrhythms feel; can play basic 2 vs. 3 patterns with hands and feet against a steady pulse.', weeks: [
      { week: 1, topic: 'Hands vs. Feet Subdivision', items: ['Hands 8ths + feet quarters — 5 min', 'Hands quarters + feet 8ths — 5 min', 'Alternate between both patterns — 10 min'] },
      { week: 2, topic: 'Introducing 2 vs. 3', items: ['Listen and tap along to 2:3 audio — 5 min', 'R hand = 2, L hand = 3 — 10 min', 'Add metronome (80 BPM) — 5 min'] },
      { week: 3, topic: '3 vs. 2 Awareness', items: ['Sing 3:2 rhythm out loud — 5 min', 'R hand = 3, L hand = 2 — 10 min', 'Add feet keeping steady pulse — 5 min'] },
      { week: 4, topic: 'Simple Polyphonic Play', items: ['Feet only (samba ostinato) — 5 min', 'Add hands (groove) — 10 min', 'Metronome on offbeats — 5 min'] }
    ]},
    { month: 3, title: 'Core Polyrhythms — 2:3 & 3:2', focus: 'Master the two most important polyrhythms. Play them between hands and feet, and inside grooves.', milestone: 'Play 2:3 and 3:2 polyrhythms cleanly and apply them inside grooves. Beginning to hear 3:4.', weeks: [
      { week: 1, topic: '2:3 — Hands vs. Feet', items: ['Isolate hands (2s) — 5 min', 'Isolate feet (3s) — 5 min', 'Combine at 60 BPM — 10 min', 'Increase to 70 BPM — 5 min'] },
      { week: 2, topic: '3:2 — Hands vs. Feet', items: ['Isolate hands (triplets) — 5 min', 'Isolate feet (8ths) — 5 min', 'Combine at 60 BPM — 10 min', 'Increase to 70 BPM — 5 min'] },
      { week: 3, topic: 'Apply 2:3 & 3:2 to a Groove', items: ['Straight groove — 5 min', 'Groove + polyrhythm (alternating) — 10 min', 'Make the polyrhythm groove musically — 5 min'] },
      { week: 4, topic: '3:4 Polyrhythm (Introduction)', items: ['Hands = 3 (triplets) — 5 min', 'Feet = 4 (16ths) — 5 min', 'Combine at 50 BPM — 10 min', 'Sing the rhythm — 5 min'] }
    ]},
    { month: 4, title: 'Complex Polyrhythms — 3:4, 4:5, 5:4', focus: 'Expand to odd-numbered layers and superimposed rhythms.', milestone: 'Play 3:4, 4:5, and 5:4 polyrhythms with control; starting to layer multiple polyrhythms simultaneously.', weeks: [
      { week: 1, topic: '3:4 Polyrhythm (Mastery)', items: ['Isolate hands (triplets) — 5 min', 'Isolate feet (16ths) — 5 min', 'Combine at 50–60 BPM — 10 min', 'Increase to 70 BPM — 5 min'] },
      { week: 2, topic: '4:3 Polyrhythm', items: ['Hands 16ths — 5 min', 'Feet triplets — 5 min', 'Combine at 50–60 BPM — 10 min', 'Swap limbs — 5 min'] },
      { week: 3, topic: '4:5 & 5:4 Polyrhythms', items: ['Isolate 4 (hands) — 5 min', 'Isolate 5 (feet) — 5 min', 'Combine at 40 BPM — 15 min', 'Move to 50 BPM — 5 min'] },
      { week: 4, topic: 'Layered Polyrhythms (3 limbs)', items: ['R hand 2 + L hand 3 — 5 min', 'L hand 3 + foot 4 — 5 min', 'All 3 limbs at 40–50 BPM — 15 min', 'Record and evaluate — 5 min'] }
    ]},
    { month: 5, title: 'Feel Modulation & Changing Time Signatures', focus: 'Shift between 4/4, 3/4, 6/8, 5/4, and 7/8 without losing the pulse.', milestone: 'Move between time signatures and feels fluidly, keeping tempo steady and form clear.', weeks: [
      { week: 1, topic: '4/4 → 3/4 Shift', items: ['4/4 groove — 5 min', 'Alternate: 2 bars 4/4 → 2 bars 3/4 — 10 min', 'Accent downbeat of each bar — 5 min'] },
      { week: 2, topic: '4/4 → 6/8 Shift', items: ['4/4 with 8th notes — 5 min', '6/8 pattern — 10 min', 'Alternate between feels — 5 min'] },
      { week: 3, topic: '5/4 & 7/8 (optional / advanced)', items: [
        { text: 'Only if 4/4 vocabulary is solid: 5/4 groove exercise — 5 min', target: 'slow', pass: 'Or skip and stay on 4/4 songs' },
        { text: '7/8 pattern exercise (metronome — not jazz repertoire homework) — 10 min', target: 'slow', pass: 'Or continue 4/4' },
        { text: 'Optional cycle 4/4 → 5/4 → 7/8 — 5 min', target: 'slow', pass: 'Or skip week' }
      ]},
      { week: 4, topic: 'Modulation without stopping', items: ['4/4 groove — 5 min', 'Gradually change feel (4/4 → 3/4 → 6/8 → 4/4) — 15 min', 'Record and check tempo consistency — 5 min'] }
    ]},
    { month: 6, title: 'Metric Modulation & Superimposed Polyrhythms', focus: 'Change the pulse itself and superimpose odd rhythms over steady 4/4.', milestone: 'Modulate time feels at will, superimpose complex polyrhythms over a steady pulse, and improvise with advanced rhythmic concepts.', weeks: [
      { week: 1, topic: 'Metric Modulation (8th → triplet)', items: ['8th-note groove — 5 min', 'Shift to triplet feel — 15 min', 'Move back and forth — 5 min'] },
      { week: 2, topic: 'Metric Modulation (16th → 8th triplet)', items: ['16th-note pattern — 5 min', 'Modulate to 8th triplets — 15 min', 'Record and check timing — 5 min'] },
      { week: 3, topic: 'Superimposed Polyrhythms', items: ['4/4 groove — 5 min', 'Add 5:4 or 7:4 with hands — 15 min', 'Improvise with superimposed rhythms — 5 min'] },
      { week: 4, topic: 'Complete Polyrhythmic Improvisation', items: ['Plan a structured solo — 10 min', 'Improvise freely — 15 min', 'Record, listen, refine — 5 min'] }
    ]}
  ],
  adaptation: [
    { month: 1, title: 'Active Listening Foundations', focus: 'Instrument isolation + groove library: style/groove first, then song applications and form adaptations.', milestone: 'Save ≥1 groove card (pattern + level) with at least one song application; note form adaptations.', weeks: [
      { week: 1, topic: 'Pick a groove, not a song', items: [
        { text: 'Listen — focus only on bass — 5 min', target: '1 song', pass: 'Can hum/describe bass role' },
        { text: 'Name the groove family (rock / rumba / merengue…) — 5 min', target: 'styles.md or ear', pass: 'Groove name written down' },
        { text: 'Add groove to library (pattern + level) — 5 min', target: 'library tool', pass: 'Saved in Groove library panel' },
        { text: 'Add 1 song application under that groove — 5 min', target: 'library tool', pass: 'Song + how it uses the groove' }
      ]},
      { week: 2, topic: 'Form adaptations of the groove', items: [
        { text: 'Count bars for each section on one application song — 5 min', target: 'library tool', pass: 'Every section has a bar count' },
        { text: 'Fill Drum Focus column (form adaptations) — 10 min', target: 'library tool', pass: 'Hi-hat vs ride / fills noted' },
        { text: 'Play along on pad, marking section changes — 5 min', target: 'song tempo', pass: 'Land fills before chorus' }
      ]},
      { week: 3, topic: 'Dynamic Awareness', items: [
        { text: 'Eyes closed — map soft/medium/loud/climax — 5 min', target: '1 song', pass: 'Climax bar range named' },
        { text: 'Add dynamics notes to groove form row — 10 min', target: 'library tool', pass: 'Verse quieter than chorus noted' },
        { text: 'Play along matching band volume — 5 min', target: 'song tempo', pass: 'Pull back in verse deliberately' }
      ]},
      { week: 4, topic: 'Basic Call & Response', items: [
        { text: 'Find call & response moments on a recording — 5 min', target: '1 song', pass: 'List 2 moments' },
        { text: 'After every 4-bar vocal phrase, 1-bar fill — 10 min', target: 'song tempo', pass: 'Fill serves the vocal' },
        { text: 'Record and compare to map — 5 min', target: 'recording', pass: 'Fills land at section edges' }
      ]}
    ]},
    { month: 2, title: 'Following the Rhythm Section', focus: 'Lock in with the bass player and rhythm section. Develop pocket awareness.', milestone: 'Lock in with the bass player, respond to rhythm section patterns, and support vocal phrasing.', weeks: [
      { week: 1, topic: 'Locking with the Bass', items: ['Listen — focus only on bass — 5 min', 'Kick drum mimics bass rhythm — 10 min', 'Full groove focusing on bass connection — 5 min'] },
      { week: 2, topic: 'Following Guitar/Piano Rhythms', items: ['Listen — focus on guitar/piano rhythm — 5 min', 'Hi-hat/ride matches rhythm section — 10 min', 'Add snare and kick while maintaining match — 5 min'] },
      { week: 3, topic: 'Listening to Vocal Phrasing', items: ['Mark vocal breaths and phrases — 5 min', 'Accent the vocal downbeats — 10 min', 'Play fills that frame vocal phrases — 5 min'] },
      { week: 4, topic: 'Ensemble Awareness', items: ['Listen to full rhythm section — 5 min', 'Play along — support collective groove — 10 min', 'Mute one instrument on track — adjust — 5 min'] }
    ]},
    { month: 3, title: 'Comping for Soloists', focus: 'Accompany and elevate soloists without overpowering them.', milestone: 'Comp effectively for soloists — adjusting volume, rhythm, and intensity to support their playing.', weeks: [
      { week: 1, topic: 'Leave Space', items: ['Play basic groove — 5 min', 'Solo section: ride + hi-hat foot only — 10 min', 'Occasional snare/kick accents to support — 5 min'] },
      { week: 2, topic: 'Dynamic Comping', items: ['Map solo dynamic arc — 5 min', 'Match dynamics to soloist — 10 min', 'Add fills that connect phrases — 5 min'] },
      { week: 3, topic: 'Rhythmic Comping', items: ['Listen to trading examples — 5 min', 'Trade 2-bar phrases with backing track — 10 min', 'Trade 4-bar phrases — 5 min'] },
      { week: 4, topic: 'Supporting Multiple Soloists', items: ['Listen to tune with multiple soloists — 5 min', 'Adapt comping to each soloist — 10 min', 'Record and evaluate adaptability — 5 min'] }
    ]},
    { month: 4, title: 'Anticipation & Phrasing', focus: 'Hear where the music is going — anticipate changes, fills, and dynamics before they happen.', milestone: 'Anticipate and set up section changes, dynamic shifts, soloist resolutions, and tempo changes.', weeks: [
      { week: 1, topic: 'Anticipating Form Changes', items: ['Predict section changes while listening — 5 min', 'Play fills that lead into next section — 10 min', 'Experiment with fill intensities — 5 min'] },
      { week: 2, topic: 'Anticipating Dynamics', items: ['Map dynamic shifts — 5 min', 'Prepare dynamic shifts with fills/accents — 10 min', 'Telegraph dynamics through body language — 5 min'] },
      { week: 3, topic: 'Anticipating Soloist Phrases', items: ['Predict phrase endings — 5 min', 'Accent resolution of each phrase — 10 min', 'Play fills that answer the soloist — 5 min'] },
      { week: 4, topic: 'Anticipating Tempo Changes', items: ['Listen to song with tempo changes — 5 min', 'Play along — follow tempo changes — 10 min', 'Lead a tempo change (slow → fast) — 5 min'] }
    ]},
    { month: 5, title: 'Dynamic Shape & Energy Management', focus: 'Control the band\'s energy — when to push, when to pull back, how to build and release tension.', milestone: 'Shape the dynamic and emotional arc of a song, building and releasing energy to tell a musical story.', weeks: [
      { week: 1, topic: 'Mapping the Emotional Arc', items: ['Draw the emotional arc — 5 min', 'Match arc with dynamics and intensity — 10 min', 'Record — does your playing tell the story? — 5 min'] },
      { week: 2, topic: 'Building Energy (Crescendo)', items: ['Warm-up — play soft — 5 min', 'Build soft → loud over 8 bars — 10 min', 'Build over 16 bars — 5 min'] },
      { week: 3, topic: 'Releasing Energy (Decrescendo)', items: ['Warm-up — play loud — 5 min', 'Pull back loud → soft over 8 bars — 10 min', 'Dramatic ending (loud → silence) — 5 min'] },
      { week: 4, topic: 'Controlling the Band\'s Energy', items: ['Listen to the track — 5 min', 'Push and pull energy deliberately — 15 min', 'Record and analyze influence on feel — 5 min'] }
    ]},
    { month: 6, title: 'Musical Leadership & Cueing', focus: 'Become the director from the drum throne. Lead through cues, resolve mistakes, shape performance.', milestone: 'Lead a band — setting tempos, cueing changes, resolving mistakes, and shaping the performance with confidence.', weeks: [
      { week: 1, topic: 'Visual Cueing', items: ['Practice cueing in front of mirror — 5 min', 'Cue imaginary band members with track — 10 min', 'Record — evaluate clarity of cues — 10 min'] },
      { week: 2, topic: 'Audio Cueing (Fills & Accents)', items: ['Identify audio cues in songs — 5 min', 'Use fills as cues — 10 min', 'Cue specific moments with backing track — 10 min'] },
      { week: 3, topic: 'Resolving Train Wrecks', items: ['Warm-up — 5 min', 'Lose time on purpose and recover — 15 min', 'Recover from mistakes without stopping — 5 min'] },
      { week: 4, topic: 'Full Musical Leadership', items: ['Plan a setlist — 10 min', 'Lead a band or backing track performance — 15 min', 'Record and self-evaluate leadership — 5 min'] }
    ]}
  ],
  versatility: [
    { month: 1, title: 'Rock Foundation + Early Latin Vehicles', focus: 'Solid rock vocabulary, then bolero/rumba/bossa or a Santana-style groove — song projects welcome.', milestone: 'Confident rock money beat + fills; one Latin/song vehicle groove you can play along to.', weeks: [
      { week: 1, topic: 'Basic Rock Beat', items: [
        { text: 'Hands only (snare + hi-hat) — 5 min', target: '60–80 BPM', pass: 'Steady backbeat' },
        { text: 'Add kick + hi-hat foot — 5 min', target: '60–80 BPM', pass: '4 limbs stable' },
        { text: 'Play along to a rock song — 5 min', target: 'song tempo', pass: 'Log song name' }
      ]},
      { week: 2, topic: 'Rock variations & ghosts', items: [
        { text: 'Kick syncopation variations — 5 min', target: '70–90 BPM', pass: 'Backbeat stays' },
        { text: 'Ghost notes between 2&4 — 5 min', target: '70–90 BPM', pass: 'Ghosts quieter than backbeat' },
        { text: 'Open hi-hat on 2&4 option — 5 min', target: 'song tempo', pass: 'Controlled open/close' }
      ]},
      { week: 3, topic: 'Fills in form', items: [
        { text: '1-bar fills around kit — 5 min', target: '80–96 BPM', pass: 'Land on 1' },
        { text: '4 bars groove → 1 bar fill — 5 min', target: 'song tempo', pass: 'Fill serves the song' },
        { text: 'Song project fills (e.g. Rumba del Capitano / A feu…) — 10 min', target: 'project tempo', pass: 'Log project' }
      ]},
      { week: 4, topic: 'Early Latin / half-time', items: [
        { text: 'Half-time rock groove — 5 min', target: 'any', pass: 'Snare on 3 feels heavy' },
        { text: 'Bolero or rumba/bossa ostinato feet + simple hands — 10 min', target: '40–70 BPM', pass: 'Feet stay when hands move' },
        { text: 'Santana-style or clave-lite groove by ear — 10 min', target: 'slow', pass: 'Match reference recording' }
      ]}
    ]},
    { month: 2, title: 'Funk & Groove', focus: 'Develop the pocket — tight, syncopated, and rhythmic with ghost notes and hi-hat work.', milestone: 'Play tight, syncopated funk grooves with ghost notes and a solid pocket.', weeks: [
      { week: 1, topic: 'Funk 16th-Note Hi-Hat', items: ['Hi-hat 16ths (R L R L) — 5 min', 'Add kick and snare — 5 min', 'Play along to a funk track — 10 min'] },
      { week: 2, topic: 'Ghost Notes', items: ['Play basic funk groove — 5 min', 'Add ghost notes on snare — 10 min', 'Increase tempo to 90–100 BPM — 5 min'] },
      { week: 3, topic: 'Funk Fills & Breaks', items: ['Groove — 5 min', 'Practice fills — 10 min', 'Groove → fill → break → groove — 5 min'] },
      { week: 4, topic: 'Tight Pocket Feel', items: ['Metronome on 2 & 4 — 5 min', 'Play along to funk track — 10 min', 'Record and evaluate pocket — 5 min'] }
    ]},
    { month: 3, title: 'Song Depth — Forms, Dynamics, Pocket (not jazz school)', focus: 'Stay in rock/pop/funk songs. Map form, dynamics, and pocket. Jazz ride/trading is a long specialist path — skip or defer until expert-level goals.', milestone: 'Play 2–3 named 4/4 songs with solid form awareness, dynamics, and pocket — no odd-meter or jazz-language requirement.', weeks: [
      { week: 1, topic: 'Song form on the kit', items: [
        { text: 'Pick a clear 4/4 song and play full form — 10 min', target: 'song tempo', pass: 'Hit section changes without getting lost' },
        { text: 'Mark fills only at phrase ends — 5 min', target: 'same song', pass: 'Land on 1 after fills' },
        { text: 'Update groove form drum-focus column — 5 min', target: 'library tool', pass: 'HH vs ride / energy noted' }
      ]},
      { week: 2, topic: 'Dynamics & arrangement support', items: [
        { text: 'Verse soft / chorus bigger on same song — 10 min', target: 'song tempo', pass: 'Clear dynamic contrast' },
        { text: 'Strip to HH + kick in quiet sections — 5 min', target: 'song tempo', pass: 'Space feels intentional' },
        { text: 'Second song — same exercise — 10 min', target: 'song tempo', pass: 'Log both song names' }
      ]},
      { week: 3, topic: 'Pocket with bass (recordings)', items: [
        { text: 'Lock kick to bass line on a rock/funk track — 10 min', target: 'song tempo', pass: 'Kick follows bass rhythm' },
        { text: 'Metronome on 2&4 while playing groove — 5 min', target: '80–100 BPM', pass: 'No rushing fills' },
        { text: 'Record 1 chorus and listen for pocket — 5 min', target: 'recording', pass: 'Note one timing fix' }
      ]},
      { week: 4, topic: 'Optional: shuffle feel only (not jazz ride)', items: [
        { text: 'Basic rock shuffle HH triplets + snare 2&4 — 10 min', target: '60–80 BPM', pass: 'Triplet feel steady' },
        { text: 'Apply shuffle to a blues-rock song if you have one — 10 min', target: 'song tempo', pass: 'Still 4/4 form' },
        { text: 'Skip jazz ride / trading 4s unless this is a long-term specialty — 5 min', target: 'n/a', pass: 'Honest choice logged in notes' }
      ]}
    ]},
    { month: 4, title: 'Shuffles & Blues', focus: 'Master shuffle feel — triplet-based grooves with a lope or swing.', milestone: 'Play standard, Texas, and half-time shuffles with a solid blues feel.', weeks: [
      { week: 1, topic: 'Basic Shuffle', items: ['Hi-hat triplets — 5 min', 'Add kick and snare — 5 min', 'Play along to a blues track — 10 min'] },
      { week: 2, topic: 'Texas Shuffle', items: ['Hi-hat with accents — 5 min', 'Add kick and snare — 10 min', 'Increase tempo — 5 min'] },
      { week: 3, topic: 'Half-Time Shuffle', items: ['Basic shuffle — 5 min', 'Half-time shuffle — 10 min', 'Alternate standard and half-time — 5 min'] },
      { week: 4, topic: 'Blues Fills & Turnarounds', items: ['12-bar blues groove — 5 min', 'Add fills at bars 4, 8, 12 — 10 min', 'Play turnarounds — 5 min'] }
    ]},
    { month: 5, title: 'Afro-Cuban & Brazilian Rhythms', focus: 'Clave-based rhythms, cascara, samba/bossa feels. Hands and feet on different layers.', milestone: 'Play son clave, cascara, bossa nova, and basic Afro-Cuban rhythms with correct feel.', weeks: [
      { week: 1, topic: 'Son Clave & Basic Latin Groove', items: ['Feet only (samba ostinato) — 5 min', 'Hands only (son clave) — 10 min', 'Combine hands and feet — 10 min'] },
      { week: 2, topic: 'Cascara Pattern', items: ['Cascara on ride — 5 min', 'Add feet — 10 min', 'Play along to Latin track — 5 min'] },
      { week: 3, topic: 'Bossa Nova', items: ['Feet only — 5 min', 'Hands only (bossa pattern) — 10 min', 'Combine — focus on lightness — 10 min'] },
      { week: 4, topic: 'Afro-Cuban (Rumba, Mozambique)', items: ['Rumba hand pattern — 5 min', 'Add feet — 10 min', 'Play along to Afro-Cuban music — 10 min'] }
    ]},
    { month: 6, title: 'Optional advanced — odd meters / world (skip if still building 4/4)', focus: 'Only if rock/pop/funk song vocabulary is solid. Odd meters and jazz-adjacent listening are not beginner goals.', milestone: 'Either deepen 4/4 repertoire with 3+ solid songs, OR (optional) dabble in one odd-meter exercise without treating Brubeck/jazz as homework.', weeks: [
      { week: 1, topic: 'Default path: deepen 4/4 repertoire', items: [
        { text: 'Full run of song A with map — 10 min', target: 'song tempo', pass: 'Form never lost' },
        { text: 'Full run of song B with map — 10 min', target: 'song tempo', pass: 'Dynamics match sections' },
        { text: 'Compare drum parts between A and B — 5 min', target: 'notes', pass: 'Two differences written down' }
      ]},
      { week: 2, topic: 'Default path: groove + fill vocabulary', items: [
        { text: 'Same two songs — new fill vocabulary — 15 min', target: 'song tempo', pass: 'Fills still land on 1' },
        { text: 'Half-time chorus option on one song — 5 min', target: 'song tempo', pass: 'Feel change is clear' },
        { text: 'Record one tune end-to-end — 5 min', target: 'recording', pass: 'Listen once critically' }
      ]},
      { week: 3, topic: 'Optional only: simple 5/4 or 7/8 exercise', items: [
        { text: 'If choosing optional path: count 5/4 with click — 5 min', target: '60 BPM', pass: 'Or skip week entirely' },
        { text: 'Basic 5/4 or 7/8 groove exercise (no jazz repertoire required) — 10 min', target: 'slow', pass: 'Or continue 4/4 songs' },
        { text: 'Do not use “famous jazz odd-meter tunes” as beginner targets — 5 min', target: 'n/a', pass: 'Stay on exercises or 4/4 songs' }
      ]},
      { week: 4, topic: 'Optional world / hand percussion taste', items: [
        { text: 'Simple hand pattern (djembe or pad substitute) — 10 min', target: 'slow', pass: 'Or skip' },
        { text: 'Or: samba/bossa feet review from Month 1–5 Latin work — 10 min', target: '70 BPM', pass: 'Feet steady' },
        { text: 'Write next-quarter goals (still mostly 4/4 songs + technique) — 5 min', target: 'notes', pass: 'Goals are realistic' }
      ]}
    ]}
  ],
  improvisation: [
    { month: 1, title: 'Foundation — Basic Fills & Phrasing', focus: 'Simple, musical fills that fit the groove. Understand 2-, 4-, and 8-bar phrasing.', milestone: 'Play simple 1-bar and 2-bar fills, place them correctly in the form, and perform a basic 4-bar solo.', weeks: [
      { week: 1, topic: '1-Bar Fills', items: ['Groove only (steady time) — 5 min', 'Groove → fill → groove (repeat) — 10 min', 'Increase tempo (60 → 80 → 100 BPM) — 5 min'] },
      { week: 2, topic: '2-Bar Fills', items: ['2-bar fills on snare only — 5 min', '2-bar fills around the kit — 10 min', 'Play with a backing track — 5 min'] },
      { week: 3, topic: 'Fill Placement', items: ['Groove — 5 min', 'Fills at bar 4, 8, and 16 — 10 min', 'Play along to a song — place fills correctly — 5 min'] },
      { week: 4, topic: 'Simple 4-Bar Solo', items: ['Groove — 5 min', 'Compose a 4-bar solo (write it down) — 10 min', 'Play with metronome — 5 min'] }
    ]},
    { month: 2, title: 'Structured Solos — 8-Bar & 16-Bar', focus: 'Longer structured solos. Learn ABA form — statement, development, conclusion.', milestone: 'Play structured 8-bar and 16-bar solos with clear ABA form, dynamics, and intentional use of space.', weeks: [
      { week: 1, topic: '8-Bar Solo — ABA Form', items: ['Groove — 5 min', 'Compose and play 8-bar solo — 15 min', 'Record and evaluate — 5 min'] },
      { week: 2, topic: '16-Bar Solo — Extended Form', items: ['Groove — 5 min', 'Compose a 16-bar solo — 15 min', 'Record and evaluate the arc — 5 min'] },
      { week: 3, topic: 'Using Dynamics in Solos', items: ['Play soft only — 5 min', 'Build soft → loud → soft over 8 bars — 10 min', 'Apply to a solo — 5 min'] },
      { week: 4, topic: 'Using Space & Silence', items: ['Solo with intentional silence — 5 min', 'Record — listen for impact of space — 15 min', 'Refine — 5 min'] }
    ]},
    { month: 3, title: 'Trading Fours & Eights', focus: 'Exchange musical phrases with soloists. Listen, respond, build a conversation.', milestone: 'Trade 4s and 8s with a soloist, responding musically to their phrasing and ideas.', weeks: [
      { week: 1, topic: 'Trading 4s — Preparation', items: ['Listen to trading examples — 5 min', '4 bars time → 4 bars solo — 10 min', 'Repeat with metronome — 5 min'] },
      { week: 2, topic: 'Trading 4s — With Backing Track', items: ['Time only — 5 min', 'Trade 4s with backing track — 15 min', 'Record — are you responding musically? — 5 min'] },
      { week: 3, topic: 'Trading 8s', items: ['Time only — 5 min', 'Trade 8s with backing track — 15 min', 'Record and evaluate — 5 min'] },
      { week: 4, topic: 'Conversational Trading', items: ['Listen to soloist — 5 min', 'Trade phrases — respond to content — 15 min', 'Record — does it sound like conversation? — 5 min'] }
    ]},
    { month: 4, title: 'Thematic Development', focus: 'Take a simple idea and develop it into a full solo. The heart of improvisation.', milestone: 'Take a simple idea and develop it into a cohesive, structured solo using thematic development.', weeks: [
      { week: 1, topic: 'Developing a Simple Rhythm', items: ['Play the basic idea — 5 min', 'Create 4 variations — 10 min', 'Build a solo from variations — 5 min'] },
      { week: 2, topic: 'Developing a Rudimental Idea', items: ['Rudiment on snare — 5 min', 'Move it around the kit — 10 min', 'Build a solo using the rudiment — 5 min'] },
      { week: 3, topic: 'Developing a Sound/Texture', items: ['Explore a sound (cymbal swells) — 5 min', 'Add layers (snare, toms) — 10 min', 'Build a texture solo — 5 min'] },
      { week: 4, topic: 'Full Thematic Solo', items: ['Choose a theme — 5 min', 'Develop over 16 bars — 15 min', 'Record, listen, refine — 5 min'] }
    ]},
    { month: 5, title: 'Improvisation — Listening & Reacting', focus: 'Improvise in real time, reacting to the music, the band, and the moment.', milestone: 'Improvise freely, reacting to the music and band, without relying on pre-planned patterns.', weeks: [
      { week: 1, topic: 'Free Improvisation (No Metronome)', items: ['Warm-up — 5 min', 'Free improv for 2–3 minutes — 15 min', 'Record — what worked? — 5 min'] },
      { week: 2, topic: 'Reacting to the Band', items: ['Listen to the track — 5 min', 'React to every change — 15 min', 'Record — evaluate responsiveness — 5 min'] },
      { week: 3, topic: 'Playing Outside the Form', items: ['Play in 4/4 — 5 min', 'Play 5/4 or 7/4 over 4/4 — find resolution — 15 min', 'Record — did you land on time? — 5 min'] },
      { week: 4, topic: 'Full Improvisation Session', items: ['Warm-up — 5 min', 'Improvise freely (2–3 min) — 15 min', 'Record — listen for musicality — 5 min'] }
    ]},
    { month: 6, title: 'Advanced — Storytelling & Mastery', focus: 'Solos that tell a story. Tension, release, climax, and emotional narrative.', milestone: 'Deliver a musically compelling, emotionally expressive solo that tells a story and captivates the listener.', weeks: [
      { week: 1, topic: 'Building a Narrative Arc', items: ['Plan the arc of a solo — 5 min', 'Play focusing on the arc — 15 min', 'Record — does it tell a story? — 5 min'] },
      { week: 2, topic: 'Creating Tension & Release', items: ['Tension exercise (play against beat) — 5 min', 'Build tension → release — 15 min', 'Apply to a solo — 5 min'] },
      { week: 3, topic: 'Emotional Solo', items: ['Warm-up — 5 min', 'Play 3 solos (joy, anger, sadness) — 15 min', 'Record — can you hear the emotion? — 5 min'] },
      { week: 4, topic: 'Master Improvisation Performance', items: ['Plan — 5 min', 'Play capstone solo (2–3 min) — 20 min', 'Listen back and reflect on growth — 5 min'] }
    ]}
  ]
};

const EVAL_COMPETENCIES = [
  { domain: 'Technical Execution', id: 'rudiments', title: 'Rudimental Vocabulary', levels: [
    { label: 'novice', desc: 'Singles, doubles, paradiddle, flam, drag', pass: 'Each clean at a logged target BPM' },
    { label: 'intermediate', desc: '26 rudiments, applied on set', pass: 'Rudiment as fill in a real song' },
    { label: 'advanced', desc: 'Swiss rudiments, melodic phrasing', pass: '8-bar phrase mixing 3+ rudiments' },
    { label: 'expert', desc: 'Hybrid rudiments, seamless at speed', pass: 'Hybrids inside improvised solo' }
  ]},
  { domain: 'Technical Execution', id: 'coordination', title: 'Independence & Coordination', levels: [
    { label: 'novice', desc: 'Money beat + hi-hat foot on 2&4', pass: '60 BPM × 8 bars, no limb collapse' },
    { label: 'intermediate', desc: 'Limb envelopes, accents+kick, 2:3', pass: 'One 16th to tom while groove holds' },
    { label: 'advanced', desc: '4-way independence, broken time, Latin feet', pass: 'Feet ostinato + improvised hands' },
    { label: 'expert', desc: 'Complete limb autonomy, metric modulation', pass: 'Change feel without losing form' }
  ]},
  { domain: 'Technical Execution', id: 'accents', title: 'Greb Alphabet Accents', levels: [
    { label: 'novice', desc: 'A–D one hand at 40 BPM; Full/Down/Tap/Up named', pass: 'A–D R and L at 40 BPM, clear accents' },
    { label: 'intermediate', desc: 'A–P one hand; E–H two hands; start letter pairs', pass: 'A→P one hand at 40; two-hand A–H at 40' },
    { label: 'advanced', desc: '2–4 letter words; kit transfer; 50–60 BPM ladders', pass: 'Personal words + letter inside a song groove' },
    { label: 'expert', desc: 'Cold random A–P; musical phrases; honest high BPM', pass: 'Random A–P at 60; 8-bar multi-letter phrase' }
  ]},
  { domain: 'Musical Perception', id: 'subdivision', title: 'Subdivision & Polyrhythm', levels: [
    { label: 'novice', desc: 'Quarters, 8ths, 16ths, accent grids', pass: '2–3–4–5–6 + accents at 40–60 BPM' },
    { label: 'intermediate', desc: 'Triplets, 16th syncopation', pass: 'Switch 16ths ↔ triplets without rushing' },
    { label: 'advanced', desc: '3:4, 5:4 polyrhythms over groove', pass: '2:3 inside a named groove' },
    { label: 'expert', desc: 'Modulate between feels (4/4→6/8→5/4)', pass: 'Modulate mid-song, land on 1' }
  ]},
  { domain: 'Musical Perception', id: 'adaptation', title: 'Listening & Adaptation', levels: [
    { label: 'novice', desc: 'Follows click or one instrument', pass: 'Kick locks to bass line' },
    { label: 'intermediate', desc: 'Learns groove language by ear', pass: 'Song groove learned without chart' },
    { label: 'advanced', desc: 'Anticipates phrasing, comps for soloists', pass: 'Set up chorus/fill without chart' },
    { label: 'expert', desc: 'Dynamic shape, pushes & pulls energy', pass: 'Lead energy for a full tune' }
  ]},
  { domain: 'Musicality & Repertoire', id: 'versatility', title: 'Stylistic Versatility', levels: [
    { label: 'novice', desc: 'Rock/Pop + clear 4/4 song vehicles', pass: 'Money beat + fills on a named tune' },
    { label: 'intermediate', desc: 'Funk, shuffles, light Latin-rock', pass: 'Switch rock ↔ funk/shuffle on songs' },
    { label: 'advanced', desc: 'Afro-Cuban, Brazilian; deep style study', pass: 'Clave-correct groove with feet' },
    { label: 'expert', desc: 'Jazz language, odd meters, cultural fluency', pass: 'Authentic feel — long-term specialist path' }
  ]},
  { domain: 'Musicality & Repertoire', id: 'improvisation', title: 'Soloing & Improvisation', levels: [
    { label: 'novice', desc: '1–2 bar fills inside a song', pass: 'Groove→fill→groove on a named tune' },
    { label: 'intermediate', desc: 'Structured 8-bar solo', pass: 'ABA solo to click' },
    { label: 'advanced', desc: 'Trades 4s, thematic development', pass: 'Answer a phrase on a track' },
    { label: 'expert', desc: 'Conversational, tension & release', pass: '2-min solo with story arc' }
  ]}
];
