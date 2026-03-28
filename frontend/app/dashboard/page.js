"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../components/core/AppShell";
import LoadingCard from "../../components/core/LoadingCard";
import WowMoment from "../../components/WowMoment";
import { useRequireAuth } from "../../lib/authGuard";
import { fetchFeed, fetchStories } from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const { user, ready, isAuthenticated } = useRequireAuth();
  const [articles, setArticles] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signalPage, setSignalPage] = useState(1);
  const signalPageSize = 4;

  useEffect(() => {
    if (!ready || !isAuthenticated || !user?.email) return;

    (async () => {
      try {
        const feed = await fetchFeed();
        const arcData = await fetchStories();

        setArticles(feed.articles || []);
        setStories(arcData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, isAuthenticated, user]);

  useEffect(() => {
    setSignalPage(1);
  }, [articles.length]);

  if (!ready || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingCard label="Checking session" />
      </main>
    );
  }

  const topArticles = articles.slice(0, 8);
  const signalTotalPages = Math.max(1, Math.ceil(articles.length / signalPageSize));
  const safeSignalPage = Math.min(signalPage, signalTotalPages);
  const signalStart = (safeSignalPage - 1) * signalPageSize;
  const signalArticles = articles.slice(signalStart, signalStart + signalPageSize);
  const successfulPredictions = 3;
  const activeStories = stories.length;
  const aiInsights = Math.max(1, Math.floor(articles.length / 2));

  return (
    <>
      <WowMoment userInterests={user?.profile?.interests || []} articles={articles} />
      <AppShell
        title={`Welcome back, ${user?.name?.split(" ")[0] || "User"}!`}
        subtitle="Your Intelligence Command Center — spot emerging patterns, track key players, and stay ahead of the curve."
      >
      {error ? <div className="panel p-4 text-sm text-rose-300">{error}</div> : null}

      {/* INTELLIGENCE COMMAND CENTER LAYOUT */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: PERSONALIZED FEED */}
        <div className="lg:col-span-2 space-y-4">
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="eyebrow">🎯 SIGNAL STREAM</p>
                <h2 className="mt-1 text-lg font-semibold">What's Happening Today</h2>
              </div>
              <Link
                href="/profile"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:border-white/30 transition"
              >
                Tune Profile
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-3">
                <LoadingCard label="Loading your intelligence" />
                <LoadingCard label="Analyzing signals" />
              </div>
            ) : signalArticles.length > 0 ? (
              <div className="space-y-3">
                {signalArticles.map((article) => (
                  <div key={article._id} className="group rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 p-4 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-slate-100 line-clamp-2 group-hover:text-cyan-200 transition">
                          {article.title}
                        </h3>
                        <p className="mt-2 text-xs text-slate-400 line-clamp-2">{article.summary || article.content?.slice(0, 100)}</p>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {article.category && (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-300/20 text-cyan-200">
                              {article.category}
                            </span>
                          )}
                          {article.entities?.slice(0, 2).map((entity, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-1 rounded-full bg-slate-700/40 text-slate-300">
                              {entity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={`/news/${article._id}`}
                        className="shrink-0 rounded-lg bg-cyan-300/20 text-cyan-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-cyan-300/30 transition"
                      >
                        Read
                      </Link>
                    </div>
                  </div>
                ))}

                {articles.length > signalPageSize ? (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-slate-400">
                      Showing {signalStart + 1}-{Math.min(signalStart + signalPageSize, articles.length)} of {articles.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSignalPage((prev) => Math.max(1, prev - 1))}
                        disabled={safeSignalPage === 1}
                        className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-slate-200 disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span className="text-xs text-slate-300">
                        {safeSignalPage}/{signalTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSignalPage((prev) => Math.min(signalTotalPages, prev + 1))}
                        disabled={safeSignalPage === signalTotalPages}
                        className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-slate-200 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Update your profile to start seeing personalized signals.</p>
            )}
          </div>
        </div>

        {/* RIGHT: AI INSIGHTS PANEL */}
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="panel p-4 space-y-3">
            <p className="eyebrow">📊 BY THE NUMBERS</p>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-slate-400">Stories Matching You</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">{aiInsights}</p>
              <p className="text-[11px] text-slate-500 mt-1">personalized to your interests</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-slate-400">Timelines You're Tracking</p>
              <p className="mt-1 text-2xl font-bold text-slate-100">{activeStories}</p>
              <p className="text-[11px] text-slate-500 mt-1">story arcs in motion</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs text-slate-400">What happens next track record</p>
              <p className="mt-1 text-2xl font-bold text-green-400">{successfulPredictions}/5</p>
              <p className="text-[11px] text-slate-500 mt-1">accurate forecasts</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="panel p-4 space-y-2">
            <p className="eyebrow">⚡ QUICK ACCESS</p>

            <Link
              href="/story-arcs"
              className="block rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-3 text-sm font-medium text-cyan-100 hover:border-cyan-300/60 hover:bg-cyan-300/20 transition"
            >
              📈 View Story Arcs
            </Link>

            <button
              onClick={() => router.push("/news")}
              className="w-full rounded-lg border border-slate-500/30 bg-slate-500/10 p-3 text-sm font-medium text-slate-100 hover:border-slate-500/60 hover:bg-slate-500/20 transition"
            >
              🔍 Browse All News
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="w-full rounded-lg border border-slate-500/30 bg-slate-500/10 p-3 text-sm font-medium text-slate-100 hover:border-slate-500/60 hover:bg-slate-500/20 transition"
            >
              🎯 Refine Interests
            </button>
          </div>

          {/* Wow Moment: Key Signal */}
          {topArticles.length > 0 && (
            <div className="panel p-4 border border-amber-500/40 bg-amber-500/5">
              <p className="eyebrow text-amber-200">✨ TODAY'S TOP SIGNAL</p>
              <p className="mt-2 text-sm font-medium text-slate-100 line-clamp-2">
                {topArticles[0]?.title}
              </p>
              <Link
                href={`/news/${topArticles[0]._id}`}
                className="mt-3 inline-block text-xs font-semibold text-amber-300 hover:text-amber-200 transition"
              >
                Learn More →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* MACRO PULSE SECTION */}
      {topArticles.length > 0 && (
        <section className="mt-6 panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="eyebrow">🌍 THE BIGGER PICTURE</p>
              <h2 className="mt-1 text-lg font-semibold">What's Moving Markets Right Now</h2>
            </div>
            <span className="mono rounded-lg border border-white/15 px-2 py-1 text-[11px] text-slate-300">Live</span>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {topArticles.slice(0, 4).map((article) => (
              <Link
                key={article._id}
                href={`/news/${article._id}`}
                className="rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 p-3 transition group"
              >
                <p className="text-xs font-medium text-slate-200 line-clamp-2 group-hover:text-cyan-200">{article.title}</p>
                <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">{article.entities?.slice(0, 2).join(" • ") || "General news"}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AppShell>
    </>
  );
}
