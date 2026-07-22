/* modules/storage.js – Persistence via chrome.storage with localStorage fallback */

const Storage = (() => {
  const DEFAULTS = {
    theme: "light",
    bgColor: "#525659",
    density: "normal",
    enableWebGL: false,
    autoRotate: true,
    cssZoom: false,
    disableLabels: false,
    disableAutofetch: false,
    disableFontface: false,
    disableRange: false,
    disableStream: false,
    enforcePerms: false,
    enablePrint: true,
    historyUpdate: true,
    urlUpdate: true,
    ignoreDestZoom: false,
    pdfBug: false,
    interactiveForms: true
  };

  const STORAGE_KEY = "pdfViewerSettings";

  async function get(key) {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.get([STORAGE_KEY], (result) => {
            const all = { ...DEFAULTS, ...(result[STORAGE_KEY] || {}) };
            resolve(key ? all[key] : all);
          });
        });
      }
    } catch (_) { /* fallback */ }
    const all = { ...DEFAULTS, ...readLocal() };
    return key ? all[key] : all;
  }

  async function set(partial) {
    const current = await get();
    const merged = { ...current, ...partial };
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [STORAGE_KEY]: merged }, resolve);
        });
      }
    } catch (_) { /* fallback */ }
    writeLocal(merged);
  }

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch (_) { return {}; }
  }

  function writeLocal(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  return { get, set, DEFAULTS };
})();
