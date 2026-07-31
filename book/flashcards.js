import { initThemeToggle } from "./theme.js";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function closeAppMenu() {
  document.body.classList.remove("menu-open");
  const toggle = $("#menuToggleBtn");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}

function openAppMenu() {
  document.body.classList.add("menu-open");
  const toggle = $("#menuToggleBtn");
  if (toggle) toggle.setAttribute("aria-expanded", "true");
}

function toggleAppMenu() {
  if (document.body.classList.contains("menu-open")) closeAppMenu();
  else openAppMenu();
}

function initDemoMenu() {
  if (document.body?.dataset?.demo !== "true") return;
  $("#menuToggleBtn")?.addEventListener("click", () => toggleAppMenu());
  $("#menuBackdrop")?.addEventListener("click", () => closeAppMenu());
  $("#menuCloseBtn")?.addEventListener("click", () => closeAppMenu());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAppMenu();
  });
}

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeVocabulary(raw) {
  const list = Array.isArray(raw) ? raw : raw?.glossary || [];
  return list
    .map((item, idx) => ({
      id: item.id || slugify(item.term || `term-${idx + 1}`),
      term: String(item.term || "").trim(),
      definition: String(item.definition || "").trim(),
    }))
    .filter((e) => e.term.length > 0);
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildCards(entries, direction) {
  const cards = [];
  for (const entry of entries) {
    if (!entry.definition) continue;
    if (direction === "term-to-def" || direction === "both") {
      cards.push({ front: entry.term, back: entry.definition, entry });
    }
    if (direction === "def-to-term" || direction === "both") {
      cards.push({ front: entry.definition, back: entry.term, entry });
    }
  }
  return cards;
}

function pickDistractors(entry, pool, count) {
  return shuffle(pool.filter((e) => e.id !== entry.id && e.definition)).slice(0, count);
}

const state = {
  entries: [],
  cards: [],
  cardIndex: 0,
  flipped: false,
  mode: "drill",
};

function getSettings() {
  return {
    title: $("#deckTitleInput").value.trim() || "Vocabulary Flashcards",
    direction: $("#directionSelect").value,
    shuffle: $("#shuffleCards").checked,
    maxQuestions: Number($("#maxQuestions").value) || 12,
    quizTypes: $$('input[name="quizType"]:checked').map((el) => el.value),
  };
}

function exportBookJson() {
  const settings = getSettings();
  return {
    title: settings.title,
    language: "en",
    glossary: state.entries,
  };
}

function updateCliHint() {
  const settings = getSettings();
  const quizFlag =
    $("#exportQuiz").checked && settings.quizTypes.length
      ? ` --quiz ${settings.quizTypes.join(",")}`
      : " --flashcards-only";
  const flags = $("#exportFlashcards").checked && $("#exportQuiz").checked
    ? ` --quiz ${settings.quizTypes.join(",")}`
  : $("#exportFlashcards").checked
      ? " --flashcards-only"
      : quizFlag;

  $("#cliHint").textContent =
    `# 1. Fetch H5P libraries (once; builds Advanced Blanks via npm)\nnode scripts/fetch-h5p-flashcard-libs.mjs\n\n` +
    `# 2. Save vocabulary JSON, then build packages\n` +
    `node scripts/build-flashcards-h5p.mjs \\\n` +
    `  --input data/vocabulary.json \\\n` +
    `  --title "${settings.title}" \\\n` +
    `  --direction ${settings.direction} \\\n` +
    `  --maxQuestions ${settings.maxQuestions}${flags}`;
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function rebuildCards() {
  const settings = getSettings();
  let cards = buildCards(
    state.entries.filter((e) => e.term && e.definition),
    settings.direction
  );
  if (settings.shuffle) cards = shuffle(cards);
  state.cards = cards;
  state.cardIndex = Math.min(state.cardIndex, Math.max(cards.length - 1, 0));
  renderDrill();
  updateCounts();
}

function updateCounts() {
  $("#vocabCount").textContent = `${state.entries.length} terms`;
  $("#deckTitle").textContent = getSettings().title;
}

function renderVocabEditor(filter = "") {
  const editor = $("#vocabEditor");
  editor.innerHTML = "";
  const q = filter.trim().toLowerCase();

  const rows = state.entries.filter(
    (e) => !q || e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
  );

  for (const entry of rows) {
    const row = document.createElement("div");
    row.className = "vocab-row";

    const termInput = document.createElement("input");
    termInput.value = entry.term;
    termInput.placeholder = "Term";
    termInput.oninput = () => {
      entry.term = termInput.value;
      entry.id = slugify(entry.term) || entry.id;
      updateCounts();
      updateCliHint();
    };

    const defInput = document.createElement("textarea");
    defInput.value = entry.definition;
    defInput.placeholder = "Definition";
    defInput.oninput = () => {
      entry.definition = defInput.value;
      updateCliHint();
    };

    const removeBtn = document.createElement("button");
    removeBtn.className = "vocab-row__remove";
    removeBtn.type = "button";
    removeBtn.textContent = "✕";
    removeBtn.onclick = () => {
      state.entries = state.entries.filter((e) => e.id !== entry.id);
      renderVocabEditor($("#vocabSearch").value);
      rebuildCards();
      updateCounts();
      updateCliHint();
    };

    row.append(termInput, defInput, removeBtn);
    editor.appendChild(row);
  }
}

function renderDrill() {
  const cards = state.cards;
  const progress = $("#cardProgress");
  const inner = $("#flashcardInner");

  if (!cards.length) {
    $("#cardFront").textContent = "Add vocabulary with definitions to start drilling.";
    $("#cardBack").textContent = "—";
    progress.textContent = "0 / 0";
    return;
  }

  const card = cards[state.cardIndex];
  const frontEl = $("#cardFront");
  const backEl = $("#cardBack");
  frontEl.textContent = card.front;
  backEl.textContent = card.back;
  frontEl.className = `flashcard__text ${card.front === card.entry.term ? "flashcard__text--vocab-term" : "flashcard__text--vocab-definition"}`;
  backEl.className = `flashcard__text ${card.back === card.entry.term ? "flashcard__text--vocab-term" : "flashcard__text--vocab-definition"}`;
  progress.textContent = `${state.cardIndex + 1} / ${cards.length}`;
  inner.classList.toggle("flashcard__inner--flipped", state.flipped);
  $("#cardProgressFooter").textContent = cards.length
    ? `Card ${state.cardIndex + 1} of ${cards.length}`
    : "";
}

function nextCard(delta) {
  if (!state.cards.length) return;
  state.cardIndex = (state.cardIndex + delta + state.cards.length) % state.cards.length;
  state.flipped = false;
  renderDrill();
}

function flipCard() {
  state.flipped = !state.flipped;
  $("#flashcardInner").classList.toggle("flashcard__inner--flipped", state.flipped);
}

function renderQuizPreview() {
  const body = $("#quizBody");
  body.innerHTML = "";

  const usable = state.entries.filter((e) => e.term && e.definition);
  if (usable.length < 2) {
    body.innerHTML = '<p class="muted">Add at least two terms with definitions for quiz preview.</p>';
    return;
  }

  const settings = getSettings();
  const selected = shuffle(usable).slice(0, Math.min(settings.maxQuestions, usable.length));

  for (const entry of selected) {
    const block = document.createElement("div");
    block.className = "quiz-question";

    const prompt = document.createElement("div");
    prompt.className = "quiz-question__prompt";
    prompt.innerHTML = `What is the meaning of <strong>${escapeHtml(entry.term)}</strong>?`;

    const options = document.createElement("div");
    options.className = "quiz-options";

    const choices = shuffle([
      { text: entry.definition, correct: true },
      ...pickDistractors(entry, usable, 3).map((d) => ({ text: d.definition, correct: false })),
    ]);

    let answered = false;
    for (const choice of choices) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option";
      btn.textContent = choice.text;
      btn.onclick = () => {
        if (answered) return;
        answered = true;
        btn.classList.add("quiz-option--selected");
        if (choice.correct) {
          btn.classList.add("quiz-option--correct");
        } else {
          btn.classList.add("quiz-option--wrong");
          for (const child of options.children) {
            if (child.textContent === entry.definition) child.classList.add("quiz-option--correct");
          }
        }
      };
      options.appendChild(btn);
    }

    block.append(prompt, options);
    body.appendChild(block);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setMode(mode) {
  state.mode = mode;
  $$(".mode-tab").forEach((tab) => {
    tab.classList.toggle("mode-tab--active", tab.dataset.mode === mode);
  });
  $("#drillPanel").classList.toggle("hidden", mode !== "drill");
  $("#quizPanel").classList.toggle("hidden", mode !== "quiz");
  if (mode === "quiz") renderQuizPreview();
}

async function loadDefaultData() {
  const configuredSrc = document.body?.dataset?.vocabSrc;
  const isDemo = document.body?.dataset?.demo === "true";
  try {
    let json;
    if (configuredSrc) {
      const res = await fetch(configuredSrc);
      json = await res.json();
    } else {
      try {
        const res = await fetch("./data/book.generated.json");
        json = await res.json();
      } catch {
        const res = await fetch("./data/book.example.json");
        json = await res.json();
      }
    }
    state.entries = normalizeVocabulary(json);
    const defaultTitle = isDemo
      ? "Demo Glossary — Flashcards"
      : json.title
        ? `${json.title} — Flashcards`
        : "Vocabulary Flashcards";
    $("#deckTitleInput").value = defaultTitle;
    $("#deckTitle").textContent = defaultTitle;
  } catch {
    state.entries = normalizeVocabulary([
      { term: "boarding school", definition: "A school where students live away from home" },
      { term: "ledger", definition: "A record-keeping book for finances" },
    ]);
  }
}

function wireEvents() {
  $("#directionSelect").onchange = rebuildCards;
  $("#shuffleCards").onchange = rebuildCards;
  $("#deckTitleInput").oninput = () => {
    updateCounts();
    updateCliHint();
  };
  $("#maxQuestions").oninput = updateCliHint;
  $("#exportFlashcards").onchange = updateCliHint;
  $("#exportQuiz").onchange = updateCliHint;
  $$('input[name="quizType"]').forEach((el) => {
    el.onchange = updateCliHint;
  });

  $("#vocabSearch").oninput = (e) => renderVocabEditor(e.target.value);

  $("#addTermBtn").onclick = () => {
    state.entries.push({ id: `new-${Date.now()}`, term: "", definition: "" });
    renderVocabEditor($("#vocabSearch").value);
    updateCounts();
  };

  $("#exportJsonBtn").onclick = () => downloadJson("vocabulary.json", exportBookJson());
  $("#downloadVocabBtn").onclick = () => downloadJson("vocabulary.json", exportBookJson());

  $("#prevCardBtn").onclick = () => nextCard(-1);
  $("#nextCardBtn").onclick = () => nextCard(1);
  $("#flipCardBtn").onclick = flipCard;
  $("#flashcard").onclick = flipCard;

  $("#resetDrillBtn").onclick = () => {
    state.cardIndex = 0;
    state.flipped = false;
    rebuildCards();
  };

  $$(".mode-tab").forEach((tab) => {
    tab.onclick = () => setMode(tab.dataset.mode);
  });
  $("#newQuizBtn").onclick = renderQuizPreview;

  $("#jsonFileInput").addEventListener("change", async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      state.entries = normalizeVocabulary(json);
      if (json.title) $("#deckTitleInput").value = `${json.title} — Flashcards`;
      renderVocabEditor();
      rebuildCards();
      updateCliHint();
    } catch {
      alert("Invalid JSON file.");
    } finally {
      ev.target.value = "";
    }
  });
}

async function init() {
  initThemeToggle();
  initDemoMenu();
  await loadDefaultData();
  wireEvents();
  renderVocabEditor();
  rebuildCards();
  updateCliHint();
}

init();
