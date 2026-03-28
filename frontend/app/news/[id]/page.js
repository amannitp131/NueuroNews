"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../components/core/AppShell";
import LoadingCard from "../../../components/core/LoadingCard";
import ChatPanel from "../../../components/news/ChatPanel";
import DebateModePanel from "../../../components/news/DebateModePanel";
import InsightPanel from "../../../components/news/InsightPanel";
import PredictionEngine from "../../../components/PredictionEngine";
import { useRequireAuth } from "../../../lib/authGuard";
import { fetchArticleById, generateNewsToAction, summarizeArticle, enhanceHeadline } from "../../../lib/api";
import { cleanArticleContent } from "../../../lib/cleanContent";

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
  const [actionAnimated, setActionAnimated] = useState(false);
  const [error, setError] = useState("");
  const [catchyTitle, setCatchyTitle] = useState("");

  useEffect(() => {
    if (!articleId || !ready || !isAuthenticated) return;

    (async () => {
      try {
        const data = await fetchArticleById(articleId);
        setArticle(data);

        // Enhance headline with AI
        try {
          const headlineResult = await enhanceHeadline(data.title);
          setCatchyTitle(headlineResult.enhanced);
        } catch (_) {
          setCatchyTitle(data.title);
        }

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

  function getActionIcon(index) {
    const icons = ["🎯", "📋", "🔄", "📈", "💡"];
    return icons[index % icons.length];
  }

  function highlightKeywords(text) {
    // Highlight key business/decision terms
    const keywords = [
      "immediately",
      "urgent",
      "critical",
      "monitor",
      "watch",
      "expect",
      "likely",
      "consider",
      "review",
      "assess",
      "confirm",
      "track",
      "position",
      "adjust",
    ];
    let highlighted = text;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
      highlighted = highlighted.replace(
        regex,
        '<span class="font-semibold text-cyan-200">$1</span>'
      );
    });
    return highlighted;
  }

  useEffect(() => {
    if (!actionPlan) return;
    setActionAnimated(false);
    const timer = setTimeout(() => setActionAnimated(true), 20);
    return () => clearTimeout(timer);
  }, [actionPlan]);

  if (!ready || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingCard label="Checking session" />
      </main>
    );
  }

  return (
    <AppShell
      title={catchyTitle || "News"}
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
              <div className="panel p-6 border-2 border-cyan-300/50 bg-gradient-to-br from-cyan-400/10 via-cyan-300/[0.06] to-transparent shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_18px_40px_rgba(8,47,73,0.45)]">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="eyebrow text-cyan-100">💎 WHAT SHOULD YOU DO NEXT?</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-100">
                      Your <span className="text-cyan-300">Action Plan</span>
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Personalized decision framework based on your profile
                    </p>
                  </div>

                  <button
                    onClick={() => runActionPlan(true)}
                    disabled={actionLoading}
                    className="rounded-lg bg-cyan-300/20 text-cyan-100 px-3 py-1.5 text-xs font-semibold hover:bg-cyan-300/35 hover:shadow-lg disabled:opacity-60 transition-all duration-200"
                  >
                    {actionLoading ? "Generating..." : actionPlan ? "Regenerate" : "Generate"}
                  </button>
                </div>

                {!actionPlan && !actionLoading ? (
                  <div className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
                    <p className="text-sm text-slate-300">
                      <span className="text-cyan-200 font-semibold">📊 Your advisor ready.</span> Generate
                      a personalized action plan to see decision triggers, specific steps, urgency level, and
                      signals to watch.
                    </p>
                  </div>
                ) : null}

                {actionLoading ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 md:col-span-2 animate-pulse">
                      <div className="h-4 w-32 rounded bg-white/20" />
                      <div className="mt-3 space-y-2">
                        <div className="h-3 w-full rounded bg-white/10" />
                        <div className="h-3 w-11/12 rounded bg-white/10" />
                      </div>
                    </div>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 animate-pulse">
                        <div className="h-4 w-24 rounded bg-white/20" />
                        <div className="mt-3 h-3 w-20 rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : null}

                {actionPlan && !actionLoading ? (
                  <div className={`mt-5 space-y-4 transition-all duration-500 ease-out ${
                    actionAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}>
                    {/* DECISION TRIGGER - Full Width */}
                    <div className="group relative rounded-xl border border-cyan-300/40 bg-gradient-to-r from-cyan-500/10 to-cyan-400/5 p-5 hover:border-cyan-300/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 cursor-default">
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-500/5 to-transparent transition-opacity duration-300" />
                      <div className="relative">
                        <p className="mono text-xs text-cyan-200 font-semibold uppercase tracking-wide">⚡ Decision Trigger</p>
                        <p className="mt-3 text-sm leading-relaxed text-slate-100">
                          <span
                            dangerouslySetInnerHTML={{
                              __html: highlightKeywords(actionPlan.trigger || actionPlan.decisionTrigger),
                            }}
                          />
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS GRID */}
                    <div>
                      <p className="text-xs font-semibold text-cyan-100 uppercase tracking-wide mb-3">
                        → Recommended Next Steps
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {(actionPlan.actions || actionPlan.recommendedActions || []).map((step, index) => (
                          <div
                            key={index}
                            style={{
                              animation: actionAnimated
                                ? `fadeInUp 0.5s ease-out ${100 + index * 80}ms both`
                                : "none",
                            }}
                            className="group relative rounded-lg border border-white/15 bg-white/[0.05] p-4 hover:border-cyan-300/50 hover:bg-cyan-300/[0.08] hover:shadow-md hover:shadow-cyan-500/15 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                          >
                            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-gradient-to-br from-cyan-500/5 to-transparent transition-opacity duration-300" />
                            <div className="relative">
                              <div className="flex items-start gap-3">
                                <span className="text-lg flex-shrink-0 mt-0.5">{getActionIcon(index)}</span>
                                <p className="text-sm text-slate-100 leading-relaxed">
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: highlightKeywords(step),
                                    }}
                                  />
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FOLLOW-UP SIGNALS */}
                    <div>
                      <p className="text-xs font-semibold text-cyan-100 uppercase tracking-wide mb-3">
                        🔔 Signals to Watch
                      </p>
                      <div className="grid gap-2">
                        {(actionPlan.signals || actionPlan.followUpSignals || []).map((signal, index) => (
                          <div
                            key={index}
                            style={{
                              animation: actionAnimated
                                ? `slideInLeft 0.5s ease-out ${200 + index * 60}ms both`
                                : "none",
                            }}
                            className="group relative flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:border-amber-300/40 hover:bg-amber-300/[0.08] transition-all duration-300 cursor-pointer hover:translate-x-1"
                          >
                            <span className="text-amber-300 flex-shrink-0 mt-1">◆</span>
                            <p className="text-xs text-slate-100 leading-relaxed">
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: highlightKeywords(signal),
                                }}
                              />
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* METRICS GRID */}
                    <div className="grid gap-3 md:grid-cols-2 pt-2">
                      {/* URGENCY */}
                      <div
                        style={{
                          animation: actionAnimated ? `fadeInUp 0.5s ease-out 350ms both` : "none",
                        }}
                        className="group rounded-lg border border-white/10 bg-white/[0.03] p-4 hover:shadow-md transition-all duration-300"
                      >
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
                          📊 Urgency Level
                        </p>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300 ${urgencyClass(
                            actionPlan.urgency || actionPlan.urgencyLevel
                          )} group-hover:scale-105 group-hover:shadow-lg`}
                        >
                          {actionPlan.urgency === "High" || actionPlan.urgencyLevel === "High"
                            ? "🔴 Act Now"
                            : actionPlan.urgency === "Low" || actionPlan.urgencyLevel === "Low"
                            ? "🟢 Can Wait"
                            : "🟡 Soon"}
                        </span>
                      </div>

                      {/* TIME HORIZON */}
                      <div
                        style={{
                          animation: actionAnimated ? `fadeInUp 0.5s ease-out 430ms both` : "none",
                        }}
                        className="group rounded-lg border border-white/10 bg-white/[0.03] p-4 hover:shadow-md transition-all duration-300"
                      >
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
                          ⏱️ Time Horizon
                        </p>
                        <span className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition-all duration-300 group-hover:border-cyan-300/70 group-hover:bg-cyan-300/25 group-hover:shadow-lg group-hover:shadow-cyan-500/20">
                          {actionPlan.timeHorizon}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Add keyframe animations */}
                <style>{`
                  @keyframes fadeInUp {
                    from {
                      opacity: 0;
                      transform: translateY(12px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                  
                  @keyframes slideInLeft {
                    from {
                      opacity: 0;
                      transform: translateX(-12px);
                    }
                    to {
                      opacity: 1;
                      transform: translateX(0);
                    }
                  }
                `}</style>
              </div>

              {articleId ? <DebateModePanel articleId={articleId} /> : null}

              <ChatPanel />

              {/* ORIGINAL ARTICLE */}
              <div className="panel p-6">
                <p className="eyebrow">📄 FULL ARTICLE</p>
                <div className="mt-4 space-y-4">
                  {article.content ? (
                    <div className="space-y-4">
                      {cleanArticleContent(article.content)
                        .split("\n\n")
                        .map((paragraph, index) => (
                          <p
                            key={index}
                            className="text-sm text-slate-200 leading-relaxed max-w-4xl"
                          >
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No article content available.</p>
                  )}
                </div>

                {article.sourceUrl && (
                  <div className="mt-6 pt-4 border-t border-white/10">
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
