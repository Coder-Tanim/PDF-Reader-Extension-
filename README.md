<p align="center">
  <img src="icons/icon128.png" width="96" height="96" alt="PDFZero Icon">
</p>

<h1 align="center">
  PDFZero
</h1>

<p align="center">
  <strong>Full-featured PDF reader, right inside your browser.</strong><br>
  Annotate. Draw. Crop. Extract. No upload. No cloud. No nonsense.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MV3-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Chrome-109+-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome 109+">
  <img src="https://img.shields.io/badge/Version-1.0.0-green?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License">
</p>

<br>

<p align="center">
  <a href="#installation">Install</a> · <a href="#features">Features</a> · <a href="#keyboard-shortcuts">Shortcuts</a> · <a href="#settings">Settings</a> · <a href="#architecture">Architecture</a> · <a href="#contributing">Contribute</a>
</p>

---

<br>

<table align="center">
<tr>
<td width="50%" valign="top">

### The problem

The default Chrome PDF viewer is bare-bones. You can read, maybe print. That's it.

Need to sign a document? Crop a page? Highlight something? Extract a few pages? You're reaching for external tools — third-party sites that upload your files, desktop apps you have to install, or clunky online editors with watermarks.

</td>
<td width="50%" valign="top">

### The solution

PDFZero replaces Chrome's built-in viewer entirely. Every PDF you open — online or local — loads in a custom viewer with a full toolbar:

- Text and image annotations
- Freehand drawing and signatures
- Crop, extract, and remove pages
- **NEW:** Full-text search with highlighting
- **NEW:** Bookmark system with export/import
- **NEW:** Text highlighting tool
- **NEW:** Page rotation controls
- **NEW:** PDF split and merge
- **NEW:** Multiple reading modes
- **NEW:** Export pages as images
- **NEW:** Selectable and copyable text
- Dark mode, customizable settings

Everything runs locally in your browser. **Your files never leave your machine.**

</td>
</tr>
</table>

<br>

---

<br>

## Features

<br>

### Core Viewer

| | Feature | Description |
|---|---------|-------------|
| <img width="32" src="https://img.shields.io/badge/-nav-555?style=flat-square&labelColor=555&color=555"> | **Page Navigation** | Prev/next buttons, direct page input, hash-based deep linking |
| <img width="32" src="https://img.shields.io/badge/-zoom-555?style=flat-square&labelColor=555&color=555"> | **Zoom Controls** | 25% to 300% with auto-fit and presets |
| <img width="32" src="https://img.shields.io/badge/-side-555?style=flat-square&labelColor=555&color=555"> | **Sidebar** | Thumbnail grid + document outline navigation |
| <img width="32" src="https://img.shields.io/badge/-theme-555?style=flat-square&labelColor=555&color=555"> | **Theme Toggle** | Light and dark mode, instant switch |
| <img width="32" src="https://img.shields.io/badge/-drop-555?style=flat-square&labelColor=555&color=555"> | **Drag & Drop** | Drop a PDF file anywhere onto the viewer |
| <img width="32" src="https://img.shields.io/badge/-lazy-555?style=flat-square&labelColor=555&color=555"> | **Lazy Loading** | Pages render on scroll for fast load on large PDFs |
| <img width="32" src="https://img.shields.io/badge/-forms-555?style=flat-square&labelColor=555&color=555"> | **Interactive Forms** | Fill in PDF form fields directly in the browser |
| <img width="32" src="https://img.shields.io/badge/-copy-555?style=flat-square&labelColor=555&color=555"> | **Text Selection** | Select and copy text from PDFs with overlay text layer |

<br>

### Advanced Features

<br>

#### 🔍 Search & Navigation

| | Feature | Description |
|---|------|-------------|
| <img width="32" src="https://img.shields.io/badge/-search-4285F4?style=flat-square"> | **Full-Text Search** | Search across all pages with Ctrl+F |
| <img width="32" src="https://img.shields.io/badge/-highlight-FFD700?style=flat-square"> | **Search Highlights** | Visual highlighting of all matches |
| <img width="32" src="https://img.shields.io/badge/-navigate-4285F4?style=flat-square"> | **Result Navigation** | Jump between matches with Enter/Shift+Enter |
| <img width="32" src="https://img.shields.io/badge/-count-4285F4?style=flat-square"> | **Match Counter** | Shows current match and total count |

<br>

#### 📑 Bookmark System

