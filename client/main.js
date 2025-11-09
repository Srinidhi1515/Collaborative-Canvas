// client/main.js
const canvasEl = document.getElementById("canvas");
const cm = new CanvasManager(canvasEl);
window.cm = cm;

const toolSelect = document.getElementById("tool");
const colorInput = document.getElementById("color");
const widthInput = document.getElementById("width");

toolSelect.addEventListener("change", e => cm.setTool(e.target.value));

colorInput.addEventListener("input", e => {
  cm.setColor(e.target.value);
  const colorPreview = document.getElementById("colorPreview");
  colorPreview.style.background = e.target.value;
});

widthInput.addEventListener("input", e => cm.setWidth(e.target.value));

let drawing = false;

canvasEl.addEventListener("mousedown", e => {
  drawing = true;
  cm.beginStroke(e);
});

canvasEl.addEventListener("mousemove", e => {
  if (drawing) cm.moveStroke(e);
});

canvasEl.addEventListener("mouseup", () => {
  drawing = false;
  cm.endStroke();
});

canvasEl.addEventListener("mouseleave", () => {
  drawing = false;
});
