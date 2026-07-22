/* ═══════════════════════════════════════════════════════════
   pdf-merge-split.js – PDF merge and split functionality
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const PdfMergeSplit = {
    init() {
      this.bindEvents();
    },

    bindEvents() {
      // Split button handler
      document.getElementById('btn-split')?.addEventListener('click', () => {
        this.showSplitPanel();
      });

      // Merge button handler  
      document.getElementById('btn-merge')?.addEventListener('click', () => {
        this.triggerMerge();
      });
    },

    async splitPdf(pageRanges, outputMode = 'separate') {
      const pdfBytes = window.PDFZeroState?.pdfBytes;
      if (!pdfBytes) {
        setStatus('No PDF loaded');
        return;
      }

      try {
        const { PDFDocument } = PDFLib;
        const srcDoc = await PDFDocument.load(pdfBytes);
        const totalPages = srcDoc.getPageCount();

        // Parse page ranges (e.g., "1-3,5,7-9")
        const pagesToExtract = this.parsePageRanges(pageRanges, totalPages);
        
        if (pagesToExtract.length === 0) {
          setStatus('No valid pages specified');
          return;
        }

        if (outputMode === 'separate') {
          // Create separate PDF for each page
          for (let pageNum of pagesToExtract) {
            const newDoc = await PDFDocument.create();
            const [copiedPage] = await newDoc.copyPages(srcDoc, [pageNum - 1]);
            newDoc.addPage(copiedPage);
            
            const bytes = await newDoc.save();
            this.downloadBlob(bytes, `page-${pageNum}.pdf`);
          }
          setStatus(`Split ${pagesToExtract.length} pages into separate files`);
        } else {
          // Create single PDF with selected pages
          const newDoc = await PDFDocument.create();
          const copiedPages = await newDoc.copyPages(srcDoc, pagesToExtract.map(p => p - 1));
          copiedPages.forEach(page => newDoc.addPage(page));
          
          const bytes = await newDoc.save();
          this.downloadBlob(bytes, 'split-pages.pdf');
          setStatus('PDF split and downloaded');
        }
      } catch (err) {
        console.error('Split error:', err);
        setStatus('Failed to split PDF');
      }
    },

    async mergePdfs(files) {
      if (!files || files.length < 2) {
        setStatus('Please select at least 2 PDFs to merge');
        return;
      }

      try {
        const { PDFDocument } = PDFLib;
        const mergedDoc = await PDFDocument.create();

        for (let file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const doc = await PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
          copiedPages.forEach(page => mergedDoc.addPage(page));
        }

        const bytes = await mergedDoc.save();
        this.downloadBlob(bytes, 'merged.pdf');
        setStatus(`Merged ${files.length} PDFs`);
      } catch (err) {
        console.error('Merge error:', err);
        setStatus('Failed to merge PDFs');
      }
    },

    parsePageRanges(rangeStr, totalPages) {
      const pages = new Set();
      const parts = rangeStr.split(',').map(s => s.trim());

      for (let part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n.trim()));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
              pages.add(i);
            }
          }
        } else {
          const num = parseInt(part);
          if (!isNaN(num) && num >= 1 && num <= totalPages) {
            pages.add(num);
          }
        }
      }

      return Array.from(pages).sort((a, b) => a - b);
    },

    downloadBlob(bytes, filename) {
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },

    showSplitPanel() {
      const panel = document.getElementById('split-panel');
      if (panel) {
        panel.classList.remove('hidden');
      }
    },

    triggerMerge() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.multiple = true;
      
      input.addEventListener('change', (e) => {
        this.mergePdfs(Array.from(e.target.files));
      });
      
      input.click();
    }
  };

  window.PdfMergeSplit = PdfMergeSplit;

  function setStatus(msg) {
    const el = document.getElementById('status-text');
    if (el) el.textContent = msg;
  }

})();
