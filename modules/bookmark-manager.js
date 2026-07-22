/* ═══════════════════════════════════════════════════════════
   bookmark-manager.js – Bookmark system for PDFZero
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const BookmarkManager = {
    bookmarks: [],
    currentDocId: null,

    async init() {
      this.bindEvents();
      await this.loadBookmarks();
    },

    bindEvents() {
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault();
          this.addBookmark();
        }
      });
    },

    getCurrentDocId() {
      return window.PDFZeroState?.fileName || 'default';
    },

    async loadBookmarks() {
      const stored = localStorage.getItem('pdfzero-bookmarks');
      if (stored) {
        this.bookmarks = JSON.parse(stored);
      }
      this.currentDocId = this.getCurrentDocId();
      this.renderBookmarks();
    },

    async saveBookmarks() {
      localStorage.setItem('pdfzero-bookmarks', JSON.stringify(this.bookmarks));
    },

    addBookmark(pageNum, label) {
      const docId = this.getCurrentDocId();
      const bookmark = {
        id: Date.now(),
        docId: docId,
        page: pageNum,
        label: label || `Page ${pageNum}`,
        createdAt: new Date().toISOString()
      };
      
      // Check if bookmark for this page already exists
      const existing = this.bookmarks.find(b => b.docId === docId && b.page === pageNum);
      if (existing) {
        setStatus('Bookmark already exists for this page');
        return;
      }

      this.bookmarks.push(bookmark);
      this.saveBookmarks();
      this.renderBookmarks();
      setStatus(`Bookmark added: ${bookmark.label}`);
    },

    removeBookmark(id) {
      this.bookmarks = this.bookmarks.filter(b => b.id !== id);
      this.saveBookmarks();
      this.renderBookmarks();
      setStatus('Bookmark removed');
    },

    navigateToBookmark(bookmark) {
      if (window.goToPage) {
        window.goToPage(bookmark.page);
      }
      setStatus(`Navigated to: ${bookmark.label}`);
    },

    exportBookmarks() {
      const docBookmarks = this.bookmarks.filter(b => b.docId === this.currentDocId);
      const dataStr = JSON.stringify(docBookmarks, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.currentDocId}-bookmarks.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Bookmarks exported');
    },

    importBookmarks(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            imported.forEach(b => {
              b.docId = this.currentDocId;
              b.id = Date.now() + Math.random();
            });
            this.bookmarks = [...this.bookmarks, ...imported];
            this.saveBookmarks();
            this.renderBookmarks();
            setStatus(`Imported ${imported.length} bookmarks`);
          }
        } catch (err) {
          setStatus('Failed to import bookmarks');
          console.error(err);
        }
      };
      reader.readAsText(file);
    },

    renderBookmarks() {
      const container = document.getElementById('sidebar-bookmarks');
      if (!container) return;

      const docBookmarks = this.bookmarks.filter(b => b.docId === this.currentDocId);
      
      container.innerHTML = `
        <div class="bookmarks-header">
          <h3>Bookmarks</h3>
          <div class="bookmark-actions">
            <button id="btn-add-bookmark" class="tb-btn-sm" title="Add Bookmark">+</button>
            <button id="btn-export-bookmarks" class="tb-btn-sm" title="Export">↓</button>
            <label class="tb-btn-sm" title="Import">
              ↑
              <input type="file" id="import-bookmarks-input" accept=".json" style="display:none">
            </label>
          </div>
        </div>
        <div class="bookmarks-list">
          ${docBookmarks.length === 0 ? '<p class="no-bookmarks">No bookmarks yet. Press Ctrl+D to add one.</p>' : ''}
          ${docBookmarks.map(b => `
            <div class="bookmark-item" data-id="${b.id}">
              <span class="bookmark-page" title="Go to page">${b.page}</span>
              <span class="bookmark-label">${b.label}</span>
              <button class="bookmark-delete" data-id="${b.id}" title="Remove">×</button>
            </div>
          `).join('')}
        </div>
      `;

      // Bind events
      container.querySelector('#btn-add-bookmark')?.addEventListener('click', () => {
        const currentPage = window.PDFZeroState?.currentPage || 1;
        this.addBookmark(currentPage);
      });

      container.querySelector('#btn-export-bookmarks')?.addEventListener('click', () => {
        this.exportBookmarks();
      });

      container.querySelector('#import-bookmarks-input')?.addEventListener('change', (e) => {
        if (e.target.files[0]) {
          this.importBookmarks(e.target.files[0]);
        }
      });

      container.querySelectorAll('.bookmark-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.classList.contains('bookmark-delete')) return;
          const id = parseInt(item.dataset.id);
          const bookmark = this.bookmarks.find(b => b.id === id);
          if (bookmark) this.navigateToBookmark(bookmark);
        });
      });

      container.querySelectorAll('.bookmark-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          this.removeBookmark(id);
        });
      });
    }
  };

  window.BookmarkManager = BookmarkManager;

  function setStatus(msg) {
    const el = document.getElementById('status-text');
    if (el) el.textContent = msg;
  }

})();
