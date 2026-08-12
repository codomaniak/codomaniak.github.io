(function () {
  var KEY = 'drums-hub:theme';

  function storedTheme() {
    var t = localStorage.getItem(KEY);
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') document.documentElement.dataset.theme = 'light';
    else delete document.documentElement.dataset.theme;
    document.querySelectorAll('[data-theme-option]').forEach(function (btn) {
      var option = btn.getAttribute('data-theme-option');
      var active = option === theme || (option === 'dark' && theme === 'dark');
      btn.classList.toggle('is-active', active);
    });
  }

  function setTheme(theme) {
    var next = theme === 'light' ? 'light' : 'dark';
    localStorage.setItem(KEY, next);
    applyTheme(next);
  }

  (function initEarly() {
    if (storedTheme() === 'light') document.documentElement.dataset.theme = 'light';
  })();

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(storedTheme());
    document.querySelectorAll('[data-theme-option]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTheme(btn.getAttribute('data-theme-option'));
      });
    });
  });
})();
