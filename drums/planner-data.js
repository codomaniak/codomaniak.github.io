const DOMAINS = [
  {
    id: 'technical',
    label: 'Technical Execution',
    tracks: ['rudiments', 'coordination']
  },
  {
    id: 'perception',
    label: 'Musical Perception',
    tracks: ['subdivision', 'adaptation']
  },
  {
    id: 'musicality',
    label: 'Musicality & Repertoire',
    tracks: ['versatility', 'improvisation']
  }
];

const TRACK_META = {
  rudiments: { label: 'Rudiments', short: 'Rud.', color: '#3f6a9b', bg: '#eaf0fa' },
  coordination: { label: 'Coordination', short: 'Coord.', color: '#6a9b8a', bg: '#eaf5f0' },
  subdivision: { label: 'Subdivision', short: 'Subdiv.', color: '#7a6a9b', bg: '#f0eaf8' },
  adaptation: { label: 'Listening', short: 'Listen.', color: '#9b7a6a', bg: '#f8f0ea' },
  versatility: { label: 'Versatility', short: 'Styles', color: '#9b8a6a', bg: '#f8f5ea' },
  improvisation: { label: 'Improvisation', short: 'Solo', color: '#6a7a9b', bg: '#eaeff8' }
};

const ALL_TRACKS = Object.keys(TRACK_META);

const STATUS_TYPES = [
  { id: 'done', icon: '✅', label: 'Complete', desc: 'Milestone achieved — move on when ready' },
  { id: 'partial', icon: '⚠️', label: 'Partial', desc: 'Needs work — extend or revisit this month' },
  { id: 'progress', icon: '🔄', label: 'In progress', desc: 'Currently working on this month' }
];

