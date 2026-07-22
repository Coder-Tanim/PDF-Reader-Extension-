/* modules/annotation-tools.js – Text and image annotation insertion */

const AnnotationTools = (() => {
  let activePageEl = null;
  let color = "#ff0000";
  let fontSize = 16;
  let onTextInsert = null;  // callback(text, x, y, style)
  let onImageInsert = null; // callback(dataUrl, x, y)

  function init(options) {
    color = options.color || "#ff0000";
    fontSize = options.fontSize || 16;
    onTextInsert = options.onTextInsert || (() => {});
    onImageInsert = options.onImageInsert || (() => {});
  }

  function setPage(pageEl) {
    activePageEl = pageEl;
  }

  function setColor(c) { color = c; }
  function setFontSize(s) { fontSize = s; }

  /* ── Text annotation ── */

  function startTextAnnotation(pageEl) {
    if (pageEl) activePageEl = pageEl;
    if (!activePageEl) return;

    const overlay = document.getElementById("text-annot-input");
    const field = document.getElementById("text-annot-field");
    overlay.classList.remove("hidden");
    field.value = "";
    field.style.color = color;
    field.style.fontSize = fontSize + "px";
    field.focus();

    /* Position near center of viewer */
    const vc = document.getElementById("viewer-container");
    const rect = vc.getBoundingClientRect();
    overlay.style.left = (rect.left + rect.width / 2 - 120) + "px";
    overlay.style.top = (rect.top + rect.height / 2 - 60) + "px";
  }

  function confirmTextAnnotation() {
    const field = document.getElementById("text-annot-field");
    const text = field.value.trim();
    document.getElementById("text-annot-input").classList.add("hidden");
    if (!text || !activePageEl) return;

    const div = document.createElement("div");
    div.className = "custom-text-annotation";
    div.contentEditable = "false";
    div.textContent = text;
    div.style.color = color;
    div.style.fontSize = fontSize + "px";
    div.style.left = "40px";
    div.style.top = "40px";

    makeDraggable(div, activePageEl);
    activePageEl.appendChild(div);
  }

  function cancelTextAnnotation() {
    document.getElementById("text-annot-input").classList.add("hidden");
  }

  /* ── Image annotation ── */

  function triggerImageAnnotation(pageEl) {
    if (pageEl) activePageEl = pageEl;
    if (!activePageEl) return;
    document.getElementById("ann-image-input").click();
  }

  function handleImageFile(file) {
    if (!file || !activePageEl) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement("div");
      div.className = "custom-image-annotation";
      div.style.left = "40px";
      div.style.top = "40px";
      div.style.width = "200px";
      div.style.height = "150px";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.draggable = false;
      div.appendChild(img);

      makeDraggable(div, activePageEl);
      activePageEl.appendChild(div);
    };
    reader.readAsDataURL(file);
  }

  /* ── Generic drag helper ── */

  function makeDraggable(el, container) {
    let startX, startY, origLeft, origTop;

    el.addEventListener("pointerdown", (e) => {
      if (e.target.tagName === "TEXTAREA") return;
      e.preventDefault();
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseInt(el.style.left || "0", 10);
      origTop = parseInt(el.style.top || "0", 10);

      const onMove = (ev) => {
        el.style.left = (origLeft + ev.clientX - startX) + "px";
        el.style.top = (origTop + ev.clientY - startY) + "px";
      };
      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });
  }

  /* ── Collect all annotations on a page for export ── */

  function getAnnotationsOnPage(pageEl) {
    const results = [];
    pageEl.querySelectorAll(".custom-text-annotation").forEach((el) => {
      results.push({
        type: "text",
        text: el.textContent,
        x: parseInt(el.style.left, 10),
        y: parseInt(el.style.top, 10),
        color: el.style.color,
        fontSize: parseInt(el.style.fontSize, 10)
      });
    });
    pageEl.querySelectorAll(".custom-image-annotation").forEach((el) => {
      const img = el.querySelector("img");
      results.push({
        type: "image",
        dataUrl: img ? img.src : "",
        x: parseInt(el.style.left, 10),
        y: parseInt(el.style.top, 10),
        width: parseInt(el.style.width, 10),
        height: parseInt(el.style.height, 10)
      });
    });
    return results;
  }

  return {
    init, setPage, setColor, setFontSize,
    startTextAnnotation, confirmTextAnnotation, cancelTextAnnotation,
    triggerImageAnnotation, handleImageFile,
    getAnnotationsOnPage
  };
})();
