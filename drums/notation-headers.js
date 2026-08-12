/**
 * obsidian-drum-notation header helpers (Time, Grid, Tempo, Count).
 * Slot math matches vendor drum-notation-embed.js ($o / Go).
 */
const NotationHeaders = (function () {
  const TIME_OPTIONS = ['4/4', '3/4', '6/8'];
  const GRID_OPTIONS = [16, 32];

  function parseTime(raw) {
    const m = /^(\d+)\/(\d+)$/.exec(String(raw || '').trim());
    if (!m) return { num: 4, den: 4, str: '4/4' };
    return { num: parseInt(m[1], 10), den: parseInt(m[2], 10), str: `${m[1]}/${m[2]}` };
  }

  /** Grid slots per bar (matches obsidian $o). */
  function slotsPerBar(time, grid) {
    const { num, den } = parseTime(time);
    const g = grid === 32 ? 32 : 16;
    return Math.max(1, Math.round(num * (g / den)));
  }

  /** Grid slots per written beat (matches obsidian Go). */
  function slotsPerBeat(time, grid) {
    const { num, den } = parseTime(time);
    const g = grid === 32 ? 32 : 16;
    const perDen = Math.max(1, Math.round(g / den));
    const compound = num >= 6 && num % 3 === 0 ? 3 : 1;
    return Math.max(1, perDen * compound);
  }

  /** Bar length in quarter-note units (for BPM timing). */
  function barQuarterLength(time) {
    const { num, den } = parseTime(time);
    return num * (4 / den);
  }

  function defaultCountLine(time) {
    const { str, num, den } = parseTime(time);
    if (den === 8 && num >= 6 && num % 3 === 0) {
      const beats = Math.max(1, Math.round(num / 3));
      const parts = [];
      for (let i = 1; i <= beats; i++) parts.push(`${i} & a`);
      return `Count: ${parts.join(' ')}`;
    }
    if (str === '3/4') return 'Count: 1 e & a 2 e & a 3 e & a';
    const beats = Math.max(1, Math.round(num * (4 / den)));
    const beatCounts = [];
    for (let i = 1; i <= beats; i++) beatCounts.push(`${i} e & a`);
    return `Count: ${beatCounts.join(' ')}`;
  }

  function normalizeTime(raw) {
    const m = /^(\d+)\/(\d+)$/.exec(String(raw || '').trim());
    if (!m) return '4/4';
    const num = parseInt(m[1], 10);
    const den = parseInt(m[2], 10);
    if (num <= 0 || den <= 0) return '4/4';
    return `${num}/${den}`;
  }

  function isCompoundMeter(time) {
    const { num, den } = parseTime(time);
    return den === 8 && num >= 6 && num % 3 === 0;
  }

  function parseHeaders(text) {
    const src = String(text || '');
    const tempoM = /^Tempo:\s*(\d+)/im.exec(src);
    const timeM = /^(?:Time|Meter|Time Signature):\s*(\d+\/\d+)/im.exec(src);
    const gridM = /^(?:Grid|Subdivision|Resolution):\s*(\d+)/im.exec(src);
    const gridVal = gridM ? parseInt(gridM[1], 10) : 16;
    const timeVal = timeM ? normalizeTime(timeM[1]) : '4/4';
    return {
      tempo: tempoM ? parseInt(tempoM[1], 10) : 80,
      time: timeVal,
      grid: gridVal === 32 ? 32 : 16
    };
  }

  function patchHeaders(text, patch) {
    let src = String(text || '');

    if (patch.tempo !== undefined) {
      const t = Math.max(1, parseInt(patch.tempo, 10) || 80);
      if (/^Tempo:\s*\d+/im.test(src)) src = src.replace(/^Tempo:\s*\d+/im, `Tempo: ${t}`);
      else if (/^Title:/im.test(src)) src = src.replace(/^Title:.*$/im, m => `${m}\nTempo: ${t}`);
      else src = `Tempo: ${t}\n${src}`;
    }

    if (patch.time !== undefined) {
      const time = normalizeTime(patch.time);
      if (/^(?:Time|Meter|Time Signature):/im.test(src)) {
        src = src.replace(/^(?:Time|Meter|Time Signature):\s*\S+/im, `Time: ${time}`);
      } else if (/^Tempo:/im.test(src)) {
        src = src.replace(/^Tempo:.*$/im, m => `${m}\nTime: ${time}`);
      } else src = `Time: ${time}\n${src}`;

      const countLine = defaultCountLine(time);
      if (/^Count:/im.test(src)) {
        src = src.replace(/^Count:.*$/im, countLine);
      }
    }

    if (patch.grid !== undefined) {
      const g = patch.grid === 32 ? 32 : 16;
      if (/^(?:Grid|Subdivision|Resolution):/im.test(src)) {
        src = src.replace(/^(?:Grid|Subdivision|Resolution):\s*\d+/im, `Grid: ${g}`);
      } else if (/^Time:/im.test(src)) {
        src = src.replace(/^Time:.*$/im, m => `${m}\nGrid: ${g}`);
      } else if (/^Tempo:/im.test(src)) {
        src = src.replace(/^Tempo:.*$/im, m => `${m}\nGrid: ${g}`);
      } else src = `Grid: ${g}\n${src}`;
    }

    return src;
  }

  function fitPatternToBar(pattern, time, grid) {
    const len = slotsPerBar(time, grid);
    const p = String(pattern || '');
    if (p.length === len) return p;
    if (p.length > len) return p.slice(0, len);
    return p + '-'.repeat(len - p.length);
  }

  function emptyNotation(title, opts) {
    const o = opts || {};
    const h = {
      tempo: o.tempo != null ? o.tempo : 80,
      time: o.time || '4/4',
      grid: o.grid === 32 ? 32 : 16
    };
    const len = slotsPerBar(h.time, h.grid);
    const row = '-'.repeat(len);
    return [
      `Title: ${title}`,
      `Tempo: ${h.tempo}`,
      `Time: ${h.time}`,
      `Grid: ${h.grid}`,
      'Legend: used',
      defaultCountLine(h.time),
      `HH | ${row}`,
      `SD | ${row}`,
      `BD | ${row}`
    ].join('\n');
  }

  return {
    TIME_OPTIONS,
    GRID_OPTIONS,
    normalizeTime,
    isCompoundMeter,
    parseTime,
    slotsPerBar,
    slotsPerBeat,
    barQuarterLength,
    defaultCountLine,
    parseHeaders,
    patchHeaders,
    fitPatternToBar,
    emptyNotation
  };
})();
