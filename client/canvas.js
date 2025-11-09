// client/canvas.js
class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    // Transparent overlay for shapes (for live preview)
    this.tempCanvas = document.createElement("canvas");
    this.tempCtx = this.tempCanvas.getContext("2d");
    this.tempCanvas.style.position = "absolute";
    this.tempCanvas.style.pointerEvents = "none";
    this.tempCanvas.style.background = "transparent";
    this.tempCanvas.style.zIndex = "10";
    const parent = this.canvas.parentNode;
    parent.style.position = "relative";
    parent.appendChild(this.tempCanvas);

    // Drawing state
    this.isDrawing = false;
    this.tool = "brush";
    this.color = "#007bff";
    this.width = 5;
    this.startPos = null;

    // Cursor indicator
    this.cursorIndicator = document.createElement("div");
    Object.assign(this.cursorIndicator.style, {
      position: "absolute",
      pointerEvents: "none",
      zIndex: "9999",
      transition: "0.1s ease",
      fontSize: "20px",
    });
    document.body.appendChild(this.cursorIndicator);

    this.attachCursorTracking();
    this.updateCursorStyle();

    // Resize setup
    this.resize();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("scroll", () => this.alignOverlay());

    // 🖱️ Mouse events
    this.canvas.addEventListener("mousedown", (e) => this.beginStroke(e));
    this.canvas.addEventListener("mousemove", (e) => this.moveStroke(e));
    this.canvas.addEventListener("mouseup", (e) => this.endStroke(e));

    // 📱 Touch events (for phone support)
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.beginStroke(touch);
    });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.moveStroke(touch);
    });

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.endStroke(e.changedTouches[0] || e);
    });
    
    
  }

  // --- Canvas size alignment ---
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.tempCanvas.width = rect.width;
    this.tempCanvas.height = rect.height;
    this.alignOverlay();
  }

  alignOverlay() {
    this.tempCanvas.style.top = `${this.canvas.offsetTop}px`;
    this.tempCanvas.style.left = `${this.canvas.offsetLeft}px`;
  }

  // --- Tool and style setters ---
  setTool(tool) {
    this.tool = tool;
    this.updateCursorStyle();
  }

  setColor(color) {
    this.color = color;
    this.updateCursorStyle();
  }

  setWidth(width) {
    this.width = Number(width);
    this.updateCursorStyle();
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }


  // --- Drawing logic ---
  beginStroke(e) {
    const pos = this.getPos(e);

    if (this.tool === "fill") {
      this.floodFill(Math.floor(pos.x), Math.floor(pos.y), this.color);
      return;
    }

    this.isDrawing = true;
    this.startPos = pos;

    if (this.tool === "brush" || this.tool === "eraser") {
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    }
  }

  moveStroke(e) {
    if (!this.isDrawing) return;
    const pos = this.getPos(e);

    // Brush or eraser
    if (this.tool === "brush" || this.tool === "eraser") {
      const ctx = this.ctx;
      ctx.lineWidth = this.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = this.tool === "eraser" ? "#ffffff" : this.color;
      ctx.globalCompositeOperation =
        this.tool === "eraser" ? "destination-out" : "source-over";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      return;
    }

    // Shape preview (on temp canvas)
    const ctx = this.tempCtx;
    ctx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    ctx.lineWidth = this.width;
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;

    const fillMode = document.getElementById("fillShape")?.checked;
    const start = this.startPos;

    this.drawShape(ctx, start, pos, fillMode);
  }

  endStroke(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    const pos = this.getPos(e);

    if (
      ["rectangle", "square", "circle", "oval", "hexagon", "line"].includes(
        this.tool
      )
    ) {
      const ctx = this.ctx;
      const fillMode = document.getElementById("fillShape")?.checked;
      this.drawShape(ctx, this.startPos, pos, fillMode);
      this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
    }
  }

  // --- Shape Drawer (for preview + final render) ---
  drawShape(ctx, start, pos, fillMode) {
  ctx.beginPath();
  ctx.lineWidth = this.width;
  ctx.strokeStyle = this.color;
  ctx.fillStyle = this.color;

  switch (this.tool) {
    case "rectangle": {
      const w = pos.x - start.x;
      const h = pos.y - start.y;
      fillMode
        ? ctx.fillRect(start.x, start.y, w, h)
        : ctx.strokeRect(start.x, start.y, w, h);
      break;
    }

    case "square": {
      const size = Math.max(Math.abs(pos.x - start.x), Math.abs(pos.y - start.y));
      const w = pos.x < start.x ? -size : size;
      const h = pos.y < start.y ? -size : size;
      fillMode
        ? ctx.fillRect(start.x, start.y, w, h)
        : ctx.strokeRect(start.x, start.y, w, h);
      break;
    }

    case "circle": {
      const r = Math.hypot(pos.x - start.x, pos.y - start.y);
      ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
      fillMode ? ctx.fill() : ctx.stroke();
      break;
    }

    case "oval": {
      const radiusX = Math.abs(pos.x - start.x) / 2;
      const radiusY = Math.abs(pos.y - start.y) / 2;
      const centerX = (pos.x + start.x) / 2;
      const centerY = (pos.y + start.y) / 2;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      fillMode ? ctx.fill() : ctx.stroke();
      break;
    }

    case "hexagon": {
      const rHex = Math.hypot(pos.x - start.x, pos.y - start.y) / 2;
      const centerXH = (start.x + pos.x) / 2;
      const centerYH = (start.y + pos.y) / 2;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerXH + rHex * Math.cos(angle);
        const y = centerYH + rHex * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath(); // ✅ Ensures no open edges
      fillMode ? ctx.fill() : ctx.stroke();
      break;
    }

    case "line": {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      break;
    }
  }
}


  // --- Fill Tool ---
  floodFill(x, y, fillColor) {
  const ctx = this.ctx;
  const imgData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  const data = imgData.data;
  const width = this.canvas.width;
  const height = this.canvas.height;

  const targetColor = this.getPixel(data, x, y);
  const fill = this.hexToRgb(fillColor);

  // If already same color → skip
  if (this.colorsMatch(targetColor, [fill.r, fill.g, fill.b, 255])) return;

  const stack = [{ x, y }];
  while (stack.length) {
    const { x, y } = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;

    const idx = (y * width + x) * 4;
    const currentColor = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    if (!this.colorsMatch(currentColor, targetColor)) continue;

    data[idx] = fill.r;
    data[idx + 1] = fill.g;
    data[idx + 2] = fill.b;
    data[idx + 3] = 255;

    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }

  ctx.putImageData(imgData, 0, 0);
}

