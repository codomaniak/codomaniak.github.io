/**
 * Groove library + song projects — separate from the practice planner.
 */
(function () {
  let state = PlannerStorage.loadState();
  let notationHandle = null;
  let mapEditorFlush = null;
  let mapEditorDebounced = null;
  let mapEditorTimer = null;

  function save() {
    PlannerStorage.saveState(state);
    updateSaveHint();
  }

  function updateSaveHint() {
    const el = document.getElementById('library-save-hint');
    if (!el) return;
    el.textContent = 'Saved ' + new Date().toLocaleTimeString();
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  function flushMapEdits() {
    if (mapEditorTimer) {
      clearTimeout(mapEditorTimer);
      mapEditorTimer = null;
    }
    if (mapEditorFlush) mapEditorFlush();
  }

  function ensureActiveApp(map) {
    if (!map.applications.length) {
      state.activeAppId = null;
      return;
    }
    const app = PlannerStorage.getActiveApplication(state, map);
    state.activeAppId = app ? app.id : map.applications[0].id;
  }

  function notationHeaderControlsHtml(idPrefix, headers) {
    const h = headers || { tempo: 80, time: '4/4', grid: 16 };
    const timeOpts = NotationHeaders.TIME_OPTIONS.map(t =>
      `<option value="${t}"${h.time === t ? ' selected' : ''}>${t}</option>`
    ).join('');
    const gridOpts = NotationHeaders.GRID_OPTIONS.map(g =>
      `<option value="${g}"${h.grid === g ? ' selected' : ''}>${g}</option>`
    ).join('');
    return `
      <div class="notation-header-controls" id="${idPrefix}-header-controls">
        <label>Tempo<input type="number" id="${idPrefix}-tempo" min="20" max="300" value="${h.tempo}"></label>
        <label>Time<select id="${idPrefix}-time">${timeOpts}</select></label>
        <label>Grid<select id="${idPrefix}-grid">${gridOpts}</select></label>
      </div>`;
  }

  function readNotationHeaderControls(idPrefix) {
    const tempoEl = document.getElementById(`${idPrefix}-tempo`);
    const timeEl = document.getElementById(`${idPrefix}-time`);
    const gridEl = document.getElementById(`${idPrefix}-grid`);
    return {
      tempo: tempoEl ? parseInt(tempoEl.value, 10) : 80,
      time: timeEl ? timeEl.value : '4/4',
      grid: gridEl && parseInt(gridEl.value, 10) === 32 ? 32 : 16
    };
  }

  function syncNotationHeaderControls(idPrefix, text) {
    const h = NotationHeaders.parseHeaders(text);
    const tempoEl = document.getElementById(`${idPrefix}-tempo`);
    const timeEl = document.getElementById(`${idPrefix}-time`);
    const gridEl = document.getElementById(`${idPrefix}-grid`);
    if (tempoEl) tempoEl.value = String(h.tempo);
    if (timeEl) timeEl.value = h.time;
    if (gridEl) gridEl.value = String(h.grid);
  }

  function wireNotationHeaderControls(idPrefix, textarea, persist) {
    const tempoEl = document.getElementById(`${idPrefix}-tempo`);
    const timeEl = document.getElementById(`${idPrefix}-time`);
    const gridEl = document.getElementById(`${idPrefix}-grid`);
    if (!textarea) return;

    function patchFromControls() {
      const patch = readNotationHeaderControls(idPrefix);
      textarea.value = NotationHeaders.patchHeaders(textarea.value, patch);
      if (persist) persist();
    }

    [tempoEl, timeEl, gridEl].forEach(el => {
      if (!el) return;
      el.addEventListener('change', patchFromControls);
      el.addEventListener('input', patchFromControls);
    });

    textarea.addEventListener('input', () => {
      syncNotationHeaderControls(idPrefix, textarea.value);
    });
  }

  function destroyNotationPreview() {
    if (notationHandle) {
      notationHandle.destroy();
      notationHandle = null;
    }
  }

  function mountNotationPreview(host, source) {
    destroyNotationPreview();
    const api = window.DrumNotationEmbed;
    if (!host) return;
    if (!api || typeof api.mount !== 'function') {
      host.innerHTML = '<p class="focus-hint">Notation engine failed to load.</p>';
      return;
    }
    notationHandle = api.mount(host);
    notationHandle.setSource(source || '');
  }

  function pushNotationSource(source) {
    if (notationHandle) notationHandle.setSource(source || '');
  }

  function renderProjects() {
    const el = document.getElementById('projects-list');
    if (!el) return;
    if (!state.projects.length) {
      el.innerHTML = '<p class="focus-hint">No projects yet — add a song or technique goal below.</p>';
      return;
    }
    el.innerHTML = state.projects.map((p, i) => {
      const trackLabels = (p.tracks || []).map(t => TRACK_META[t]?.label || t).join(', ');
      return `
        <div class="project-card" data-idx="${i}">
          <div class="project-head">
            <strong>${PlannerStorage.escapeAttr(p.title)}</strong>
            <div class="status-picker">${STATUS_TYPES.map(s => `
              <button type="button" class="status-btn status-${s.id}${p.status === s.id ? ' active' : ''}"
                data-project-idx="${i}" data-status="${s.id}" title="${s.label}">${s.icon}</button>
            `).join('')}</div>
          </div>
          <p class="project-goal">${PlannerStorage.escapeAttr(p.goal || '')}</p>
          <p class="project-tracks">${PlannerStorage.escapeAttr(trackLabels)}</p>
        </div>`;
    }).join('');
    el.querySelectorAll('.status-btn[data-project-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.projectIdx, 10);
        const next = state.projects[i].status === btn.dataset.status ? '' : btn.dataset.status;
        state.projects[i].status = next;
        save();
        renderProjects();
      });
    });
  }

  function renderPrinciples() {
    document.getElementById('practice-principles').innerHTML =
      PRACTICE_PRINCIPLES.map(p => `<li>${p}</li>`).join('');
      document.getElementById('starter-songs').innerHTML =
      '<span class="starter-label">Sample grooves (no songs):</span> ' +
      GROOVE_LIBRARY.map((g, i) =>
        `<button type="button" class="starter-chip" data-idx="${i}" title="${PlannerStorage.escapeAttr(g.pattern)}">${g.name}<span class="chip-level">${g.level}</span></button>`
      ).join('');
    document.querySelectorAll('.starter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const g = GROOVE_LIBRARY[parseInt(btn.dataset.idx, 10)];
        if (g) addGrooveFromTemplate(g);
      });
    });
  }

  function addGrooveFromTemplate(g) {
    flushMapEdits();
    const groove = PlannerStorage.createEmptyGroove(g.name, {
      style: g.style,
      level: g.level,
      pattern: g.pattern,
      tempoRange: g.tempoRange,
      notes: g.notes,
      source: g.source || '',
      notation: g.notation || '',
      applications: (g.applications || []).map(a => PlannerStorage.createApplication(a))
    });
    state.maps.unshift(groove);
    state.activeMapId = groove.id;
    if (groove.applications.length) {
      state.activeAppId = groove.applications[0].id;
    } else {
      state.activeAppId = null;
    }
    save();
    renderMaps();
  }

  function createMap(name, style, level, tempoRange) {
    flushMapEdits();
    const groove = PlannerStorage.createEmptyGroove(name, {
      style: style || '',
      level: level || 'beginner',
      tempoRange: tempoRange || ''
    });
    state.maps.unshift(groove);
    state.activeMapId = groove.id;
    state.activeAppId = null;
    save();
    renderMaps();
  }

  function renderMaps() {
    const list = document.getElementById('maps-list');
    if (!state.maps.length) {
      list.innerHTML = '<p class="focus-hint">No grooves yet — pick a sample above or add your own.</p>';
    } else {
      list.innerHTML = state.maps.map(m => `
        <button type="button" class="map-chip${m.id === state.activeMapId ? ' active' : ''}" data-id="${m.id}">
          ${PlannerStorage.escapeAttr(PlannerStorage.grooveChipLabel(m))}
          <span class="chip-level">${m.level || 'beginner'}</span>
        </button>
      `).join('');
      list.querySelectorAll('.map-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.id === state.activeMapId) return;
          flushMapEdits();
          state.activeMapId = btn.dataset.id;
          const map = PlannerStorage.getActiveMap(state);
          ensureActiveApp(map);
          save();
          renderMaps();
        });
      });
    }
    renderMapEditor();
  }

  function notationTargetLabel(map, app) {
    if (app) {
      const name = app.song.trim() || 'Untitled song';
      return `song: ${name}`;
    }
    return 'groove template (no song selected)';
  }

  function renderMapEditor() {
    const editor = document.getElementById('map-editor');
    const map = PlannerStorage.getActiveMap(state);
    destroyNotationPreview();
    mapEditorFlush = null;
    mapEditorDebounced = null;

    if (!map) {
      editor.classList.add('hidden');
      editor.innerHTML = '';
      return;
    }

    Object.assign(map, PlannerStorage.normalizeGroove(map));
    ensureActiveApp(map);
    const activeApp = PlannerStorage.getActiveApplication(state, map);
    const displayNotation = PlannerStorage.editorNotation(state, map);
    const previewNotation = PlannerStorage.effectiveNotation(state, map);
    const templateHeaders = NotationHeaders.parseHeaders(map.notation || '');
    const songHeaders = NotationHeaders.parseHeaders(displayNotation);

    editor.classList.remove('hidden');
    editor.innerHTML = `
      <div class="map-editor-head">
        <div class="day-fields groove-fields">
          <label>Groove<input type="text" id="edit-map-name" value="${PlannerStorage.escapeAttr(map.name)}"></label>
          <label>Style<input type="text" id="edit-map-style" value="${PlannerStorage.escapeAttr(map.style)}" placeholder="Rumba, Rock…"></label>
          <label>Level
            <select id="edit-map-level">
              ${GROOVE_LEVELS.map(l =>
                `<option value="${l}"${map.level === l ? ' selected' : ''}>${l}</option>`
              ).join('')}
            </select>
          </label>
          <label>Tempo<input type="text" id="edit-map-tempo" value="${PlannerStorage.escapeAttr(map.tempoRange)}" placeholder="60–100"></label>
        </div>
        <button type="button" class="map-delete" id="map-delete">Delete groove</button>
      </div>
      <label class="groove-block-label">Pattern / skeleton
        <textarea id="edit-map-pattern" rows="2" placeholder="Kick / snare / HH / feet…">${PlannerStorage.escapeAttr(map.pattern)}</textarea>
      </label>
      <label class="groove-block-label">Groove template notation
        ${notationHeaderControlsHtml('template', templateHeaders)}
        <textarea id="edit-map-template-notation" class="notation-editor notation-editor-sm" rows="4" spellcheck="false" wrap="off" placeholder="Default kit pattern for this groove…">${PlannerStorage.escapeAttr(map.notation || '')}</textarea>
      </label>
      <p class="focus-hint">Template is shared; each song below gets its own transcription (saved separately).</p>
      <label class="groove-block-label">Notes (how it changes across songs)
        <textarea id="edit-map-notes" rows="2" placeholder="What stays the same; what songs change…">${PlannerStorage.escapeAttr(map.notes)}</textarea>
      </label>
      ${map.source ? `<p class="focus-hint">Source sample: ${PlannerStorage.escapeAttr(map.source)}</p>` : ''}

      <div class="groove-apps">
        <div class="groove-apps-head">
          <h3>Song applications</h3>
          <button type="button" class="map-chip" id="app-add">+ song</button>
        </div>
        <p class="focus-hint">Click a row to edit its transcription. Each song keeps its own kit notation.</p>
        <div id="apps-list">
          ${map.applications.length ? map.applications.map((a, i) => `
            <div class="app-row${activeApp && a.id === activeApp.id ? ' app-row-active' : ''}" data-app-id="${PlannerStorage.escapeAttr(a.id)}">
              <button type="button" class="app-select" data-app-id="${PlannerStorage.escapeAttr(a.id)}" title="Edit this song's transcription">${activeApp && a.id === activeApp.id ? '●' : '○'}</button>
              <input type="text" data-field="song" value="${PlannerStorage.escapeAttr(a.song)}" placeholder="Song">
              <input type="text" data-field="artist" value="${PlannerStorage.escapeAttr(a.artist)}" placeholder="Artist">
              <input type="text" data-field="notes" value="${PlannerStorage.escapeAttr(a.notes)}" placeholder="How this song uses the groove">
              <span class="app-notation-badge" title="Has saved transcription">${a.notation.trim() ? '♫' : ''}</span>
              <button type="button" class="app-remove" data-app-id="${PlannerStorage.escapeAttr(a.id)}" title="Remove">×</button>
            </div>
          `).join('') : '<p class="focus-hint">No songs yet — add applications as you listen.</p>'}
        </div>
      </div>

      <div class="groove-notation">
        <div class="groove-apps-head">
          <h3>Kit notation <span class="notation-target">— ${PlannerStorage.escapeAttr(notationTargetLabel(map, activeApp))}</span></h3>
          <div class="notation-actions">
            <button type="button" class="map-chip" id="notation-from-template" title="Copy groove template into this song">From template</button>
            <button type="button" class="map-chip" id="notation-template" title="Insert empty HH/SD/BD bar">Empty bar</button>
            <button type="button" class="map-chip" id="notation-copy">Copy for Obsidian</button>
            <a class="map-chip" href="${DRUM_NOTATION_PLAYGROUND}" target="_blank" rel="noopener">Playground</a>
            <a class="map-chip" href="${DRUM_NOTATION_DOCS}" target="_blank" rel="noopener">Format docs</a>
          </div>
        </div>
        <p class="focus-hint">${activeApp
          ? 'Editing this song only — preview falls back to groove template when empty.'
          : 'Add a song above to save per-song transcriptions (template field above is the shared default).'}
        </p>
        ${notationHeaderControlsHtml('song', songHeaders)}
        <textarea id="edit-map-notation" class="notation-editor" rows="10" spellcheck="false" wrap="off"
          ${activeApp ? '' : 'disabled'}
          placeholder="Title: …&#10;Tempo: 80&#10;Time: 4/4&#10;Grid: 16&#10;HH | x-x-x-x-x-x-x-x-&#10;SD | ----o-------o---&#10;BD | o-------o-------">${PlannerStorage.escapeAttr(displayNotation)}</textarea>
        <div id="notation-preview-host" class="notation-preview-host"></div>
      </div>

      <div class="groove-form">
        <div class="groove-apps-head">
          <h3>Form adaptations</h3>
          <button type="button" class="map-chip" id="form-add">+ section</button>
        </div>
        <p class="focus-hint">Add / remove sections as the song needs (extra verses, pre-chorus, tags…).</p>
        <div id="form-list">
          ${map.sections.map((row, i) => `
            <div class="form-row" data-form="${i}">
              <input type="text" data-field="label" value="${PlannerStorage.escapeAttr(row.label)}" placeholder="Section (e.g. Verse 3)">
              <input type="text" data-field="bars" value="${PlannerStorage.escapeAttr(row.bars)}" placeholder="Bars">
              <input type="text" data-field="description" value="${PlannerStorage.escapeAttr(row.description)}" placeholder="What changes">
              <input type="text" data-field="drumFocus" value="${PlannerStorage.escapeAttr(row.drumFocus)}" placeholder="HH / ride / sparse…">
              <button type="button" class="app-remove form-remove" data-form="${i}" title="Remove">×</button>
            </div>
          `).join('') || '<p class="focus-hint">No sections yet — add form rows as you map the song.</p>'}
        </div>
      </div>
    `;

    const notationEl = document.getElementById('edit-map-notation');
    const templateEl = document.getElementById('edit-map-template-notation');
    const previewHost = document.getElementById('notation-preview-host');
    mountNotationPreview(previewHost, previewNotation);

    function syncFromDom() {
      map.name = document.getElementById('edit-map-name').value.trim() || map.name;
      map.style = document.getElementById('edit-map-style').value.trim();
      map.level = document.getElementById('edit-map-level').value;
      map.tempoRange = document.getElementById('edit-map-tempo').value.trim();
      map.pattern = document.getElementById('edit-map-pattern').value.trim();
      map.notes = document.getElementById('edit-map-notes').value.trim();
      map.notation = templateEl.value;

      map.applications = [...editor.querySelectorAll('.app-row')].map(row => {
        const id = row.dataset.appId;
        const existing = map.applications.find(a => a.id === id) || PlannerStorage.createApplication({ id });
        return {
          ...existing,
          song: row.querySelector('[data-field="song"]').value.trim(),
          artist: row.querySelector('[data-field="artist"]').value.trim(),
          notes: row.querySelector('[data-field="notes"]').value.trim()
        };
      });

      const app = PlannerStorage.getActiveApplication(state, map);
      if (app && notationEl && !notationEl.disabled) {
        app.notation = notationEl.value;
      }

      map.sections = [...editor.querySelectorAll('.form-row')].map(row => ({
        label: row.querySelector('[data-field="label"]').value.trim(),
        bars: row.querySelector('[data-field="bars"]').value.trim(),
        description: row.querySelector('[data-field="description"]').value.trim(),
        drumFocus: row.querySelector('[data-field="drumFocus"]').value.trim()
      }));

      map.updatedAt = new Date().toISOString();
      save();
      pushNotationSource(PlannerStorage.effectiveNotation(state, map));

      const list = document.getElementById('maps-list');
      list.querySelectorAll('.map-chip').forEach(chip => {
        if (chip.dataset.id === map.id) {
          chip.innerHTML = `${PlannerStorage.escapeAttr(PlannerStorage.grooveChipLabel(map))}<span class="chip-level">${map.level}</span>`;
        }
      });

      editor.querySelectorAll('.app-notation-badge').forEach((badge, i) => {
        const a = map.applications[i];
        badge.textContent = a && a.notation.trim() ? '♫' : '';
      });
    }

    mapEditorFlush = syncFromDom;
    mapEditorDebounced = debounce(syncFromDom, 250);

    function schedulePersist() {
      clearTimeout(mapEditorTimer);
      mapEditorTimer = setTimeout(() => {
        mapEditorTimer = null;
        syncFromDom();
      }, 250);
    }

    wireNotationHeaderControls('template', templateEl, schedulePersist);
    wireNotationHeaderControls('song', notationEl, schedulePersist);

    editor.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', schedulePersist);
      input.addEventListener('change', schedulePersist);
    });

    document.getElementById('notation-template').addEventListener('click', () => {
      if (!activeApp || notationEl.disabled) return;
      const title = activeApp.song.trim() || map.name || 'Song';
      const headers = readNotationHeaderControls('song');
      notationEl.value = NotationHeaders.emptyNotation(title, headers);
      syncFromDom();
      notationEl.focus();
    });

    document.getElementById('notation-from-template').addEventListener('click', () => {
      if (!activeApp || notationEl.disabled) return;
      notationEl.value = map.notation || templateEl.value;
      syncFromDom();
      notationEl.focus();
    });

    document.getElementById('notation-copy').addEventListener('click', async () => {
      const text = PlannerStorage.wrapObsidianFence(notationEl.value || templateEl.value);
      try {
        await navigator.clipboard.writeText(text);
        document.getElementById('notation-copy').textContent = 'Copied';
        setTimeout(() => {
          const btn = document.getElementById('notation-copy');
          if (btn) btn.textContent = 'Copy for Obsidian';
        }, 1200);
      } catch (_) {
        window.prompt('Copy this Obsidian block:', text);
      }
    });

    document.getElementById('app-add').addEventListener('click', () => {
      flushMapEdits();
      const app = PlannerStorage.createApplication();
      map.applications.push(app);
      state.activeAppId = app.id;
      save();
      renderMapEditor();
      const row = editor.querySelector(`.app-row[data-app-id="${app.id}"] input[data-field="song"]`);
      if (row) row.focus();
    });

    editor.querySelectorAll('.app-select').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.appId === state.activeAppId) return;
        flushMapEdits();
        state.activeAppId = btn.dataset.appId;
        save();
        renderMapEditor();
      });
    });

    editor.querySelectorAll('.app-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.app-remove') || e.target.closest('input')) return;
        const id = row.dataset.appId;
        if (id === state.activeAppId) return;
        flushMapEdits();
        state.activeAppId = id;
        save();
        renderMapEditor();
      });
    });

    editor.querySelectorAll('.app-remove:not(.form-remove)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        flushMapEdits();
        const id = btn.dataset.appId;
        map.applications = map.applications.filter(a => a.id !== id);
        if (state.activeAppId === id) {
          state.activeAppId = map.applications[0]?.id || null;
        }
        save();
        renderMapEditor();
      });
    });

    document.getElementById('form-add').addEventListener('click', () => {
      flushMapEdits();
      map.sections.push({ label: '', bars: '', description: '', drumFocus: '' });
      save();
      renderMapEditor();
    });

    editor.querySelectorAll('.form-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        flushMapEdits();
        const i = parseInt(btn.dataset.form, 10);
        map.sections.splice(i, 1);
        save();
        renderMapEditor();
      });
    });

    document.getElementById('map-delete').addEventListener('click', () => {
      if (!confirm('Delete this groove and all song transcriptions?')) return;
      flushMapEdits();
      destroyNotationPreview();
      state.maps = state.maps.filter(m => m.id !== map.id);
      state.activeMapId = state.maps[0]?.id || null;
      state.activeAppId = null;
      save();
      renderMaps();
    });
  }

  document.getElementById('project-add').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('project-title').value.trim();
    if (!title) return;
    state.projects.push({
      id: PlannerStorage.newId('p'),
      title,
      goal: document.getElementById('project-goal').value.trim(),
      tracks: ['adaptation', 'versatility'],
      status: 'progress'
    });
    document.getElementById('project-title').value = '';
    document.getElementById('project-goal').value = '';
    save();
    renderProjects();
  });

  document.getElementById('map-add').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('map-title').value.trim();
    if (!name) return;
    createMap(
      name,
      document.getElementById('map-style').value.trim(),
      document.getElementById('map-level').value,
      document.getElementById('map-tempo').value.trim()
    );
    document.getElementById('map-title').value = '';
    document.getElementById('map-style').value = '';
    document.getElementById('map-level').value = 'beginner';
    document.getElementById('map-tempo').value = '';
  });

  window.addEventListener('beforeunload', () => flushMapEdits());

  renderProjects();
  renderPrinciples();
  renderMaps();
})();
