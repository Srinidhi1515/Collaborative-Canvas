class Rooms {
  constructor() { this.rooms = new Map(); }
  join(room, id) {
    if (!this.rooms.has(room)) this.rooms.set(room, new Set());
    this.rooms.get(room).add(id);
  }
  leave(room, id) {
    if (this.rooms.has(room)) this.rooms.get(room).delete(id);
  }
  count(room) { return this.rooms.has(room) ? this.rooms.get(room).size : 0; }
}
module.exports = Rooms;