getPixel(data, x, y) {
  const idx = (y * this.canvas.width + x) * 4;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

// ✅ Lower tolerance = prevents screen flooding
colorsMatch(a, b) {
  return (
    Math.abs(a[0] - b[0]) < 15 &&
    Math.abs(a[1] - b[1]) < 15 &&
    Math.abs(a[2] - b[2]) < 15
  );
}

hexToRgb(hex) {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return res
    ? {
        r: parseInt(res[1], 16),
        g: parseInt(res[2], 16),
        b: parseInt(res[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}


  // --- Cursor indicator ---
  updateCursorStyle() {
    const el = this.cursorIndicator;
    if (this.tool === "eraser") {
      el.textContent = "";
      el.style.width = `${this.width * 2}px`;
      el.style.height = `${this.width * 2}px`;
      el.style.borderRadius = "50%";
      el.style.border = "2px solid rgba(0,0,0,0.4)";
      el.style.background = "rgba(255,255,255,0.5)";
    } else if (this.tool === "fill") {
      el.textContent = "🪣";
      el.style.fontSize = `${this.width * 3}px`;
    } else {
      el.textContent = "🖌️";
      el.style.fontSize = `${this.width * 2.5}px`;
    }
  }

  attachCursorTracking() {
    document.addEventListener("mousemove", (e) => {
      const el = this.cursorIndicator;
      el.style.left = e.pageX + "px";
      el.style.top = e.pageY + "px";
    });
  }
}

window.CanvasManager = CanvasManager;
