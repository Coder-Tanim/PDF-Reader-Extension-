/* ═══════════════════════════════════════════════════════════
   search.js – Full-text search functionality for PDFZero
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const SearchModule = {
    searchText: '',
    searchResults: [],
    currentResultIndex: -1,
    highlights: [],

    init() {
      this.bindEvents();
    },

    bindEvents() {
      // Keyboard shortcut: Ctrl+F or Cmd+F
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault();
          this.toggleSearchPanel();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
          e.preventDefault();
          this.nextResult();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'G') {
          e.preventDefault();
          this.prevResult();
        }
      });
    },

    toggleSearchPanel() {
      const panel = document.getElementById('search-panel');
      if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        document.getElementById('search-input').focus();
      } else {
        panel.classList.add('hidden');
        this.clearHighlights();
      }
    },

    async performSearch(text) {
      if (!text || text.length < 2) {
        this.clearSearch();
        return;
      }

      this.searchText = text.toLowerCase();
      this.searchResults = [];
      this.currentResultIndex = -1;

      const pdfDoc = window.PDFZeroState?.pdfDoc;
      if (!pdfDoc) return;

      setStatus('Searching...');

      try {
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          let pageText = '';
          let textItems = [];
          
          textContent.items.forEach((item, index) => {
            const str = item.str.trim();
            if (str) {
              textItems.push({
                str: str,
                x: item.transform[4],
                y: item.transform[5],
                width: item.width,
                height: item.height
              });
              pageText += str + ' ';
            }
          });

          // Find all occurrences in this page
          const lowerPageText = pageText.toLowerCase();
          let startIndex = 0;
          
          while (true) {
            const pos = lowerPageText.indexOf(this.searchText, startIndex);
            if (pos === -1) break;
            
            // Find corresponding text items
            let charCount = 0;
            let matchingItems = [];
            
            for (let i = 0; i < textItems.length; i++) {
              const itemLen = textItems[i].str.length;
              if (charCount <= pos && charCount + itemLen > pos) {
                matchingItems.push(textItems[i]);
              }
              if (charCount + itemLen >= pos + this.searchText.length) {
                break;
              }
              charCount += itemLen;
            }

            this.searchResults.push({
              page: pageNum,
              position: pos,
              context: pageText.substring(Math.max(0, pos - 30), pos + this.searchText.length + 30),
              items: matchingItems
            });

            startIndex = pos + 1;
          }
        }

        this.currentResultIndex = 0;
        this.updateSearchResultsUI();
        
        if (this.searchResults.length > 0) {
          this.navigateToResult(0);
          setStatus(`Found ${this.searchResults.length} result(s)`);
        } else {
          setStatus('No results found');
        }
      } catch (err) {
        console.error('Search error:', err);
        setStatus('Search failed');
      }
    },

    updateSearchResultsUI() {
      const resultsContainer = document.getElementById('search-results');
      if (!resultsContainer) return;

      resultsContainer.innerHTML = '';
      
      this.searchResults.forEach((result, index) => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        if (index === this.currentResultIndex) {
          div.classList.add('active');
        }
        
        div.innerHTML = `
          <span class="search-result-page">Page ${result.page}</span>
          <span class="search-result-context">${this.highlightMatch(result.context)}</span>
        `;
        
        div.addEventListener('click', () => {
          this.currentResultIndex = index;
          this.navigateToResult(index);
          this.updateSearchResultsUI();
        });
        
        resultsContainer.appendChild(div);
      });

      // Update count display
      const countEl = document.getElementById('search-count');
      if (countEl) {
        countEl.textContent = `${this.searchResults.length} result(s)`;
      }
    },

    highlightMatch(text) {
      const regex = new RegExp(`(${this.escapeRegex(this.searchText)})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    },

    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    navigateToResult(index) {
      if (index < 0 || index >= this.searchResults.length) return;

      const result = this.searchResults[index];
      
      // Navigate to page
      if (window.goToPage) {
        window.goToPage(result.page);
      }

      // Highlight the match
      this.highlightMatchOnPage(result);
      
      // Scroll into view
      setTimeout(() => {
        const activeEl = document.querySelector('.search-result-item.active');
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    },

    highlightMatchOnPage(result) {
      this.clearHighlights();
      
      const viewer = document.getElementById('viewer');
      const pageEl = viewer.querySelector(`[data-page-number="${result.page}"]`);
      
      if (!pageEl) return;

      // Create highlight overlay
      const highlight = document.createElement('div');
      highlight.className = 'search-highlight';
      highlight.style.position = 'absolute';
      highlight.style.left = result.items[0]?.x + 'px';
      highlight.style.top = result.items[0]?.y + 'px';
      highlight.style.width = '100px';
      highlight.style.height = '20px';
      highlight.style.backgroundColor = 'rgba(255, 255, 0, 0.4)';
      highlight.style.border = '2px solid yellow';
      highlight.style.pointerEvents = 'none';
      highlight.style.zIndex = '100';

      pageEl.appendChild(highlight);
      this.highlights.push(highlight);
    },

    clearHighlights() {
      this.highlights.forEach(h => h.remove());
      this.highlights = [];
    },

    nextResult() {
      if (this.searchResults.length === 0) return;
      this.currentResultIndex = (this.currentResultIndex + 1) % this.searchResults.length;
      this.navigateToResult(this.currentResultIndex);
      this.updateSearchResultsUI();
    },

    prevResult() {
      if (this.searchResults.length === 0) return;
      this.currentResultIndex = (this.currentResultIndex - 1 + this.searchResults.length) % this.searchResults.length;
      this.navigateToResult(this.currentResultIndex);
      this.updateSearchResultsUI();
    },

    clearSearch() {
      this.searchText = '';
      this.searchResults = [];
      this.currentResultIndex = -1;
      this.clearHighlights();
      
      const resultsContainer = document.getElementById('search-results');
      if (resultsContainer) resultsContainer.innerHTML = '';
      
      const countEl = document.getElementById('search-count');
      if (countEl) countEl.textContent = '0 result(s)';
      
      const input = document.getElementById('search-input');
      if (input) input.value = '';
    }
  };

  // Export to window
  window.SearchModule = SearchModule;

  // Helper for status
  function setStatus(msg) {
    const el = document.getElementById('status-text');
    if (el) el.textContent = msg;
  }

})();
