"use client";

import { useState, useEffect } from "react";
import { predictArticle } from "../lib/api";

export default function PredictionEngine({ articleId }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runPrediction = async () => {
    if (!articleId) return;

    setLoading(true);
    setError("");
    try {
      const data = await predictArticle(articleId);
      setPrediction(data?.data || data);
    } catch (err) {
      setError(err.message || "Failed to generate prediction");
    } finally {
      setLoading(false);
    }
  };

  if (!prediction && !loading) {
    return (
      <div className="panel p-4">
        <p className="eyebrow">🔮 WHAT HAPPENS NEXT</p>
        <p className="mt-2 text-sm text-slate-400">Generate AI-powered outcome scenarios.</p>
        <button
          onClick={runPrediction}
          className="mt-3 rounded-lg bg-cyan-300/20 text-cyan-200 px-3 py-1.5 text-xs font-semibold hover:bg-cyan-300/30 transition"
        >
          Generate what happens next
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel p-4">
        <p className="eyebrow">🔮 WHAT HAPPENS NEXT</p>
        <p className="mt-3 text-sm text-slate-400">Analyzing market patterns and historical signals...</p>
        <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-300 animate-pulse w-1/3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel p-4 border border-rose-500/30 bg-rose-500/5">
        <p className="eyebrow text-rose-300">⚠️ WHAT HAPPENS NEXT ERROR</p>
        <p className="mt-2 text-sm text-rose-200">{error}</p>
        <button
          onClick={runPrediction}
          className="mt-3 text-xs font-semibold text-rose-300 hover:text-rose-200 transition"
        >
          Try Again →
        </button>
      </div>
    );
  }

  const ruleSignals = prediction.ruleSignals || {};
  const outcomes = prediction.possibleFutureOutcomes || [];

  // Calculate aggregate probability
  const avgProbability =
    outcomes.length > 0
      ? Math.round(
          (outcomes.reduce((sum, o) => sum + (o.probability || 0), 0) / outcomes.length) * 100
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* SIGNAL SUMMARY */}
      <div className="panel p-4">
        <p className="eyebrow text-cyan-300">📊 SIGNAL ANALYSIS</p>

        <div className="mt-3 grid gap-3">
          {/* Sentiment Momentum */}
          <div className="rounded-lg bg-white/[0.02] p-3 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Sentiment Momentum</span>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  ruleSignals.momentum === "positive"
                    ? "bg-green-500/20 text-green-300"
                    : ruleSignals.momentum === "negative"
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-slate-500/20 text-slate-300"
                }`}
              >
                {ruleSignals.momentum?.toUpperCase() || "NEUTRAL"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  ruleSignals.sentimentScore > 0 ? "bg-green-500" : ruleSignals.sentimentScore < 0 ? "bg-rose-500" : "bg-slate-500"
                }`}
                style={{ width: `${Math.abs((ruleSignals.sentimentScore || 0) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Risk Flags */}
          {ruleSignals.riskFlags?.length > 0 && (
            <div className="rounded-lg bg-amber-500/10 p-3 border border-amber-500/30">
              <p className="text-xs text-amber-200 font-semibold mb-2">⚠️ Risk Flags Detected</p>
              <div className="flex flex-wrap gap-1">
                {ruleSignals.riskFlags.map((flag, idx) => (
                  <span key={idx} className="text-xs bg-amber-500/30 text-amber-100 px-2 py-1 rounded-full">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Entities */}
          {ruleSignals.entities?.length > 0 && (
            <div className="rounded-lg bg-white/[0.02] p-3 border border-white/10">
              <p className="text-xs text-slate-400 mb-2">Key Entities ({ruleSignals.entityCount})</p>
              <div className="flex flex-wrap gap-1">
                {ruleSignals.entities.slice(0, 5).map((entity, idx) => (
                  <span key={idx} className="text-xs bg-slate-600/40 text-slate-300 px-2 py-1 rounded-full">
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POSSIBLE OUTCOMES */}
      {outcomes.length > 0 && (
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="eyebrow text-green-300">🎯 POSSIBLE OUTCOMES</p>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full font-semibold">
              {Math.max(...outcomes.map(o => o.probability || 0)) >= 0.5 ? "High Confidence" : "Exploratory"}
            </span>
          </div>

          <div className="space-y-3">
            {outcomes.map((outcome, idx) => {
              const probability = Math.round((outcome.probability || 0) * 100);
              const probabilityColor =
                probability >= 70
                  ? "bg-green-500 text-green-100"
                  : probability >= 40
                  ? "bg-amber-500 text-amber-100"
                  : "bg-slate-500 text-slate-100";

              return (
                <div key={idx} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-100">{outcome.scenario}</p>
                      <p className="text-xs text-slate-400 mt-1">{outcome.timeHorizon}</p>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded ${probabilityColor}`}>
                      {probability}%
                    </div>
                  </div>

                  {/* Probability Progress Bar */}
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        probability >= 70
                          ? "bg-green-500"
                          : probability >= 40
                          ? "bg-amber-500"
                          : "bg-slate-600"
                      }`}
                      style={{ width: `${probability}%` }}
                    />
                  </div>

                  {/* Market Impact */}
                  {outcome.impactDirection && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-400">Market Impact:</span>
                      <span
                        className={`text-xs font-semibold ${
                          outcome.impactDirection === "up"
                            ? "text-green-300"
                            : outcome.impactDirection === "down"
                            ? "text-rose-300"
                            : "text-slate-300"
                        }`}
                      >
                        {outcome.impactDirection === "up"
                          ? "↑ Bullish"
                          : outcome.impactDirection === "down"
                          ? "↓ Bearish"
                          : "→ Neutral"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Confidence Summary */}
          <div
            className="mt-4 rounded-lg border border-cyan-300/30 bg-cyan-300/5 p-3"
          >
            <p className="text-xs text-cyan-200 mb-1">Overall Confidence Score</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                  style={{ width: `${avgProbability}%` }}
                />
              </div>
              <span className="text-sm font-bold text-cyan-300">{avgProbability}%</span>
            </div>
            <p className="text-[11px] text-cyan-300/70 mt-2">
              {avgProbability >= 60
                ? "✓ What happens next is based on strong historical patterns"
                : "⊙ Consider exploratory scenarios cautiously"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
