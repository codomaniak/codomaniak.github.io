/* Benny Greb alphabet trainer — keeps letter / strokes / kit notation in sync */
(function () {
  const settings = {
    mode: 'alpha',
    handMode: 'one',
    durationMode: 'bars',
    barsPerLetter: 4,
    secondsPerLetter: 60,
    tempo: 70,
    time: '4/4',
    click: 'quarter',
    word: 'BEAD'
  };

  let sequence = buildSequence('alpha');
  let index = 0;
  let playing = false;
  let paused = false;
  let rafId = null;
  let audioCtx = null;
  let letterStartedAt = 0;
  let slotPhase = 0;
  let lastClickSlot = -1;
  let notationHandle = null;
  let progressRatio = 0;
  let autoMeter = true;

  const $ = (id) => document.getElementById(id);

  function currentLetterData() {
    return LETTER_BY_ID[currentLetter()] || null;
  }

  function currentSubdivisionLabels() {
    return letterSubdivisionLabels(currentLetter());
  }

  function currentSubdivisionCount() {
    return currentSubdivisionLabels().length;
  }

  /** Binary letters (A–P) are 4/4; ternary letters (Q–X) are 3/4. */
  function applyAutoMeter() {
    if (!autoMeter) return;
    const time = letterTimeSignature(currentLetter());
    if (settings.time === time) return;
    settings.time = time;
    const input = $('time-sig-input');
    if (input) input.value = time;
  }

  function currentLetter() {
    if (!sequence.length) return 'A';
    if (index < 0) index = 0;
    if (index >= sequence.length) index = sequence.length - 1;
    return sequence[index];
  }

  function barDurationMs() {
    const quarters = NotationHeaders.barQuarterLength(settings.time);
    return (quarters * 60 * 1000) / settings.tempo;
  }

  function letterDurationMs() {
    if (settings.durationMode === 'time') {
      return settings.secondsPerLetter * 1000;
    }
    return settings.barsPerLetter * barDurationMs();
  }

  function subdivisionMs() {
    return (60 * 1000) / settings.tempo / currentSubdivisionCount();
  }

  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function clickSound(accent) {
    if (settings.click === 'off') return;
    const ctx = ensureAudio();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = accent ? 1200 : 800;
    gain.gain.setValueAtTime(accent ? 0.08 : 0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  function mountNotation() {
    const host = $('notation-preview-host');
    if (notationHandle) {
      notationHandle.destroy();
      notationHandle = null;
    }
    const api = window.DrumNotationEmbed;
    if (!api || !api.mount) {
      host.innerHTML = '<p class="focus-hint">Notation engine failed to load.</p>';
      return;
    }
    notationHandle = api.mount(host);
  }

  function pushNotation() {
    if (!notationHandle) return;
    const letter = currentLetter();
    const barsShow = settings.durationMode === 'bars'
      ? Math.min(Math.max(1, settings.barsPerLetter), 2)
      : 2;
    notationHandle.setSource(buildAlphabetNotation({
      letters: [letter],
      tempo: settings.tempo,
      time: settings.time,
      barsPerLetter: barsShow,
      handMode: settings.handMode,
      title: `Letter ${letter}`,
      maxBars: barsShow
    }));
  }

  function renderGrebClassic(activeSlot) {
    const letter = currentLetter();
    const L = LETTER_BY_ID[letter];
    const row = $('greb-classic-row');
    const label = $('greb-classic-letter');
    if (!L || !row) return;
    if (label) label.textContent = letter;
    const hits = L.hits || parseGrebHits(L.greb);
    const counts = letterSubdivisionLabels(letter);
    row.innerHTML = hits.map((hit, i) => {
      const active = activeSlot === i ? ' active' : '';
      if (hit) {
        return `<span class="greb-slot accent${active}" title="${counts[i]} accent">
          <span class="greb-dot" aria-hidden="true"></span>
          <span class="greb-slot-count">${counts[i]}</span>
        </span>`;
      }
      return `<span class="greb-slot rest${active}" title="${counts[i]} rest">
        <span class="greb-dash" aria-hidden="true"></span>
        <span class="greb-slot-count">${counts[i]}</span>
      </span>`;
    }).join('');
  }

  function chartClassicLine(L) {
    const hits = L.hits || parseGrebHits(L.greb);
    return hits.map(h => h
      ? '<span class="lc-dot"></span>'
      : '<span class="lc-dash"></span>'
    ).join('');
  }

  function chartStrokeLine(L) {
    if (settings.handMode === 'two') {
      return L.twoHands.map(s => `${s.hand}${strokeGlyph(s.stroke)}`).join(' ');
    }
    return L.oneHand.map(strokeGlyph).join(' ');
  }

  function renderStrokeGrid(activeSlot) {
    const letter = currentLetter();
    const L = LETTER_BY_ID[letter];
    const grid = $('stroke-grid');
    if (!L) {
      grid.innerHTML = '';
      return;
    }

    renderGrebClassic(activeSlot);

    const two = settings.handMode === 'two';
    $('stroke-mode-label').textContent =
      settings.handMode === 'two' ? 'both hands' :
      settings.handMode === 'left' ? 'one hand (L)' : 'one hand (R)';

    const counts = letterSubdivisionLabels(letter);
    grid.innerHTML = L.oneHand.map((stroke, i) => {
      const hand = two ? L.twoHands[i].hand : (settings.handMode === 'left' ? 'L' : 'R');
      const st = two ? L.twoHands[i].stroke : stroke;
      const active = activeSlot === i ? ' active' : '';
      return `<div class="stroke-cell stroke-${st}${active}">
        <span class="stroke-hand">${hand}</span>
        <span class="stroke-glyph" data-stroke="${st}" aria-label="${STROKE_LABEL[st] || st}">${strokeGlyph(st)}</span>
        <span class="stroke-name">${STROKE_LABEL[st] || st}</span>
        <span class="stroke-count">${counts[i]}</span>
      </div>`;
    }).join('');
  }

  function renderNext() {
    const upcoming = sequence.slice(index + 1, index + 6);
    $('next-letters').innerHTML = upcoming.map(id =>
      `<span class="alpha-chip upcoming">${id}</span>`
    ).join('') || '<span class="alpha-chip">—</span>';
  }

  function renderMeta(elapsedRatio, slotInBeat) {
    const letter = currentLetter();
    progressRatio = Math.min(1, Math.max(0, elapsedRatio || 0));

    $('current-letter').textContent = letter;
    $('meta-index').textContent = String(sequence.length ? index + 1 : 0);
    $('meta-total').textContent = String(sequence.length);

    const meterLabel = autoMeter ? `${settings.time} auto` : settings.time;
    if (settings.durationMode === 'bars') {
      $('meta-duration').textContent =
        `${settings.barsPerLetter} bar${settings.barsPerLetter === 1 ? '' : 's'} / letter · ${meterLabel} · Grid ${letterGrid(letter)}`;
    } else {
      $('meta-duration').textContent =
        `${settings.secondsPerLetter}s / letter · ${meterLabel} · Grid ${letterGrid(letter)}`;
    }

    const slot = Number.isFinite(slotInBeat) ? Math.max(0, slotInBeat) : 0;
    const subdivisions = currentSubdivisionLabels();
    const perBeat = subdivisions.length;
    const beatsPerBar = Math.max(1, Math.round(NotationHeaders.barQuarterLength(settings.time)));
    $('meta-beat').textContent = String(Math.floor(slot / perBeat) % beatsPerBar + 1);
    $('meta-slot').textContent = subdivisions[slot % perBeat];
    $('meta-status').textContent = playing ? (paused ? 'Paused' : 'Playing') : 'Ready';
    $('pulse-fill').style.width = `${progressRatio * 100}%`;

    document.querySelectorAll('.letter-card').forEach(card => {
      card.classList.toggle('active', card.dataset.id === letter);
      const L = LETTER_BY_ID[card.dataset.id];
      const strokesEl = card.querySelector('.lc-strokes');
      if (L && strokesEl) strokesEl.textContent = chartStrokeLine(L);
    });
  }

  /**
   * Single sync point: big letter, strokes, up-next, meta, chart, kit notation.
   */
  function syncAll({
    resetProgress = false,
    activeSlot = -1,
    elapsedRatio = null,
    slotInBeat = 0,
    status = null
  } = {}) {
    if (!sequence.length) {
      sequence = buildSequence(settings.mode, settings.word);
      index = 0;
    }
    if (index < 0) index = 0;
    if (index >= sequence.length) index = sequence.length - 1;

    applyAutoMeter();

    const ratio = resetProgress ? 0 : (elapsedRatio == null ? progressRatio : elapsedRatio);
    const slotHighlight = activeSlot;

    renderStrokeGrid(slotHighlight);
    renderNext();
    renderMeta(ratio, slotInBeat);
    pushNotation();

    if (status) $('meta-status').textContent = status;
  }

  function renderChart() {
    $('letter-chart').innerHTML = BINARY_LETTERS.map(L => `
      <button type="button" class="letter-card" data-id="${L.id}">
        <div class="lc-id">${L.id}</div>
        <div class="lc-classic">${chartClassicLine(L)}</div>
        <div class="lc-greb">${L.greb}</div>
        <div class="lc-strokes">${chartStrokeLine(L)}</div>
      </button>
    `).join('');

    $('letter-chart').querySelectorAll('.letter-card').forEach(btn => {
      btn.addEventListener('click', () => previewLetter(btn.dataset.id));
    });
  }

  function previewLetter(id) {
    if (playing) stopPractice(false);
    const pos = sequence.indexOf(id);
    if (pos >= 0) {
      index = pos;
    } else {
      sequence = buildSequence(settings.mode, settings.word);
      const again = sequence.indexOf(id);
      index = again >= 0 ? again : 0;
      if (again < 0) {
        sequence = [id];
        index = 0;
      }
    }
    syncAll({ resetProgress: true });
  }

  function rebuildSequence({ reshuffle } = {}) {
    if (playing) stopPractice(false);
    if (reshuffle && settings.mode !== 'word') {
      sequence = buildSequence('random');
    } else {
      sequence = buildSequence(settings.mode, settings.word);
    }
    index = 0;
    syncAll({ resetProgress: true });
  }

  function startLetterClock() {
    letterStartedAt = performance.now();
    lastClickSlot = -1;
    slotPhase = 0;
    progressRatio = 0;
  }

  function retimeCurrentLetter() {
    if (!playing) return;
    startLetterClock();
  }

  function liveProgress() {
    if (!playing) return { ratio: 0, slot: 0 };
    if (paused) return { ratio: progressRatio, slot: slotPhase };
    const dur = letterDurationMs();
    const elapsed = performance.now() - letterStartedAt;
    return {
      ratio: Math.min(1, Math.max(0, elapsed / dur)),
      slot: Math.floor(elapsed / subdivisionMs())
    };
  }

  function applySettingsToView({ retime = false } = {}) {
    if (retime) retimeCurrentLetter();
    const live = liveProgress();
    syncAll({
      resetProgress: !playing || retime,
      activeSlot: playing && !paused ? (live.slot % currentSubdivisionCount()) : -1,
      elapsedRatio: (!playing || retime) ? 0 : live.ratio,
      slotInBeat: live.slot
    });
  }

  function advanceLetter() {
    index++;
    if (index >= sequence.length) {
      stopPractice(true);
      return;
    }
    startLetterClock();
    syncAll({ resetProgress: true, activeSlot: 0 });
  }

  function tick(now) {
    if (!playing || paused) return;

    const dur = letterDurationMs();
    const elapsed = now - letterStartedAt;
    const ratio = elapsed / dur;
    const absoluteSlot = Math.floor(elapsed / subdivisionMs());
    slotPhase = absoluteSlot;

    if (settings.click !== 'off' && absoluteSlot !== lastClickSlot) {
      lastClickSlot = absoluteSlot;
      const spb = currentSubdivisionCount();
      const isDownbeat = absoluteSlot % spb === 0;
      const isEighth = absoluteSlot % 2 === 0;
      if (settings.click === 'sixteenth') clickSound(isDownbeat);
      else if (settings.click === 'eighth' && isEighth) clickSound(isDownbeat);
      else if (settings.click === 'quarter' && isDownbeat) clickSound(true);
    }

    // Update letter UI every frame; notation only when letter identity already set
    renderStrokeGrid(absoluteSlot % currentSubdivisionCount());
    renderNext();
    renderMeta(ratio, absoluteSlot);

    if (elapsed >= dur) advanceLetter();

    rafId = requestAnimationFrame(tick);
  }

  function startPractice() {
    ensureAudio();
    if (!sequence.length) rebuildSequence();
    playing = true;
    paused = false;
    if (index >= sequence.length) index = 0;
    startLetterClock();
    $('btn-start').disabled = true;
    $('btn-pause').disabled = false;
    $('btn-pause').textContent = 'Pause';
    $('btn-stop').disabled = false;
    syncAll({ resetProgress: true, activeSlot: 0 });
    rafId = requestAnimationFrame(tick);
  }

  function pausePractice() {
    if (!playing) return;
    paused = !paused;
    $('btn-pause').textContent = paused ? 'Resume' : 'Pause';
    if (!paused) {
      letterStartedAt = performance.now() - progressRatio * letterDurationMs();
      lastClickSlot = -1;
      $('meta-status').textContent = 'Playing';
      rafId = requestAnimationFrame(tick);
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
      syncAll({
        resetProgress: false,
        activeSlot: -1,
        elapsedRatio: progressRatio,
        slotInBeat: slotPhase,
        status: 'Paused'
      });
    }
  }

  function stopPractice(finished) {
    playing = false;
    paused = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    $('btn-start').disabled = false;
    $('btn-pause').disabled = true;
    $('btn-pause').textContent = 'Pause';
    $('btn-stop').disabled = true;
    if (!finished) index = 0;
    else if (index >= sequence.length) index = Math.max(0, sequence.length - 1);
    syncAll({
      resetProgress: true,
      status: finished ? 'Finished' : 'Ready'
    });
  }

  function setToggleGroup(rootId, activeEl) {
    $(rootId).querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b === activeEl);
    });
  }

  // —— bindings ——
  $('mode-toggle').querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      settings.mode = btn.dataset.mode;
      autoMeter = true;
      setToggleGroup('mode-toggle', btn);
      $('word-row').classList.toggle('hidden', settings.mode !== 'word');
      rebuildSequence();
    });
  });

  $('hand-toggle').querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.handMode = btn.dataset.hand;
      setToggleGroup('hand-toggle', btn);
      applySettingsToView({ retime: false });
    });
  });

  $('duration-toggle').querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.durationMode = btn.dataset.dur;
      setToggleGroup('duration-toggle', btn);
      $('bars-row').classList.toggle('hidden', settings.durationMode !== 'bars');
      $('time-row').classList.toggle('hidden', settings.durationMode !== 'time');
      applySettingsToView({ retime: true });
    });
  });

  $('time-sig-input').addEventListener('change', () => {
    autoMeter = false;
    settings.time = NotationHeaders.normalizeTime($('time-sig-input').value);
    $('time-sig-input').value = settings.time;
    applySettingsToView({ retime: true });
  });

  $('bars-input').addEventListener('change', () => {
    settings.barsPerLetter = Math.max(1, Math.min(64, parseInt($('bars-input').value, 10) || 4));
    $('bars-input').value = settings.barsPerLetter;
    applySettingsToView({ retime: true });
  });

  $('time-input').addEventListener('change', () => {
    settings.secondsPerLetter = Math.max(5, Math.min(600, parseInt($('time-input').value, 10) || 60));
    $('time-input').value = settings.secondsPerLetter;
    applySettingsToView({ retime: true });
  });

  $('tempo-range').addEventListener('input', () => {
    settings.tempo = parseInt($('tempo-range').value, 10);
    $('tempo-value').textContent = String(settings.tempo);
    applySettingsToView({ retime: true });
  });

  $('click-select').addEventListener('change', () => {
    settings.click = $('click-select').value;
  });

  $('word-input').addEventListener('input', () => {
    settings.word = $('word-input').value;
    if (settings.mode === 'word') rebuildSequence();
  });

  $('btn-start').addEventListener('click', startPractice);
  $('btn-pause').addEventListener('click', pausePractice);
  $('btn-stop').addEventListener('click', () => stopPractice(false));
  $('btn-reshuffle').addEventListener('click', () => rebuildSequence({ reshuffle: true }));

  renderChart();
  mountNotation();
  rebuildSequence();
})();
