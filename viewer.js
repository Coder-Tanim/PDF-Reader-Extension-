/* ═══════════════════════════════════════════════════════════
   viewer.js – Main PDF viewer orchestrator
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── State ── */
  const state = {
    pdfDoc: null,
    pdfBytes: null,
    totalPages: 0,
    currentPage: 1,
    scale: 1,
    fileName: "document.pdf",
    rendering: false,
    pageCache: {},          // pageNum -> { canvas, viewport }
    settings: {},
    activeTool: null,       // "annotate" | "draw" | "crop" | null
    cropMode: false
  };

  /* ── DOM refs ── */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const els = {
    viewer:          () => $("#viewer"),
    viewerContainer: () => $("#viewer-container"),
    pageNum:         () => $("#page-num"),
    pageCount:       () => $("#page-count"),
    loadingOverlay:  () => $("#loading-overlay"),
    loadingText:     () => $("#loading-text"),
    statusText:      () => $("#status-text"),
    statusZoom:      () => $("#status-zoom"),
    docTitle:        () => $("#doc-title"),
    sidebar:         () => $("#sidebar"),
    sidebarThumbs:   () => $("#sidebar-thumbnails"),
    sidebarOutline:  () => $("#sidebar-outline"),
    zoomSelect:      () => $("#zoom-select"),
    dropOverlay:     () => $("#drop-overlay"),
    annColor:        () => $("#ann-color"),
    annFontSize:     () => $("#ann-font-size"),
    drawColor:       () => $("#draw-color"),
    drawWidth:       () => $("#draw-width"),
    drawWidthVal:    () => $("#draw-width-val"),
  };

  /* ═══════════════════════════════════════
     Initialisation
     ═══════════════════════════════════════ */

  async function init() {
    ThemeManager.init();
    await loadSettings();
    applySettingsToUI();
    bindToolbar();
    bindPanels();
    bindKeyboard();
    bindDragDrop();
    bindHashNavigation();
    await loadPdfFromUrl();
    setStatus("Ready");
  }

  /* ═══════════════════════════════════════
     Settings
     ═══════════════════════════════════════ */

  async function loadSettings() {
    state.settings = await Storage.get();
  }

  function applySettingsToUI() {
    const s = state.settings;
    ThemeManager.apply(s.theme || "light");

    /* Density */
    document.body.classList.remove("density-compact", "density-normal", "density-comfortable");
    document.body.classList.add("density-" + (s.density || "normal"));

    /* Background color */
    const vc = els.viewerContainer();
    if (vc && s.bgColor) vc.style.background = s.bgColor;

    /* Settings panel values */
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
    const setSel = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

    setSel("set-theme", s.theme);
    setSel("set-density", s.density);
    setVal("set-webgl", s.enableWebGL);
    setVal("set-auto-rotate", s.autoRotate);
    setVal("set-css-zoom", s.cssZoom);
    setVal("set-disable-labels", s.disableLabels);
    setVal("set-disable-autofetch", s.disableAutofetch);
    setVal("set-disable-fontface", s.disableFontface);
    setVal("set-disable-range", s.disableRange);
    setVal("set-disable-stream", s.disableStream);
    setVal("set-enforce-perms", s.enforcePerms);
    setVal("set-enable-print", s.enablePrint);
    setVal("set-history-update", s.historyUpdate);
    setVal("set-url-update", s.urlUpdate);
    setVal("set-ignore-dest-zoom", s.ignoreDestZoom);
    setVal("set-pdf-bug", s.pdfBug);
    setVal("set-interactive-forms", s.interactiveForms);

    /* Print button visibility */
    const printBtn = $("#btn-print");
    if (printBtn) printBtn.style.display = s.enablePrint ? "" : "none";

    /* BG color picker */
    const bgPicker = document.getElementById("set-bg-color");
    if (bgPicker) bgPicker.value = s.bgColor || "#525659";
  }

  function bindSettingsPanel() {
    const save = async () => {
      const get = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };
      const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };

      await Storage.set({
        theme: getVal("set-theme"),
        bgColor: document.getElementById("set-bg-color").value,
        density: getVal("set-density"),
        enableWebGL: get("set-webgl"),
        autoRotate: get("set-auto-rotate"),
        cssZoom: get("set-css-zoom"),
        disableLabels: get("set-disable-labels"),
        disableAutofetch: get("set-disable-autofetch"),
        disableFontface: get("set-disable-fontface"),
        disableRange: get("set-disable-range"),
        disableStream: get("set-disable-stream"),
        enforcePerms: get("set-enforce-perms"),
        enablePrint: get("set-enable-print"),
        historyUpdate: get("set-history-update"),
        urlUpdate: get("set-url-update"),
        ignoreDestZoom: get("set-ignore-dest-zoom"),
        pdfBug: get("set-pdf-bug"),
        interactiveForms: get("set-interactive-forms")
      });
      await loadSettings();
      applySettingsToUI();
    };

    $$(".settings-body input, .settings-body select").forEach((el) => {
      el.addEventListener("change", save);
    });

    /* Theme dropdown in settings */
    const themeSelect = document.getElementById("set-theme");
    if (themeSelect) {
      themeSelect.addEventListener("change", () => {
        ThemeManager.apply(themeSelect.value);
      });
    }
  }

  /* ═══════════════════════════════════════
     PDF Loading
     ═══════════════════════════════════════ */

  async function loadPdfFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const fileUrl = params.get("file");
    const dataUrl = params.get("data"); // base64-encoded PDF

    if (dataUrl) {
      await loadPdfFromBase64(dataUrl);
      return;
    }

    if (!fileUrl) {
      showEmptyState();
      return;
    }

    showLoading("Loading PDF…");
    try {
      const loadingTask = pdfjsLib.getDocument({
        url: fileUrl,
        cMapUrl: "https://mozilla.github.io/pdf.js/web/cmaps/",
        cMapPacked: true,
        disableAutoFetch: state.settings.disableAutofetch,
        disableRange: state.settings.disableRange,
        disableStream: state.settings.disableStream
      });

      state.pdfDoc = await loadingTask.promise;
      state.totalPages = state.pdfDoc.numPages;
      state.fileName = decodeURIComponent(fileUrl.split("/").pop().split("?")[0]) || "document.pdf";

      /* Store raw bytes for export (copy to avoid ArrayBuffer view issues) */
      const raw = await state.pdfDoc.getData();
      state.pdfBytes = new Uint8Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength));
      ExportTools.setPdfBytes(state.pdfBytes);
      ExportTools.setViewerScale(state.scale);

      els.docTitle().textContent = state.fileName;
      els.pageCount().textContent = "/ " + state.totalPages;
      const hashPage = getHashPage();
      if (hashPage) state.currentPage = hashPage;

      await renderAllPages();
      buildThumbnails();
      buildOutline();
      goToPage(state.currentPage);
      hideLoading();
    } catch (err) {
      hideLoading();
      showEmptyState("Failed to load PDF: " + err.message);
      console.error("PDF load error:", err);
    }
  }

  async function loadPdfFromBase64(b64) {
    showLoading("Loading PDF…");
    try {
      const raw = atob(b64);
      const arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);

      state.pdfBytes = arr;
      ExportTools.setPdfBytes(arr);
      ExportTools.setViewerScale(state.scale);

      const loadingTask = pdfjsLib.getDocument({ data: arr });
      state.pdfDoc = await loadingTask.promise;
      state.totalPages = state.pdfDoc.numPages;
      state.fileName = "document.pdf";

      els.docTitle().textContent = state.fileName;
      els.pageCount().textContent = "/ " + state.totalPages;

      await renderAllPages();
      buildThumbnails();
      buildOutline();
      goToPage(1);
      hideLoading();
    } catch (err) {
      hideLoading();
      showEmptyState("Failed to load PDF: " + err.message);
    }
  }

  function showEmptyState(msg) {
    const viewer = els.viewer();
    viewer.innerHTML = `
      <div style="text-align:center;padding:80px 20px;color:#999;">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <h2 style="margin:16px 0 8px;font-size:20px;color:#666;">${msg || "No PDF loaded"}</h2>
        <p style="font-size:14px;color:#999;">Drag and drop a PDF file here, or open a PDF URL with this extension.</p>
      </div>`;
    hideLoading();
  }

  /* ═══════════════════════════════════════
     Rendering
     ═══════════════════════════════════════ */

  async function renderAllPages() {
    const viewer = els.viewer();
    viewer.innerHTML = "";

    for (let i = 1; i <= state.totalPages; i++) {
      const pageDiv = document.createElement("div");
      pageDiv.className = "pdf-page";
      pageDiv.dataset.page = i;
      viewer.appendChild(pageDiv);

      /* Render lazily (only when visible) – but render first few eagerly */
      if (i <= 5) {
        await renderPage(i, pageDiv);
      }
    }

    /* Intersection Observer for lazy loading */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.dataset.page, 10);
          if (!state.pageCache[pageNum]) {
            renderPage(pageNum, entry.target);
          }
        }
      });
    }, { root: els.viewerContainer(), rootMargin: "400px" });

    $$(".pdf-page").forEach((p) => observer.observe(p));
  }

  async function renderPage(pageNum, container) {
    if (state.rendering || !state.pdfDoc) return;
    if (state.pageCache[pageNum]) return;

    try {
      const page = await state.pdfDoc.getPage(pageNum);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: state.scale * (window.devicePixelRatio || 1) });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = (unscaledViewport.width * state.scale) + "px";
      canvas.style.height = (unscaledViewport.height * state.scale) + "px";

      container.innerHTML = "";
      container.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      state.rendering = true;

      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        intent: "display"
      }).promise;

      state.rendering = false;
      state.pageCache[pageNum] = { canvas, viewport: unscaledViewport };

      /* Render annotations if interactive forms enabled */
      if (state.settings.interactiveForms) {
        renderAnnotationLayer(page, container, viewport, pageNum);
      }
    } catch (err) {
      state.rendering = false;
      console.error(`Error rendering page ${pageNum}:`, err);
    }
  }

  function renderAnnotationLayer(page, container, viewport, pageNum) {
    const annotations = page.getAnnotations();
    if (!annotations || annotations.length === 0) return;

    let annotDiv = container.querySelector(".annotation-layer");
    if (!annotDiv) {
      annotDiv = document.createElement("div");
      annotDiv.className = "annotation-layer";
      container.appendChild(annotDiv);
    }

    const printAnnotationViewport = page.getViewport({ scale: state.scale });
    pdfjsLib.AnnotationLayer.render({
      annotations: annotations,
      div: annotDiv,
      page: page,
      viewport: printAnnotationViewport,
      linkService: { getDestinationHash: () => "#", getAnchorUrl: () => "", getOpenAction: () => {} },
      renderInteractiveForms: state.settings.interactiveForms
    });
  }

  function reRenderCurrentPages() {
    state.pageCache = {};
    const viewer = els.viewer();
    const pages = viewer.querySelectorAll(".pdf-page");
    pages.forEach((p) => {
      const num = parseInt(p.dataset.page, 10);
      p.innerHTML = "";
      renderPage(num, p);
    });
  }

  /* ═══════════════════════════════════════
     Navigation
     ═══════════════════════════════════════ */

  function goToPage(num) {
    num = Math.max(1, Math.min(num, state.totalPages));
    state.currentPage = num;
    els.pageNum().value = num;

    const pageEl = $(`.pdf-page[data-page="${num}"]`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    updateHash(num);
    updateHistory(num);
    updateActiveThumbnail(num);
    setStatus(`Page ${num} of ${state.totalPages}`);
  }

  function prevPage() { goToPage(state.currentPage - 1); }
  function nextPage() { goToPage(state.currentPage + 1); }

  function getHashPage() {
    const hash = window.location.hash;
    const m = hash.match(/#page=(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }

  function updateHash(pageNum) {
    if (!state.settings.urlUpdate) return;
    const hash = `#page=${pageNum}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
  }

  function updateHistory(pageNum) {
    if (!state.settings.historyUpdate) return;
    try {
      const url = new URL(window.location.href);
      url.hash = `page=${pageNum}`;
      history.pushState({ page: pageNum }, "", url.toString());
    } catch (_) { /* ignore */ }
  }

  function bindHashNavigation() {
    window.addEventListener("hashchange", () => {
      const p = getHashPage();
      if (p && p !== state.currentPage) goToPage(p);
    });
    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.page) goToPage(e.state.page);
    });
  }

  /* ═══════════════════════════════════════
     Zoom
     ═══════════════════════════════════════ */

  function setZoom(newScale) {
    state.scale = Math.max(0.25, Math.min(5, newScale));
    els.zoomSelect().value = state.scale.toString();
    els.statusZoom().textContent = Math.round(state.scale * 100) + "%";
    ExportTools.setViewerScale(state.scale);
    reRenderCurrentPages();
  }

  function zoomIn() { setZoom(state.scale + 0.25); }
  function zoomOut() { setZoom(state.scale - 0.25); }

  /* ═══════════════════════════════════════
     Thumbnails & Outline
     ═══════════════════════════════════════ */

  async function buildThumbnails() {
    const container = els.sidebarThumbs();
    container.innerHTML = "";

    for (let i = 1; i <= state.totalPages; i++) {
      const item = document.createElement("div");
      item.className = "thumb-item" + (i === state.currentPage ? " active" : "");
      item.dataset.page = i;

      const canvas = document.createElement("canvas");
      const label = document.createElement("div");
      label.className = "thumb-label";
      label.textContent = i;
      item.appendChild(canvas);
      item.appendChild(label);
      container.appendChild(item);

      item.addEventListener("click", () => goToPage(i));

      /* Render thumbnail */
      try {
        const page = await state.pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      } catch (_) { /* skip failed thumbnails */ }
    }
  }

  function updateActiveThumbnail(pageNum) {
    $$(".thumb-item").forEach((t) => {
      t.classList.toggle("active", parseInt(t.dataset.page, 10) === pageNum);
    });
  }

  async function buildOutline() {
    const container = els.sidebarOutline();
    container.innerHTML = "";

    try {
      const outline = await state.pdfDoc.getOutline();
      if (!outline || outline.length === 0) {
        container.innerHTML = '<p style="font-size:12px;color:#999;padding:10px;">No outline available.</p>';
        return;
      }
      renderOutlineItems(outline, container, 0);
    } catch (_) {
      container.innerHTML = '<p style="font-size:12px;color:#999;padding:10px;">No outline available.</p>';
    }
  }

  function renderOutlineItems(items, parent, level) {
    items.forEach((item) => {
      const div = document.createElement("div");
      div.className = "outline-item level-" + Math.min(level, 3);
      div.textContent = item.title;
      div.addEventListener("click", async () => {
        try {
          const dest = await state.pdfDoc.getDestination(item.dest);
          if (dest) {
            const pageIndex = await state.pdfDoc.getPageIndex(dest[0]);
            goToPage(pageIndex + 1);
          }
        } catch (_) { /* ignore */ }
      });
      parent.appendChild(div);
      if (item.items && item.items.length > 0) {
        renderOutlineItems(item.items, parent, level + 1);
      }
    });
  }

  /* ═══════════════════════════════════════
     Print
     ═══════════════════════════════════════ */

  function printPdf() {
    if (!state.pdfDoc || !state.settings.enablePrint) return;
    window.print();
  }

  /* ═══════════════════════════════════════
     Download
     ═══════════════════════════════════════ */

  async function downloadPdf() {
    if (!state.pdfBytes) return;

    try {
      const pdfLib = (typeof PDFLib !== "undefined") ? PDFLib : null;
      if (!pdfLib) {
        /* Fallback: download original PDF without embedded drawings */
        const blob = new Blob([state.pdfBytes], { type: "application/pdf" });
        triggerDownload(blob, state.fileName);
        return;
      }

      /* Check if any page has drawings applied */
      let hasDrawings = false;
      for (let i = 1; i <= state.totalPages; i++) {
        const cache = state.pageCache[i];
        if (cache && cache.canvas) {
          hasDrawings = true;
          break;
        }
      }

      if (!hasDrawings) {
        const blob = new Blob([state.pdfBytes], { type: "application/pdf" });
        triggerDownload(blob, state.fileName);
        return;
      }

      /* Embed drawings into the PDF using pdf-lib */
      const { PDFDocument } = pdfLib;
      const srcDoc = await PDFDocument.load(state.pdfBytes);

      for (let i = 1; i <= state.totalPages; i++) {
        const cache = state.pageCache[i];
        if (!cache || !cache.canvas) continue;

        const page = srcDoc.getPage(i - 1);
        const { width, height } = page.getSize();

        /* Convert the page canvas (with drawings) to PNG image */
        const imgDataUrl = cache.canvas.toDataURL("image/png");
        const imgBytes = Uint8Array.from(atob(imgDataUrl.split(",")[1]), c => c.charCodeAt(0));
        const img = await srcDoc.embedPng(imgBytes);

        /* Draw the image over the entire page, preserving original content underneath */
        page.drawImage(img, { x: 0, y: 0, width, height });
      }

      const pdfBytes = await srcDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      triggerDownload(blob, state.fileName);
    } catch (err) {
      console.error("Download error:", err);
      /* Fallback to original */
      const blob = new Blob([state.pdfBytes], { type: "application/pdf" });
      triggerDownload(blob, state.fileName);
    }
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  }

  /* ═══════════════════════════════════════
     UI Helpers
     ═══════════════════════════════════════ */

  function showLoading(msg) {
    els.loadingText().textContent = msg || "Loading…";
    els.loadingOverlay().classList.remove("hidden");
  }

  function hideLoading() {
    els.loadingOverlay().classList.add("hidden");
  }

  function setStatus(msg) {
    els.statusText().textContent = msg;
  }

  /* ═══════════════════════════════════════
     Toolbar Bindings
     ═══════════════════════════════════════ */

  function bindToolbar() {
    /* Navigation */
    $("#btn-prev").addEventListener("click", prevPage);
    $("#btn-next").addEventListener("click", nextPage);
    els.pageNum().addEventListener("change", () => {
      goToPage(parseInt(els.pageNum().value, 10) || 1);
    });

    /* Zoom */
    $("#btn-zoom-in").addEventListener("click", zoomIn);
    $("#btn-zoom-out").addEventListener("click", zoomOut);
    els.zoomSelect().addEventListener("change", () => {
      const val = els.zoomSelect().value;
      if (val === "auto") {
        setZoom(1);
      } else {
        setZoom(parseFloat(val));
      }
    });

    /* Sidebar */
    $("#btn-sidebar").addEventListener("click", () => {
      els.sidebar().classList.toggle("collapsed");
    });

    /* Sidebar tabs */
    $$(".sidebar-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        $$(".sidebar-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        $$(".sidebar-content").forEach((c) => c.classList.remove("active"));
        const target = document.getElementById("sidebar-" + tab.dataset.tab);
        if (target) target.classList.add("active");
      });
    });

    /* Print & Download */
    $("#btn-print").addEventListener("click", printPdf);
    $("#btn-download").addEventListener("click", downloadPdf);

    /* Theme toggle */
    $("#btn-theme").addEventListener("click", () => {
      const next = ThemeManager.toggle();
      Storage.set({ theme: next });
      state.settings.theme = next;
      const themeSelect = document.getElementById("set-theme");
      if (themeSelect) themeSelect.value = next;
    });

    /* Tool panels */
    $("#btn-annotate").addEventListener("click", () => togglePanel("annotate-panel", "annotate"));
    $("#btn-draw").addEventListener("click", () => togglePanel("draw-panel", "draw"));
    $("#btn-crop").addEventListener("click", () => togglePanel("crop-panel", "crop"));
    $("#btn-remove").addEventListener("click", () => togglePanel("remove-panel", null));
    $("#btn-settings").addEventListener("click", () => togglePanel("settings-panel", null));

    /* Scroll-based page tracking */
    els.viewerContainer().addEventListener("scroll", onScroll);
  }

  function onScroll() {
    const container = els.viewerContainer();
    const scrollTop = container.scrollTop;
    const pages = $$(".pdf-page");
    let closest = 1;
    let closestDist = Infinity;

    pages.forEach((p) => {
      const rect = p.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const dist = Math.abs(rect.top - containerRect.top);
      if (dist < closestDist) {
        closestDist = dist;
        closest = parseInt(p.dataset.page, 10);
      }
    });

    if (closest !== state.currentPage) {
      state.currentPage = closest;
      els.pageNum().value = closest;
      updateHash(closest);
      updateActiveThumbnail(closest);
      setStatus(`Page ${closest} of ${state.totalPages}`);
    }
  }

  /* ═══════════════════════════════════════
     Panel Management
     ═══════════════════════════════════════ */

  function togglePanel(panelId, toolType) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const wasVisible = !panel.classList.contains("hidden");

    /* Close all panels first */
    $$(".floating-panel").forEach((p) => p.classList.add("hidden"));
    deactivateTools();

    if (wasVisible) {
      state.activeTool = null;
      return;
    }

    panel.classList.remove("hidden");
    state.activeTool = toolType;

    /* Position panel */
    const btn = document.querySelector(`[data-toggle="${panelId}"]`);
    if (btn) {
      const rect = btn.getBoundingClientRect();
      panel.style.top = (rect.bottom + 8) + "px";
      panel.style.right = "12px";
    }

    /* Activate tool-specific UI */
    if (toolType === "draw") {
      activateDrawMode();
    } else if (toolType === "crop") {
      activateCropMode();
    }
  }

  function deactivateTools() {
    DrawingTools.removeCanvas();
    ExportTools.removeCropOverlay();
    state.cropMode = false;
  }

  /* ═══════════════════════════════════════
     Drawing Mode
     ═══════════════════════════════════════ */

  function activateDrawMode() {
    const currentPageEl = $(`.pdf-page[data-page="${state.currentPage}"]`);
    if (!currentPageEl) return;
    const viewport = state.pageCache[state.currentPage]?.viewport;
    if (!viewport) return;
    DrawingTools.init(currentPageEl, state.scale);
    DrawingTools.setColor(els.drawColor().value);
    DrawingTools.setWidth(parseInt(els.drawWidth().value, 10));
  }

  function bindDrawPanel() {
    $("#draw-pen").addEventListener("click", () => {
      DrawingTools.setTool("pen");
      $("#draw-pen").classList.add("active");
      $("#draw-eraser").classList.remove("active");
    });
    $("#draw-eraser").addEventListener("click", () => {
      DrawingTools.setTool("eraser");
      $("#draw-eraser").classList.add("active");
      $("#draw-pen").classList.remove("active");
    });
    els.drawColor().addEventListener("input", () => DrawingTools.setColor(els.drawColor().value));
    els.drawWidth().addEventListener("input", () => {
      const w = parseInt(els.drawWidth().value, 10);
      els.drawWidthVal().textContent = w + "px";
      DrawingTools.setWidth(w);
    });
    $("#draw-clear").addEventListener("click", () => DrawingTools.clear());
    $("#draw-cancel").addEventListener("click", () => {
      DrawingTools.removeCanvas();
      $("#draw-panel").classList.add("hidden");
      state.activeTool = null;
    });
    $("#draw-save").addEventListener("click", () => {
      /* Flatten drawing onto the page canvas */
      const cache = state.pageCache[state.currentPage];
      if (cache) {
        DrawingTools.applyToPage(cache.canvas);
        DrawingTools.removeCanvas();
      }
      $("#draw-panel").classList.add("hidden");
      state.activeTool = null;
    });
  }

  /* ═══════════════════════════════════════
     Crop Mode
     ═══════════════════════════════════════ */

  function activateCropMode() {
    const currentPageEl = $(`.pdf-page[data-page="${state.currentPage}"]`);
    if (!currentPageEl) return;
    ExportTools.startCropMode(currentPageEl);
    state.cropMode = true;
  }

  function bindCropPanel() {
    $("#crop-apply").addEventListener("click", () => {
      ExportTools.applyCrop(state.currentPage - 1);
      ExportTools.removeCropOverlay();
      $("#crop-panel").classList.add("hidden");
      state.activeTool = null;
    });
    $("#crop-cancel").addEventListener("click", () => {
      ExportTools.removeCropOverlay();
      $("#crop-panel").classList.add("hidden");
      state.activeTool = null;
    });
  }

  /* ═══════════════════════════════════════
     Extract
     ═══════════════════════════════════════ */

  function bindRemovePanel() {
    $("#remove-apply").addEventListener("click", () => {
      const input = $("#remove-pages").value;
      ExportTools.removePages(input);
      $("#remove-panel").classList.add("hidden");
    });
    $("#remove-cancel").addEventListener("click", () => {
      $("#remove-panel").classList.add("hidden");
    });
  }

  /* ═══════════════════════════════════════
     Annotation Panel
     ═══════════════════════════════════════ */

  function bindAnnotationPanel() {
    AnnotationTools.init({
      color: els.annColor().value,
      fontSize: parseInt(els.annFontSize().value, 10)
    });

    els.annColor().addEventListener("input", () => AnnotationTools.setColor(els.annColor().value));
    els.annFontSize().addEventListener("change", () => AnnotationTools.setFontSize(parseInt(els.annFontSize().value, 10)));

    $("#ann-text").addEventListener("click", () => {
      const currentPageEl = $(`.pdf-page[data-page="${state.currentPage}"]`);
      AnnotationTools.setPage(currentPageEl);
      AnnotationTools.startTextAnnotation(currentPageEl);
    });

    $("#text-annot-ok").addEventListener("click", () => AnnotationTools.confirmTextAnnotation());
    $("#text-annot-cancel").addEventListener("click", () => AnnotationTools.cancelTextAnnotation());

    $("#ann-image").addEventListener("click", () => {
      const currentPageEl = $(`.pdf-page[data-page="${state.currentPage}"]`);
      AnnotationTools.triggerImageAnnotation(currentPageEl);
    });

    document.getElementById("ann-image-input").addEventListener("change", (e) => {
      if (e.target.files[0]) AnnotationTools.handleImageFile(e.target.files[0]);
      e.target.value = "";
    });
  }

  /* ═══════════════════════════════════════
     Panel Close Buttons
     ═══════════════════════════════════════ */

  function bindPanels() {
    $$(".panel-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panelId = btn.dataset.close;
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add("hidden");
        deactivateTools();
        state.activeTool = null;
      });
    });

    bindSettingsPanel();
    bindDrawPanel();
    bindCropPanel();
    bindRemovePanel();
    bindAnnotationPanel();
  }

  /* ═══════════════════════════════════════
     Keyboard Shortcuts
     ═══════════════════════════════════════ */

  function bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      /* Don't intercept when typing in inputs */
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        prevPage();
      } else if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToPage(1);
      } else if (e.key === "End") {
        e.preventDefault();
        goToPage(state.totalPages);
      } else if (e.ctrlKey && e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.ctrlKey && e.key === "-") {
        e.preventDefault();
        zoomOut();
      } else if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
        setZoom(1);
      } else if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        printPdf();
      }
    });
  }

  /* ═══════════════════════════════════════
     Drag & Drop
     ═══════════════════════════════════════ */

  function bindDragDrop() {
    const vc = els.viewerContainer();
    const overlay = els.dropOverlay();
    let dragCounter = 0;

    document.addEventListener("dragenter", (e) => {
      e.preventDefault();
      dragCounter++;
      overlay.classList.remove("hidden");
    });

    document.addEventListener("dragleave", (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        overlay.classList.add("hidden");
      }
    });

    document.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    document.addEventListener("drop", (e) => {
      e.preventDefault();
      dragCounter = 0;
      overlay.classList.add("hidden");

      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        loadPdfFromFile(file);
      }
    });
  }

  function loadPdfFromFile(file) {
    showLoading("Loading PDF…");
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        state.pdfBytes = data;
        ExportTools.setPdfBytes(data);
        ExportTools.setViewerScale(state.scale);

        const loadingTask = pdfjsLib.getDocument({ data });
        state.pdfDoc = await loadingTask.promise;
        state.totalPages = state.pdfDoc.numPages;
        state.fileName = file.name || "document.pdf";
        state.currentPage = 1;
        state.pageCache = {};

        els.docTitle().textContent = state.fileName;
        els.pageCount().textContent = "/ " + state.totalPages;

        await renderAllPages();
        buildThumbnails();
        buildOutline();
        goToPage(1);
        hideLoading();
      } catch (err) {
        hideLoading();
        showEmptyState("Failed to load PDF: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  /* ═══════════════════════════════════════
     Start
     ═══════════════════════════════════════ */

  function start() {
    /* Wait for ES module bootstrap to load PDF.js and pdf-lib */
    if (window.pdfjsLib && window.PDFLib) {
      init();
    } else {
      window.addEventListener("pdf-libs-ready", () => init(), { once: true });
      /* Also handle DOMContentLoaded if it fires first */
      document.addEventListener("DOMContentLoaded", () => {
        if (window.pdfjsLib && window.PDFLib) init();
      }, { once: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