| | Feature | Description |
|---|------|-------------|
| <img width="32" src="https://img.shields.io/badge/-add-4ECDC4?style=flat-square"> | **Add Bookmarks** | Create custom bookmarks with Ctrl+D |
| <img width="32" src="https://img.shields.io/badge/-panel-4ECDC4?style=flat-square"> | **Bookmark Panel** | Dedicated sidebar tab for quick navigation |
| <img width="32" src="https://img.shields.io/badge/-export-4ECDC4?style=flat-square"> | **Export/Import** | Save bookmarks as JSON, import from file |
| <img width="32" src="https://img.shields.io/badge/-custom-4ECDC4?style=flat-square"> | **Custom Labels** | Add descriptive names to bookmarks |

<br>

#### 🖍️ Text Highlighting

| | Feature | Description |
|---|------|-------------|
| <img width="32" src="https://img.shields.io/badge/-highlight-FFE66D?style=flat-square"> | **Highlight Tool** | Mark text with yellow highlight (Ctrl+H) |
| <img width="32" src="https://img.shields.io/badge/-persistent-FFE66D?style=flat-square"> | **Persistent Saves** | Highlights saved per document automatically |
| <img width="32" src="https://img.shields.io/badge/-remove-FFE66D?style=flat-square"> | **Remove Highlights** | Right-click highlighted text to remove |
| <img width="32" src="https://img.shields.io/badge/-visual-FFE66D?style=flat-square"> | **Visual Feedback** | Clear visual indication of selected text |

<br>

#### 🔄 Page Rotation

| | Feature | Description |
|---|------|-------------|
| <img width="32" src="https://img.shields.io/badge/-rotate-A8E6CF?style=flat-square"> | **Rotate Pages** | Rotate individual pages clockwise/counterclockwise |
| <img width="32" src="https://img.shields.io/badge/-shortcuts-A8E6CF?style=flat-square"> | **Quick Shortcuts** | Ctrl+R (CW), Ctrl+Shift+R (CCW) |
| <img width="32" src="https://img.shields.io/badge/-save-A8E6CF?style=flat-square"> | **Save Rotation** | Option to save and download rotated PDF |
| <img width="32" src="https://img.shields.io/badge/-preview-A8E6CF?style=flat-square"> | **Instant Preview** | See rotation applied immediately |

<br>

#### ✂️ PDF Split & Merge

| | Feature | Description |
|---|------|-------------|
| <img width="32" src="https://img.shields.io/badge/-split-95E1D3?style=flat-square"> | **Split PDF** | Extract pages by ranges (e.g., "1-3,5,7-9") |
| <img width="32" src="https://img.shields.io/badge/-merge-95E1D3?style=flat-square"> | **Merge PDFs** | Combine multiple PDF files into one |
| <img width="32" src="https://img.shields.io/badge/-drag-95E1D3?style=flat-square"> | **Drag & Drop** | Easy file upload for merging |
| <img width="32" src="https://img.shields.io/badge/-export-95E1D3?style=flat-square"> | **Flexible Export** | Download as separate files or combined PDF |

<br>

#### 📖 Reading Modes

| | Feature | Description |
|---|------|-------------|
| <img width="32" src="https://img.shields.io/badge/-single-DDA0DD?style=flat-square"> | **Single Page** | View one page at a time |
| <img width="32" src="https://img.shields.io/badge/-scroll-DDA0DD?style=flat-square"> | **Continuous** | Scroll through all pages seamlessly |
| <img width="32" src="https://img.shields.io/badge/-spread-DDA0DD?style=flat-square"> | **Two-Page** | Book-like two-page spread view |
| <img width="32" src="https://img.shields.io/badge/-cycle-DDA0DD?style=flat-square"> | **Quick Toggle** | Cycle modes with Alt+M |
| <img width="32" src="https://img.shields.io/badge/-persist-DDA0DD?style=flat-square"> | **Saved Preference** | Mode preference saved in localStorage |

<br>

#### 💾 Export as Images

| | Feature | Description |
|---|------|-------------|
| <img width="32" src="https://img.shields.io/badge/-png-77DD77?style=flat-square"> | **PNG Export** | Export pages as high-quality PNG images |
| <img width="32" src="https://img.shields.io/badge/-current-77DD77?style=flat-square"> | **Current Page** | Quick export of visible page |
| <img width="32" src="https://img.shields.io/badge/-all-77DD77?style=flat-square"> | **All Pages** | Export entire document as images |
| <img width="32" src="https://img.shields.io/badge/-zip-77DD77?style=flat-square"> | **ZIP Archive** | Download all pages in a single ZIP file |
| <img width="32" src="https://img.shields.io/badge/-scale-77DD77?style=flat-square"> | **2x Quality** | High-resolution 2x scale rendering |

<br>

### Annotation Tools

