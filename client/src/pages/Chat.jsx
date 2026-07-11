import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import API from "../services/api";
import EmojiPicker from "emoji-picker-react";
import bg from "../assets/backgrounds/login-bg.png";
import Logo from "../components/Logo";
import { motion } from "framer-motion";

function Chat() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [room, setRoom] = useState("General");

  const username = localStorage.getItem("username");

  const profilePic = localStorage.getItem("profilePic");
  const [roomUsers, setRoomUsers] = useState([]);

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const messagesRef = useRef(null);

  // Load Old Messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await API.get("/messages");
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadMessages();
  }, []);

  // Socket + Auth
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    const handleConnect = () => {
      console.log("Connected:", socket.id);

      socket.emit("user_connected", username);
    };

    if (socket.connected) {
      socket.emit("user_connected", username);
    }

    socket.on("connect", handleConnect);

    socket.on("message_history", (history) => {
      setMessages(history);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing", (data) => {
      if (data.room === room) {
        setTypingUser(data.username);
      }
    });

    socket.on("stop_typing", () => {
      setTypingUser("");
    });

    socket.on("online_users", (users) => {
      console.log("ONLINE USERS:", users);

      setOnlineUsers(users);
    });

    socket.on("room_users", (users) => {
      setRoomUsers(users);
    });

    return () => {
      socket.off("connect", handleConnect);

      socket.off("message_history");
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("online_users");
      socket.off("room_users");
    };
  }, [navigate, username, room]);

  useEffect(() => {
    socket.emit("join_room", room);
  }, [room]);

  useEffect(() => {
    setTypingUser("");
  }, [room]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      user: username,
      text: message,
      room: room,
    });

    setMessage("");

    socket.emit("stop_typing", room);
  };

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    navigate("/");
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [room]);

  return (
    <div
      className="relative h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative flex h-screen p-8 gap-6">
        <div
          className="
    w-[285px]
    rounded-3xl
    bg-black/25
    backdrop-blur-[1px]
    border
    border-red-500/20
    shadow-[0_0_50px_rgba(220,38,38,.15)]
    p-4
    flex
    flex-col
    h-full
  "
        >
          {/* ---------- TOP ---------- */}

          <div className="text-center">
            <Logo showTagline={false} showWelcome={false} />

            {/* Profile Card */}
            <div
              className="
mt-2
rounded-2xl
bg-white/5
border
border-white/10
p-1
flex
items-center
gap-4
"
            >
              <img
                src={
                  profilePic
                    ? profilePic
                    : `https://api.dicebear.com/9.x/adventurer/svg?seed=${username}`
                }
                className="w-11 h-14 rounded-full ml-2"
              />

              <div>
                <p className="text-white font-semibold">{username}</p>

                <p className="text-gray-400 text-sm">Online</p>
              </div>
            </div>

            {/* Rooms */}
            <div className="mt-5">
              <p className="text-red-400 uppercase text-md tracking-[3px] mb-2">
                ROOMS
              </p>

              <div className="space-y-2">
                {["General", "Coding", "Gaming", "Memes"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoom(r)}
                    className={`
w-full
rounded-xl
px-4
py-3
text-left
transition-all
duration-300
${room === r
                        ? "bg-red-700/40 text-white shadow-[0_0_20px_rgba(220,38,38,.3)]"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                      }
`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ---------- MIDDLE ---------- */}

          <div className="flex-1 flex flex-col mt-6">
            <p className="text-red-400 uppercase text-md tracking-[4px] mb-3 text-center">
              ONLINE
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {/* onlineUsers.map(...) */}
              {onlineUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">Nobody online</p>
              ) : (
                onlineUsers.map((user) => (
                  <div
                    key={user}
                    className="
            flex
            items-center
            gap-3
            rounded-xl
            bg-white/5
            hover:bg-red-900/20
            transition
            p-3
            border
            border-white/5
          "
                  >
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>

                    <span className="text-white text-sm font-medium">
                      {user}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ---------- BOTTOM ---------- */}

          <button
            onClick={handleLogout}
            className="
      w-full
      rounded-xl
      border
      border-red-500/30
      bg-red-900/30
      py-3
      text-white
      font-semibold
      hover:bg-red-700/40
      transition
    "
          >
            🚪 Logout
          </button>
        </div>

        {/* right part */}
        <div
          className="
    flex-1
    min-h-0
    rounded-3xl
    bg-black/20
    backdrop-blur-[1px]
    border
    border-red-500/20
    shadow-[0_0_50px_rgba(220,38,38,.15)]
    overflow-hidden
    flex
    flex-col
  "
        >
          {/* Chat Area */}
          <div className="flex flex-col flex-1 min-h-0">
            <div
              className="
py-1
px-8
border-b
border-red-500/20
bg-black/20
backdrop-blur-md
flex
items-center
justify-between
"
            >
              <div>
                <h1
                  className="
        text-2xl
        font-semibold
        text-white
        mb-0


      "
                  style={{ fontFamily: "Cinzel" }}
                >
                  {room}
                </h1>

                <p className="text-gray-400 text-sm mt-1">
                  {roomUsers.length} Online
                </p>
              </div>

              <div className="flex items-center gap-5">
                <button className="text-red-400 text-2xl hover:text-white transition">
                  🔍
                </button>

                <button className="text-red-400 text-2xl hover:text-white transition">
                  ⚙
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-8 py-6"
              ref={messagesRef}
            >
              {messages
                .filter((msg) => msg.room === room)
                .map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{
                      opacity: 0,
                      y: 20,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className={`mb-4 flex ${msg.user === username
                        ? "justify-end"
                        : "justify-start"
                      }`}
                  >
                    <div
                      className={`
    max-w-[70%]
    rounded-2xl
    border
    backdrop-blur-xl
    shadow-lg
    break-words
    px-5
    py-4
    transition-all
    duration-300
    ${msg.user === username
                          ? `
          bg-gradient-to-br
          from-red-900/60
          to-red-700/40
          border-red-500/20
          text-white
          shadow-[0_0_20px_rgba(220,38,38,.2)]
        `
                          : `
          bg-black/35
          border-white/10
          text-white
        `
                        }
  `}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${msg.user}`}
                          alt="avatar"
                          className="
w-9
h-9
rounded-full
border
border-red-500/20
"
                        />

                        <div>
                          <div className="font-semibold text-red-400">
                            {msg.user}
                          </div>

                          <div className="mt-2 text-gray-200 leading-relaxed">
                            {msg.text}
                          </div>
                        </div>
                      </div>

                      {msg.createdAt && (
                        <div className="text-[11px] mt-3">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

              <div ref={bottomRef}></div>
            </div>

            {/* Typing Indicator */}
            <div className="h-8 px-4 flex items-center text-gray-500 italic">
              {typingUser &&
                typingUser !== username &&
                `${typingUser} is typing...`}
            </div>

            {/* Input */}
            <div
              className="
    border-t
    border-red-500/20
    bg-black/25
    backdrop-blur-xl
    px-6
    py-5
    flex
    items-center
    gap-4
  "
            >
              {" "}
              {/* Emoji Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="
    w-12
    h-12
    rounded-full
    bg-white/5
    border
    border-white/10
    hover:bg-red-900/30
    transition
    text-2xl
  "
                >
                  😊
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-14 left-0 z-50">
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                )}
              </div>
              {/* Message Input */}
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);

                  socket.emit("typing", {
                    username,
                    room,
                  });

                  clearTimeout(window.typingTimeout);

                  window.typingTimeout = setTimeout(() => {
                    socket.emit("stop_typing", room);
                  }, 1000);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="
flex-1
rounded-full
bg-white/5
border
border-white/10
px-6
py-4
text-white
placeholder:text-gray-500
outline-none
transition-all
duration-300
focus:border-red-500
focus:bg-white/10
"
              />
              {/* Send Button */}
              <button
                onClick={sendMessage}
                className="
w-14
h-14
rounded-full
bg-gradient-to-r
from-red-900
to-red-700
text-white
flex
items-center
justify-center
transition-all
duration-300
hover:scale-105
hover:shadow-[0_0_20px_rgba(220,38,38,.45)]
active:scale-95
"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
