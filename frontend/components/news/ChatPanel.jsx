"use client";

import { useState } from "react";
import { askQuestion } from "../../lib/api";

export default function ChatPanel() {
  const [question, setQuestion] = useState("How should I monitor this story over the next quarter?");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function submitQuestion() {
    if (!question.trim()) return;

    const q = question.trim();
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");

    try {
      const data = await askQuestion(q);
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Follow-up Q&A</p>
          <h2 className="mt-1 text-lg font-semibold">Ask your analyst</h2>
        </div>
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 pulse-ring" />
      </div>

      <div className="mt-4 h-64 overflow-auto rounded-xl border border-white/10 bg-black/20 p-3 space-y-3">
        {messages.length === 0 ? <p className="text-sm text-slate-400">No conversation yet. Ask a question to start.</p> : null}
        {messages.map((message, index) => (
          <div key={index} className={`rounded-lg p-2 text-sm ${message.role === "user" ? "bg-cyan-300/15 text-cyan-100" : "bg-white/8 text-slate-100"}`}>
            <p className="mono text-[10px] uppercase mb-1 text-slate-300">{message.role}</p>
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-300/60"
          placeholder="Ask impact, risk, or opportunity questions"
        />
        <button
          disabled={loading}
          onClick={submitQuestion}
          className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Thinking" : "Send"}
        </button>
      </div>
    </section>
  );
}
