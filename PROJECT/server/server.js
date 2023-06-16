const http = require("http");
const express = require("express");
const morgan = require("morgan");
const { Server } = require("socket.io");

const app = express();
app.use(morgan("combined"));
app.use(express.static("."));

//initialize a simple http server
const server = http.createServer(app);
const io = new Server(server);

const clients = [];
const cams = [];
io.on("connection", (socket) => {
  clients.push(socket);
  cams.push(null);

  console.log(`Client connected with id: ${socket.id}`);

  socket.on("reloadRequest", (cam) => {
    cams[clients.indexOf(socket)] = cam;
    console.log(clients);
    socket.emit("reloadResponse", cams);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected with id: ${socket.id}`);
    const index = clients.indexOf(socket);
    if (index > -1) {
      clients.splice(index, 1);
      cams.splice(index, 1);
    }
  });
});

server.listen(process.env.PORT || 8080, () => {
  console.log(`Server started on port ${server.address().port} :)`);
});
