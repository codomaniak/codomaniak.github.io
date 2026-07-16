(function () {
  "use strict";

  const topicPanel = document.getElementById("topic-panel");
  const problemPanel = document.getElementById("problem-panel");
  const topicGrid = document.getElementById("topic-grid");
  const topicBadge = document.getElementById("topic-badge");
  const operationBadge = document.getElementById("operation-badge");
  const problemText = document.getElementById("problem-text");
  const answerForm = document.getElementById("answer-form");
  const answerInput = document.getElementById("answer-input");
  const checkBtn = document.getElementById("check-btn");
  const feedback = document.getElementById("feedback");
  const changeTopicBtn = document.getElementById("change-topic-btn");
  const nextBtn = document.getElementById("next-btn");
  const themeToggle = document.getElementById("theme-toggle");
  const themeToggleIcon = document.getElementById("theme-toggle-icon");
  const themeToggleLabel = document.getElementById("theme-toggle-label");

  const THEME_KEY = "theme";

  let currentTopic = null;
  let currentProblem = null;
  let answered = false;

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function updateThemeToggle(theme) {
    const isLight = theme === "light";
    themeToggleIcon.textContent = isLight ? "☾" : "☀";
    themeToggleLabel.textContent = isLight ? "Dark" : "Light";
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeToggle(theme);
  }

  themeToggle.addEventListener("click", () => {
    setTheme(getTheme() === "light" ? "dark" : "light");
  });
  updateThemeToggle(getTheme());

  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (event) => {
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(event.matches ? "light" : "dark");
    }
  });

  function showFeedback(message, isSuccess) {
    feedback.textContent = message;
    feedback.classList.remove("feedback--hidden", "feedback--success", "feedback--error");
    feedback.classList.add(isSuccess ? "feedback--success" : "feedback--error");
  }

  function hideFeedback() {
    feedback.classList.add("feedback--hidden");
    feedback.classList.remove("feedback--success", "feedback--error");
  }

  function showTopicPanel() {
    topicPanel.classList.remove("panel--hidden");
    problemPanel.classList.add("panel--hidden");
    currentTopic = null;
    currentProblem = null;
    answered = false;
    topicGrid.querySelectorAll(".topic-btn").forEach((btn) => {
      btn.classList.remove("is-active");
      btn.disabled = false;
    });
  }

  function showProblemPanel() {
    topicPanel.classList.add("panel--hidden");
    problemPanel.classList.remove("panel--hidden");
  }

  function renderTopics(topics) {
    topicGrid.innerHTML = "";
    for (const topic of topics) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "topic-btn";
      btn.dataset.topic = topic.key;
      btn.textContent = topic.name;
      topicGrid.appendChild(btn);
    }
  }

  function loadProblem(topicKey) {
    hideFeedback();
    answerInput.value = "";
    answerInput.disabled = false;
    checkBtn.disabled = false;
    answered = false;

    try {
      currentProblem = window.DemoGenerator.generateProblem(topicKey);
      topicBadge.textContent = currentProblem.topic;
      operationBadge.textContent = currentProblem.operation;
      problemText.textContent = currentProblem.text;
      showProblemPanel();
      answerInput.focus();
    } catch (err) {
      showFeedback(err.message, false);
    }
  }

  topicGrid.addEventListener("click", (event) => {
    const btn = event.target.closest(".topic-btn");
    if (!btn || btn.disabled) return;
    currentTopic = btn.dataset.topic;
    topicGrid.querySelectorAll(".topic-btn").forEach((el) => {
      el.classList.toggle("is-active", el === btn);
    });
    loadProblem(currentTopic);
  });

  answerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!currentProblem || answered) return;
    const result = window.DemoGenerator.checkAnswer(currentProblem, answerInput.value);
    showFeedback(result.message, result.correct);
    answered = true;
    answerInput.disabled = true;
    checkBtn.disabled = true;
  });

  changeTopicBtn.addEventListener("click", showTopicPanel);
  nextBtn.addEventListener("click", () => {
    if (currentTopic) loadProblem(currentTopic);
  });

  if (!window.DEMO_DATA || !window.DemoGenerator) {
    topicGrid.innerHTML = "<p class=\"subtitle\">Demo data failed to load. Run <code>python3 scripts/build_demo.py</code>.</p>";
  } else {
    renderTopics(window.DEMO_DATA.topics);
  }
})();
