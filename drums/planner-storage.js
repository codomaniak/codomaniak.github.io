/**
 * Shared planner state — localStorage load/save, groove + per-song notation.
 * Used by planner.html and library.html.
 */
const PlannerStorage = (function () {
  const STORAGE_KEY = 'drums-planner-v3';

  function newId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function blankMapSections() {
    return ARRANGEMENT_SECTIONS.map(s => ({
      label: s.label,
      bars: '',
      description: '',
      drumFocus: ''
    }));
  }

  function normalizeSections(sections) {
    if (Array.isArray(sections)) {
      return sections.map(row => ({
        label: row.label || row.name || '',
        bars: row.bars || '',
        description: row.description || '',
        drumFocus: row.drumFocus || ''
      }));
    }
    if (sections && typeof sections === 'object') {
      const fromKeys = ARRANGEMENT_SECTIONS.map(s => {
        const row = sections[s.key] || {};
        return {
          label: s.label,
          bars: row.bars || '',
          description: row.description || '',
          drumFocus: row.drumFocus || ''
        };
      });
      const hasContent = fromKeys.some(r => r.bars || r.description || r.drumFocus);
      return hasContent ? fromKeys : blankMapSections();
    }
    return blankMapSections();
  }

  function createApplication(partial) {
    const p = partial || {};
    return {
      id: p.id || newId('app'),
      song: p.song || '',
      artist: p.artist || '',
      notes: p.notes || '',
      notation: typeof p.notation === 'string' ? p.notation : ''
    };
  }

  function normalizeApplication(a) {
    if (!a || typeof a !== 'object') return createApplication();
    return createApplication(a);
  }

  function normalizeGroove(m) {
    if (!m || typeof m !== 'object') return createEmptyGroove('Untitled groove');
    const apps = Array.isArray(m.applications)
      ? m.applications.map(normalizeApplication)
      : [];
    if (!m.pattern && !m.style && !m.level && (m.title || m.artist) && !apps.length) {
      apps.push(createApplication({
        song: m.title || '',
        artist: m.artist || '',
        notes: 'Migrated from song map'
      }));
    }
    return {
      id: m.id || newId('groove'),
      name: m.name || m.title || 'Untitled groove',
      style: m.style || '',
      level: GROOVE_LEVELS.includes(m.level) ? m.level : 'beginner',
      pattern: m.pattern || '',
      tempoRange: m.tempoRange || m.tempo || '',
      notes: m.notes || '',
      source: m.source || '',
      notation: typeof m.notation === 'string' ? m.notation : '',
      sections: normalizeSections(m.sections),
      applications: apps,
      updatedAt: m.updatedAt || new Date().toISOString()
    };
  }

  function createEmptyGroove(name, extras) {
    const e = extras || {};
    const titleLine = `Title: ${name}`;
    const notation = e.notation ||
      (typeof EMPTY_DRUMS_NOTATION === 'string'
        ? EMPTY_DRUMS_NOTATION.replace(/^Title:.*$/m, titleLine)
        : '');
    return normalizeGroove({
      id: newId('groove'),
      name,
      style: e.style || '',
      level: e.level || 'beginner',
      pattern: e.pattern || '',
      tempoRange: e.tempoRange || e.tempo || '',
      notes: e.notes || '',
      source: e.source || '',
      notation,
      applications: (e.applications || []).map(normalizeApplication),
      sections: blankMapSections(),
      updatedAt: new Date().toISOString()
    });
  }

  function emptyState() {
    return {
      checks: {},
      eval: {},
      monthStatus: {},
      days: {},
      monthNotes: {},
      sessionMix: { ...DEFAULT_SESSION_MIX },
      projects: DEFAULT_PROJECTS.map(p => ({ ...p })),
      maps: [],
      activeMapId: null,
      activeAppId: null
    };
  }

  function migrateV1(old) {
    const days = {};
    for (const [date, d] of Object.entries(old.days || {})) {
      days[date] = { notes: d.notes || '' };
      if (d.rudiments) days[date].rudiments = true;
      if (d.coordination) days[date].coordination = true;
    }
    const monthStatus = {};
    for (const track of ALL_TRACKS) {
      for (let m = 1; m <= 6; m++) {
        if (old.checks && old.checks[`${track}-m${m}`]) {
          monthStatus[`${track}-m${m}-status`] = 'done';
        }
      }
    }
    return {
      checks: old.checks || {},
      eval: old.eval || {},
      monthStatus,
      days,
      monthNotes: old.monthNotes || {}
    };
  }

  function migrateV3(old) {
    const base = {
      ...emptyState(),
      checks: old.checks || {},
      eval: old.eval || {},
      monthStatus: old.monthStatus || {},
      days: old.days || {},
      monthNotes: old.monthNotes || {}
    };
    if (!old.monthStatus) {
      for (const track of ALL_TRACKS) {
        for (let m = 1; m <= 6; m++) {
          if (old.checks && old.checks[`${track}-m${m}`]) {
            base.monthStatus[`${track}-m${m}-status`] = 'done';
          }
        }
      }
    }
    if (old.sessionMix && typeof old.sessionMix === 'object') {
      base.sessionMix = {
        technical: Number(old.sessionMix.technical) || DEFAULT_SESSION_MIX.technical,
        perception: Number(old.sessionMix.perception) || DEFAULT_SESSION_MIX.perception,
        musicality: Number(old.sessionMix.musicality) || DEFAULT_SESSION_MIX.musicality
      };
    }
    if (Array.isArray(old.projects) && old.projects.length) {
      base.projects = old.projects;
    }
    if (Array.isArray(old.maps)) {
      base.maps = old.maps.map(m => {
        const g = normalizeGroove(m);
        if (g.applications.length === 1 && g.notation.trim() && !g.applications[0].notation.trim()) {
          g.applications[0].notation = g.notation;
        }
        return g;
      });
      base.activeMapId = old.activeMapId || (base.maps[0] && base.maps[0].id) || null;
    }
    base.activeAppId = old.activeAppId || null;
    for (const [date, d] of Object.entries(base.days)) {
      base.days[date] = {
        ...d,
        bpm: d.bpm || '',
        song: d.song || '',
        techniques: Array.isArray(d.techniques) ? d.techniques : [],
        notes: d.notes || ''
      };
    }
    return base;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return migrateV3(JSON.parse(raw));
      const v2 = localStorage.getItem('drums-planner-v2');
      if (v2) return migrateV3(JSON.parse(v2));
      const legacy = localStorage.getItem('drums-planner-v1');
      if (legacy) return migrateV3(migrateV1(JSON.parse(legacy)));
    } catch (_) { /* ignore */ }
    return emptyState();
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Planner save failed — storage may be full', err);
      alert('Could not save: browser storage may be full. Export CSV as backup.');
      throw err;
    }
  }

  function getActiveMap(state) {
    return state.maps.find(m => m.id === state.activeMapId) || null;
  }

  function getActiveApplication(state, map) {
    const groove = map || getActiveMap(state);
    if (!groove || !groove.applications.length) return null;
    if (state.activeAppId) {
      const app = groove.applications.find(a => a.id === state.activeAppId);
      if (app) return app;
    }
    return groove.applications[0];
  }

  /** Notation shown in editor / preview for the active song. */
  function editorNotation(state, map) {
    const groove = map || getActiveMap(state);
    if (!groove) return '';
    const app = getActiveApplication(state, groove);
    if (app) return app.notation || '';
    return groove.notation || '';
  }

  /** Preview/play source — song override or groove template. */
  function effectiveNotation(state, map) {
    const groove = map || getActiveMap(state);
    if (!groove) return '';
    const app = getActiveApplication(state, groove);
    if (app && app.notation.trim()) return app.notation;
    return groove.notation || '';
  }

  function syncNotationTitle(notation, name) {
    if (!notation) return notation;
    if (/^Title:\s*/m.test(notation)) {
      return notation.replace(/^Title:\s*.*$/m, `Title: ${name}`);
    }
    return `Title: ${name}\n${notation}`;
  }

  function wrapObsidianFence(source) {
    return '```drums\n' + (source || '').trim() + '\n```';
  }

  function escapeAttr(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  function grooveChipLabel(m) {
    const style = m.style ? ` · ${m.style}` : '';
    return `${m.name}${style}`;
  }

  return {
    STORAGE_KEY,
    loadState,
    saveState,
    emptyState,
    normalizeGroove,
    createEmptyGroove,
    createApplication,
    normalizeApplication,
    getActiveMap,
    getActiveApplication,
    editorNotation,
    effectiveNotation,
    syncNotationTitle,
    wrapObsidianFence,
    escapeAttr,
    grooveChipLabel,
    blankMapSections,
    normalizeSections,
    newId
  };
})();
