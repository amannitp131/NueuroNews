"use client";

export default function NewsFeed({ articles = [], selectedId, onSelect }) {
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Your Intelligence</h2>
        <span className="text-xs text-slate-500">{articles.length} stories</span>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
        {articles.map((article) => {
          const active = selectedId === article._id;
          return (
            <button
              key={article._id}
              onClick={() => onSelect(article)}
              className={`w-full text-left rounded-xl p-3 border transition ${active ? "border-accent bg-teal-50" : "border-slate-200 hover:border-slate-300"}`}
            >
              <h3 className="font-semibold text-sm">{article.title}</h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{article.content}</p>
              <div className="mt-2 text-xs text-slate-500 flex gap-3">
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                <span>Sentiment: {article.sentimentScore}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
