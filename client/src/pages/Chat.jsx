import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import API from "../services/api";

function Chat() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const username = localStorage.getItem("username");

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
      socket.off(
        "connect",
        handleConnect
      );

      socket.off("message_history");
      socket.off("receive_message");
      socket.off("online_users");
    };

  }, [navigate, username]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      user: username,
      text: message,
    });

    setMessage("");
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

            {messages.map((msg, index) => (
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
                  <div className="font-semibold">
                    {msg.user}
                  </div>

                  <div className="mt-1">
                    {msg.text}
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

          {/* Input */}
          <div className="bg-white border-t p-4 flex gap-2">

            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

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