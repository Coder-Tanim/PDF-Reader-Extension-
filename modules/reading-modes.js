/* ═══════════════════════════════════════════════════════════
   reading-modes.js – Reading modes for PDFZero
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const ReadingModes = {
    currentMode: 'single', // 'single', 'continuous', 'two-page'
    scrollEnabled: false,

    init() {
      this.bindEvents();
      this.loadMode();
    },

    bindEvents() {
      document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'm') {
          e.preventDefault();
          this.cycleMode();
        }
      });
    },

    loadMode() {
      const saved = localStorage.getItem('pdfzero-reading-mode');
      if (saved) {
        this.setMode(saved);
      }
    },

    saveMode() {
      localStorage.setItem('pdfzero-reading-mode', this.currentMode);
    },

    cycleMode() {
      const modes = ['single', 'continuous', 'two-page'];
      const currentIndex = modes.indexOf(this.currentMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      this.setMode(nextMode);
    },

    setMode(mode) {
      this.currentMode = mode;
      this.saveMode();
      
      const viewer = document.getElementById('viewer');
      const viewerContainer = document.getElementById('viewer-container');
      
      // Remove all mode classes
      viewer.classList.remove('mode-single', 'mode-continuous', 'mode-two-page');
      viewerContainer.classList.remove('mode-single', 'mode-continuous', 'mode-two-page');
      
      // Add new mode class
      viewer.classList.add(`mode-${mode}`);
      viewerContainer.classList.add(`mode-${mode}`);
      
      // Apply specific styles based on mode
      switch (mode) {
        case 'single':
          viewer.style.display = 'flex';
          viewer.style.flexDirection = 'column';
          viewer.style.alignItems = 'center';
          viewer.style.overflowY = 'auto';
          break;
        case 'continuous':
          viewer.style.display = 'flex';
          viewer.style.flexDirection = 'column';
          viewer.style.alignItems = 'center';
          viewer.style.overflowY = 'scroll';
          break;
        case 'two-page':
          viewer.style.display = 'grid';
          viewer.style.gridTemplateColumns = '1fr 1fr';
          viewer.style.gap = '10px';
          viewer.style.justifyItems = 'center';
          break;
      }
      
      setStatus(`Reading mode: ${this.formatModeName(mode)}`);
      
      // Re-render pages if needed
      this.applyModeToPages();
    },

    applyModeToPages() {
      const pages = document.querySelectorAll('.page');
      
      if (this.currentMode === 'two-page') {
        // For two-page mode, ensure even page count by adding blank if needed
        pages.forEach((page, index) => {
          page.style.breakAfter = index % 2 === 0 ? 'unset' : 'page';
        });
      } else {
        pages.forEach(page => {
          page.style.breakAfter = '';
        });
      }
    },

    formatModeName(mode) {
      const names = {
        'single': 'Single Page',
        'continuous': 'Continuous Scroll',
        'two-page': 'Two Page Spread'
      };
      return names[mode] || mode;
    },

    toggleScroll() {
      this.scrollEnabled = !this.scrollEnabled;
      const viewerContainer = document.getElementById('viewer-container');
      
      if (this.scrollEnabled) {
        viewerContainer.style.overflowY = 'scroll';
        setStatus('Scroll enabled');
      } else {
        viewerContainer.style.overflowY = 'hidden';
        setStatus('Scroll disabled');
      }
    },

    showProgress() {
      const currentPage = window.PDFZeroState?.currentPage || 1;
      const totalPages = window.PDFZeroState?.totalPages || 1;
      const progress = Math.round((currentPage / totalPages) * 100);
      
      // Show progress indicator
      const progressBar = document.getElementById('reading-progress');
      if (progressBar) {
        progressBar.value = progress;
        progressBar.textContent = `${progress}%`;
      }
      
      setStatus(`Page ${currentPage} of ${totalPages} (${progress}%)`);
    }
  };

  window.ReadingModes = ReadingModes;

  function setStatus(msg) {
    const el = document.getElementById('status-text');
    if (el) el.textContent = msg;
  }

})();
