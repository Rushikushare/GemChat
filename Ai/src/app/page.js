"use client";
import { useState, useRef, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';  // your own styles if any


export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]); // store conversation
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleChat = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      const botMessage = {
        role: "bot",
        content: res.ok
          ? data.res
          : `Error: ${data.error || "Something went wrong"}`,
      };

      setChat((prev) => [...prev, botMessage]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { role: "bot", content: "Error: " + error.message },
      ]);
    }

    setLoading(false);
  };

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      {/* Header */}
      <header className="bg-warning text-white text-center py-3 shadow fw-bold fs-4">
        Ask me Anything 
      </header>

      {/* Chat area */}
      <main className="flex-grow-1 overflow-auto p-3">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`d-flex mb-2 ${
              msg.role === "user" ? "justify-content-end" : "justify-content-start"
            }`}
          >
            <div
              className={`p-2 rounded shadow-sm ${
                msg.role === "user"
                  ? "bg-warning text-white rounded-3 rounded-end-0"
                  : "bg-white text-dark border rounded-3 rounded-start-0"
              }`}
              style={{ maxWidth: "70%" }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="d-flex justify-content-start mb-2">
            <div className="p-2 bg-white border rounded-3 text-muted fst-italic">
              typing...
            </div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </main>

      {/* Input section */}
      <footer className="p-3 bg-white shadow d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleChat()}
        />
        <button
          className="btn btn-warning text-white"
          onClick={handleChat}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </footer>
    </div>
  );
}
