"use client";

import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../../lib/api";

export default function ArcAnalystChat({ arcHeadline, arcEntities }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      type: "analyst",
      text: "Ask your analyst",
      subtext: "No conversation yet. Ask a question to start."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setError("");

    // Add user message
    setMessages((prev) => [
      ...prev.filter((m) => m.id !== "welcome"),
      { id: Date.now(), type: "user", text: userMessage }
    ]);

    setLoading(true);

    try {
      // Add context about the story arc to the question
      const contextualQuestion = `Regarding the story arc "${arcHeadline}" with key entities: ${arcEntities.slice(0, 5).join(", ")} - ${userMessage}`;

      const response = await askQuestion(contextualQuestion);
      const answer = response?.data || response?.answer || "I couldn't generate a response at this time.";

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "analyst", text: answer }
      ]);
    } catch (err) {
      setError(err.message || "Failed to get response");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "analyst",
          text: "⚠️ Error",
          subtext: err.message || "Could not process your question. Try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-5 space-y-4 flex flex-col h-full">
      {/* HEADER */}
      <div className="border-b border-white/10 pb-3">
        <p className="eyebrow">💬 FOLLOW-UP Q&A</p>
        <p className="text-xs text-slate-400 mt-1">Dive deeper into this narrative</p>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs rounded-lg p-3 text-sm ${
                msg.type === "user"
                  ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/30"
                  : "bg-slate-700/30 text-slate-200 border border-slate-600/30"
              }`}
            >
              <p className="font-medium">{msg.text}</p>
              {msg.subtext && (
                <p className="text-xs mt-1 opacity-75">{msg.subtext}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/30 text-slate-300 border border-slate-600/30 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSend} className="space-y-2 border-t border-white/10 pt-3">
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="How should I monitor this story over the next quarter?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-300/60 focus:bg-white/10 outline-none transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-200 disabled:opacity-50 transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
