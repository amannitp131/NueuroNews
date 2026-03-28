"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../components/core/AppShell";
import LoadingCard from "../../../components/core/LoadingCard";
import ChatPanel from "../../../components/news/ChatPanel";
import InsightPanel from "../../../components/news/InsightPanel";
import PredictionEngine from "../../../components/PredictionEngine";
import { useRequireAuth } from "../../../lib/authGuard";
import { fetchArticleById, generateNewsToAction, summarizeArticle } from "../../../lib/api";

export default function NewsDetailPage() {
  const { user, ready, isAuthenticated } = useRequireAuth();
  const params = useParams();
  const articleId = useMemo(() => params?.id, [params]);

  const [article, setArticle] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [actionPlan, setActionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!articleId || !ready || !isAuthenticated) return;

    (async () => {
      try {
        const data = await fetchArticleById(articleId);
        setArticle(data);
        // Auto-generate briefing on load for better UX
        setBriefingLoading(true);
        try {
          const brief = await summarizeArticle(articleId);
          setBriefing(brief);
        } catch (_) {
          // Silently fail, user can click Generate button
        } finally {
          setBriefingLoading(false);
        }

        setActionLoading(true);
        try {
          const action = await generateNewsToAction(articleId);
          setActionPlan(action);
        } catch (_) {
          // Silently fail, user can click refresh action plan
        } finally {
          setActionLoading(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [articleId, ready, isAuthenticated]);

  async function runBriefing() {
    if (!articleId || briefingLoading) return;

    setBriefingLoading(true);
    try {
      const data = await summarizeArticle(articleId);
      setBriefing(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBriefingLoading(false);
    }
  }

  async function runActionPlan(forceRefresh = true) {
    if (!articleId || actionLoading) return;

    setActionLoading(true);
    try {
      const data = await generateNewsToAction(articleId, forceRefresh);
      setActionPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  function urgencyClass(level) {
    if (level === "High") return "bg-rose-500/20 text-rose-200 border-rose-500/40";
    if (level === "Low") return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
    return "bg-amber-500/20 text-amber-200 border-amber-500/40";
  }

  if (!ready || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingCard label="Checking session" />
      </main>
    );
  }

  return (
    <AppShell
      title="Why This Matters"
      subtitle="AI-powered insights reveal what happens next, who's affected, and what you should know."
    >
      {error && <div className="panel p-4 text-sm text-rose-300">{error}</div>}

      {loading ? (
        <LoadingCard label="Loading article and analysis" />
      ) : article ? (
        <>
          {/* HERO SECTION */}
          <section className="panel p-6 mb-6 border-b border-white/10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                {article.source && <span className="text-slate-500">{article.source}</span>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-100 leading-tight">
                {article.title}
              </h1>
              {article.entities?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.entities.map((entity, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-medium text-cyan-200"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 3-COLUMN LAYOUT: AI CENTER + SIDEBAR */}
          <section className="grid gap-6 lg:grid-cols-3">
            {/* CENTER: AI BRIEFING (MAIN FOCUS) */}
            <div className="lg:col-span-2 space-y-4">
              {/* AI SUMMARY CARD - HERO */}
              <div className="panel p-6 border-2 border-cyan-300/30 bg-gradient-to-br from-cyan-300/5 to-transparent">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="eyebrow text-cyan-300">🤖 THE SIGNAL</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-100">What's happening</h2>
                  </div>
                  <button
                    onClick={runBriefing}
                    disabled={briefingLoading}
                    className="rounded-lg bg-cyan-300/20 text-cyan-200 px-3 py-1.5 text-xs font-semibold hover:bg-cyan-300/30 disabled:opacity-60 transition"
                  >
                    {briefingLoading ? "Analyzing..." : briefing ? "Refresh" : "Analyze"}
                  </button>
                </div>

                {briefing?.personalizedSummary ? (
                  <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-4 rounded-lg border border-white/10">
                    {briefing.personalizedSummary}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 p-4">
                    Click "Analyze" to generate what's happening and insights.
                  </div>
                )}
              </div>

              {/* WHY THIS MATTERS TO YOU */}
              {briefing?.whyThisMattersToYou?.length > 0 && (
                <div className="panel p-5 border border-amber-400/35 bg-amber-500/5">
                  <p className="eyebrow text-amber-200">🧠 WHY THIS MATTERS TO YOU</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-100">
                    {briefing.whyThisMattersToYou.slice(0, 5).map((point, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="mt-0.5 shrink-0 text-amber-300">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* INSIGHTS GRID */}
              {briefing && (
                <div className="grid gap-4 md:grid-cols-3">
                  {/* KEY INSIGHTS */}
                  <div className="panel p-4">
                    <p className="eyebrow text-amber-300">💡 KEY INSIGHTS</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {(briefing.keyInsights || []).slice(0, 3).map((insight, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-amber-300 shrink-0 mt-0.5">→</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* PREDICTIONS */}
                  <div className="panel p-4">
                    <p className="eyebrow text-green-300">🔮 WHAT HAPPENS NEXT</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-200">
                      {(briefing.predictions || []).slice(0, 3).map((pred, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-green-400 shrink-0 mt-0.5">▸</span>
                          <span>{pred}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* IMPACT */}
                  <div className="panel p-4">
                    <p className="eyebrow text-rose-300">📈 IMPACT ON YOU</p>
                    <div className="mt-3 space-y-2 text-xs text-slate-300">
                      {briefing.impactAnalysis && (
                        <>
                          <div>
                            <span className="text-rose-300 font-semibold">Now:</span>
                            <p className="text-slate-200">{briefing.impactAnalysis.shortTerm}</p>
                          </div>
                          <div className="pt-1 border-t border-white/10">
                            <span className="text-rose-300 font-semibold">Later:</span>
                            <p className="text-slate-200">{briefing.impactAnalysis.longTerm}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* NEWS-TO-ACTION ENGINE */}
              <div className="panel p-5 border border-cyan-300/30 bg-cyan-300/[0.05]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow text-cyan-200">⚡ NEWS-TO-ACTION ENGINE</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-100">What should you do next?</h2>
                  </div>

                  <button
                    onClick={() => runActionPlan(true)}
                    disabled={actionLoading}
                    className="rounded-lg bg-cyan-300/20 text-cyan-100 px-3 py-1.5 text-xs font-semibold hover:bg-cyan-300/30 disabled:opacity-60 transition"
                  >
                    {actionLoading ? "Building..." : actionPlan ? "Refresh Plan" : "Generate Plan"}
                  </button>
                </div>

                {!actionPlan && !actionLoading ? (
                  <p className="mt-3 text-sm text-slate-300">
                    Generate an action plan to see decision triggers, recommended steps, urgency, and follow-up signals.
                  </p>
                ) : null}

                {actionPlan ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="mono text-xs text-cyan-200">Decision Trigger</p>
                      <p className="mt-2 text-sm text-slate-100">{actionPlan.decisionTrigger}</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <p className="mono text-xs text-cyan-200">Urgency</p>
                        <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${urgencyClass(actionPlan.urgencyLevel)}`}>
                          {actionPlan.urgencyLevel}
                        </span>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <p className="mono text-xs text-cyan-200">Time Horizon</p>
                        <p className="mt-2 text-sm font-semibold text-slate-100">{actionPlan.timeHorizon}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="mono text-xs text-cyan-200">Recommended Actions</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-100">
                        {(actionPlan.recommendedActions || []).map((step, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="mt-0.5 shrink-0 text-cyan-300">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <p className="mono text-xs text-cyan-200">Follow-up Signals</p>
                      <ul className="mt-2 space-y-2 text-sm text-slate-100">
                        {(actionPlan.followUpSignals || []).map((signal, index) => (
                          <li key={index} className="flex gap-2">
                            <span className="mt-0.5 shrink-0 text-cyan-300">•</span>
                            <span>{signal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* ORIGINAL ARTICLE */}
              <div className="panel p-6">
                <p className="eyebrow">📄 FULL ARTICLE</p>
                <div className="mt-4 prose prose-invert max-w-none text-sm text-slate-300 whitespace-pre-wrap">
                  {article.content}
                </div>

                {article.sourceUrl && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition text-sm font-semibold"
                    >
                      Read Original Source →
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR: CHAT + PREDICTIONS + ACTIONS */}
            <div className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
              <ChatPanel />

              {/* PREDICTION ENGINE */}
              {articleId && <PredictionEngine articleId={articleId} />}

              {/* QUICK ACTIONS */}
              <div className="panel p-4 space-y-2">
                <p className="eyebrow">⚡ WHAT NEXT?</p>

                <Link
                  href="/story-arcs"
                  className="block rounded-lg border border-slate-500/30 bg-slate-500/10 p-3 text-sm font-medium text-slate-100 hover:border-slate-500/60 hover:bg-slate-500/20 transition text-center"
                >
                  Add to Story Arc
                </Link>

                <button
                  onClick={() => {
                    if (article?.sourceUrl) window.open(article.sourceUrl);
                  }}
                  className="w-full rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-3 text-sm font-medium text-cyan-100 hover:border-cyan-300/60 hover:bg-cyan-300/20 transition"
                >
                  Read the Full Article
                </button>

                <button
                  onClick={() => alert("Saved to your watchlist!")}
                  className="w-full rounded-lg border border-slate-500/30 bg-slate-500/10 p-3 text-sm font-medium text-slate-100 hover:border-slate-500/60 hover:bg-slate-500/20 transition"
                >
                  💾 Save for Later
                </button>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
