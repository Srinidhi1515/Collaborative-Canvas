 ARCHITECTURE.md — 🎨 REAL-TIME COLLABORATIVE DRAWING CANVAS - ARCHITECTURE

----------------------------------------------------------
📌 PROJECT OVERVIEW
----------------------------------------------------------
- This document describes the architecture, data flow, and design decisions involved in the Real-Time Collaborative Drawing Canvas project.
- This project allows multiple users to draw together in real time in the same canvas using both laptops and mobile phones


----------------------------------------------------------
⚙️ SYSTEM WORKING FLOW
----------------------------------------------------------
The system can let multiple users draw together in real-time on the same canvas.

It uses:
- Frontend: Vanilla JavaScript + HTML5 Canvas
- Backend: Node.js + Express + Socket.io (WebSockets)

- Communication: Bi-directional real-time event streaming

The app supports both mouse and touch input, allowing seamless usage across laptops and phones.

----------------------------------------------------------
📡 DATA FLOW DIAGRAM (Simple View)
----------------------------------------------------------
      ┌────────────────┐
      │     User A     │
      │ (Laptop/Phone) │
      └──────┬─────────┘
             │ Draw Event (stroke/shape/fill)
             ▼
     ┌───────────────────┐
     │   WebSocket (io)  │
     │  via Socket.io    │
     └───────────────────┘
             │ Broadcast
             ▼
      ┌────────────────┐
      │     Server     │
      │ (Node.js + io) │
      └──────┬─────────┘
             │ Send updates to others
             ▼
      ┌────────────────┐
      │     User B     │
      │ (Laptop/Phone) │
      └────────────────┘

All drawing events are sent as JSON packets through Websockets.
Each packet includes information like position,colour,width, tool etc....

Example data packet
{
    "tool": " brush",
    "colour" : "#ff0000",
    "width": 5,
    "points":[
        {"x": 100, "y": 150},
        {"x": 105, "y":155}
    ]
}

Events Used:
- "draw"        : Sent when drawing or erasing
- "clear"       : Sent when erase all is triggered
- "join"        : When new user joins
- "disconnect"  : When user leaves

----------------------------------------------------------
🎨 FRONTEND (CLIENT) DETAILS
----------------------------------------------------------
The client uses HTML5 Canvas API for drawing.

Key JS functions:
- beginStroke() -> starts drawing(mousedown/touchstart)
- moveStroke()  -> draws line or shape(mousemove/touchmove)
- endStroke()   -> ends drawing(mouseup/touchend)
- floodFill()   -> fills a closed area with color
- drawShape()   -> handles shapes like circle,square,oval,hexagon

Canvas API methods used:
- ctx.beginPath()
- ctx.lineTo()
- ctx.stroke()
- ctx.fillReact()
- ctx.arc()
- ctx.ellipse()
- ctx.clearReact()

----------------------------------------------------------
📱 TOUCH AND MOUSE SUPPORT
----------------------------------------------------------
The app supports both input types:

Mouse Events:
- mousedown, mousemove, mouseup

Touch Events:
- touchstart, touchmove, touchend

getPos() function automatically detects whether the input is from mouse or touch.

----------------------------------------------------------
🪣 FILL TOOL ALGORITHM (Flood Fill)
----------------------------------------------------------
1. Reads pixel color at click point.
2. Checks color difference (tolerance).
3. Replaces pixels of same color with new color.
4. uses a stack-based algorithm to fill the region.
5. Stops when boundary or different color is reached.

----------------------------------------------------------
🔄 UNDO / REDO (Optional)
----------------------------------------------------------
- Each cnavas change is stored as image snapshot.
- Undo -> go back to previous snapshot.
- Redo -> restore next snapshot.
- These can also be shared with other users using webSockets.

----------------------------------------------------------
📡 SERVER (BACKEND) DETAILS
----------------------------------------------------------
The backend runs using:
- Node.js
- Express.js
- Socket.io(for real-time data)

Important server line:
server.listen(3000,"0.0.0.0");
-> allows other devices on same wi-Fi to access the app.

On Laptop:
http://localhost:3000
On Phone:
http://<your-laptop-ip>:3000

----------------------------------------------------------
🌐 NETWORK SETUP
----------------------------------------------------------
1. Connect Laptop & Phone to same Wi-Fi.
2. Run"ipconfig" in CMD -> copy IPv4 Address.
3. Open on Phone -> http://IPv4:3000
4. Both devices can now draw on same canvas in sync.

----------------------------------------------------------
⚡ PERFORMANCE OPTIMIZATIONS
----------------------------------------------------------
- Combined draw points before sending (reduces traffic)
- Temporary overlay canvas for shape preview(no flicker)
- Closed paths ensure fill tool stays inside region
- "0.0.0.0" binding allows Wi-Fi sharing
- Prevented page scrolling during touch drawing

----------------------------------------------------------
⚖️ CONFLICT HANDLING
----------------------------------------------------------
When multiple users draw at same time:
- Events are processed in order recived.
- New strokes overwrite older pixels.
- Due to fast updated,conflicts are hardly visible.

----------------------------------------------------------
🧱 TECHNOLOGY STACK
----------------------------------------------------------
Frontend    :HTML,CSS,JavaScript (Canvas API)
Backend     :Node.js, Express.js
Realtime    :Socket.io(WebSockets)
Algorithm   :Flood Fill
Devices     :PC and Mobile(both supported)

----------------------------------------------------------
🔐 SECURITY & STABILITY
----------------------------------------------------------
- No database required; everything in memory.
- Each user has unique Socket ID.
- Small memory usage, fast response.
- Handles disconnects safely.

----------------------------------------------------------
✅ SUMMARY
----------------------------------------------------------
- Built with JavaScript and HTML5 canvas.
- Real-time drawing using Socket.io.
- Works on both laptop and phone.
- Supports mouse and touch
- Smooth and fast
