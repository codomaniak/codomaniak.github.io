#!/usr/bin/env python3
"""Rebuild exercise pool + workout-data.js from raw ODT parses."""
import json, re, hashlib
from collections import defaultdict, Counter
from pathlib import Path

ROOT = Path(__file__).parent
RAW = ROOT / "workout-data-raw.json"
OUT_POOL = ROOT / "exercise-pool.json"
OUT_JS = ROOT / "workout-data.js"

# Order matters: more specific patterns first
PATTERNS = [
    # Legs that are often misread as arms
    (r'сгибани\w*\s+(?:лежа\s+на\s+)?бицепс\s+бедр', 'legs', 'isolation'),
    (r'сгибани\w*\s+сидя\s*(?:в\s*)?(?:тренаж)?', 'legs', 'isolation'),
    (r'разгибани\w*\s+ног', 'legs', 'isolation'),
    (r'разгибани\w*\s+сидя(?:\s+\d|\s*~|\s*\()', 'legs', 'isolation'),

    # Triceps before generic push-ups
    (r'обратн\w*\s+отжиман', 'triceps', 'isolation'),
    (r'отжиман\w*\s+(?:на\s+)?триц', 'triceps', 'isolation'),
    (r'на\s+триц\w*\s+от\s+скамь', 'triceps', 'isolation'),
    (r'от\s+скамьи\s+на\s+(?:триц|рицепс)', 'triceps', 'isolation'),
    (r'француз', 'triceps', 'isolation'),
    (r'разгибан\w*.*трицепс|трицепс.*разгибан', 'triceps', 'isolation'),
    (r'разгибан\w*\s+(?:из[\-\s]?за|изза)\s+голов', 'triceps', 'isolation'),
    (r'разгибан\w*\s+(?:с\s+)?(?:гантел|на\s+блоке|с\s+косичк)', 'triceps', 'isolation'),
    (r'разгибан\w*\s+на\s+блоке', 'triceps', 'isolation'),
    (r'дьявольск', 'triceps', 'isolation'),

    # Back first — "подтягивания на бицепс" is still a pull
    (r'подтяг', 'back', 'compound'),
    (r'горизонтальн\w*\s+(?:блок|тяг)', 'back', 'compound'),
    (r'вертикальн\w*\s+(?:блок|тяг)', 'back', 'compound'),
    (r'тяга\s+(?:штанги|гантел|в\s+наклоне|к\s+поясу|горизонт|рычаж)', 'back', 'compound'),
    (r'пуловер', 'back', 'isolation'),
    (r'тяга\s+ко?\s*лбу', 'back', 'isolation'),
    (r'гиперэкстенз', 'back', 'isolation'),

    # Biceps (after back so pull-ups win)
    (r'молоточ', 'biceps', 'isolation'),
    (r'сгибани\w*\s+(?:с\s+)?(?:изогнут|гантел|гриф)|удержание\w*\s+(?:гири|на\s+бицепс)|на\s+бицепс(?!\s*бедр)', 'biceps', 'isolation'),

    # Shoulders before chest (army press / standing press)
    (r'армейск|арм\.?\s*жим', 'shoulders', 'compound'),
    (r'жим\s+(?:гантел|штан|гриф)\w*.*стоя', 'shoulders', 'compound'),
    (r'жим\s+стоя', 'shoulders', 'compound'),
    (r'жим\s+гантел\w*\s+сидя(?!\s*на\s*(?:наклон|горизонт|скамь))', 'shoulders', 'compound'),
    (r'махи\s+в\s+сторон|отведен\w*\s+(?:в\s+)?сторон', 'shoulders', 'isolation'),
    (r'задн\w*\s+дельт|на\s+заднюю\s+дельт', 'shoulders', 'isolation'),
    (r'тяга\s+к\s+подбородк', 'shoulders', 'isolation'),

    # Chest
    (r'брусь', 'chest', 'compound'),
    (r'разводк', 'chest', 'isolation'),
    (r'хаммер|верх\s+грудн', 'chest', 'compound'),
    (r'жим\s+(?:гантел|грифа|штанги).*(?:наклон|горизонт|лежа|скамь)', 'chest', 'compound'),
    (r'жим\s+(?:гантел|грифа|штанги|в\s+хаммере)', 'chest', 'compound'),
    (r'отжиман(?!\s*(?:на\s*)?триц)', 'chest', 'compound'),

    # Cardio / conditioning (before legs so скакалка isn't tagged as legs)
    (r'скакал', 'cardio', 'cardio'),
    (r'гребн', 'cardio', 'cardio'),
    (r'байк|вело', 'cardio', 'cardio'),
    (r'лыжн', 'cardio', 'cardio'),
    (r'\d+\s*кал\b', 'cardio', 'cardio'),
    (r'берпи', 'cardio', 'cardio'),
    (r'махи\s+гир', 'cardio', 'cardio'),

    # Legs — compounds, then explosive, then accessory
    (r'псшнс|пшнс|присед|гоблет|плие', 'legs', 'compound'),
    (r'выпад|пистол|трастер|болгарск', 'legs', 'compound'),
    (r'румынск|станова|тяга\s+со\s+стоек', 'legs', 'compound'),
    (r'выпрыг|запрыг|взрывн', 'legs', 'explosive'),
    (r'восхожден|коробк', 'legs', 'explosive'),
    (r'стульчик|подь?ем\w*\s+на\s+носки', 'legs', 'accessory'),

    # Core (includes timed holds: "30 сек планка")
    (r'скручив|планк|ролик|ситап|hollow|уголок|скалолаз', 'core', 'core'),
    (r'русск\w*\s+подь?ем|турецк|иголочк|колен\w*\s+к\s+(?:груд|локг|локт)|поднос', 'core', 'core'),
    (r'броск\w*\s+мяч|мячик', 'core', 'core'),
    (r'боков\w*\s+(?:скруч|планк)', 'core', 'core'),
]