| | Tool | Description |
|---|------|-------------|
| <img width="32" src="https://img.shields.io/badge/-text-FF6B6B?style=flat-square"> | **Text Annotation** | Insert text boxes with custom color and font size |
| <img width="32" src="https://img.shields.io/badge/-image-4ECDC4?style=flat-square"> | **Image Annotation** | Embed signatures, stamps, or logos onto any page |
| <img width="32" src="https://img.shields.io/badge/-color-FFE66D?style=flat-square"> | **Color Picker** | Choose any color for annotations |
| <img width="32" src="https://img.shields.io/badge/-size-95E1D3?style=flat-square"> | **Font Size** | Adjustable from 8px to 72px |

<br>

### Drawing & Signature

| | Tool | Description |
|---|------|-------------|
| <img width="32" src="https://img.shields.io/badge/-pen-A8E6CF?style=flat-square"> | **Pen Tool** | Freehand drawing with adjustable color and stroke width |
| <img width="32" src="https://img.shields.io/badge/-eraser-DDA0DD?style=flat-square"> | **Eraser** | Remove drawn strokes selectively |
| <img width="32" src="https://img.shields.io/badge/-width-FFB347?style=flat-square"> | **Stroke Width** | 1px to 10px via slider |
| <img width="32" src="https://img.shields.io/badge/-bake-87CEEB?style=flat-square"> | **Apply to Page** | Bake drawings directly into the PDF page for export |

<br>

### Export Tools

| | Tool | Description |
|---|------|-------------|
| <img width="32" src="https://img.shields.io/badge/-crop-98D8C8?style=flat-square"> | **Crop Page** | Select a region and export only that area as a new PDF |
| <img width="32" src="https://img.shields.io/badge/-remove-F7DC6F?style=flat-square"> | **Remove Pages** | Enter page numbers or ranges to strip from the PDF |
| <img width="32" src="https://img.shields.io/badge/-print-B0C4DE?style=flat-square"> | **Print** | Native browser print dialog with page selection |
| <img width="32" src="https://img.shields.io/badge/-download-77DD77?style=flat-square"> | **Download** | Save the annotated PDF with embedded drawings |

<br>

---

<br>

## Keyboard Shortcuts

<table>
<tr><td><kbd>&uarr;</kbd></td><td>Previous page</td><td><kbd>Ctrl</kbd>+<kbd>+</kbd></td><td>Zoom in</td></tr>
<tr><td><kbd>&darr;</kbd></td><td>Next page</td><td><kbd>Ctrl</kbd>+<kbd>-</kbd></td><td>Zoom out</td></tr>
<tr><td><kbd>Home</kbd></td><td>First page</td><td><kbd>Ctrl</kbd>+<kbd>0</kbd></td><td>Reset zoom</td></tr>
<tr><td><kbd>End</kbd></td><td>Last page</td><td><kbd>Ctrl</kbd>+<kbd>P</kbd></td><td>Print</td></tr>
<tr><td><kbd>PgUp</kbd></td><td>Previous page</td><td><kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>B</kbd></td><td>Toggle sidebar</td></tr>
<tr><td><kbd>PgDn</kbd></td><td>Next page</td><td><kbd>Ctrl</kbd>+<kbd>F</kbd></td><td>Search in document</td></tr>
<tr><td><kbd>Enter</kbd></td><td>Next search result</td><td><kbd>Shift</kbd>+<kbd>Enter</kbd></td><td>Previous search result</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>D</kbd></td><td>Add bookmark</td><td><kbd>Ctrl</kbd>+<kbd>H</kbd></td><td>Toggle highlight mode</td></tr>
<tr><td><kbd>Ctrl</kbd>+<kbd>R</kbd></td><td>Rotate page clockwise</td><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd></td><td>Rotate page counter-clockwise</td></tr>
<tr><td><kbd>Alt</kbd>+<kbd>M</kbd></td><td>Cycle reading modes</td><td></td><td></td></tr>
</table>

<br>

---

<br>

## Context Menu

Right-click any link to access PDFZero:

```
  PDF Reader and Editor
  ├── Open with PDF Reader              → new active tab
  └── Open with PDF Reader (background) → background tab
```

<br>

---

<br>

## Settings

Click the gear icon to customize everything. All settings persist via `chrome.storage`.

<br>

<details>
<summary><strong>Appearance</strong></summary>

<br>

- **Theme** — Light or Dark
- **Background Color** — Custom viewer background
- **Layout Density** — Compact / Normal / Comfortable

</details>

<details>
<summary><strong>Rendering</strong></summary>

<br>

- **Enable WebGL** — Hardware-accelerated page rendering
- **Auto-Rotate** — Follow PDF orientation metadata
- **CSS Zoom** — CSS-based zoom instead of re-rendering
- **Disable Font Face** — Prevent custom font loading
- **Disable Range Requests** — Fallback for restricted servers

</details>

