"use client";

import { useState } from "react";
import { askQuestion, summarizeArticle } from "../lib/api";

export default function DeepBriefing({ article }) {
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("What are the biggest near-term risks here?");
  const [answer, setAnswer] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  async function generateSummary() {
    if (!article?._id) return;
    setLoadingSummary(true);
    try {
      const response = await summarizeArticle(article._id);
      setSummary(response.personalizedSummary);
    } finally {
      setLoadingSummary(false);
    }
  }

  async function ask() {
    if (!question.trim()) return;
    setLoadingChat(true);
    try {
      const response = await askQuestion(question);
      setAnswer(response.answer);
    } finally {
      setLoadingChat(false);
    }
  }

  return (
    <section className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Deep Briefing</h2>
        <button onClick={generateSummary} disabled={!article || loadingSummary} className="rounded-xl bg-ink text-white px-3 py-1.5 text-sm">
          {loadingSummary ? "Briefing..." : "Generate Briefing"}
        </button>
      </div>

      <p className="text-xs text-slate-500">{article ? article.title : "Select a news article to generate a personalized briefing."}</p>

      <div className="rounded-xl border p-3 min-h-24 text-sm whitespace-pre-wrap">{summary || "No briefing yet."}</div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ask over indexed news</label>
        <textarea className="w-full rounded-xl border p-2 text-sm" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
        <button onClick={ask} disabled={loadingChat} className="rounded-xl bg-ember text-white px-3 py-1.5 text-sm">
          {loadingChat ? "Thinking..." : "Ask your analyst"}
        </button>
      </div>

      <div className="rounded-xl border p-3 min-h-20 text-sm whitespace-pre-wrap">{answer || "Analyst answer will appear here."}</div>
    </section>
  );
}
