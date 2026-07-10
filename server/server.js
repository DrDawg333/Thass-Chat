const onlineUsers = new Map();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const uploadRoutes = require("./routes/uploadRoutes");
const messageRoutes = require("./routes/messageRoutes");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err.message);
  });

app.get("/", (req, res) => {
  res.send("Server Running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", async (socket) => {
  console.log("✅ User Connected:", socket.id);

  const messages = await Message.find()
    .sort({ createdAt: 1 });

  socket.emit("message_history", messages);

  socket.on("typing", (data) => {

    socket.to(data.room).emit("typing", {
      username: data.username,
      room: data.room,
    });

  });

  socket.on("stop_typing", (room) => {

    socket.to(room).emit("stop_typing");

  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("stop_typing", () => {
    socket.broadcast.emit("stop_typing");
  });

  socket.on("send_message", async (data) => {

    const message = await Message.create({
      user: data.user,
      text: data.text,
      room: data.room,
    });

    io.to(data.room)
      .emit("receive_message", message);

  });

  socket.on("user_connected", (username) => {
    try {

      console.log("🔥 user_connected:", username);

      socket.username = username;

      onlineUsers.set(socket.id, username);

      const users = [
        ...new Set(
          Array.from(onlineUsers.values())
        ),
      ];

      console.log("EMITTING:", users);

      io.emit("online_users", users);

    } catch (err) {

      console.error(
        "ONLINE USER ERROR:",
        err
      );

    }
  });

  socket.on("join_room", (room) => {

    socket.join(room);

    console.log(
      `${socket.id} joined ${room}`
    );

  });

  socket.on("disconnect", () => {

    onlineUsers.delete(socket.id);

    const users = [
      ...new Set(
        Array.from(onlineUsers.values())
      ),
    ];

    io.emit("online_users", users);

    console.log("❌ User Disconnected");
    console.log("ONLINE USERS:", users);
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});