FREE = re.compile(r'гантел|штан|гриф|гир|диск', re.I)
MACHINE = re.compile(r'блок|тренаж|хаммер|кроссовер|трх|trx|резин|петл|ghd', re.I)

# Reject noisy / multi-move fragments from the pool
REJECT = re.compile(
    r'(сделать|выполнить|на время|лимит|выйдет|большой отдых|если вдруг|'
    r'емom|емом|работать по минут|цель дойти|т\.е\.|вместо)',
    re.I
)


def classify(text):
    t = text.lower()
    for pat, muscle, kind in PATTERNS:
        if re.search(pat, t):
            equip = 'machine' if MACHINE.search(t) else ('free' if FREE.search(t) else 'bodyweight')
            return muscle, kind, equip
    return None, None, None


def split_parts(text):
    core = re.sub(r'^[\s•\-\*]*(?:\d+\s*(?:суперсет\w*|трисет\w*|сет\w*|круга?\w*)[:\s]*)?', '', text, flags=re.I)
    return [p.strip() for p in re.split(r'\s*\+\s*', core) if p.strip() and len(p.strip()) > 8]


HOLD_WORDS = re.compile(r'планк|удержан|стульчик|уголок|вис\b|hollow', re.I)


def is_clean_single(text):
    """Prefer atomic exercise descriptions for the pool."""
    if REJECT.search(text):
        return False
    if text.count('+') >= 2:
        return False  # tri-sets / circuits
    if text.count('+') == 1 and len(text) > 120:
        return False
    if len(text) > 160:
        return False
    words = re.findall(r'[а-яa-zё]{3,}', text.lower())
    if len(words) < 2:
        return False
    # Allow "30 сек планка" / "1 мин планка" — timed holds, not junk
    if words[0] in ('сек', 'мин', 'кал'):
        if not HOLD_WORDS.search(text) and words[0] != 'кал':
            # "кал байк/гребной" is cardio; other bare units without hold = skip
            if not re.search(r'байк|гребн|лыжн|скакал', text, re.I):
                return False
    elif words[0] in ('после', 'каждый', 'каждого', 'если'):
        return False
    if text.strip().startswith(('подряд', 'нечетный', 'чётный', 'четный')):
        return False
    return True