const PLANS = {
  rudiments: [
    { month: 1, title: 'The Foundation — 5 Core Rudiments', focus: 'Build proper grip, stroke technique, and evenness.', milestone: 'Play all 5 rudiments cleanly at 80–100 BPM with even dynamics and proper stick control.', weeks: [
      { week: 1, topic: 'Single Stroke Roll', items: ['Single strokes at 60 BPM (8ths) — 5 min', 'Increase to 80 BPM — 5 min', 'Accented singles (accent on 1) — 5 min'] },
      { week: 2, topic: 'Double Stroke Roll', items: ['Double strokes at 60 BPM — 5 min', 'Increase to 80 BPM — 5 min', 'Open roll (RRLL) at 100 BPM — 5 min'] },
      { week: 3, topic: 'Paradiddle', items: ['Paradiddle slow (60 BPM) — 5 min', 'Accented paradiddle (accent on R) — 5 min', 'Accent on L — 5 min'] },
      { week: 4, topic: 'Flam & Drag', items: ['Flams (alternating hands) — 5 min', 'Drags (alternating hands) — 5 min', 'Combine Flams + Drags in 4-bar pattern — 5 min'] }
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
    { month: 1, title: 'Foundation & Limb Separation', focus: 'Isolate each limb, build basic coordination, establish a strong pulse.', milestone: 'Play a basic rock beat with all 4 limbs and add simple bass drum syncopation without breaking the groove.', weeks: [
      { week: 1, topic: 'Stick control with metronome', items: ['Quarter notes on kick — 5 min', 'Hi-hat 8ths + snare 2&4 — 5 min', 'Combine: kick 1&3, snare 2&4, hi-hat 8ths — 5 min'] },
      { week: 2, topic: 'Add the hi-hat foot', items: ['Hands only (snare + hi-hat) — 5 min', 'Add kick drum — 5 min', 'Add hi-hat foot on 2&4 — 5 min'] },
      { week: 3, topic: 'Money beat — all 4 limbs', items: ['Slow tempo (60 BPM) — 10 min', 'Increase to 80 BPM — 5 min', 'Swap hi-hat foot to quarters — 5 min'] },
      { week: 4, topic: 'Bass drum variations', items: ['Rock beat with kick variation — 5 min', 'Repeat each variation 4× without stopping — 10 min', 'Play without metronome — 5 min'] }
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
      { week: 3, topic: '5/4 & 7/8 Odd Meters', items: ['5/4 groove — 5 min', '7/8 pattern — 10 min', 'Cycle: 4/4 → 5/4 → 7/8 — 5 min'] },
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
    { month: 1, title: 'Active Listening Foundations', focus: 'Train ears to hear individual instruments, identify form, and respond to dynamic changes.', milestone: 'Identify individual instruments, map song structure, and play simple dynamic responses to the music.', weeks: [
      { week: 1, topic: 'Instrument Isolation', items: ['Listen — focus only on bass — 5 min', 'Focus only on guitar/keys — 5 min', 'Focus only on vocals — 5 min', 'Write a map of the arrangement — 5 min'] },
      { week: 2, topic: 'Form & Structure Recognition', items: ['Listen and count bars — 5 min', 'Write down the form — 10 min', 'Play along on practice pad, marking sections — 5 min'] },
      { week: 3, topic: 'Dynamic Awareness', items: ['Listen with eyes closed — focus on dynamics — 5 min', 'Map the dynamic arc of the song — 10 min', 'Play along, adjusting volume — 5 min'] },
      { week: 4, topic: 'Basic Call & Response', items: ['Listen to call & response examples — 5 min', 'After every 4-bar vocal phrase, play 1-bar fill — 10 min', 'Record and evaluate if response fits — 5 min'] }
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
    { month: 1, title: 'Rock & Pop Foundation', focus: 'Master core rock/pop vocabulary — solid time, backbeat feel, and basic fills.', milestone: 'Play solid rock/pop grooves with confidence, add basic fills, and understand common variations.', weeks: [
      { week: 1, topic: 'Basic Rock Beat', items: ['Hands only (snare + hi-hat) — 5 min', 'Add kick drum — 5 min', 'Add hi-hat foot — 5 min', 'Play along to a rock song — 5 min'] },
      { week: 2, topic: 'Rock Variations', items: ['Play basic beat — 5 min', 'Practice kick variations — 10 min', 'Add ghost notes and open hi-hat — 5 min'] },
      { week: 3, topic: 'Rock Fills', items: ['Warm-up with basic beat — 5 min', 'Practice 1-bar fills around kit — 10 min', '4 bars groove → 1 bar fill — 5 min'] },
      { week: 4, topic: 'Pop Grooves', items: ['Half-time groove — 5 min', 'Four-on-the-floor groove — 5 min', 'Shuffle groove (start slow) — 10 min'] }
    ]},
    { month: 2, title: 'Funk & Groove', focus: 'Develop the pocket — tight, syncopated, and rhythmic with ghost notes and hi-hat work.', milestone: 'Play tight, syncopated funk grooves with ghost notes and a solid pocket.', weeks: [
      { week: 1, topic: 'Funk 16th-Note Hi-Hat', items: ['Hi-hat 16ths (R L R L) — 5 min', 'Add kick and snare — 5 min', 'Play along to a funk track — 10 min'] },
      { week: 2, topic: 'Ghost Notes', items: ['Play basic funk groove — 5 min', 'Add ghost notes on snare — 10 min', 'Increase tempo to 90–100 BPM — 5 min'] },
      { week: 3, topic: 'Funk Fills & Breaks', items: ['Groove — 5 min', 'Practice fills — 10 min', 'Groove → fill → break → groove — 5 min'] },
      { week: 4, topic: 'Tight Pocket Feel', items: ['Metronome on 2 & 4 — 5 min', 'Play along to funk track — 10 min', 'Record and evaluate pocket — 5 min'] }
    ]},
    { month: 3, title: 'Jazz & Swing', focus: 'Learn jazz ride pattern, comping, and swing feel. Independence in a jazz context.', milestone: 'Play jazz ride pattern, comp with snare/kick, and trade 4s with a soloist.', weeks: [
      { week: 1, topic: 'Jazz Ride Cymbal Pattern', items: ['Ride pattern only — 5 min', 'Add hi-hat foot on 2 & 4 — 5 min', 'Keep ride + hi-hat foot — 10 min'] },
      { week: 2, topic: 'Jazz Comping (Snare & Kick)', items: ['Ride + hi-hat only — 5 min', 'Add snare comping (syncopated) — 10 min', 'Add kick comping (soft feathering) — 10 min'] },
      { week: 3, topic: 'Swing vs. Straight Feel', items: ['Straight 8ths (rock) — 5 min', 'Swing 8ths (jazz) — 10 min', 'Alternate between feels — 10 min'] },
      { week: 4, topic: 'Trading Fours & Jazz Soloing', items: ['Play jazz time — 5 min', 'Trade 4s with a track — 15 min', 'Record and evaluate — 5 min'] }
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
    { month: 6, title: 'Odd Meters & World Rhythms', focus: 'Expand into odd time (5/4, 7/8, 9/8) and world percussion rhythms.', milestone: 'Play in 5/4, 7/8, and 9/8 with confidence; awareness of world percussion styles.', weeks: [
      { week: 1, topic: '5/4 Groove', items: ['Count 5/4 with metronome — 5 min', 'Play basic 5/4 groove — 10 min', 'Play along to a 5/4 track — 5 min'] },
      { week: 2, topic: '7/8 Groove', items: ['Count 7/8 — 5 min', 'Play 7/8 groove — 10 min', 'Play along to a 7/8 track — 5 min'] },
      { week: 3, topic: '9/8 & Other Odd Meters', items: ['Count 9/8 with different groupings — 5 min', 'Play 9/8 groove — 15 min', 'Alternate 4/4 and 9/8 — 5 min'] },
      { week: 4, topic: 'World Rhythms Overview', items: ['Hand techniques (djembe) — 5 min', 'Darbuka patterns — 10 min', 'Samba batucada on drum set — 10 min'] }
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
    { label: 'novice', desc: '5 basic rudiments' },
    { label: 'intermediate', desc: '26 rudiments, applied on set' },
    { label: 'advanced', desc: 'Swiss rudiments, melodic phrasing' },
    { label: 'expert', desc: 'Hybrid rudiments, seamless at speed' }
  ]},
  { domain: 'Technical Execution', id: 'coordination', title: 'Independence & Coordination', levels: [
    { label: 'novice', desc: 'Basic rock beat (kick 1&3, snare 2&4)' },
    { label: 'intermediate', desc: 'Limb separation, polyrhythms (2:3)' },
    { label: 'advanced', desc: '4-way independence, broken time, Latin feet' },
    { label: 'expert', desc: 'Complete limb autonomy, metric modulation' }
  ]},
  { domain: 'Musical Perception', id: 'subdivision', title: 'Subdivision & Polyrhythm', levels: [
    { label: 'novice', desc: 'Quarter, 8th, 16th notes' },
    { label: 'intermediate', desc: 'Triplets, 16th syncopation' },
    { label: 'advanced', desc: '3:4, 5:4 polyrhythms over groove' },
    { label: 'expert', desc: 'Modulate between feels (4/4→6/8→5/4)' }
  ]},
  { domain: 'Musical Perception', id: 'adaptation', title: 'Listening & Adaptation', levels: [
    { label: 'novice', desc: 'Follows click or bass' },
    { label: 'intermediate', desc: 'Notices guitar riff, adjusts volume' },
    { label: 'advanced', desc: 'Anticipates phrasing, comping for soloists' },
    { label: 'expert', desc: 'Dynamic shape, pushes & pulls energy' }
  ]},
  { domain: 'Musicality & Repertoire', id: 'versatility', title: 'Stylistic Versatility', levels: [
    { label: 'novice', desc: 'Rock, Pop' },
    { label: 'intermediate', desc: 'Jazz, Funk, Shuffles' },
    { label: 'advanced', desc: 'Afro-Cuban, Brazilian, odd-meter' },
    { label: 'expert', desc: 'Chameleon, authentic cultural language' }
  ]},
  { domain: 'Musicality & Repertoire', id: 'improvisation', title: 'Soloing & Improvisation', levels: [
    { label: 'novice', desc: '4-bar drum fill' },
    { label: 'intermediate', desc: 'Structured 8-bar solo' },
    { label: 'advanced', desc: 'Trades 4s, thematic development' },
    { label: 'expert', desc: 'Conversational, tension & release' }
  ]}
];
