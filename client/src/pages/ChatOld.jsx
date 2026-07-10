import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import API from "../services/api";
import EmojiPicker from "emoji-picker-react";

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
    <div className="h-screen flex flex-col bg-slate-100">

      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-2xl font-bold">
            💬 Thass Chat
          </h1>

          <p className="text-sm text-blue-100">
            Logged in as {username}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="border p-2 rounded bg-white text-black">

        <select
          value={room}
          onChange={(e) =>
            setRoom(e.target.value)
          }
          className="border p-2 rounded"
        >
          <option value="General">
            General
          </option>

          <option value="Coding">
            Coding
          </option>

          <option value="Gaming">
            Gaming
          </option>

          <option value="Memes">
            Memes
          </option>

        </select>

      </div>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">

          <h2 className="font-bold text-lg mb-4">
            🟢 Online Users
          </h2>

          {onlineUsers.length === 0 ? (
            <p className="text-gray-500">
              No users online
            </p>
          ) : (
            onlineUsers.map((user) => (
              <div
                key={user}
                className="mb-2 p-2 rounded bg-green-50"
              >
                🟢 {user}
              </div>
            ))
          )}
        </div>

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
  );
}

export default Chat;