/* content.js – Detects PDF objects / embeds inside pages and
   offers to re-open them through the extension viewer. */

(function () {
  "use strict";

  const VIEWER_BASE = chrome.runtime.getURL("viewer.html");

  /* Scan the page for PDF embeds / iframes and inject an overlay button */
  function scanForPdfs() {
    const selectors = [
      'embed[type="application/pdf"]',
      'object[type="application/pdf"]',
      'iframe[src$=".pdf"]',
      'iframe[src*=".pdf?"]'
    ];

    const elements = document.querySelectorAll(selectors.join(","));
    elements.forEach((el) => {
      if (el.dataset.pdfViewerHandled) return;
      el.dataset.pdfViewerHandled = "1";

      const src = el.getAttribute("src") || el.getAttribute("data") || "";
      if (!src) return;

      const absoluteUrl = new URL(src, document.baseURI).href;

      /* Create a floating "Open in PDF Viewer" button */
      const btn = document.createElement("button");
      btn.textContent = "Open in PDFZero";
      btn.style.cssText =
        "position:absolute;top:4px;right:4px;z-index:999999;" +
        "background:#1a73e8;color:#fff;border:none;border-radius:4px;" +
        "padding:6px 12px;font-size:13px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.3);";

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        chrome.runtime.sendMessage({ type: "OPEN_PDF", url: absoluteUrl });
      });

      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
      wrapper.appendChild(btn);
    });
  }

  /* Run on load and watch for dynamically added content */
  scanForPdfs();
  const observer = new MutationObserver(scanForPdfs);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
