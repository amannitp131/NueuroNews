"use client";

import { useState } from "react";
import { generateDebateMode, submitDebateOpinion } from "../../lib/api";

const POSITIVE_KEYWORDS = [
  "growth",
  "upside",
  "opportunity",
  "expand",
  "improve",
  "strong",
  "benefit",
  "momentum",
  "demand",
  "innovation"
];

const NEGATIVE_KEYWORDS = [
  "risk",
  "downside",
  "pressure",
  "decline",
  "delay",
  "volatility",
  "uncertainty",
  "weak",
  "loss",
  "cost"
];

function renderHighlightedText(text, tone = "neutral") {
  const source = String(text || "");
  if (!source) return null;

  const keywords = tone === "positive" ? POSITIVE_KEYWORDS : tone === "negative" ? NEGATIVE_KEYWORDS : [];
  if (!keywords.length) return source;

  const pattern = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
  const parts = source.split(pattern);

  return parts.map((part, index) => {
    if (keywords.some((keyword) => keyword.toLowerCase() === part.toLowerCase())) {
      return (
        <span
          key={`hl-${index}`}
          className={
            tone === "positive"
              ? "font-semibold text-emerald-200"
              : "font-semibold text-rose-200"
          }
        >
          {part}
        </span>
      );
    }

    return <span key={`tx-${index}`}>{part}</span>;
  });
}

