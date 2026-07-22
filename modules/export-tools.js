/* modules/export-tools.js – Crop & Extract using pdf-lib */

const ExportTools = (() => {
  let currentPdfBytes = null;  // Uint8Array of the loaded PDF
  let cropSelection = null;    // {x, y, w, h} in screen pixels
  let cropOverlay = null;
  let cropStart = null;
  let viewerScale = 1;         // current zoom scale for coordinate conversion

  function setPdfBytes(bytes) {
    /* pdf-lib requires a clean Uint8Array starting at offset 0.
       PDF.js getData() may return a view over a larger ArrayBuffer
       with a non-zero byteOffset, which breaks pdf-lib parsing. */
    if (bytes instanceof Uint8Array) {
      currentPdfBytes = new Uint8Array(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
      );
    } else {
      currentPdfBytes = bytes;
    }
  }

  function setViewerScale(scale) {
    viewerScale = scale;
  }

  function getPDFLib() {
    if (typeof PDFLib !== "undefined") return PDFLib;
    alert("PDF library not loaded yet. Please wait a moment and try again.");
    return null;
  }

  /* ═══════ Crop Tool ═══════ */

  function startCropMode(pageEl) {
    removeCropOverlay();
    cropOverlay = document.createElement("div");
    cropOverlay.className = "crop-overlay";
    pageEl.appendChild(cropOverlay);

    cropOverlay.addEventListener("pointerdown", onCropDown);
    cropOverlay.addEventListener("pointermove", onCropMove);
    cropOverlay.addEventListener("pointerup", onCropUp);

    cropSelection = null;
  }

  function onCropDown(e) {
    e.preventDefault();
    e.stopPropagation();
    cropStart = { x: e.offsetX, y: e.offsetY };
    const old = cropOverlay.querySelector(".crop-selection");
    if (old) old.remove();

    const sel = document.createElement("div");
    sel.className = "crop-selection";
    sel.style.left = cropStart.x + "px";
    sel.style.top = cropStart.y + "px";
    cropOverlay.appendChild(sel);
  }

  function onCropMove(e) {
    if (!cropStart) return;
    const sel = cropOverlay.querySelector(".crop-selection");
    if (!sel) return;

    const x = Math.min(cropStart.x, e.offsetX);
    const y = Math.min(cropStart.y, e.offsetY);
    const w = Math.abs(e.offsetX - cropStart.x);
    const h = Math.abs(e.offsetY - cropStart.y);
    sel.style.left = x + "px";
    sel.style.top = y + "px";
    sel.style.width = w + "px";
    sel.style.height = h + "px";

    cropSelection = { x, y, w, h };
  }

  function onCropUp(e) {
    cropStart = null;
  }

  function removeCropOverlay() {
    if (cropOverlay && cropOverlay.parentNode) {
      cropOverlay.parentNode.removeChild(cropOverlay);
    }
    cropOverlay = null;
    cropSelection = null;
    cropStart = null;
  }

  async function applyCrop(currentPageIndex) {
    const pdfLib = getPDFLib();
    if (!pdfLib) return;

    if (!currentPdfBytes) {
      alert("No PDF loaded.");
      return;
    }
    if (!cropSelection || (cropSelection.w < 2 && cropSelection.h < 2)) {
      alert("Please select a crop area first by clicking and dragging on the page.");
      return;
    }

    try {
      const { PDFDocument } = pdfLib;
      const srcDoc = await PDFDocument.load(currentPdfBytes);
      const newDoc = await PDFDocument.create();

      const page = srcDoc.getPage(currentPageIndex);
      const { height } = page.getSize();

      const croppedPage = await newDoc.copyPages(srcDoc, [currentPageIndex]);
      const newPage = newDoc.addPage(croppedPage[0]);

      /* Convert screen-pixel coordinates to PDF points */
      const { x, y, w, h } = cropSelection;
      const pdfX = x / viewerScale;
      const pdfW = w / viewerScale;
      const pdfH = h / viewerScale;
      const pdfY = height - (y / viewerScale) - pdfH;

      newPage.setCropBox(pdfX, pdfY, pdfW, pdfH);

      const pdfBytes = await newDoc.save();
      downloadBlob(pdfBytes, "cropped-page.pdf", "application/pdf");
      removeCropOverlay();
    } catch (err) {
      console.error("Crop error:", err);
      alert("Failed to crop page: " + err.message);
    }
  }

  /* ═══════ Extract Tool ═══════ */

  async function extractPages(startPage, endPage) {
    const pdfLib = getPDFLib();
    if (!pdfLib) return;

    if (!currentPdfBytes) {
      alert("No PDF loaded.");
      return;
    }
    if (isNaN(startPage) || isNaN(endPage) || startPage < 1 || endPage < startPage) {
      alert("Invalid page range. Please enter valid start and end page numbers.");
      return;
    }

    try {
      const { PDFDocument } = pdfLib;
      const srcDoc = await PDFDocument.load(currentPdfBytes);
      const pageCount = srcDoc.getPageCount();
      const safeEnd = Math.min(endPage, pageCount);

      if (startPage > pageCount) {
        alert(`Start page ${startPage} exceeds total pages (${pageCount}).`);
        return;
      }

      const newDoc = await PDFDocument.create();
      const indices = [];
      for (let i = startPage - 1; i < safeEnd; i++) {
        indices.push(i);
      }
      const copiedPages = await newDoc.copyPages(srcDoc, indices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      downloadBlob(pdfBytes, `pages-${startPage}-${safeEnd}.pdf`, "application/pdf");
    } catch (err) {
      console.error("Extract error:", err);
      alert("Failed to extract pages: " + err.message);
    }
  }

  /* ═══════ Remove Tool ═══════ */

  function parsePageRanges(input, maxPage) {
    const pages = new Set();
    const parts = input.split(",").map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (start < 1 || end < start || start > maxPage) continue;
        for (let i = start; i <= Math.min(end, maxPage); i++) pages.add(i);
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= maxPage) pages.add(num);
      }
    }
    return pages;
  }

  async function removePages(pageInput) {
    const pdfLib = getPDFLib();
    if (!pdfLib) return;

    if (!currentPdfBytes) {
      alert("No PDF loaded.");
      return;
    }
    if (!pageInput || !pageInput.trim()) {
      alert("Please enter page numbers to remove.");
      return;
    }

    try {
      const { PDFDocument } = pdfLib;
      const srcDoc = await PDFDocument.load(currentPdfBytes);
      const pageCount = srcDoc.getPageCount();
      const removeSet = parsePageRanges(pageInput, pageCount);

      if (removeSet.size === 0) {
        alert("No valid pages to remove.");
        return;
      }
      if (removeSet.size >= pageCount) {
        alert("Cannot remove all pages. At least one page must remain.");
        return;
      }

      const keepIndices = [];
      for (let i = 0; i < pageCount; i++) {
        if (!removeSet.has(i + 1)) keepIndices.push(i);
      }

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, keepIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      downloadBlob(pdfBytes, `pages-removed.pdf`, "application/pdf");
    } catch (err) {
      console.error("Remove error:", err);
      alert("Failed to remove pages: " + err.message);
    }
  }

  /* ═══════ Download helper ═══════ */

  function downloadBlob(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 100);
  }

  function getCropSelection() { return cropSelection; }
  function isCropActive() { return !!cropOverlay; }

  return {
    setPdfBytes, setViewerScale, startCropMode, removeCropOverlay, applyCrop,
    extractPages, removePages, getCropSelection, isCropActive
  };
})();
