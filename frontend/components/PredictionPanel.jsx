"use client";

export default function PredictionPanel({ articles = [] }) {
  const momentum = articles.slice(0, 5).map((item) => item.sentimentScore || 0);
  const score = momentum.reduce((a, b) => a + b, 0);

  const call = score >= 2 ? "Bullish bias" : score <= -2 ? "Defensive bias" : "Neutral / range-bound";

  return (
    <section className="card p-4 space-y-2">
      <h2 className="text-lg font-semibold">What happens next engine (optional)</h2>
      <p className="text-sm text-slate-600">
        Lightweight signal from recent sentiment trend. Replace with a formal ML forecasting pipeline in production.
      </p>
      <div className="rounded-xl border p-3 bg-slate-50">
        <p className="text-xs text-slate-500">Aggregate Signal</p>
        <p className="text-xl font-bold text-ink">{call}</p>
      </div>
    </section>
  );
}
