import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://thass-chat.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export default socket;