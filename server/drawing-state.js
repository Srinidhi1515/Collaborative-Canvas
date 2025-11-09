class DrawingState {
  constructor() {
    this.strokes = [];
    this.undoStack = [];
    this.colors = ["#ff4d4d", "#4d94ff", "#4dff4d", "#ffb84d", "#b84dff"];
    this.colorMap = new Map();
    this.index = 0;
  }

  assignColor(id) {
    const color = this.colors[this.index++ % this.colors.length];
    this.colorMap.set(id, color);
    return color;
  }

  unassignColor(id) { this.colorMap.delete(id); }

  addStroke(s) {
    this.strokes.push(s);
    this.undoStack = [];
  }

  getStrokes() { return this.strokes; }

  undo() {
    for (let i = this.strokes.length - 1; i >= 0; i--) {
      if (!this.strokes[i].removed) {
        this.strokes[i].removed = true;
        this.undoStack.push(this.strokes[i]);
        return this.strokes[i];
      }
    }
  }

  redo() {
    const s = this.undoStack.pop();
    if (s) {
      s.removed = false;
      return s;
    }
  }
}
module.exports = DrawingState;
