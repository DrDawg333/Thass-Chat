import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import API from "../services/api";
import EmojiPicker from "emoji-picker-react";
import bg from "../assets/backgrounds/login-bg.png";
import Logo from "../components/Logo";

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

  const profilePic =
    localStorage.getItem("profilePic");

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

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

      socket.emit(
        "user_connected",
        username
      );
    };

    if (socket.connected) {
      socket.emit(
        "user_connected",
        username
      );
    }

    socket.on("connect", handleConnect);

    socket.on(
      "message_history",
      (history) => {
        setMessages(history);
      }
    );

    socket.on(
      "receive_message",
      (data) => {
        setMessages((prev) => [
          ...prev,
          data,
        ]);
      }
    );

    socket.on("typing", (data) => {
      if (data.room === room) {
        setTypingUser(data.username);
      }
    });

    socket.on("stop_typing", () => {
      setTypingUser("");
    });

    socket.on(
      "online_users",
      (users) => {
        console.log(
          "ONLINE USERS:",
          users
        );

        setOnlineUsers(users);
      }
    );

    return () => {
      socket.off("connect", handleConnect);

      socket.off("message_history");
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("online_users");
    };

  }, [navigate, username]);

  useEffect(() => {
    socket.emit(
      "join_room",
      room
    );

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

    socket.emit(
      "stop_typing",
      room
    );
  };

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    navigate("/");
  };

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

            <Logo
              showTagline={false}
              showWelcome={false}
            />

            {/* Profile Card */}
            <div className="
mt-2
rounded-2xl
bg-white/5
border
border-white/10
p-1
flex
items-center
gap-4
">

              <img
                src={
                  profilePic
                    ? profilePic
                    : `https://api.dicebear.com/9.x/adventurer/svg?seed=${username}`
                }
                className="w-11 h-14 rounded-full ml-2"
              />

              <div>

                <p className="text-white font-semibold">
                  {username}
                </p>

                <p className="text-gray-400 text-sm">
                  Online
                </p>

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

                <p className="text-gray-500 text-sm">
                  Nobody online
                </p>

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
        <div
          className="
    flex-1
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
          <div className="flex flex-col flex-1">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">

              {messages
                .filter((msg) => msg.room === room)
                .map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-3 flex ${msg.user === username
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >
                    <div
                      className={`p-3 rounded-lg shadow max-w-md break-words ${msg.user === username
                        ? "bg-blue-600 text-white"
                        : "bg-white text-black"
                        }`}
                    >
                      <div className="flex items-start gap-3">

                        <img
                          src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${msg.user}`}
                          alt="avatar"
                          className="w-10 h-10 rounded-full"
                        />

                        <div>

                          <div className="font-semibold">
                            {msg.user}
                          </div>

                          <div className="mt-1">
                            {msg.text}
                          </div>

                        </div>

                      </div>

                      {msg.createdAt && (
                        <div
                          className={`text-xs mt-2 ${msg.user === username
                            ? "text-blue-100"
                            : "text-gray-500"
                            }`}
                        >
                          {new Date(
                            msg.createdAt
                          ).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
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
            <div className="bg-white border-t p-4 flex gap-2 items-center">

              {/* Emoji Button */}
              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker(!showEmojiPicker)
                  }
                  className="text-3xl"
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
                className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder:text-gray-500" />

              {/* Send Button */}
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg"
              >
                Send
              </button>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default Chat;