def normalize(text):
    t = text.lower()
    # Strip load numbers, but keep "сек"/"мин" so "30 сек планка" ≠ bare "планка"
    t = re.sub(r'\d+([.,]\d+)?\s*(кг|кал|см|м)\b', '', t)
    t = re.sub(r'\d+([.,]\d+)?(?=\s*(?:сек|мин)\b)', '', t)
    t = re.sub(r'\d+', '', t)
    t = re.sub(r'[()\[\],.:;!~\-+*/]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t[:55]


def extract_from_block(block_text, block_type):
    results = []
    text = block_text.strip()
    if not text or len(text) < 8:
        return results
    if REJECT.match(text):
        return results

    is_ss = block_type in ('superset', 'triset') or bool(re.search(r'суперсет|трисет', text, re.I))
    chunks = split_parts(text) if (is_ss or '+' in text) else [text]

    for chunk in chunks:
        chunk = re.sub(r'^[\s•\-\*]+', '', chunk).strip()
        if not is_clean_single(chunk):
            continue
        muscle, kind, equip = classify(chunk)
        if muscle:
            results.append({'text': chunk[:160], 'muscle': muscle, 'kind': kind, 'equip': equip})
    return results


def build_pool():
    raw = json.loads(RAW.read_text(encoding='utf-8'))
    pool = defaultdict(list)
    seen = set()
    for entry in raw:
        for w in entry['workouts'].values():
            for b in w['blocks']:
                for ex in extract_from_block(b['text'], b['type']):
                    norm = normalize(ex['text'])
                    if norm in seen or len(norm) < 8:
                        continue
                    seen.add(norm)
                    pool[ex['muscle']].append({
                        'id': hashlib.md5(norm.encode()).hexdigest()[:8],
                        'text': ex['text'],
                        'muscle': ex['muscle'],
                        'kind': ex['kind'],
                        'equip': ex['equip'],
                        'source': entry['file'].replace('.odt', ''),
                    })
    return dict(pool)


HEADER = r'''// Workout planner data — generated from /home/lakonika/Documents/workouts/
// Rebuild: python3 rebuild-data.py

const MUSCLE_GROUPS = {
  back: { label: 'Back', short: 'Back', color: '#3f6a9b', bg: '#eaf0fa', icon: '🔙' },
  arms: { label: 'Arms', short: 'Arms', color: '#7a6a9b', bg: '#f0eaf8', icon: '💪' },
  chest: { label: 'Chest', short: 'Chest', color: '#9b6a7a', bg: '#f8eaef', icon: '🫁' },
  legs: { label: 'Legs', short: 'Legs', color: '#6a9b8a', bg: '#eaf5f0', icon: '🦵' },
  core: { label: 'Core', short: 'Core', color: '#9b8a6a', bg: '#f8f5ea', icon: '🎯' },
  cardio: { label: 'Cardio', short: 'Cardio', color: '#a06a30', bg: '#fef6ea', icon: '❤️' }
};

const SESSION_TYPES = {
  back_arms: { label: 'Back & Arms', focus: ['back', 'arms'], groups: ['back', 'arms'] },
  chest_arms_core: { label: 'Chest, Arms & Core', focus: ['chest', 'arms', 'core'], groups: ['chest', 'arms', 'core'] },
  legs_core: { label: 'Legs & Core', focus: ['legs', 'core'], groups: ['legs', 'core'] },
  full_body: { label: 'Full Body Finisher', focus: ['back', 'chest', 'legs', 'core'], groups: ['back', 'chest', 'legs', 'core', 'arms'] }
};

const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Focus on form, lighter loads, 3 sessions/week (~60 min)', sessionsPerWeek: 3, minDuration: 50, maxDuration: 70, levelFilter: ['beginner'], scoreMax: 2.0 },
  { id: 'intermediate', label: 'Intermediate', desc: 'Balanced volume, supersets & EMOMs, 3–4 sessions/week (~75 min)', sessionsPerWeek: 4, minDuration: 60, maxDuration: 85, levelFilter: ['beginner', 'intermediate'], scoreMax: 3.0 },
  { id: 'advanced', label: 'Advanced', desc: 'Higher intensity, complex formats, 4 sessions/week (~90 min)', sessionsPerWeek: 4, minDuration: 70, maxDuration: 90, levelFilter: ['intermediate', 'advanced'], scoreMax: 4.0 },
  { id: 'expert', label: 'Expert', desc: 'Maximum challenge — for-time, heavy compounds, 4 sessions/week', sessionsPerWeek: 4, minDuration: 75, maxDuration: 90, levelFilter: ['intermediate', 'advanced', 'expert'], scoreMax: 99 }
];

const EVAL_AREAS = [
  { id: 'back', title: 'Back & Pulling', domain: 'Upper Body', levels: [
    { label: 'beginner', desc: 'Assisted pull-ups, light rows' },
    { label: 'intermediate', desc: 'Pull-ups, barbell/dumbbell rows, lat pulldowns' },
    { label: 'advanced', desc: 'Weighted pull-ups, heavy rows, EMOM finishers' },
    { label: 'expert', desc: 'High-volume pulling, complex supersets' }
  ]},
  { id: 'arms', title: 'Arms & Shoulders', domain: 'Upper Body', levels: [
    { label: 'beginner', desc: 'Light curls, pushdowns, lateral raises' },
    { label: 'intermediate', desc: 'Supersets, hammer curls, overhead press' },
    { label: 'advanced', desc: 'Devil press, heavy curls, dip variations' },
    { label: 'expert', desc: 'Complex arm circuits, grip work' }
  ]},
  { id: 'chest', title: 'Chest & Push', domain: 'Upper Body', levels: [
    { label: 'beginner', desc: 'Incline press, assisted dips, push-ups' },
    { label: 'intermediate', desc: 'Bench press, dips with band, flyes' },
    { label: 'advanced', desc: 'Heavy bench, ring dips, for-time circuits' },
    { label: 'expert', desc: 'Strict HSPU progressions, heavy supersets' }
  ]},
  { id: 'legs', title: 'Legs & Glutes', domain: 'Lower Body', levels: [
    { label: 'beginner', desc: 'Goblet squats, lunges, bodyweight' },
    { label: 'intermediate', desc: 'Back squats, RDL, step-ups' },
    { label: 'advanced', desc: 'Heavy squats, pistols, box jumps' },
    { label: 'expert', desc: 'Complex leg EMOMs, heavy singles' }
  ]},
  { id: 'core', title: 'Core & Stability', domain: 'Midline', levels: [
    { label: 'beginner', desc: 'Planks, crunches, dead bugs' },
    { label: 'intermediate', desc: 'Roman chair, ab wheel, side planks' },
    { label: 'advanced', desc: 'Turkish get-ups, L-sits, hollow holds' },
    { label: 'expert', desc: 'Complex core circuits, weighted carries' }
  ]}
];

const STATUS_TYPES = [
  { id: 'done', icon: '✅', label: 'Complete', desc: 'Workout finished — log weights and how it felt' },
  { id: 'partial', icon: '⚠️', label: 'Partial', desc: 'Cut short or scaled — note what to adjust' },
  { id: 'progress', icon: '🔄', label: 'In progress', desc: 'Currently working through this session' }
];

'''

GENERATOR = r'''
const MUSCLE_TO_FOCUS = {
  back: 'back', chest: 'chest', legs: 'legs', core: 'core',
  biceps: 'arms', triceps: 'arms', shoulders: 'arms',
  cardio: 'cardio'
};

/**
 * Three superset types:
 * 1) antagonistic — opposite movements (chest–back, biceps–triceps)
 * 2) distant — far-apart muscles (chest–biceps, back–triceps, legs–core…)
 * 3) same — two different exercises for one muscle (prefer free → machine)
 */
const SUPERSET_PAIRS = {
  antagonistic: [
    ['chest', 'back'],
    ['biceps', 'triceps'],
  ],
  distant: [
    ['chest', 'biceps'],
    ['back', 'triceps'],
    ['chest', 'triceps'],
    ['back', 'biceps'],
    ['shoulders', 'biceps'],
    ['shoulders', 'triceps'],
    ['legs', 'shoulders'],
    ['legs', 'biceps'],
    ['legs', 'triceps'],
    ['back', 'core'],
    ['chest', 'core'],
    ['legs', 'core'],
  ]
};

/**
 * Three triset recipes (strength → interval → cardio / isolation)
 */
const TRISET_RECIPES = {
  fatburn: {
    id: 'fatburn',
    label: 'жиросжигание',
    desc: 'силовое → взрывное → кардио',
    slots: [
      { role: 'силовое', muscles: ['legs'], preferKind: 'compound', dose: '8–10 повт.' },
      { role: 'взрывное', muscles: ['legs'], preferKind: 'explosive', dose: '15–20 сек' },
      { role: 'кардио', muscles: ['cardio'], preferKind: 'cardio', dose: '30–40 сек' }
    ]
  },
  core_relief: {
    id: 'core_relief',
    label: 'корсет и рельеф',
    desc: 'тяга → кор/статодинамика → кардио',
    slots: [
      { role: 'силовое', muscles: ['legs'], preferKind: 'compound', preferText: /румын|станова|тяг/, dose: '8–10 повт.' },
      { role: 'кор / интервал', muscles: ['core'], preferKind: 'core', preferText: /планк|скалолаз|уголок/, dose: '40–45 сек' },
      { role: 'кардио', muscles: ['cardio'], preferKind: 'cardio', dose: '40–45 сек' }
    ]
  },
  upper_cardio: {
    id: 'upper_cardio',
    label: 'верх + кардио',
    desc: 'база верха → изоляция → кардио',
    slots: [
      { role: 'силовое', muscles: ['chest', 'back'], preferKind: 'compound', dose: '8–10 повт.' },
      { role: 'изоляция', muscles: ['biceps', 'triceps', 'shoulders'], preferKind: 'isolation', dose: '10–12 повт.' },
      { role: 'кардио', muscles: ['cardio'], preferKind: 'cardio', dose: '30 сек' }
    ]
  }
};

const SESSION_BLUEPRINTS = {
  back_arms: {
    label: 'Back & Arms',
    focus: ['back', 'arms'],
    steps: [
      { form: 'main', muscle: 'back', preferKind: 'compound', preferEquip: null, sets: '4×8–12' },
      { form: 'superset', preferredTypes: ['same'], muscle: 'back', sets: '3–4' },
      { form: 'superset', preferredTypes: ['antagonistic'], muscles: ['biceps', 'triceps'], sets: '3–4' },
      { form: 'triset', recipe: 'upper_cardio', strengthMuscle: 'back', sets: '3' },
      { form: 'main', muscle: 'core', preferKind: 'core', sets: '3×30–45 сек' }
    ]
  },
  chest_arms_core: {
    label: 'Chest, Arms & Core',
    focus: ['chest', 'arms', 'core'],
    steps: [
      { form: 'main', muscle: 'chest', preferKind: 'compound', preferEquip: 'free', sets: '4×8–12' },
      { form: 'superset', preferredTypes: ['same'], muscle: 'chest', sets: '3–4' },
      { form: 'superset', preferredTypes: ['distant'], muscles: ['shoulders', 'triceps'], sets: '3–4' },
      { form: 'triset', recipe: 'upper_cardio', strengthMuscle: 'chest', sets: '3' },
      { form: 'main', muscle: 'core', preferKind: 'core', sets: '3×30–45 сек' }
    ]
  },
  legs_core: {
    label: 'Legs & Core',
    focus: ['legs', 'core'],
    steps: [
      { form: 'main', muscle: 'legs', preferKind: 'compound', sets: '4–5×8–12' },
      { form: 'superset', preferredTypes: ['same'], muscle: 'legs', sets: '3–4' },
      { form: 'triset', recipe: 'fatburn', sets: '3–4' },
      { form: 'triset', recipe: 'core_relief', sets: '3' },
      { form: 'main', muscle: 'core', preferKind: 'core', sets: '3×30–45 сек' }
    ]
  },
  full_body: {
    label: 'Full Body',
    focus: ['back', 'chest', 'legs', 'core'],
    steps: [
      { form: 'superset', preferredTypes: ['antagonistic'], muscles: ['chest', 'back'], sets: '3–4' },
      { form: 'triset', recipe: 'fatburn', sets: '3' },
      { form: 'superset', preferredTypes: ['antagonistic'], muscles: ['biceps', 'triceps'], sets: '3' },
      { form: 'triset', recipe: 'core_relief', sets: '3' },
      { form: 'main', muscle: 'core', preferKind: 'core', sets: '3×30–45 сек' }
    ]
  }
};

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function exerciseNorm(text) {
  return String(text).toLowerCase()
    .replace(/\d+([.,]\d+)?\s*(кг|кал|см|м)\b/g, '')
    .replace(/\d+([.,]\d+)?(?=\s*(?:сек|мин)\b)/g, '')
    .replace(/\d+/g, '')
    .replace(/[()\[\],.:;!~\-+*/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50);
}

/** Collapse near-duplicates: "отжимания на трицепс" ≈ "на триц от скамьи" */
function exerciseStem(text) {
  let t = exerciseNorm(text)
    .replace(/триц\w*/g, 'трицепс')
    .replace(/подтяг\w*/g, 'подтягивания')
    .replace(/отжиман\w*/g, 'отжимания')
    .replace(/сгибани\w*/g, 'сгибания')
    .replace(/разгибан\w*/g, 'разгибания')
    .replace(/гиперэкстенз\w*/g, 'гиперэкстензия')
    .replace(/присед\w*/g, 'присед')
    .replace(/выпад\w*/g, 'выпады')
    .replace(/жим\w*/g, 'жим')
    .replace(/тяг\w*/g, 'тяга')
    .replace(/скручив\w*/g, 'скручивания')
    .replace(/планк\w*/g, 'планка')
    .replace(/скакал\w*/g, 'скакалка')
    .replace(/гребн\w*/g, 'гребной');
  const keys = t.split(' ').filter(w => w.length > 2).slice(0, 4);
  return keys.join(' ');
}

function poolFor(muscle) {
  return EXERCISE_POOL[muscle] || [];
}

function pickExercise(muscle, rand, usedNorms, preferKind, preferEquip, preferText) {
  let pool = poolFor(muscle);
  if (!pool.length) return null;

  let candidates = pool.filter(e => {
    const n = exerciseNorm(e.text);
    const s = exerciseStem(e.text);
    if (usedNorms.has(n) || usedNorms.has('stem:' + s)) return false;
    return true;
  });
  if (!candidates.length) return null;

  const score = (e) => {
    let s = 0;
    if (preferKind && e.kind === preferKind) s += 4;
    if (preferEquip && e.equip === preferEquip) s += 2;
    if (preferText && preferText.test(e.text)) s += 5;
    if (e.text.length < 80) s += 1;
    if (!e.text.includes('+')) s += 1;
    return s;
  };

  candidates.sort((a, b) => score(b) - score(a) || a.text.length - b.text.length);
  const top = candidates.slice(0, Math.min(8, candidates.length));
  const pick = top[Math.floor(rand() * top.length)];
  usedNorms.add(exerciseNorm(pick.text));
  usedNorms.add('stem:' + exerciseStem(pick.text));
  return pick;
}

function pickFromMuscles(muscles, rand, usedNorms, preferKind, preferText) {
  const order = muscles.slice();
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (const m of order) {
    const ex = pickExercise(m, rand, usedNorms, preferKind, null, preferText);
    if (ex) return ex;
  }
  for (const m of order) {
    const ex = pickExercise(m, rand, usedNorms, null, null, preferText);
    if (ex) return ex;
  }
  return null;
}

function pickSupersetPair(step, rand, usedNorms) {
  const preferred = step.preferredTypes || ['same', 'antagonistic', 'distant'];

  if (preferred.includes('same') && step.muscle) {
    const first = pickExercise(step.muscle, rand, usedNorms, 'compound', 'free')
      || pickExercise(step.muscle, rand, usedNorms, 'compound')
      || pickExercise(step.muscle, rand, usedNorms);
    if (!first) return null;
    const second = pickExercise(step.muscle, rand, usedNorms, 'isolation', 'machine')
      || pickExercise(step.muscle, rand, usedNorms, 'isolation')
      || pickExercise(step.muscle, rand, usedNorms, 'accessory', 'machine')
      || pickExercise(step.muscle, rand, usedNorms, 'accessory')
      || pickExercise(step.muscle, rand, usedNorms, null, 'machine')
      || pickExercise(step.muscle, rand, usedNorms);
    if (!second) {
      usedNorms.delete(exerciseNorm(first.text));
      usedNorms.delete('stem:' + exerciseStem(first.text));
      return null;
    }
    return { type: 'same', typeLabel: 'одна группа мышц', a: first, b: second };
  }

  const muscles = step.muscles || (step.muscle ? [step.muscle] : []);
  const pairCandidates = [];
  for (const type of preferred) {
    if (type === 'same') continue;
    for (const [a, b] of (SUPERSET_PAIRS[type] || [])) {
      if (muscles.length === 1) {
        if (a === muscles[0] || b === muscles[0]) pairCandidates.push({ type, a, b });
      } else if (muscles.length >= 2) {
        if (muscles.includes(a) && muscles.includes(b)) pairCandidates.push({ type, a, b });
      } else {
        pairCandidates.push({ type, a, b });
      }
    }
  }

  for (let i = pairCandidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pairCandidates[i], pairCandidates[j]] = [pairCandidates[j], pairCandidates[i]];
  }

  for (const pair of pairCandidates) {
    const preferA = (pair.a === 'chest' || pair.a === 'back' || pair.a === 'legs' || pair.a === 'shoulders') ? 'compound' : null;
    const preferB = (pair.b === 'chest' || pair.b === 'back' || pair.b === 'legs' || pair.b === 'shoulders') ? 'compound' : null;
    const exA = pickExercise(pair.a, rand, usedNorms, preferA);
    if (!exA) continue;
    const exB = pickExercise(pair.b, rand, usedNorms, preferB);
    if (!exB) {
      usedNorms.delete(exerciseNorm(exA.text));
      usedNorms.delete('stem:' + exerciseStem(exA.text));
      continue;
    }
    const typeLabel = pair.type === 'antagonistic' ? 'антагонисты' : 'далёкие группы';
    return { type: pair.type, typeLabel, a: exA, b: exB };
  }
  return null;
}

function pickTriset(step, rand, usedNorms) {
  const recipe = TRISET_RECIPES[step.recipe];
  if (!recipe) return null;
  const picks = [];
  for (let i = 0; i < recipe.slots.length; i++) {
    const slot = recipe.slots[i];
    let muscles = slot.muscles.slice();
    // Upper-body recipe: lock first slot to session strength focus when given
    if (i === 0 && step.strengthMuscle) muscles = [step.strengthMuscle];
    const preferText = slot.preferText || null;
    const ex = pickFromMuscles(muscles, rand, usedNorms, slot.preferKind, preferText);
    if (!ex) {
      // rollback
      for (const p of picks) {
        usedNorms.delete(exerciseNorm(p.ex.text));
        usedNorms.delete('stem:' + exerciseStem(p.ex.text));
      }
      return null;
    }
    picks.push({ role: slot.role, dose: slot.dose, ex });
  }
  return { recipe, picks };
}

function scaleBlockText(text, level) {
  if (level === 'intermediate') return text;
  if (level === 'beginner') {
    return text
      .replace(/(\d+)\s*кг/g, (m, w) => `${Math.max(2, Math.round(Number(w) * 0.7))}кг`)
      .replace(/(\d+)\s*[xх×]\s*(\d+)/g, (m, s, r) => `${Math.max(2, Number(s) - 1)}×${Math.max(5, Number(r) - 2)}`);
  }
  if (level === 'advanced' || level === 'expert') {
    return text.replace(/(\d+)\s*кг/g, (m, w) => `${Math.round(Number(w) * 1.15)}кг`);
  }
  return text;
}

function formatMainBlock(ex, sets, level) {
  return {
    text: `• ${sets}: ${scaleBlockText(ex.text, level)}`,
    type: 'sets',
    groups: [MUSCLE_TO_FOCUS[ex.muscle] || ex.muscle],
    muscles: [ex.muscle],
    pairType: null,
    sources: [ex.source]
  };
}

function formatSupersetBlock(pair, sets, level) {
  const groups = [...new Set([
    MUSCLE_TO_FOCUS[pair.a.muscle] || pair.a.muscle,
    MUSCLE_TO_FOCUS[pair.b.muscle] || pair.b.muscle
  ])];
  return {
    text: `• ${sets} суперсета (${pair.typeLabel}):\n- ${scaleBlockText(pair.a.text, level)}\n- ${scaleBlockText(pair.b.text, level)}`,
    type: 'superset',
    groups,
    muscles: [pair.a.muscle, pair.b.muscle],
    pairType: pair.type,
    sources: [pair.a.source, pair.b.source]
  };
}

function formatTrisetBlock(triset, sets, level) {
  const groups = [...new Set(triset.picks.map(p => MUSCLE_TO_FOCUS[p.ex.muscle] || p.ex.muscle))];
  const lines = triset.picks.map(p =>
    `- [${p.role}, ${p.dose}] ${scaleBlockText(p.ex.text, level)}`
  ).join('\n');
  return {
    text: `• ${sets} трисета (${triset.recipe.label} — ${triset.recipe.desc}):\n${lines}`,
    type: 'triset',
    groups,
    muscles: triset.picks.map(p => p.ex.muscle),
    pairType: triset.recipe.id,
    sources: triset.picks.map(p => p.ex.source)
  };
}

function estimateDuration(blocks) {
  let total = 8;
  for (const b of blocks) {
    if (b.type === 'triset') total += 16;
    else if (b.type === 'superset') total += 14;
    else total += 10;
  }
  return Math.min(90, Math.max(55, total));
}

function composeSession(typeKey, level, weekNum, sessionIdx, usedExerciseNorms) {
  const blueprint = SESSION_BLUEPRINTS[typeKey] || SESSION_BLUEPRINTS.back_arms;
  const rand = seededRandom(hashSeed(`${level}-w${weekNum}-${typeKey}-${sessionIdx}-v4`));
  const usedNorms = usedExerciseNorms || new Set();
  const blocks = [];

  for (const step of blueprint.steps) {
    if (step.form === 'main') {
      const ex = pickExercise(step.muscle, rand, usedNorms, step.preferKind, step.preferEquip);
      if (ex) blocks.push(formatMainBlock(ex, step.sets, level));
    } else if (step.form === 'superset') {
      const pair = pickSupersetPair(step, rand, usedNorms);
      if (pair) {
        blocks.push(formatSupersetBlock(pair, step.sets, level));
      } else if (step.muscle) {
        const a = pickExercise(step.muscle, rand, usedNorms, 'compound');
        const b = pickExercise(step.muscle, rand, usedNorms, 'isolation');
        if (a) blocks.push(formatMainBlock(a, step.sets, level));
        if (b) blocks.push(formatMainBlock(b, '3×12–15', level));
      }
    } else if (step.form === 'triset') {
      const triset = pickTriset(step, rand, usedNorms);
      if (triset) blocks.push(formatTrisetBlock(triset, step.sets, level));
    }
  }

  if (blocks.length < 4) return null;

  return {
    id: `${weekNum}-${typeKey}-${sessionIdx}`,
    type: typeKey,
    label: blueprint.label,
    focus: blueprint.focus,
    source: 'composed',
    durationMin: estimateDuration(blocks),
    blocks: blocks.map((b, i) => ({
      id: `${weekNum}-${typeKey}-${sessionIdx}-b${i}`,
      ...b
    }))
  };
}

function generateWeekPlan(level, weekNum, sessionsOverride) {
  const lvl = LEVELS.find(l => l.id === level) || LEVELS[1];
  const count = sessionsOverride || lvl.sessionsPerWeek;
  const usedExerciseNorms = new Set();
  const sessions = [];

  const sequence = count <= 3
    ? ['back_arms', 'chest_arms_core', 'legs_core']
    : ['back_arms', 'chest_arms_core', 'legs_core', 'full_body'];

  for (let i = 0; i < count; i++) {
    const type = sequence[i];
    const session = composeSession(type, level, weekNum, i, usedExerciseNorms);
    if (session) sessions.push({ ...session, daySlot: i + 1 });
  }

  return {
    week: weekNum,
    level,
    sessionsPerWeek: count,
    sessions,
    generatedAt: new Date().toISOString()
  };
}

function blockCheckKey(weekNum, sessionId, blockId) {
  return `w${weekNum}-${sessionId}-${blockId}`;
}

function sessionStatusKey(weekNum, sessionId) {
  return `w${weekNum}-${sessionId}-status`;
}

// Compatibility stub for index.html stats
const WORKOUT_LIBRARY = {
  back_arms: Array(EXERCISE_POOL.back?.length || 0),
  chest_arms_core: Array((EXERCISE_POOL.chest?.length || 0) + (EXERCISE_POOL.triceps?.length || 0)),
  legs_core: Array(EXERCISE_POOL.legs?.length || 0)
};
'''


def write_js(pool):
    body = HEADER + 'const EXERCISE_POOL = ' + json.dumps(pool, ensure_ascii=False) + ';\n' + GENERATOR
    OUT_JS.write_text(body, encoding='utf-8')
    OUT_POOL.write_text(json.dumps(pool, ensure_ascii=False, indent=2), encoding='utf-8')


def main():
    pool = build_pool()
    write_js(pool)
    total = sum(len(v) for v in pool.values())
    print(f'Pool: {total} exercises')
    for m, items in sorted(pool.items()):
        print(f'  {m}: {len(items)}  {dict(Counter(i["kind"] for i in items))}  {dict(Counter(i["equip"] for i in items))}')
        # sanity spot-check
        bad = [i['text'] for i in items if ('бедр' in i['text'].lower() and m == 'biceps')
               or ('триц' in i['text'].lower() and m == 'chest')
               or ('армейск' in i['text'].lower() and m == 'chest')
               or ('ног' in i['text'].lower() and 'разгибан' in i['text'].lower() and m == 'triceps')]
        if bad:
            print(f'    !! suspects: {bad[:3]}')


if __name__ == '__main__':
    main()
