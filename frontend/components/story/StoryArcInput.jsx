"use client";

import { useState } from "react";
import { trackStoryArc } from "../../lib/api";

function emptyArticle() {
  return {
    title: "",
    content: "",
    publishedAt: ""
  };
}

export default function StoryArcInput({ onTracked }) {
  const [headline, setHeadline] = useState("");
  const [articles, setArticles] = useState([emptyArticle(), emptyArticle()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateArticle(index, field, value) {
    setArticles((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  }

  function addArticle() {
    setArticles((prev) => [...prev, emptyArticle()]);
  }

  async function submit() {
    const payloadArticles = articles.filter((item) => item.title.trim() && item.content.trim());

    if (payloadArticles.length < 2) {
      setError("Provide at least two related articles with title and content.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await trackStoryArc({
        headline,
        articles: payloadArticles
      });
      onTracked?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel p-5 space-y-3">
      <div>
        <p className="eyebrow">Story Arc Builder</p>
        <h2 className="mt-1 text-lg font-semibold">Track Evolution From Multiple Related News Articles</h2>
      </div>

      <input
        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
        placeholder="Optional story headline"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
      />

      <div className="space-y-3 max-h-96 overflow-auto pr-1">
        {articles.map((article, idx) => (
          <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
            <p className="mono text-xs text-cyan-200">Article {idx + 1}</p>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              placeholder="Title"
              value={article.title}
              onChange={(e) => updateArticle(idx, "title", e.target.value)}
            />
            <textarea
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              rows={4}
              placeholder="Content"
              value={article.content}
              onChange={(e) => updateArticle(idx, "content", e.target.value)}
            />
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              value={article.publishedAt}
              onChange={(e) => updateArticle(idx, "publishedAt", e.target.value)}
            />
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="flex gap-2">
        <button onClick={addArticle} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm">
          Add Article
        </button>
        <button
          disabled={loading}
          onClick={submit}
          className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Tracking" : "Build Story Arc"}
        </button>
      </div>
    </section>
  );
}