export default function DebateModePanel({ articleId }) {
  const [debate, setDebate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [activeCard, setActiveCard] = useState("optimistic");
  const [exchanges, setExchanges] = useState([]);
  const [userOpinionInput, setUserOpinionInput] = useState("");
  const [exchangeLoading, setExchangeLoading] = useState(false);

  async function runDebate(force = false) {
    if (!articleId || loading || (!enabled && !force)) return;

    setLoading(true);
    setError("");

    try {
      const data = await generateDebateMode(articleId);
      setDebate(data?.data || data);
    } catch (err) {
      setError(err.message || "Failed to generate debate mode");
    } finally {
      setLoading(false);
    }
  }

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);

    if (next && !debate) {
      runDebate(true);
    }
  }

  async function submitOpinion() {
    if (!userOpinionInput.trim() || !articleId) return;

    setExchangeLoading(true);
    setError("");

    try {
      const response = await submitDebateOpinion(articleId, userOpinionInput.trim());
      const { exchange, exchangeIndex } = response.data || response;

      setExchanges((prev) => [
        ...prev,
        {
          index: exchangeIndex,
          userOpinion: userOpinionInput.trim(),
          aiCounterArgument: exchange.aiCounterArgument,
          timestamp: new Date().toISOString()
        }
      ]);

      setUserOpinionInput("");
    } catch (err) {
      setError(err.message || "Failed to submit opinion");
    } finally {
      setExchangeLoading(false);
    }
  }

  return (
    <section className="panel relative overflow-hidden border border-fuchsia-300/30 bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-rose-500/10 p-6">
      <div className="pointer-events-none absolute -left-20 top-12 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-6 h-56 w-56 rounded-full bg-rose-400/20 blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow text-fuchsia-200">DEBATE MODE</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-100">⚖️ Two Sides of the Story</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              A critical-view engine that frames both upside and downside before you decide.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggle}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                enabled
                  ? "border-cyan-300/50 bg-cyan-300/20 text-cyan-100"
                  : "border-white/20 bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              {enabled ? "Debate Mode On" : "Enable Debate Mode"}
            </button>

            <button
              type="button"
              onClick={() => runDebate(true)}
              disabled={loading || !enabled}
              className="rounded-full border border-fuchsia-300/40 bg-fuchsia-300/15 px-4 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-300/25 disabled:opacity-50"
            >
              {loading ? "Thinking..." : debate ? "Refresh" : "Generate"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>
        ) : null}

        {loading ? (
          <div className="mt-5 animate-[fadeIn_400ms_ease-out] space-y-4">
            <div className="rounded-xl border border-cyan-300/25 bg-cyan-500/10 p-3 text-xs text-cyan-100">
              🧠 AI is building opposing cases from the same evidence...
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/5 p-4">
                <div className="h-4 w-40 animate-pulse rounded bg-white/20" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-11/12 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-10/12 animate-pulse rounded bg-white/10" />
                </div>
              </div>

              <div className="rounded-xl border border-rose-300/25 bg-rose-300/5 p-4">
                <div className="h-4 w-40 animate-pulse rounded bg-white/20" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-11/12 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-10/12 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {enabled && debate ? (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <article
                onMouseEnter={() => setActiveCard("optimistic")}
                onFocus={() => setActiveCard("optimistic")}
                className={`rounded-xl border bg-emerald-300/10 p-4 transition-all duration-300 ${
                  activeCard === "optimistic"
                    ? "border-emerald-300/70 shadow-[0_0_0_1px_rgba(52,211,153,0.4),0_12px_32px_rgba(16,185,129,0.25)]"
                    : "border-emerald-300/40 shadow-[0_10px_30px_rgba(16,185,129,0.15)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-100">🟢 Optimistic View</h3>
                </div>

                <p className="mt-3 text-base font-semibold leading-snug text-emerald-50">
                  {debate.optimistic?.title || "Upside Scenario"}
                </p>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Key Arguments</p>
                  <ul className="mt-2 space-y-2 text-sm text-emerald-50">
                    {(debate.optimistic?.points || []).map((item, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 rounded-lg px-2 py-1 transition-all duration-200 hover:bg-emerald-500/20 hover:translate-x-1"
                      >
                        <span className="mt-0.5 text-emerald-200">+</span>
                        <span>{renderHighlightedText(item, "positive")}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 rounded-lg border border-emerald-200/30 bg-emerald-500/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Positive Outcomes / Who Benefits</p>
                  <p className="mt-2 text-xs leading-relaxed text-emerald-50">
                    {renderHighlightedText(debate.optimistic?.beneficiaries || "N/A", "positive")}
                  </p>
                </div>
              </article>

              <article
                onMouseEnter={() => setActiveCard("pessimistic")}
                onFocus={() => setActiveCard("pessimistic")}
                className={`rounded-xl border bg-rose-300/10 p-4 transition-all duration-300 ${
                  activeCard === "pessimistic"
                    ? "border-rose-300/70 shadow-[0_0_0_1px_rgba(251,113,133,0.4),0_12px_32px_rgba(244,63,94,0.25)]"
                    : "border-rose-300/40 shadow-[0_10px_30px_rgba(244,63,94,0.15)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-rose-100">🔴 Pessimistic View</h3>
                </div>

                <p className="mt-3 text-base font-semibold leading-snug text-rose-50">
                  {debate.pessimistic?.title || "Downside Scenario"}
                </p>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-200">Key Arguments</p>
                  <ul className="mt-2 space-y-2 text-sm text-rose-50">
                    {(debate.pessimistic?.points || []).map((item, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 rounded-lg px-2 py-1 transition-all duration-200 hover:bg-rose-500/20 hover:translate-x-1"
                      >
                        <span className="mt-0.5 text-rose-200">-</span>
                        <span>{renderHighlightedText(item, "negative")}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 rounded-lg border border-rose-200/30 bg-rose-500/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-200">Risks and Downsides</p>
                  <p className="mt-2 text-xs leading-relaxed text-rose-50">
                    {renderHighlightedText(debate.pessimistic?.risks || "N/A", "negative")}
                  </p>
                </div>
              </article>
            </div>

            <div className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-4">
              <p className="text-xs uppercase tracking-wide text-cyan-200">🧠 Reality Check</p>
              <p className="mt-1 text-sm leading-relaxed text-cyan-50">{debate.realityCheck}</p>
            </div>

            {/* User Opinion Input Section */}
            <div className="mt-6 space-y-3 rounded-xl border border-fuchsia-300/30 bg-fuchsia-400/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200">💬 Your Opinion</p>
              <textarea
                value={userOpinionInput}
                onChange={(e) => setUserOpinionInput(e.target.value)}
                placeholder="Share your perspective on this news. The AI will generate a counter-argument..."
                className="w-full rounded-lg border border-fuchsia-300/30 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-fuchsia-300/60 focus:outline-none"
                rows={3}
              />
              <button
                type="button"
                onClick={submitOpinion}
                disabled={!userOpinionInput.trim() || exchangeLoading}
                className="rounded-lg border border-fuchsia-300/40 bg-fuchsia-300/15 px-4 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-300/25 disabled:opacity-50"
              >
                {exchangeLoading ? "AI Thinking..." : "Submit Opinion"}
              </button>
            </div>

            {/* Display Debate Exchanges */}
            {exchanges.length > 0 ? (
              <div className="mt-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-200">📊 Debate Exchange</p>
                {exchanges.map((exchange, idx) => (
                  <div key={idx} className="space-y-3 rounded-xl border border-fuchsia-200/20 bg-fuchsia-300/5 p-4">
                    {/* User Opinion */}
                    <div className="rounded-lg border border-blue-300/30 bg-blue-500/10 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">👤 Your Opinion #{exchange.index}</p>
                      <p className="mt-2 text-sm leading-relaxed text-blue-50">{exchange.userOpinion}</p>
                    </div>

                    {/* AI Counter-Argument */}
                    <div className="rounded-lg border border-amber-300/30 bg-amber-500/10 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">🤖 AI Counter-Argument</p>
                      <p className="mt-2 text-sm font-semibold leading-snug text-amber-50">{exchange.aiCounterArgument?.title}</p>

                      {exchange.aiCounterArgument?.counterPoints && exchange.aiCounterArgument.counterPoints.length > 0 ? (
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">Key Counter Points</p>
                          <ul className="mt-2 space-y-2 text-sm text-amber-50">
                            {exchange.aiCounterArgument.counterPoints.map((point, pidx) => (
                              <li key={pidx} className="flex gap-2 rounded-lg px-2 py-1 hover:bg-amber-500/20">
                                <span className="mt-0.5 text-amber-200">→</span>
                                <span>{renderHighlightedText(point, "negative")}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {exchange.aiCounterArgument?.concessions && exchange.aiCounterArgument.concessions.length > 0 ? (
                        <div className="mt-3 rounded-lg border border-amber-200/20 bg-amber-400/5 p-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">✓ Where You Have Merit</p>
                          <ul className="mt-2 space-y-1 text-xs text-amber-50">
                            {exchange.aiCounterArgument.concessions.map((concession, cidx) => (
                              <li key={cidx} className="flex gap-2">
                                <span className="text-amber-200">•</span>
                                <span>{concession}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}

        {!enabled ? (
          <div className="mt-4 rounded-lg border border-white/15 bg-white/[0.04] p-3 text-xs text-slate-300">
            Enable Debate Mode to compare both sides with a critical AI lens.
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
