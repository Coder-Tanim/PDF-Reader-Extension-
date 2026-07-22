/* settings.js – Standalone settings page logic */

(function () {
  "use strict";

  const STORAGE_KEY = "pdfViewerSettings";

  const DEFAULTS = {
    theme: "light", bgColor: "#525659", density: "normal",
    enableWebGL: false, autoRotate: true, cssZoom: false,
    disableLabels: false, disableAutofetch: false, disableFontface: false,
    disableRange: false, disableStream: false, enforcePerms: false,
    enablePrint: true, historyUpdate: true, urlUpdate: true,
    ignoreDestZoom: false, pdfBug: false, interactiveForms: true
  };

  const FIELD_MAP = {
    theme: "theme", bgColor: "bgColor", density: "density",
    webgl: "enableWebGL", autoRotate: "autoRotate", cssZoom: "cssZoom",
    disableLabels: "disableLabels", disableAutofetch: "disableAutofetch",
    disableFontface: "disableFontface", disableRange: "disableRange",
    disableStream: "disableStream", enforcePerms: "enforcePerms",
    enablePrint: "enablePrint", historyUpdate: "historyUpdate",
    urlUpdate: "urlUpdate", ignoreDestZoom: "ignoreDestZoom",
    pdfBug: "pdfBug", interactiveForms: "interactiveForms"
  };

  function readSettings() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
    catch (_) { return { ...DEFAULTS }; }
  }

  function writeSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function loadUI() {
    const s = readSettings();
    Object.entries(FIELD_MAP).forEach(([elId, key]) => {
      const el = document.getElementById(elId);
      if (!el) return;
      if (el.type === "checkbox") el.checked = !!s[key];
      else el.value = s[key] ?? "";
    });
    applyTheme(s.theme);
  }

  function saveUI() {
    const s = readSettings();
    Object.entries(FIELD_MAP).forEach(([elId, key]) => {
      const el = document.getElementById(elId);
      if (!el) return;
      s[key] = el.type === "checkbox" ? el.checked : el.value;
    });
    writeSettings(s);
    if (s.theme) applyTheme(s.theme);
  }

  function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    document.getElementById("themeToggle").textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }

  /* Bind events */
  document.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("change", saveUI);
  });

  document.getElementById("themeToggle").addEventListener("click", () => {
    const s = readSettings();
    s.theme = s.theme === "dark" ? "light" : "dark";
    writeSettings(s);
    loadUI();
  });

  loadUI();
})();
