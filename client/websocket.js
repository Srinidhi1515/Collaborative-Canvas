class SocketClient {
  constructor(canvasManager) {
    this.cm = canvasManager;
    this.socket = io();
    this.user = {};
    this.init();
  }

  init() {
    this.socket.on("welcome", meta => {
      this.user = meta;
      document.getElementById("users").textContent = `Users: ${meta.userCount}`;
    });

    this.socket.on("init-state", data => {
      this.cm.strokes = data.strokes;
      this.cm.redraw();
    });

    this.socket.on("user-list", n => {
      document.getElementById("users").textContent = `Users: ${n}`;
    });

    this.socket.on("stroke-added", s => this.cm.addStroke(s));
    this.socket.on("stroke-removed", id => this.cm.removeStroke(id));
    this.socket.on("stroke-restored", s => this.cm.restoreStroke(s));

    this.socket.on("cursor", p => {
      this.cm.updateCursor(p.userId, p.x, p.y, p.color);
    });

    this.socket.on("user-left", id => this.cm.removeCursor(id));
  }

  sendStroke(stroke) { this.socket.emit("add-stroke", stroke); }
  sendUndo() { this.socket.emit("undo"); }
  sendRedo() { this.socket.emit("redo"); }
  sendCursor(e) {
    this.socket.emit("cursor", { x: e.clientX, y: e.clientY });
  }
}
window.SocketClient = SocketClient;
