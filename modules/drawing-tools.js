/* modules/drawing-tools.js – Canvas-based drawing overlay for signatures & freehand */

const DrawingTools = (() => {
  let activeCanvas = null;
  let ctx = null;
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  let tool = "pen";       // "pen" | "eraser"
  let color = "#000000";
  let lineWidth = 2;
  let enabled = false;
  let pageEl = null;
  let scale = 1;

  function init(pageElement, viewportScale) {
    pageEl = pageElement;
    scale = viewportScale;
    removeCanvas();
    const rect = pageEl.getBoundingClientRect();
    activeCanvas = document.createElement("canvas");
    activeCanvas.className = "draw-overlay";
    activeCanvas.width = pageEl.querySelector("canvas").width;
    activeCanvas.height = pageEl.querySelector("canvas").height;
    activeCanvas.style.width = rect.width + "px";
    activeCanvas.style.height = rect.height + "px";
    pageEl.appendChild(activeCanvas);
    ctx = activeCanvas.getContext("2d");
    bindEvents();
    enabled = true;
  }

  function removeCanvas() {
    if (activeCanvas && activeCanvas.parentNode) {
      activeCanvas.parentNode.removeChild(activeCanvas);
    }
    activeCanvas = null;
    ctx = null;
    enabled = false;
  }

  function bindEvents() {
    activeCanvas.addEventListener("pointerdown", onPointerDown);
    activeCanvas.addEventListener("pointermove", onPointerMove);
    activeCanvas.addEventListener("pointerup", onPointerUp);
    activeCanvas.addEventListener("pointerleave", onPointerUp);
  }

  function unbindEvents() {
    if (!activeCanvas) return;
    activeCanvas.removeEventListener("pointerdown", onPointerDown);
    activeCanvas.removeEventListener("pointermove", onPointerMove);
    activeCanvas.removeEventListener("pointerup", onPointerUp);
    activeCanvas.removeEventListener("pointerleave", onPointerUp);
  }

  function getCanvasCoords(e) {
    const rect = activeCanvas.getBoundingClientRect();
    const scaleX = activeCanvas.width / rect.width;
    const scaleY = activeCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function onPointerDown(e) {
    if (!enabled) return;
    e.preventDefault();
    drawing = true;
    const pos = getCanvasCoords(e);
    lastX = pos.x;
    lastY = pos.y;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  }

  function onPointerMove(e) {
    if (!drawing || !enabled) return;
    e.preventDefault();
    const pos = getCanvasCoords(e);
    ctx.lineWidth = lineWidth * scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = lineWidth * scale * 3;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
  }

  function onPointerUp(e) {
    drawing = false;
  }

  function setTool(t) {
    tool = t;
    if (activeCanvas) {
      activeCanvas.classList.toggle("eraser-mode", t === "eraser");
    }
  }

  function setColor(c) { color = c; }
  function setWidth(w) { lineWidth = w; }

  function clear() {
    if (!ctx || !activeCanvas) return;
    ctx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
  }

  /* Flatten drawing into the page canvas */
  function applyToPage(pageCanvas) {
    if (!activeCanvas) return;
    const pageCtx = pageCanvas.getContext("2d");
    pageCtx.drawImage(activeCanvas, 0, 0, pageCanvas.width, pageCanvas.height);
  }

  function isActive() { return enabled; }
  function getCanvas() { return activeCanvas; }

  return {
    init, removeCanvas, setTool, setColor, setWidth,
    clear, applyToPage, isActive, getCanvas
  };
})();
