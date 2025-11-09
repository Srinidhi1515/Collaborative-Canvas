const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const Rooms = require("./rooms");
const State = require("./drawing-state");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../client")));

const rooms = new Rooms();
const state = new State();

io.on("connection", socket => {
  const color = state.assignColor(socket.id);
  rooms.join("main", socket.id);

  socket.emit("welcome", { userId: socket.id, color, userCount: rooms.count("main") });
  io.emit("user-list", rooms.count("main"));
  socket.emit("init-state", { strokes: state.getStrokes() });

  socket.on("add-stroke", s => {
    state.addStroke(s);
    io.emit("stroke-added", s);
  });

  socket.on("undo", () => {
    const rem = state.undo();
    if (rem) io.emit("stroke-removed", rem.id);
  });

  socket.on("redo", () => {
    const res = state.redo();
    if (res) io.emit("stroke-restored", res);
  });

  socket.on("cursor", p => {
    io.emit("cursor", { userId: socket.id, x: p.x, y: p.y, color });
  });

  socket.on("disconnect", () => {
    rooms.leave("main", socket.id);
    state.unassignColor(socket.id);
    io.emit("user-left", socket.id);
    io.emit("user-list", rooms.count("main"));
  });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
