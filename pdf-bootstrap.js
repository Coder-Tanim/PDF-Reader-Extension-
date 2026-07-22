/* pdf-bootstrap.js – Loads PDF.js and pdf-lib as ES modules and exposes globals */

(async function () {
  "use strict";

  try {
    /* Import PDF.js */
    const pdfjsLib = await import(chrome.runtime.getURL("lib/pdf.min.mjs"));

    /* Set the worker source */
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("lib/pdf.worker.min.mjs");
    }

    /* Expose globally */
    window.pdfjsLib = pdfjsLib;

    console.log("[PDFZero] PDF.js loaded successfully, version:", pdfjsLib.version);
  } catch (err) {
    console.error("[PDFZero] Failed to load PDF.js:", err);
  }

  try {
    /* Load pdf-lib via script tag (UMD build, not ES module) */
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("lib/pdf-lib.min.js");
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    /* pdf-lib UMD build assigns to window.PDFLib automatically */
    if (!window.PDFLib) {
      console.error("[PDFZero] pdf-lib loaded but PDFLib not found on window");
    } else {
      console.log("[PDFZero] pdf-lib loaded successfully");
    }
  } catch (err) {
    console.error("[PDFZero] Failed to load pdf-lib:", err);
  }

  /* Signal that libraries are ready */
  window.dispatchEvent(new Event("pdf-libs-ready"));
})();
