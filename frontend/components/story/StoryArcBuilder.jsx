"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackStoryArc } from "../../lib/api";

const EMPTY_ARTICLE = {
  id: Math.random(),
  title: "",
  content: "",
  date: new Date().toISOString().split("T")[0],
  time: new Date().toTimeString().slice(0, 5)
};

export default function StoryArcBuilder() {
  const router = useRouter();
  const [headline, setHeadline] = useState("");
  const [articles, setArticles] = useState([EMPTY_ARTICLE]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addArticle = () => {
    setArticles([...articles, { ...EMPTY_ARTICLE, id: Math.random() }]);
  };

  const removeArticle = (id) => {
    if (articles.length > 1) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const updateArticle = (id, field, value) => {
    setArticles(articles.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const handleBuild = async () => {
    // Validation
    if (!headline.trim()) {
      setError("Please enter a story headline");
      return;
    }

    const validArticles = articles.filter(a => a.title.trim() && a.content.trim());
    if (validArticles.length < 2) {
      setError("Add at least 2 articles to build a story arc");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare timeline data
      const timeline = validArticles.map(article => {
        const dateTime = new Date(`${article.date}T${article.time}`);
        return {
          title: article.title,
          content: article.content,
          summary: article.content.slice(0, 150) + "...",
          publishedAt: dateTime.toISOString(),
          sentimentScore: Math.random() * 4 - 2, // Random sentiment for demo
        };
      });

      // Extract entities from all articles
      const allText = validArticles.map(a => `${a.title} ${a.content}`).join(" ");
      const entities = extractEntities(allText);

      const payload = {
        headline,
        entities,
        timeline,
        sentimentTrend: timeline.map(() => Math.random() * 2 - 1)
      };

      await trackStoryArc(payload);
      
      // Success - redirect to story arcs
      router.push("/story-arcs");
    } catch (err) {
      setError(err.message || "Failed to build story arc");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="panel p-6 border-b border-white/10">
        <p className="eyebrow">📖 BUILD A STORY</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-100">Story Arc Builder</h2>
        <p className="mt-2 text-sm text-slate-400">
          Track how a narrative evolves by connecting related articles over time. Add at least 2 articles to build your arc.
        </p>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="panel p-4 border border-rose-500/30 bg-rose-500/5">
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* STORY HEADLINE */}
      <div className="panel p-5">
        <label className="block">
          <p className="text-sm font-semibold text-slate-200 mb-2">Story Headline (Optional)</p>
          <input
            type="text"
            placeholder="e.g., 'The Great AI Boom of 2026' or leave blank for auto-generated"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-300/60 focus:bg-white/10 outline-none transition"
          />
          <p className="mt-1 text-xs text-slate-400">
            This describes the overall narrative connecting all articles.
          </p>
        </label>
      </div>

      {/* ARTICLES LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-sm">Articles ({articles.length})</p>
          <span className="text-xs text-slate-400">
            {articles.filter(a => a.title && a.content).length} of {articles.length} complete
          </span>
        </div>

        {articles.map((article, idx) => (
          <div key={article.id} className="panel p-5 space-y-4 border border-white/10">
            {/* ARTICLE HEADER */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-300">Article {idx + 1}</p>
              {articles.length > 1 && (
                <button
                  onClick={() => removeArticle(article.id)}
                  className="text-xs text-rose-300 hover:text-rose-200 transition font-semibold"
                >
                  Remove
                </button>
              )}
            </div>

            {/* TITLE */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Title *</label>
              <input
                type="text"
                placeholder="Article title"
                value={article.title}
                onChange={(e) => updateArticle(article.id, "title", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-300/60 focus:bg-white/10 outline-none transition"
              />
            </div>

            {/* CONTENT */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Content *</label>
              <textarea
                placeholder="Article content or summary"
                value={article.content}
                onChange={(e) => updateArticle(article.id, "content", e.target.value)}
                rows="4"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-300/60 focus:bg-white/10 outline-none transition resize-none"
              />
            </div>

            {/* DATE & TIME */}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Date *</label>
                <input
                  type="date"
                  value={article.date}
                  onChange={(e) => updateArticle(article.id, "date", e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-300/60 focus:bg-white/10 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Time *</label>
                <input
                  type="time"
                  value={article.time}
                  onChange={(e) => updateArticle(article.id, "time", e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-300/60 focus:bg-white/10 outline-none transition"
                />
              </div>
            </div>

            {/* COMPLETION STATUS */}
            {article.title && article.content ? (
              <div className="flex items-center gap-2 text-xs text-green-300">
                <span>✓ Complete</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>○ Incomplete — fill in title and content</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD ARTICLE BUTTON */}
      <button
        onClick={addArticle}
        className="w-full rounded-lg border border-dashed border-white/20 bg-white/[0.02] p-4 text-sm font-semibold text-slate-300 hover:border-white/40 hover:bg-white/5 transition"
      >
        + Add Article
      </button>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={handleBuild}
          disabled={loading}
          className="flex-1 rounded-lg bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:opacity-60 transition"
        >
          {loading ? "Building Story Arc..." : "Build Story Arc"}
        </button>
        <button
          onClick={() => router.back()}
          disabled={loading}
          className="rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-white/30 hover:bg-white/10 disabled:opacity-60 transition"
        >
          Cancel
        </button>
      </div>

      {/* INFO */}
      <div className="panel p-4 bg-slate-500/5 border border-slate-500/20 rounded-lg">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300">What happens next?</span> Your articles will be analyzed to extract entities, calculate sentiment trends, and map the narrative evolution. You'll then view the complete timeline with insights.
        </p>
      </div>
    </div>
  );
}

// Helper: Extract entities from text (simple word extraction)
function extractEntities(text) {
  const words = text.split(/\s+/);
  const capitalized = words
    .filter(w => /^[A-Z][a-z]+/.test(w))
    .slice(0, 10);
  
  const unique = [...new Set(capitalized)];
  return unique.length > 0 ? unique : ["Unknown"];
}
