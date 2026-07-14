const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://thass-chat-mo.vercel.app",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/messages", messageRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("Server Running");
});



/*
socket.id
↓

{
    username,
    room
}
*/

const onlineUsers = new Map();

function emitUsers() {

    const allUsers = [
        ...new Set(
            [...onlineUsers.values()].map(u => u.username)
        )
    ];

    io.emit("online_users", allUsers);

    const rooms = ["General", "Coding", "Gaming", "Memes"];

    rooms.forEach(room => {

        const roomUsers = [

            ...new Set(

                [...onlineUsers.values()]
                    .filter(u => u.room === room)
                    .map(u => u.username)

            )

        ];

        io.to(room).emit("room_users", roomUsers);

    });

}

io.on("connection", async (socket) => {

    console.log("🟢", socket.id);

    const history = await Message.find()
        .sort({ createdAt: 1 });

    socket.emit("message_history", history);

    socket.on("user_connected", (username) => {

        onlineUsers.set(socket.id, {
            username,
            room: null
        });

        emitUsers();

    });

    socket.on("join_room", (room) => {

        const user = onlineUsers.get(socket.id);

        if (!user) return;

        if (user.room) {

            socket.leave(user.room);

        }

        socket.join(room);

        user.room = room;

        onlineUsers.set(socket.id, user);

        emitUsers();

    });

    socket.on("typing", (data) => {

        socket.to(data.room).emit("typing", {
            username: data.username,
            room: data.room
        });

    });

    socket.on("stop_typing", (room) => {

        socket.to(room).emit("stop_typing");

    });

    socket.on("send_message", async (data) => {

        const message = await Message.create({

            user: data.user,
            text: data.text,
            room: data.room

        });

        io.to(data.room)
            .emit("receive_message", message);

    });

    socket.on("disconnect", () => {

        onlineUsers.delete(socket.id);

        emitUsers();

        console.log("🔴", socket.id);

    });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});