<details>
<summary><strong>Behavior</strong></summary>

<br>

- **Enable Print** — Allow print dialog access
- **History Update** — Update browser history on page change
- **URL Update** — Reflect page number in the address bar
- **Render Interactive Forms** — Enable PDF form fields
- **PDF Bug Mode** — Legacy compatibility toggle

</details>

<br>

---

<br>

## Installation

<br>

### Developer Mode (Recommended)

```bash
git clone https://github.com/your-username/pdf-viewer-extension.git
```

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the cloned folder

<br>

### View Local Files

After installing, enable file access:

1. Go to `chrome://extensions/`
2. Find **PDFZero** → **Details**
3. Toggle **Allow access to file URLs** to ON

<br>

---

<br>

## Architecture

```
pdf-viewer-extension/
│
├── manifest.json              MV3 manifest with declarativeNetRequest
├── background.js              Service worker — PDF interception + context menus
├── content.js                 Content script — detects embedded PDFs
│
├── viewer.html                Main viewer UI (toolbar, sidebar, panels)
├── viewer.js                  Core viewer logic (PDF.js integration)
├── viewer.css                 Viewer styles and theme variables
├── pdf-bootstrap.js           ES module loader for PDF.js
│
├── settings.html              Options page
├── settings.js                Settings persistence
│
├── lib/
│   ├── pdf.min.mjs            Mozilla PDF.js (core)
│   ├── pdf.worker.min.mjs     PDF.js web worker
│   └── pdf-lib.min.js         pdf-lib for PDF manipulation
│
├── modules/
│   ├── annotation-tools.js    Text & image annotation engine
│   ├── drawing-tools.js       Pen & eraser canvas tools
│   ├── export-tools.js        Crop, extract, and download
│   ├── storage.js             Chrome storage API wrapper
│   ├── theme-manager.js       Light/dark theme logic
│   ├── search.js              Full-text search with highlighting
│   ├── bookmark-manager.js    Bookmark creation and management
│   ├── text-highlight.js      Text highlighting tool
│   ├── page-rotate.js         Page rotation functionality
│   ├── pdf-merge-split.js     PDF split and merge operations
│   ├── reading-modes.js       Single/continuous/two-page modes
│   └── export-page-images.js  Export pages as PNG images
│
└── icons/                     Extension icons (16, 48, 128)
```

<br>

<details>
<summary><strong>How PDF Interception Works</strong></summary>

<br>

PDFZero uses Manifest V3's `declarativeNetRequest` API to intercept PDF requests:

```
Browser loads a .pdf URL
        │
        ▼
declarativeNetRequest matches the request
        │
        ▼
Redirects to viewer.html?file=<encoded-url>
        │
        ▼
PDF.js loads and renders the PDF in the custom UI
```

- Works for `http://`, `https://`, and `file://` URLs
- Local files require enabling file access in extension settings
- The content script detects embedded `<iframe>` PDFs and offers to open them

</details>

<br>

---

<br>

## Permissions

| Permission | Purpose |
|------------|---------|
| `declarativeNetRequest` | Intercept and redirect PDF URLs to the viewer |
| `contextMenus` | Right-click "PDF Reader and Editor" menu |
| `storage` | Save user preferences and settings |
| `activeTab` | Access the current tab for context menu actions |
| `tabs` | Open new tabs for PDF viewing |
| `host_permissions` | Access PDFs across all URLs including `file://` |

<br>

---

<br>

## Contributing

Contributions are welcome. Fork the repo, create a feature branch, and submit a pull request.

```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

<br>

### New Features Added

The following features have been recently added to PDFZero:

- **Full-Text Search** - Search across all pages with visual highlighting
- **Bookmark System** - Create, manage, and export bookmarks
- **Text Highlighting** - Mark important text with persistent highlights
- **Page Rotation** - Rotate individual pages and save changes
- **PDF Split & Merge** - Extract pages or combine multiple PDFs
- **Reading Modes** - Single page, continuous scroll, or two-page spread
- **Export as Images** - Save PDF pages as high-quality PNG files
- **Text Selection** - Copy text directly from PDFs

See [FEATURES_SUMMARY.md](FEATURES_SUMMARY.md) for detailed usage instructions.

<br>

---

<br>

## License

MIT License. See [LICENSE](LICENSE) for details.

<br>

---

<br>

<p align="center">
  Built with <a href="https://mozilla.github.io/pdf.js/">PDF.js</a> by Mozilla + <a href="https://pdf-lib.js.org/">pdf-lib</a><br><br>
  Made by <a href="https://www.linkedin.com/in/ishtiaque2/">Tanim</a><br><br>
  <em>If PDFZero helps you, consider giving it a star.</em>
</p>
