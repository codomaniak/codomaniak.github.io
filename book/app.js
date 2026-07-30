import { initThemeToggle } from "./theme.js";

const LS_KEY = "interactive-book:v1";
const CORNELL_FIELDS = {
  recallTitle: "Cue",
  recallPlaceholder:
    "Enter your comments, questions, the main idea, etc. that you derive from your notes!",
  notesTitle: "Notes",
  notesPlaceholder:
    "Enter dates, details, definitions, formulas, examples, etc. from the source material!",
  summaryTitle: "Summary",
  summaryPlaceholder: "Summarize what you have learned!",
};

function cornellStorageKey(bookId, pageId) {
  return `interactive-book:cornell:${bookId}:${pageId}`;
}

function loadCornellNotes(bookId, pageId) {
  try {
    const raw = localStorage.getItem(cornellStorageKey(bookId, pageId));
    if (!raw) return { recall: "", notes: "", summary: "", updatedAt: null };
    const parsed = JSON.parse(raw);
    return {
      recall: parsed.recall || "",
      notes: parsed.notes || "",
      summary: parsed.summary || "",
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return { recall: "", notes: "", summary: "", updatedAt: null };
  }
}

function saveCornellNotes(bookId, pageId, data) {
  const payload = {
    recall: data.recall || "",
    notes: data.notes || "",
    summary: data.summary || "",
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(cornellStorageKey(bookId, pageId), JSON.stringify(payload));
  return payload;
}

function formatCornellNotesText({ title, bookTitle, recall, notes, summary, updatedAt }) {
  const lines = [
    "Cornell Notes",
    bookTitle ? `Book: ${bookTitle}` : null,
    title ? `Page: ${title}` : null,
    updatedAt ? `Saved: ${new Date(updatedAt).toLocaleString()}` : null,
    "",
    `${CORNELL_FIELDS.recallTitle}`,
    "─".repeat(40),
    recall || "(empty)",
    "",
    `${CORNELL_FIELDS.notesTitle}`,
    "─".repeat(40),
    notes || "(empty)",
    "",
    `${CORNELL_FIELDS.summaryTitle}`,
    "─".repeat(40),
    summary || "(empty)",
    "",
  ];
  return lines.filter((line) => line !== null).join("\n");
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function cornellDownloadBasename(title) {
  const slug = slugifyTerm(title || "cornell-notes") || "cornell-notes";
  return slug.slice(0, 80);
}

function collectAllCornellNotes(bookData) {
  const bookId = bookData.id || slugifyTerm(bookData.title || "interactive-book");
  const pages = (bookData.pages || []).filter((page) => page.cornellNotes);
  const items = [];

  for (const page of pages) {
    const saved = loadCornellNotes(bookId, page.id);
    if (!saved.recall && !saved.notes && !saved.summary) continue;
    items.push({
      pageId: page.id,
      title: page.title,
      ...saved,
    });
  }

  return { bookId, bookTitle: bookData.title || "Interactive Book", items };
}

const $ = (sel) => document.querySelector(sel);

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugifyTerm(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const PLACEHOLDER_TOKENS = new Set(["smth", "sth", "someth"]);

const IRREGULAR_VERB_FORMS = {
  be: ["be", "being", "am", "is", "are", "was", "were", "been"],
  do: ["do", "doing", "does", "did", "done"],
  go: ["go", "going", "goes", "went", "gone"],
  have: ["have", "having", "has", "had"],
  get: ["get", "getting", "gets", "got", "gotten"],
  make: ["make", "making", "makes", "made"],
  take: ["take", "taking", "takes", "took", "taken"],
  come: ["come", "coming", "comes", "came"],
  give: ["give", "giving", "gives", "gave", "given"],
  know: ["know", "knowing", "knows", "knew", "known"],
  see: ["see", "seeing", "sees", "saw", "seen"],
  find: ["find", "finding", "finds", "found"],
  think: ["think", "thinking", "thinks", "thought"],
  say: ["say", "saying", "says", "said"],
  tell: ["tell", "telling", "tells", "told"],
  turn: ["turn", "turning", "turns", "turned"],
  run: ["run", "running", "runs", "ran"],
  fall: ["fall", "falling", "falls", "fell", "fallen"],
  keep: ["keep", "keeping", "keeps", "kept"],
  let: ["let", "letting", "lets"],
  put: ["put", "putting", "puts"],
  set: ["set", "setting", "sets"],
  bring: ["bring", "bringing", "brings", "brought"],
  hold: ["hold", "holding", "holds", "held"],
  stand: ["stand", "standing", "stands", "stood"],
  write: ["write", "writing", "writes", "wrote", "written"],
  read: ["read", "reading", "reads"],
  lead: ["lead", "leading", "leads", "led"],
  meet: ["meet", "meeting", "meets", "met"],
  feel: ["feel", "feeling", "feels", "felt"],
  leave: ["leave", "leaving", "leaves", "left"],
  lose: ["lose", "losing", "loses", "lost"],
  pay: ["pay", "paying", "pays", "paid"],
  send: ["send", "sending", "sends", "sent"],
  spend: ["spend", "spending", "spends", "spent"],
  lend: ["lend", "lending", "lends", "lent"],
  sell: ["sell", "selling", "sells", "sold"],
  buy: ["buy", "buying", "buys", "bought"],
  catch: ["catch", "catching", "catches", "caught"],
  teach: ["teach", "teaching", "teaches", "taught"],
  mean: ["mean", "meaning", "means", "meant"],
  begin: ["begin", "beginning", "begins", "began", "begun"],
  break: ["break", "breaking", "breaks", "broke", "broken"],
  speak: ["speak", "speaking", "speaks", "spoke", "spoken"],
  eat: ["eat", "eating", "eats", "ate", "eaten"],
  drink: ["drink", "drinking", "drinks", "drank", "drunk"],
  sing: ["sing", "singing", "sings", "sang", "sung"],
  swim: ["swim", "swimming", "swims", "swam", "swum"],
  fly: ["fly", "flying", "flies", "flew", "flown"],
  grow: ["grow", "growing", "grows", "grew", "grown"],
  draw: ["draw", "drawing", "draws", "drew", "drawn"],
  drive: ["drive", "driving", "drives", "drove", "driven"],
  wear: ["wear", "wearing", "wears", "wore", "worn"],
  choose: ["choose", "choosing", "chooses", "chose", "chosen"],
  rise: ["rise", "rising", "rises", "rose", "risen"],
  ride: ["ride", "riding", "rides", "rode", "ridden"],
  throw: ["throw", "throwing", "throws", "threw", "thrown"],
  steal: ["steal", "stealing", "steals", "stole", "stolen"],
  wake: ["wake", "waking", "wakes", "woke", "woken"],
  shake: ["shake", "shaking", "shakes", "shook", "shaken"],
  tear: ["tear", "tearing", "tears", "tore", "torn"],
  swear: ["swear", "swearing", "swears", "swore", "sworn"],
  bear: ["bear", "bearing", "bears", "bore", "born", "borne"],
  cut: ["cut", "cutting", "cuts"],
  hit: ["hit", "hitting", "hits"],
  shut: ["shut", "shutting", "shuts"],
  spread: ["spread", "spreading", "spreads"],
  burst: ["burst", "bursting", "bursts"],
  cost: ["cost", "costing", "costs"],
  hurt: ["hurt", "hurting", "hurts"],
  cast: ["cast", "casting", "casts"],
  convey: ["convey", "conveying", "conveys", "conveyed"],
  beseech: ["beseech", "beseeching", "beseeches", "besought", "beseeched"],
  retort: ["retort", "retorting", "retorts", "retorted"],
  loaf: ["loaf", "loafing", "loafs", "loafed"],
  lurch: ["lurch", "lurching", "lurches", "lurched"],
  darn: ["darn", "darning", "darns", "darned"],
};

function regularVerbPattern(token) {
  const lower = token.toLowerCase();
  const base = escapeRegExp(token);
  if (!/^[a-z]+$/.test(lower)) return base;

  if (lower.endsWith("e") && lower.length > 2) {
    const stem = escapeRegExp(lower.slice(0, -1));
    return `(?:${base}|${stem}ing|${stem}ed|${base}s)`;
  }
  if (/[^aeiou]y$/.test(lower)) {
    const stem = escapeRegExp(lower.slice(0, -1));
    return `(?:${base}|${stem}ies|${stem}ied|${stem}ying|${stem}yed)`;
  }
  return `(?:${base}|${base}(?:s|es|ed|ing))`;
}

function inflectFirstToken(token) {
  const lower = token.toLowerCase();
  const irregular = IRREGULAR_VERB_FORMS[lower];
  if (irregular) {
    return `(?:${[...new Set(irregular)].map((word) => escapeRegExp(word)).join("|")})`;
  }
  return regularVerbPattern(token);
}

function tokenRegex(token, { isFirst, isLast, tokenCount }) {
  const lower = String(token || "").toLowerCase();
  if (PLACEHOLDER_TOKENS.has(lower)) return "\\w+";

  if (tokenCount > 1 && isFirst && /^[a-z]+$/.test(lower)) {
    return inflectFirstToken(token);
  }

  let core = escapeRegExp(token);
  if (tokenCount === 1 && isLast && /^[a-z]+$/.test(lower)) {
    core = `${core}(?:ing|ed|ly|ness|ment|s|es)?`;
  } else if (tokenCount > 1 && isLast && /^[a-z]+$/.test(lower) && !lower.endsWith("s")) {
    core = `${core}(?:s|es)?`;
  }
  return core;
}

function buildTermRegexCores(term, options = {}) {
  const source = String(options.match || term || "")
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "");
  const tokens = source.split(/[-\s]+/).filter(Boolean);
  if (!tokens.length) return [];

  const tokenCount = tokens.length;
  const joined = tokens
    .map((token, index) =>
      tokenRegex(token, {
        isFirst: index === 0,
        isLast: index === tokenCount - 1,
        tokenCount,
      })
    )
    .join("[-\\s]+");

  const cores = new Set([joined]);

  if (tokens.length === 1 && /^[a-z]{6,}$/.test(tokens[0])) {
    const word = tokens[0];
    for (let i = 3; i <= word.length - 4; i++) {
      const head = word.slice(0, i);
      const tail = word.slice(i);
      if (head.length >= 3 && tail.length >= 4) {
        cores.add(`${escapeRegExp(head)}[-\\s]+${escapeRegExp(tail)}(?:s|es)?`);
      }
    }
  }

  return [...cores];
}

function buildTermRegex(term, options = {}) {
  const cores = buildTermRegexCores(term, options);
  if (!cores.length) return /(?!)/;
  const alternation = cores.length === 1 ? cores[0] : `(?:${cores.join("|")})`;
  return new RegExp(`(^|[^A-Za-z0-9])(${alternation})($|[^A-Za-z0-9])`, "gi");
}

function mergeGlossaryEntries(existing, additions) {
  const merged = new Map();
  for (const entry of existing || []) {
    if (!entry?.term) continue;
    merged.set(entry.id || slugifyTerm(entry.term), {
      id: entry.id || slugifyTerm(entry.term),
      term: entry.term,
      definition: entry.definition || "",
      ...(entry.match ? { match: entry.match } : {}),
    });
  }
  for (const entry of additions || []) {
    if (!entry?.term) continue;
    const id = entry.id || slugifyTerm(entry.term);
    const prev = merged.get(id);
    merged.set(id, {
      id,
      term: entry.term,
      definition: entry.definition || prev?.definition || "",
      ...(entry.match || prev?.match ? { match: entry.match || prev.match } : {}),
    });
  }
  return [...merged.values()].sort((a, b) => a.term.localeCompare(b.term));
}

function extractGlossaryFromJson(data) {
  if (Array.isArray(data)) return mergeGlossaryEntries([], data);
  if (Array.isArray(data?.glossary)) return mergeGlossaryEntries([], data.glossary);
  return [];
}

function isVocabularyOnlyJson(data) {
  const glossary = extractGlossaryFromJson(data);
  return glossary.length > 0 && !Array.isArray(data?.pages);
}

async function loadOptionalVocabulary(path) {
  try {
    const data = await loadJSON(path);
    return extractGlossaryFromJson(data);
  } catch {
    return [];
  }
}

async function attachVocabularySources(bookData) {
  const params = new URLSearchParams(window.location.search);
  let glossary = bookData.glossary || [];

  if (params.get("vocab")) {
    glossary = mergeGlossaryEntries(
      glossary,
      await loadOptionalVocabulary(params.get("vocab"))
    );
  } else if (bookData.vocabulary) {
    glossary = mergeGlossaryEntries(
      glossary,
      await loadOptionalVocabulary(bookData.vocabulary)
    );
  } else if (!glossary.length) {
    glossary = mergeGlossaryEntries(
      glossary,
      await loadOptionalVocabulary("./data/tasks/vocabulary_1.json")
    );
  }

  return { ...bookData, glossary };
}

function findGlossaryTermMatches(text, glossary) {
  const all = [];

  for (const entry of glossary) {
    if (!entry.term) continue;

    const matchPatterns = [];
    if (entry.match) {
      const raw = Array.isArray(entry.match) ? entry.match : [entry.match];
      for (const pattern of raw) {
        matchPatterns.push(...buildTermRegexCores(pattern));
      }
    }
    matchPatterns.push(...buildTermRegexCores(entry.term));

    for (const core of [...new Set(matchPatterns)]) {
      const regex = new RegExp(`(^|[^A-Za-z0-9])(${core})($|[^A-Za-z0-9])`, "gi");
      let m;
      // eslint-disable-next-line no-cond-assign
      while ((m = regex.exec(text)) !== null) {
        const boundary = m[1] ?? "";
        const termText = m[2] ?? "";
        const start = m.index + boundary.length;
        const end = start + termText.length;
        all.push({
          start,
          end,
          termId: entry.id,
          termText,
        });
        if (m.index === regex.lastIndex) regex.lastIndex++;
      }
    }
  }

  // Sort by start asc, then longer matches first.
  all.sort((a, b) => (a.start - b.start) || ((b.end - b.start) - (a.end - a.start)));

  const chosen = [];
  let lastEnd = -1;
  for (const item of all) {
    if (item.start >= lastEnd) {
      chosen.push(item);
      lastEnd = item.end;
    }
  }
  return chosen;
}

function clearEl(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function setKnownFromStorage(bookData) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { knownTermIds: new Set(), pageDone: new Set() };
    const parsed = JSON.parse(raw);
    return {
      knownTermIds: new Set(parsed.knownTermIds || []),
      pageDone: new Set(parsed.pageDone || []),
    };
  } catch {
    return { knownTermIds: new Set(), pageDone: new Set() };
  }
}

function persistKnownAndPages(bookData, state) {
  localStorage.setItem(
    LS_KEY,
    JSON.stringify({
      knownTermIds: [...state.knownTermIds],
      pageDone: [...state.pageDone],
    })
  );
}

function openModal(termEntry, onToggleKnown) {
  const overlay = $("#modalOverlay");
  const modalTitle = $("#modalTitle");
  const modalBody = $("#modalBody");

  modalTitle.textContent = termEntry.term;

  clearEl(modalBody);
  if (termEntry.definition && String(termEntry.definition).trim().length > 0) {
    const p = createEl("p", null, termEntry.definition);
    p.style.margin = "0";
    modalBody.appendChild(p);
  } else {
    const p = createEl(
      "p",
      null,
      "Definition not set yet. You can add definitions in the JSON data."
    );
    p.style.color = "var(--muted)";
    modalBody.appendChild(p);
  }

  const known = !!termEntry.__known;
  const btn = createEl("button", "btn btn--accent", known ? "Mark as not known" : "Mark as known");
  btn.onclick = () => onToggleKnown();

  const hint = createEl("div", "kbdHint", "Tip: linked terms in the text are clickable.");
  const wrapper = createEl("div", "btnRow");
  wrapper.appendChild(btn);
  modalBody.appendChild(wrapper);
  modalBody.appendChild(hint);

  overlay.classList.remove("hidden");
}

function closeModal() {
  const overlay = $("#modalOverlay");
  overlay.classList.add("hidden");
}

function normalizeBookData(bookData) {
  const glossary = mergeGlossaryEntries([], bookData.glossary || []).map((t) => ({
    id: t.id || slugifyTerm(t.term || ""),
    term: t.term,
    definition: t.definition || "",
    ...(t.match ? { match: t.match } : {}),
  }));
  const glossaryById = new Map(glossary.map((g) => [g.id, g]));

  const pages = (bookData.pages || []).map((p, idx) => ({
    id: p.id || `page-${idx + 1}`,
    title: p.title || p.type || `Page ${idx + 1}`,
    type: p.type,
    ...p,
  }));

  return { ...bookData, glossary, glossaryById, pages };
}

function renderGlossaryList(bookData, state) {
  const list = $("#glossaryList");
  const search = $("#glossarySearch");
  const glossaryCount = $("#glossaryCount");

  const allEntries = bookData.glossary;
  glossaryCount.textContent = `${allEntries.length} terms`;

  function doRender(filterText) {
    clearEl(list);
    const query = (filterText || "").trim().toLowerCase();
    const filtered = query
      ? allEntries.filter((e) => e.term.toLowerCase().includes(query))
      : allEntries;

    for (const entry of filtered) {
      entry.__known = state.knownTermIds.has(entry.id);
      const row = createEl("div", "glossaryTerm");
      if (entry.__known) row.classList.add("termLink--known");

      const term = createEl("div", "termText", entry.term);
      term.style.marginBottom = "6px";

      const def = createEl(
        "div",
        null,
        entry.definition && entry.definition.trim() ? entry.definition : "No definition set."
      );
      def.className = "small muted";

      row.appendChild(term);
      row.appendChild(def);

      row.onclick = () => {
        openModal(entry, () => {
          if (state.knownTermIds.has(entry.id)) state.knownTermIds.delete(entry.id);
          else state.knownTermIds.add(entry.id);
          persistKnownAndPages(bookData, state);
          renderAll(bookData, state);
          closeModal();
        });
      };

      list.appendChild(row);
    }
  }

  search.oninput = () => doRender(search.value);
  doRender(search.value || "");
}

function renderLinkedText(text, bookData, state) {
  const container = createEl("div", null);
  const glossary = bookData.glossary;

  const matches = findGlossaryTermMatches(text, glossary);
  if (!matches.length) {
    container.textContent = text;
    return container;
  }

  let cursor = 0;
  for (const match of matches) {
    if (match.start > cursor) {
      container.appendChild(document.createTextNode(text.slice(cursor, match.start)));
    }

    const entry = bookData.glossaryById.get(match.termId);
    const known = state.knownTermIds.has(match.termId);

    const span = createEl("span", "termLink", match.termText);
    if (entry?.definition) span.title = entry.definition;
    if (known) span.classList.add("termLink--known");
    span.onclick = () => {
      entry.__known = known;
      openModal(entry, () => {
        if (state.knownTermIds.has(entry.id)) state.knownTermIds.delete(entry.id);
        else state.knownTermIds.add(entry.id);
        persistKnownAndPages(bookData, state);
        renderAll(bookData, state);
        closeModal();
      });
    };
    container.appendChild(span);

    cursor = match.end;
  }

  if (cursor < text.length) container.appendChild(document.createTextNode(text.slice(cursor)));

  return container;
}

function renderTextPage(page, bookData, state) {
  const header = $("#pageHeader");
  const body = $("#pageBody");
  clearEl(body);

  clearEl(header);
  const h1 = createEl("h1", null, page.title);
  header.appendChild(h1);

  const paragraphs = [];
  if (Array.isArray(page.paragraphs)) paragraphs.push(...page.paragraphs);
  else if (typeof page.text === "string") {
    // Split on blank lines.
    paragraphs.push(...page.text.split(/\n\s*\n/g).map((p) => p.trim()).filter(Boolean));
  }

  for (const p of paragraphs) {
    const para = createEl("div", "paragraph");
    para.appendChild(renderLinkedText(p, bookData, state));
    body.appendChild(para);
  }

  if (page.cornellNotes) {
    body.appendChild(renderCornellNotesPanel(page, bookData));
  }
}

function renderCornellNotesPanel(page, bookData) {
  const bookId = bookData.id || slugifyTerm(bookData.title || "interactive-book");
  const saved = loadCornellNotes(bookId, page.id);

  const panel = createEl("section", "cornell");
  panel.appendChild(createEl("h2", "cornell__title", "Cornell Notes"));
  panel.appendChild(
    createEl(
      "p",
      "cornell__intro small muted",
      "Use the Cue, Notes, and Summary fields below while you read. Save stores notes in this browser; Download exports a text file you can keep."
    )
  );

  const grid = createEl("div", "cornell__grid");
  const fields = [
    { key: "recall", title: CORNELL_FIELDS.recallTitle, placeholder: CORNELL_FIELDS.recallPlaceholder, rows: 6 },
    { key: "notes", title: CORNELL_FIELDS.notesTitle, placeholder: CORNELL_FIELDS.notesPlaceholder, rows: 10 },
  ];

  const values = { recall: saved.recall, notes: saved.notes, summary: saved.summary };
  const inputs = new Map();

  for (const field of fields) {
    const block = createEl("div", "cornell__field");
    block.appendChild(createEl("label", "cornell__label", field.title));
    const ta = document.createElement("textarea");
    ta.className = "input cornell__input";
    ta.rows = field.rows;
    ta.placeholder = field.placeholder;
    ta.value = values[field.key] || "";
    inputs.set(field.key, ta);
    block.appendChild(ta);
    grid.appendChild(block);
  }

  const summaryBlock = createEl("div", "cornell__field cornell__field--summary");
  summaryBlock.appendChild(createEl("label", "cornell__label", CORNELL_FIELDS.summaryTitle));
  const summaryTa = document.createElement("textarea");
  summaryTa.className = "input cornell__input";
  summaryTa.rows = 7;
  summaryTa.placeholder = CORNELL_FIELDS.summaryPlaceholder;
  summaryTa.value = values.summary || "";
  inputs.set("summary", summaryTa);
  summaryBlock.appendChild(summaryTa);

  panel.appendChild(grid);
  panel.appendChild(summaryBlock);

  const status = createEl("div", "cornell__status small muted");
  if (saved.updatedAt) {
    status.textContent = `Last saved: ${new Date(saved.updatedAt).toLocaleString()}`;
  }

  const actions = createEl("div", "btnRow cornell__actions");
  const saveBtn = createEl("button", "btn btn--accent", "Save notes");
  const downloadBtn = createEl("button", "btn", "Download notes");
  const downloadAllBtn = createEl("button", "btn", "Download all notes");
  const copyBtn = createEl("button", "btn", "Copy to clipboard");

  const readCurrentNotes = () => ({
    recall: inputs.get("recall").value,
    notes: inputs.get("notes").value,
    summary: inputs.get("summary").value,
  });

  saveBtn.onclick = () => {
    const payload = saveCornellNotes(bookId, page.id, readCurrentNotes());
    status.textContent = `Notes saved (${new Date(payload.updatedAt).toLocaleString()})`;
    status.classList.add("cornell__status--saved");
  };

  downloadBtn.onclick = () => {
    const current = readCurrentNotes();
    // Persist first so download matches what the reader expects to keep.
    const payload = saveCornellNotes(bookId, page.id, current);
    const text = formatCornellNotesText({
      title: page.title,
      bookTitle: bookData.title,
      recall: payload.recall,
      notes: payload.notes,
      summary: payload.summary,
      updatedAt: payload.updatedAt,
    });
    const filename = `cornell-notes-${cornellDownloadBasename(page.title)}.txt`;
    downloadTextFile(filename, text);
    status.textContent = `Downloaded ${filename}`;
    status.classList.add("cornell__status--saved");
  };

  downloadAllBtn.onclick = () => {
    // Include the current page’s unsaved edits before collecting.
    saveCornellNotes(bookId, page.id, readCurrentNotes());
    const { bookTitle, items } = collectAllCornellNotes(bookData);
    if (!items.length) {
      status.textContent = "No saved Cornell notes to download yet";
      status.classList.remove("cornell__status--saved");
      return;
    }

    const sections = items.map((item, index) =>
      formatCornellNotesText({
        title: item.title,
        bookTitle: index === 0 ? bookTitle : null,
        recall: item.recall,
        notes: item.notes,
        summary: item.summary,
        updatedAt: item.updatedAt,
      })
    );
    const text = [
      `Cornell Notes — ${bookTitle}`,
      `Exported: ${new Date().toLocaleString()}`,
      `Pages with notes: ${items.length}`,
      "",
      sections.join("\n" + "═".repeat(48) + "\n\n"),
    ].join("\n");

    const filename = `cornell-notes-${cornellDownloadBasename(bookTitle)}-all.txt`;
    downloadTextFile(filename, text);
    status.textContent = `Downloaded ${items.length} page(s) as ${filename}`;
    status.classList.add("cornell__status--saved");
  };

  copyBtn.onclick = async () => {
    const current = readCurrentNotes();
    const text = formatCornellNotesText({
      title: page.title,
      bookTitle: bookData.title,
      ...current,
    });
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Notes copied to clipboard";
    } catch {
      status.textContent = "Could not copy notes to clipboard";
    }
  };

  actions.appendChild(saveBtn);
  actions.appendChild(downloadBtn);
  actions.appendChild(downloadAllBtn);
  actions.appendChild(copyBtn);
  panel.appendChild(actions);
  panel.appendChild(status);

  return panel;
}

function renderMatchingTask(task, bookData, state) {
  const body = $("#pageBody");
  const header = $("#pageHeader");
  clearEl(body);
  clearEl(header);

  header.appendChild(createEl("h1", null, $("#pageHeader").dataset.pageTitle || "Matching task"));

  const match = task.matching || {};
  const termIds = match.termIds || [];
  const options = match.options || [];
  const correctByTermId = match.correctByTermId || {};

  // Build UI state
  const selectByTerm = new Map();

  const knownToScore = termIds.filter((id) => !!correctByTermId[id]);

  const block = createEl("div", "taskBlock");
  block.appendChild(createEl("div", "taskTitle", task.prompt || "Match the words to the correct definitions."));

  const grid = createEl("div", "grid2");

  // Left column terms / right dropdowns.
  for (const termId of termIds) {
    const entry = bookData.glossaryById.get(termId);
    const left = createEl("div", null);
    left.appendChild(createEl("div", "termText", entry ? entry.term : termId));

    const right = createEl("div", null);
    const sel = document.createElement("select");
    sel.className = "input";

    const emptyOpt = document.createElement("option");
    emptyOpt.value = "";
    emptyOpt.textContent = "Choose…";
    sel.appendChild(emptyOpt);

    for (const opt of options) {
      const o = document.createElement("option");
      o.value = opt.id;
      o.textContent = `${opt.label}) ${opt.definition}`;
      sel.appendChild(o);
    }

    sel.onchange = () => {
      selectByTerm.set(termId, sel.value);
    };
    selectByTerm.set(termId, sel.value);

    right.appendChild(sel);
    grid.appendChild(left);
    grid.appendChild(right);
  }

  block.appendChild(grid);

  const result = createEl("div", "small muted");
  result.style.marginTop = "10px";

  const actions = createEl("div", "btnRow");
  const checkBtn = createEl("button", "btn btn--accent", "Check answers");
  const doneBtn = createEl("button", "btn", "Mark page completed");
  doneBtn.onclick = () => {
    // Completion handled in renderTaskPage wrapper.
    const ev = new CustomEvent("pageCompleted", { detail: { completed: true } });
    window.dispatchEvent(ev);
  };

  checkBtn.onclick = () => {
    const chosen = new Map();
    for (const termId of termIds) chosen.set(termId, selectByTerm.get(termId) || "");

    let correct = 0;
    for (const termId of knownToScore) {
      const ok = correctByTermId[termId];
      if (chosen.get(termId) === ok) correct++;
    }
    const total = Math.max(knownToScore.length, 1);
    result.textContent = `Score: ${correct}/${total} (only terms with known correct answers are scored).`;
    result.style.color = "var(--text)";

    // Give quick per-select feedback for scored terms.
    for (const termId of knownToScore) {
      const entry = bookData.glossaryById.get(termId);
      const correctOptId = correctByTermId[termId];

      // Find the select element by rebuilding: keep simple by using DOM query.
      // (We mark all selects by comparing their current value.)
      // This isn't perfect but keeps the code simple.
      const selects = grid.querySelectorAll("select");
      // Find by matching the label in the left column is non-trivial; instead, we store data-termId.
    }
  };

  actions.appendChild(checkBtn);
  actions.appendChild(doneBtn);
  block.appendChild(actions);
  block.appendChild(result);

  body.appendChild(block);
}

function renderFillBlanksTask(task, bookData, state) {
  const body = $("#pageBody");
  const header = $("#pageHeader");
  clearEl(body);
  clearEl(header);

  header.appendChild(createEl("h1", null, task.title || "Fill in the blanks"));

  const fill = task.fillBlanks || {};
  const items = fill.items || [];
  const answerTermIds = fill.choices || bookData.glossary.map((g) => g.id);
  const inputMode = task.inputMode || fill.inputMode || "selection";
  const typingMode = inputMode === "typing";

  const answerByItem = new Map();

  const block = createEl("div", "taskBlock");
  block.appendChild(createEl("div", "taskTitle", task.prompt || "Complete the sentences."));

  for (const item of items) {
    const row = createEl("div", "fillBlankRow");
    const prompt = createEl("div", "small", item.prompt);
    prompt.style.marginBottom = "8px";
    row.appendChild(prompt);

    if (item.hint) {
      const hint = createEl("div", "fillBlankHint small muted", `Hint: ${item.hint}`);
      row.appendChild(hint);
    }

    if (typingMode) {
      const entry = bookData.glossaryById.get(item.answerTermId);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "input";
      input.placeholder = "Type the vocabulary word…";
      input.autocomplete = "off";
      input.oninput = () => answerByItem.set(item.id, input.value.trim());
      answerByItem.set(item.id, "");
      row.appendChild(input);
      row.dataset.answerTerm = entry ? entry.term : item.answerTermId;
    } else {
      const sel = document.createElement("select");
      sel.className = "input";
      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "Choose…";
      sel.appendChild(emptyOpt);
      for (const termId of answerTermIds) {
        const entry = bookData.glossaryById.get(termId);
        const o = document.createElement("option");
        o.value = termId;
        o.textContent = entry ? entry.term : termId;
        sel.appendChild(o);
      }
      sel.onchange = () => answerByItem.set(item.id, sel.value);
      answerByItem.set(item.id, "");
      row.appendChild(sel);
    }

    block.appendChild(row);
  }

  const result = createEl("div", "small muted");

  const actions = createEl("div", "btnRow");
  const checkBtn = createEl("button", "btn btn--accent", "Check answers");
  const doneBtn = createEl("button", "btn", "Mark page completed");
  doneBtn.onclick = () => window.dispatchEvent(new CustomEvent("pageCompleted", { detail: { completed: true } }));

  checkBtn.onclick = () => {
    let correct = 0;
    for (const item of items) {
      const given = answerByItem.get(item.id) || "";
      if (typingMode) {
        const entry = bookData.glossaryById.get(item.answerTermId);
        const expected = entry ? entry.term : "";
        if (given && expected && given.toLowerCase() === expected.toLowerCase()) correct++;
      } else if (given && item.answerTermId && given === item.answerTermId) {
        correct++;
      }
    }
    result.textContent = `Score: ${correct}/${items.length}`;
    result.style.color = "var(--text)";
  };

  actions.appendChild(checkBtn);
  actions.appendChild(doneBtn);

  block.appendChild(actions);
  block.appendChild(result);
  body.appendChild(block);
}

function renderFindExplainTask(task, bookData, state) {
  const body = $("#pageBody");
  const header = $("#pageHeader");
  clearEl(body);
  clearEl(header);

  header.appendChild(createEl("h1", null, task.title || "Find & explain"));

  const find = task.findExplain || {};
  const terms = find.termIds || [];
  const prompt = task.prompt || "Find these words and expressions in the text, explain their meaning.";

  const block = createEl("div", "taskBlock");
  block.appendChild(createEl("div", "taskTitle", prompt));

  const inputs = new Map();
  for (const termId of terms) {
    const entry = bookData.glossaryById.get(termId);
    const row = createEl("div", null);
    row.style.marginBottom = "12px";

    const label = createEl("div", "small", entry ? entry.term : termId);
    label.style.marginBottom = "8px";

    const ta = document.createElement("textarea");
    ta.className = "input";
    ta.placeholder = "Type the meaning in your own words…";
    inputs.set(termId, ta);

    const btn = createEl("button", "btn", "Show definition");
    btn.onclick = () => {
      if (!entry) return;
      entry.__known = state.knownTermIds.has(entry.id);
      openModal(entry, () => {
        if (state.knownTermIds.has(entry.id)) state.knownTermIds.delete(entry.id);
        else state.knownTermIds.add(entry.id);
        persistKnownAndPages(bookData, state);
        renderAll(bookData, state);
        closeModal();
      });
    };

    row.appendChild(label);
    row.appendChild(ta);
    row.appendChild(btn);
    block.appendChild(row);
  }

  const actions = createEl("div", "btnRow");
  const doneBtn = createEl("button", "btn btn--accent", "Mark page completed");
  doneBtn.onclick = () => window.dispatchEvent(new CustomEvent("pageCompleted", { detail: { completed: true } }));
  actions.appendChild(doneBtn);

  block.appendChild(actions);
  body.appendChild(block);
}

function renderTaskPage(page, bookData, state) {
  $("#pageHeader").dataset.pageTitle = page.title;
  const task = page.task || {};

  if (task.type === "matching") {
    renderMatchingTask(task, bookData, state);
  } else if (task.type === "fill_blanks") {
    renderFillBlanksTask(task, bookData, state);
  } else if (task.type === "find_explain") {
    renderFindExplainTask(task, bookData, state);
  } else {
    const body = $("#pageBody");
    clearEl(body);
    body.appendChild(createEl("div", "small muted", `Unknown task type: ${task.type}`));
  }
}

function renderTOC(bookData, state) {
  const toc = $("#toc");
  clearEl(toc);

  for (const page of bookData.pages) {
    const btn = createEl("button", "tocBtn", page.title);
    btn.classList.toggle("tocBtn--active", page.id === state.currentPageId);
    btn.onclick = () => {
      state.currentPageId = page.id;
      persistKnownAndPages(bookData, state);
      renderAll(bookData, state);
    };
    toc.appendChild(btn);
  }
}

function renderPage(bookData, state) {
  const page = bookData.pages.find((p) => p.id === state.currentPageId) || bookData.pages[0];
  state.currentPageId = page.id;

  $("#pageHeader").dataset.pageTitle = page.title;

  $("#pageHeader").innerHTML = "";
  clearEl($("#pageBody"));

  if (page.type === "text") {
    renderTextPage(page, bookData, state);
  } else if (page.type === "task") {
    renderTaskPage(page, bookData, state);
  } else {
    const body = $("#pageBody");
    body.appendChild(createEl("div", "small muted", `Unknown page type: ${page.type}`));
  }
}

function renderBookHeader(bookData) {
  $("#bookTitle").textContent = bookData.title || "Interactive Book";
}

function renderAll(bookData, state) {
  renderBookHeader(bookData);
  renderTOC(bookData, state);
  renderGlossaryList(bookData, state);
  renderPage(bookData, state);
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load JSON: ${path}`);
  return res.json();
}

function wireModalHandlers(state, bookData) {
  $("#modalOverlay").onclick = (e) => {
    if (e.target === $("#modalOverlay")) closeModal();
  };
  $("#modalCloseBtn").onclick = closeModal;
}

async function init() {
  initThemeToggle();

  let bookData = null;
  let state = { knownTermIds: new Set(), pageDone: new Set(), currentPageId: "" };

  // Page completed event
  window.addEventListener("pageCompleted", () => {
    if (!bookData) return;
    state.pageDone.add(state.currentPageId);
    persistKnownAndPages(bookData, state);
    // Re-render TOC styling could be added later.
    renderAll(bookData, state);
  });

  wireModalHandlers(state, bookData);

  const configuredSrc = document.body?.dataset?.bookSrc;
  const isDemo = document.body?.dataset?.demo === "true";

  // Load default data
  try {
    let json = null;
    if (configuredSrc) {
      json = await loadJSON(configuredSrc);
    } else {
      try {
        json = await loadJSON("./data/book.generated.json");
      } catch {
        json = await loadJSON("./data/book.example.json");
      }
    }
    // Demo JSON already embeds the glossary — skip auto-merge overlays.
    if (!isDemo) {
      json = await attachVocabularySources(json);
    }
    bookData = normalizeBookData(json);
    const stored = setKnownFromStorage(bookData);
    state.knownTermIds = stored.knownTermIds;
    state.pageDone = stored.pageDone;
    state.currentPageId = bookData.pages[0]?.id || "";
    renderAll(bookData, state);
  } catch (e) {
    console.error(e);
    $("#pageBody").appendChild(createEl("div", "small muted", "Failed to load default data."));
  }

  // Allow user to load a JSON file (full book UI only)
  const fileInput = $("#jsonFileInput");
  if (fileInput) {
    fileInput.addEventListener("change", async (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;

      const txt = await file.text();
      try {
        const parsed = JSON.parse(txt);
        if (isVocabularyOnlyJson(parsed)) {
          if (!bookData) {
            alert("Load the book first, then load a vocabulary file to merge glossary terms.");
            return;
          }
          const additions = extractGlossaryFromJson(parsed);
          bookData = normalizeBookData({
            ...bookData,
            glossary: mergeGlossaryEntries(bookData.glossary, additions),
          });
        } else {
          let merged = parsed;
          if (!merged.glossary?.length) {
            merged = await attachVocabularySources(parsed);
          }
          bookData = normalizeBookData(merged);
        }
        const stored = setKnownFromStorage(bookData);
        state.knownTermIds = stored.knownTermIds;
        state.pageDone = stored.pageDone;
        state.currentPageId = bookData.pages[0]?.id || "";
        persistKnownAndPages(bookData, state);
        renderAll(bookData, state);
      } catch (err) {
        alert("Invalid JSON file.");
      } finally {
        ev.target.value = "";
      }
    });
  }
}

init();

