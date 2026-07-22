/* ═══════════════════════════════════════════════════════════
   page-rotate.js – Page rotation functionality for PDFZero
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const PageRotate = {
    rotations: {}, // pageNum -> rotation degrees (0, 90, 180, 270)

    init() {
      this.bindEvents();
    },

    bindEvents() {
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
          e.preventDefault();
          this.rotateCurrentPage(90);
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
          e.preventDefault();
          this.rotateCurrentPage(-90);
        }
      });
    },

    rotateCurrentPage(direction = 90) {
      const currentPage = window.PDFZeroState?.currentPage || 1;
      this.rotatePage(currentPage, direction);
    },

    rotatePage(pageNum, direction = 90) {
      if (!this.rotations[pageNum]) {
        this.rotations[pageNum] = 0;
      }
      
      this.rotations[pageNum] = (this.rotations[pageNum] + direction + 360) % 360;
      
      this.applyRotation(pageNum);
      setStatus(`Page ${pageNum} rotated ${this.rotations[pageNum]}°`);
    },

    applyRotation(pageNum) {
      const viewer = document.getElementById('viewer');
      const pageEl = viewer.querySelector(`[data-page="${pageNum}"]`);
      
      if (!pageEl) return;

      const canvas = pageEl.querySelector('canvas');
      if (canvas) {
        const rotation = this.rotations[pageNum];
        
        if (rotation === 0) {
          canvas.style.transform = '';
        } else {
          canvas.style.transformOrigin = 'center center';
          canvas.style.transform = `rotate(${rotation}deg)`;
        }
      }
    },

    rotateAllPages(direction = 90) {
      const totalPages = window.PDFZeroState?.totalPages || 0;
      
      for (let i = 1; i <= totalPages; i++) {
        this.rotatePage(i, direction);
      }
      
      setStatus(`All pages rotated`);
    },

    resetRotation(pageNum) {
      if (pageNum) {
        this.rotations[pageNum] = 0;
        this.applyRotation(pageNum);
        setStatus(`Page ${pageNum} rotation reset`);
      } else {
        // Reset all
        this.rotations = {};
        const viewer = document.getElementById('viewer');
        viewer.querySelectorAll('.page').forEach(pageEl => {
          const canvas = pageEl.querySelector('canvas');
          if (canvas) {
            canvas.style.transform = '';
          }
        });
        setStatus('All rotations reset');
      }
    },

    async applyToPdfAndDownload() {
      const pdfDoc = window.PDFZeroState?.pdfDoc;
      const pdfBytes = window.PDFZeroState?.pdfBytes;
      
      if (!pdfDoc || !pdfBytes) {
        setStatus('No PDF loaded');
        return;
      }

      try {
        const { PDFDocument } = PDFLib;
        const pdfLibDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfLibDoc.getPages();
        
        Object.entries(this.rotations).forEach(([pageNum, rotation]) => {
          const pageIndex = parseInt(pageNum) - 1;
          if (pages[pageIndex]) {
            pages[pageIndex].setRotation(rotation);
          }
        });

        const modifiedBytes = await pdfLibDoc.save();
        const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = window.PDFZeroState?.fileName || 'rotated.pdf';
        a.click();
        URL.revokeObjectURL(url);
        
        setStatus('PDF with rotations downloaded');
      } catch (err) {
        console.error('Error applying rotations:', err);
        setStatus('Failed to apply rotations');
      }
    }
  };

  window.PageRotate = PageRotate;

  function setStatus(msg) {
    const el = document.getElementById('status-text');
    if (el) el.textContent = msg;
  }

})();
