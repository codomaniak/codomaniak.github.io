export const THEME_KEY = "interactive-book:theme";

export function getStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(theme, buttonId = "themeToggleBtn") {
  const root = document.documentElement;
  if (theme === "light") root.dataset.theme = "light";
  else delete root.dataset.theme;

  const btn = document.getElementById(buttonId);
  if (!btn) return;

  const isLight = theme === "light";
  btn.setAttribute("aria-pressed", isLight ? "true" : "false");
  btn.textContent = isLight ? "Dark" : "Light";
  btn.title = isLight ? "Switch to dark theme" : "Switch to light theme";
  btn.setAttribute("aria-label", btn.title);
}

export function initThemeToggle(buttonId = "themeToggleBtn") {
  applyTheme(getStoredTheme(), buttonId);
  document.getElementById(buttonId)?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next, buttonId);
  });
}
