/* modules/theme-manager.js – Manages Light/Dark themes */

const ThemeManager = (() => {
  const STORAGE_KEY = "pdf-viewer-theme";

  function apply(theme) {
    const body = document.body;
    if (theme === "dark") {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
    updateIcon(theme);
  }

  function updateIcon(theme) {
    const icon = document.getElementById("icon-theme");
    if (!icon) return;
    if (theme === "dark") {
      icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    } else {
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  }

  function toggle() {
    const current = getCurrent();
    const next = current === "dark" ? "light" : "dark";
    apply(next);
    return next;
  }

  function getCurrent() {
    return document.body.classList.contains("dark") ? "dark" : "light";
  }

  function init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      apply(stored);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      apply("dark");
    }
  }

  return { apply, toggle, getCurrent, init };
})();
