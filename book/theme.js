export const THEME_KEY = "interactive-book:theme";

export function getStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function syncThemeControls(theme) {
  const isLight = theme === "light";
  const label = isLight ? "Dark" : "Light";
  const title = isLight ? "Switch to dark theme" : "Switch to light theme";

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.setAttribute("aria-pressed", isLight ? "true" : "false");
    btn.textContent = label;
    btn.title = title;
    btn.setAttribute("aria-label", title);
  });

  document.querySelectorAll("[data-theme-option]").forEach((btn) => {
    const option = btn.getAttribute("data-theme-option");
    const active = option === theme || (option === "dark" && !isLight);
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

export function applyTheme(theme, buttonId = "themeToggleBtn") {
  const root = document.documentElement;
  if (theme === "light") root.dataset.theme = "light";
  else delete root.dataset.theme;

  syncThemeControls(theme);

  // Legacy single-button id used by older markup
  const btn = document.getElementById(buttonId);
  if (btn && !btn.hasAttribute("data-theme-toggle")) {
    const isLight = theme === "light";
    btn.setAttribute("aria-pressed", isLight ? "true" : "false");
    btn.textContent = isLight ? "Dark" : "Light";
    btn.title = isLight ? "Switch to dark theme" : "Switch to light theme";
    btn.setAttribute("aria-label", btn.title);
  }
}

export function setTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  return next;
}

export function toggleTheme() {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  return setTheme(next);
}

export function initThemeToggle(buttonId = "themeToggleBtn") {
  applyTheme(getStoredTheme(), buttonId);

  const legacy = document.getElementById(buttonId);
  const toggles = new Set(document.querySelectorAll("[data-theme-toggle]"));
  if (legacy) toggles.add(legacy);

  toggles.forEach((btn) => {
    if (btn.dataset.themeBound) return;
    btn.dataset.themeBound = "1";
    btn.addEventListener("click", () => toggleTheme());
  });

  document.querySelectorAll("[data-theme-option]").forEach((btn) => {
    if (btn.dataset.themeBound) return;
    btn.dataset.themeBound = "1";
    btn.addEventListener("click", () => {
      setTheme(btn.getAttribute("data-theme-option"));
    });
  });
}
