/* background.js – Manifest V3 service worker
   Intercepts PDF requests via declarativeNetRequest and rewrites them
   to the built-in viewer. Also registers the context-menu item for
   <frame> PDF parsing. */

const VIEWER_URL = chrome.runtime.getURL("viewer.html");

/* ───────── PDF redirect rules (declarativeNetRequest) ───────── */

const PDF_REDIRECT_RULES = [
  {
    id: 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        regexSubstitution: VIEWER_URL + "?file=$1",
      },
    },
    condition: {
      regexFilter: "^(https?://.*\\.pdf)(\\?.*)?$",
      resourceTypes: ["main_frame"],
    },
  },
];

chrome.runtime.onInstalled.addListener(async () => {
  /* Set up declarativeNetRequest redirect rules */
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map((r) => r.id);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: PDF_REDIRECT_RULES,
  });

  /* Context-menu: PDF Reader and Editor parent + submenus */
  chrome.contextMenus.create({
    id: "pdf-reader-parent",
    title: "PDF Reader and Editor",
    contexts: ["link", "page"],
  });

  chrome.contextMenus.create({
    id: "pdf-reader-open",
    parentId: "pdf-reader-parent",
    title: "Open with PDF Reader",
    contexts: ["link", "page"],
  });

  chrome.contextMenus.create({
    id: "pdf-reader-open-bg",
    parentId: "pdf-reader-parent",
    title: "Open with PDF Reader (background)",
    contexts: ["link", "page"],
  });
});

/* ───────── Fallback: open PDFs clicked in the browser ───────── */

function isPdfUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.endsWith(".pdf") ||
    lower.includes(".pdf?") ||
    lower.includes(".pdf#") ||
    lower.includes("application/pdf") ||
    lower.includes("type=application/pdf")
  );
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && isPdfUrl(tab.url)) {
    chrome.tabs.update(tab.id, {
      url: VIEWER_URL + "?file=" + encodeURIComponent(tab.url),
    });
  }
});

/* ───────── Context-menu click handler ───────── */

function openPdfInViewer(url, active) {
  chrome.tabs.create({
    url: VIEWER_URL + "?file=" + encodeURIComponent(url),
    active,
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  /* Submenu: Open with PDF Reader (foreground) */
  if (info.menuItemId === "pdf-reader-open") {
    const url = info.linkUrl || tab.url;
    if (url && isPdfUrl(url)) {
      openPdfInViewer(url, true);
    } else if (url) {
      openPdfInViewer(url, true);
    }
  }

  /* Submenu: Open with PDF Reader (background) */
  if (info.menuItemId === "pdf-reader-open-bg") {
    const url = info.linkUrl || tab.url;
    if (url) {
      openPdfInViewer(url, false);
    }
  }

  /* Legacy: frame context menu */
  if (info.menuItemId === "pdf-viewer-parse-frame" && info.frameUrl) {
    openPdfInViewer(info.frameUrl, true);
  }
});

/* ───────── Message handler (from content scripts / viewer) ───────── */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "OPEN_PDF") {
    const url = msg.url;
    if (url) {
      chrome.tabs.create({
        url: VIEWER_URL + "?file=" + encodeURIComponent(url),
        active: true,
      });
      sendResponse({ ok: true });
    }
  }
  return true;
});
