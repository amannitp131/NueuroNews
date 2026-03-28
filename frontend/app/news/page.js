"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/core/AppShell";
import LoadingCard from "../../components/core/LoadingCard";
import { useRequireAuth } from "../../lib/authGuard";
import { fetchFeed } from "../../lib/api";

export default function NewsPage() {
  const { ready, isAuthenticated } = useRequireAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    if (!ready || !isAuthenticated) return;

    (async () => {
      try {
        const data = await fetchFeed({ page: 1, limit: 50 });
        setArticles(data.articles || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, isAuthenticated]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  if (!ready || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingCard label="Checking session" />
      </main>
    );
  }

  // Extract unique categories from articles
  const categories = ["all", ...new Set(articles.map(a => a.category || "other").filter(Boolean))];

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.entities?.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedArticles = filteredArticles.slice(startIndex, startIndex + pageSize);

  return (
    <AppShell
      title=""
      subtitle=""
    >
      {error && <div className="panel p-4 text-sm text-rose-300">{error}</div>}

      {/* SEARCH & FILTER SECTION */}
      <div className="panel p-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* SEARCH */}
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search articles by title, entities, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:border-cyan-300/60 focus:bg-white/10 outline-none transition"
            />
          </div>

          {/* RESULTS COUNT */}
          <div className="text-sm text-slate-400">
            {filteredArticles.length} {filteredArticles.length === 1 ? "story" : "stories"}
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 self-center mr-2">Filter by category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-cyan-300 text-slate-950"
                  : "bg-white/5 border border-white/15 text-slate-300 hover:border-white/30 hover:bg-white/10"
              }`}
            >
              {cat === "all" ? "All Stories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ARTICLES GRID */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <LoadingCard label="Loading articles" />
          <LoadingCard label="Loading articles" />
          <LoadingCard label="Loading articles" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="text-lg font-semibold text-slate-300">No articles found</p>
          <p className="mt-2 text-sm text-slate-400">Try adjusting your search or filters.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition font-semibold text-sm"
            >
              Clear search →
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pagedArticles.map(article => (
            <Link
              key={article._id}
              href={`/news/${article._id}`}
              className="group panel p-5 border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition overflow-hidden"
            >
              {/* CATEGORY BADGE */}
              {article.category && (
                <div className="mb-3">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-300/20 text-cyan-200 font-semibold">
                    {article.category}
                  </span>
                </div>
              )}

              {/* TITLE */}
              <h3 className="text-base font-semibold text-slate-100 line-clamp-3 group-hover:text-cyan-200 transition">
                {article.title}
              </h3>

              {/* SUMMARY */}
              {article.summary && (
                <p className="mt-3 text-sm text-slate-400 line-clamp-2">
                  {article.summary}
                </p>
              )}

              {/* ENTITIES */}
              {article.entities?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {article.entities.slice(0, 3).map((entity, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-1 rounded-full bg-slate-700/40 text-slate-300"
                    >
                      {entity}
                    </span>
                  ))}
                  {article.entities.length > 3 && (
                    <span className="text-[10px] px-2 py-1 text-slate-400">
                      +{article.entities.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* METADATA */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/10">
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                <span className="text-cyan-300/60 font-semibold">Read →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* LOAD MORE / PAGINATION NOTE */}
      {filteredArticles.length > 0 && (
        <div className="mt-8 space-y-4">
          <p className="text-center text-xs text-slate-500">
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredArticles.length)} of {filteredArticles.length} matching stories
          </p>

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-xs text-slate-300">
                Page {safePage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
