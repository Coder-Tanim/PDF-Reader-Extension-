/* ═══════════════════════════════════════════════════════════
   text-highlight.js – Text annotation tools for PDFZero
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const TextHighlight = {
    highlights: [],
    activeColor: '#ffff00',
    isSelecting: false,
    selectionStart: null,

    init() {
      this.bindEvents();
      this.loadHighlights();
    },

    bindEvents() {
      // Add highlight button to toolbar or panel
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
          e.preventDefault();
          this.toggleHighlightMode();
        }
      });
    },

    toggleHighlightMode() {
      const btn = document.getElementById('btn-highlight');
      if (!btn) return;
      
      this.isSelecting = !this.isSelecting;
      btn.classList.toggle('active', this.isSelecting);
      
      if (this.isSelecting) {
        setStatus('Highlight mode: Select text to highlight');
        document.body.style.cursor = 'text';
      } else {
        setStatus('Highlight mode off');
        document.body.style.cursor = 'default';
      }
    },

    async createHighlight(pageNum, text, rect) {
      const highlight = {
        id: Date.now(),
        page: pageNum,
        text: text,
        rect: rect,
        color: this.activeColor,
        createdAt: new Date().toISOString()
      };

      this.highlights.push(highlight);
      this.saveHighlights();
      this.renderHighlight(highlight);
      setStatus('Highlight added');
    },

    removeHighlight(id) {
      this.highlights = this.highlights.filter(h => h.id !== id);
      this.saveHighlights();
      
      const el = document.querySelector(`[data-highlight-id="${id}"]`);
      if (el) el.remove();
      
      setStatus('Highlight removed');
    },

    saveHighlights() {
      const docId = window.PDFZeroState?.fileName || 'default';
      const key = `pdfzero-highlights-${docId}`;
      localStorage.setItem(key, JSON.stringify(this.highlights));
    },

    loadHighlights() {
      const docId = window.PDFZeroState?.fileName || 'default';
      const key = `pdfzero-highlights-${docId}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        this.highlights = JSON.parse(stored);
        this.highlights.forEach(h => this.renderHighlight(h));
      }
    },

    renderHighlight(highlight) {
      const viewer = document.getElementById('viewer');
      const pageEl = viewer.querySelector(`[data-page-number="${highlight.page}"]`);
      
      if (!pageEl) return;

      const overlay = document.createElement('div');
      overlay.className = 'text-highlight';
      overlay.dataset.highlightId = highlight.id;
      overlay.style.position = 'absolute';
      overlay.style.left = highlight.rect.x + 'px';
      overlay.style.top = highlight.rect.y + 'px';
      overlay.style.width = highlight.rect.width + 'px';
      overlay.style.height = highlight.rect.height + 'px';
      overlay.style.backgroundColor = highlight.color;
      overlay.style.opacity = '0.4';
      overlay.style.pointerEvents = 'auto';
      overlay.style.zIndex = '50';
      overlay.title = highlight.text;

      // Context menu for removal
      overlay.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (confirm('Remove this highlight?')) {
          this.removeHighlight(highlight.id);
        }
      });

      pageEl.appendChild(overlay);
    },

    clearAllHighlights() {
      this.highlights = [];
      this.saveHighlights();
      
      document.querySelectorAll('.text-highlight').forEach(el => el.remove());
      setStatus('All highlights cleared');
    },

    exportHighlights() {
      const dataStr = JSON.stringify(this.highlights, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'highlights.json';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Highlights exported');
    }
  };

  window.TextHighlight = TextHighlight;

  function setStatus(msg) {
    const el = document.getElementById('status-text');
    if (el) el.textContent = msg;
  }

})();
