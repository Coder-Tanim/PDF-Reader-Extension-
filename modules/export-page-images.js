/* ═══════════════════════════════════════════════════════════
   export-page-images.js – Export PDF pages as images
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const ExportPageImages = {
    init() {
      this.bindEvents();
    },

    bindEvents() {
      document.getElementById('btn-export-images')?.addEventListener('click', () => {
        this.showExportPanel();
      });
    },

    async exportCurrentPage(format = 'png', quality = 1.0) {
      const currentPage = window.PDFZeroState?.currentPage || 1;
      await this.exportPages([currentPage], format, quality);
    },

    async exportAllPages(format = 'png', quality = 1.0) {
      const totalPages = window.PDFZeroState?.totalPages || 0;
      const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
      await this.exportPages(pages, format, quality);
    },

    async exportPages(pageNumbers, format = 'png', quality = 1.0) {
      const pdfDoc = window.PDFZeroState?.pdfDoc;
      if (!pdfDoc) {
        setStatus('No PDF loaded');
        return;
      }

      try {
        for (let pageNum of pageNumbers) {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 }); // Higher quality

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          // Export as image
          const dataUrl = canvas.toDataURL(`image/${format}`, quality);
          
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `page-${pageNum}.${format}`;
          a.click();

          setStatus(`Exported page ${pageNum} as ${format.toUpperCase()}`);
          
          // Small delay between exports
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (err) {
        console.error('Export error:', err);
        setStatus('Failed to export pages');
      }
    },

    async exportAsZip(format = 'png') {
      const totalPages = window.PDFZeroState?.totalPages || 0;
      
      try {
        const zip = new JSZip();
        const imgFolder = zip.folder('pdf-pages');

        const pdfDoc = window.PDFZeroState?.pdfDoc;
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          const dataUrl = canvas.toDataURL(`image/${format}`);
          const base64Data = dataUrl.split(',')[1];
          imgFolder.file(`page-${pageNum}.${format}`, base64Data, { base64: true });
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pdf-pages.zip';
        a.click();
        URL.revokeObjectURL(url);

        setStatus(`Exported all ${totalPages} pages as ZIP`);
      } catch (err) {
        console.error('ZIP export error:', err);
        setStatus('Failed to create ZIP. Exporting individually...');
        this.exportAllPages(format);
      }
    },

    showExportPanel() {
      const panel = document.getElementById('export-images-panel');
      if (panel) {
        panel.classList.remove('hidden');
      } else {
        // Quick export menu
        const choice = prompt('Export options:\n1 - Current page as PNG\n2 - All pages as PNG\n3 - All pages as ZIP\nEnter choice (1-3):');
        
        if (choice === '1') {
          this.exportCurrentPage('png');
        } else if (choice === '2') {
          this.exportAllPages('png');
        } else if (choice === '3') {
          this.exportAsZip('png');
        }
      }
    }
  };

  window.ExportPageImages = ExportPageImages;

  function setStatus(msg) {
    const el = document.getElementById('status-text');
    if (el) el.textContent = msg;
  }

})();
