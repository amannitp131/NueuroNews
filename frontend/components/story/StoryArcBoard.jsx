"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function StoryArcBoard({ arc }) {
  if (!arc) {
    return <div className="panel p-5 text-sm text-slate-400">No story arc selected.</div>;
  }

  const trend = (arc.sentimentTrend || []).map((value, idx) => ({
    step: idx + 1,
    score: value
  }));

  const entityPairs = Object.entries(arc.entityMentions || {}).sort((a, b) => b[1] - a[1]);
  const entities = entityPairs.length ? entityPairs : (arc.entities || []).map((name) => [name, 1]);

  // Calculate overall sentiment trend
  const avgSentiment = trend.length > 0 ? Math.round(trend.reduce((sum, t) => sum + t.score, 0) / trend.length) : 0;
  const trendDirection = avgSentiment > 1 ? "Positive" : avgSentiment < -1 ? "Negative" : "Mixed";
  const trendColor = avgSentiment > 1 ? "text-green-300" : avgSentiment < -1 ? "text-rose-300" : "text-slate-300";

  return (
    <section className="panel p-6 space-y-6">
      {/* HEADER */}
      <div className="border-b border-white/10 pb-4">
        <p className="eyebrow">📖 STORY TIMELINE</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-100">{arc.headline}</h2>
        <p className="mt-2 text-sm text-slate-300">{arc.evolutionSummary || "Track this narrative as it unfolds across time."}</p>

        {/* TREND SUMMARY */}
        <div className="mt-4 flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-400">Narrative Sentiment</p>
            <p className={`text-lg font-bold ${trendColor}`}>{trendDirection}</p>
          </div>
          <div className="flex-1">
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${avgSentiment > 1 ? "bg-green-500" : avgSentiment < -1 ? "bg-rose-500" : "bg-slate-500"}`}
                style={{
                  width: `${50 + (avgSentiment / 5) * 50}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SENTIMENT CHART */}
      <div>
        <p className="eyebrow text-sm">Sentiment Trend</p>
        <div className="mt-3 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <XAxis dataKey="step" stroke="#64748b" stroke-width={0.5} />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                cursor={{ stroke: "#14f1d9" }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#14f1d9" 
                strokeWidth={3}
                dot={{ fill: "#14f1d9", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* VERTICAL TIMELINE */}
      <div>
        <p className="eyebrow text-sm mb-4">Key Events</p>

        <div className="space-y-0">
          {(arc.timeline || []).map((item, index) => {
            const isLeft = index % 2 === 0;
            const sentiment = item.sentimentScore || 0;
            const sentimentIcon = sentiment > 1 ? "📈" : sentiment < -1 ? "📉" : "→";
            const sentimentColor = sentiment > 1 ? "border-green-500/30 bg-green-500/5" : sentiment < -1 ? "border-rose-500/30 bg-rose-500/5" : "border-slate-500/30 bg-slate-500/5";
            const badgeColor = sentiment > 1 ? "bg-green-500/20 text-green-300" : sentiment < -1 ? "bg-rose-500/20 text-rose-300" : "bg-slate-500/20 text-slate-300";

            return (
              <div key={`${item.articleId}-${index}`} className="relative">
                {/* TIMELINE DOT */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-3 rounded-full bg-cyan-300 border-2 border-slate-950 z-10" />

                {/* TIMELINE CONNECTOR */}
                {index < (arc.timeline || []).length - 1 && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-3 w-0.5 h-20 bg-gradient-to-b from-cyan-300 to-cyan-300/20" />
                )}

                {/* EVENT CARD */}
                <div className={`mt-4 pt-4 ${isLeft ? "mr-1/2 mr-4" : "ml-1/2 ml-4"} max-w-sm`}>
                  <div className={`rounded-lg border ${sentimentColor} p-4 hover:border-cyan-300/50 transition`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-100 line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                      <span className="text-lg shrink-0">{sentimentIcon}</span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">
                      {new Date(item.publishedAt).toLocaleDateString()} at {new Date(item.publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>

                    {item.summary && (
                      <p className="text-xs text-slate-300 line-clamp-3 mb-3">
                        {item.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeColor}`}>
                        Sentiment: {sentiment > 0 ? "+" : ""}{sentiment}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Event {index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {(!arc.timeline || arc.timeline.length === 0) && (
            <div className="text-center p-8 text-slate-400">
              <p className="text-sm">No events tracked yet.</p>
              <p className="text-xs mt-1">Add articles to this story arc to see the timeline.</p>
            </div>
          )}
        </div>
      </div>

      {/* KEY PLAYERS */}
      <div className="border-t border-white/10 pt-4">
        <p className="eyebrow text-sm mb-3">🎯 Key Players & Entities</p>
        <div className="flex flex-wrap gap-2">
          {entities.slice(0, 8).map(([entity, count]) => (
            <span
              key={entity}
              className="inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100 hover:border-cyan-300/60 transition"
            >
              <span>{entity}</span>
              <span className="text-cyan-300/70 font-semibold">×{count}</span>
            </span>
          ))}
          {entities.length > 8 && (
            <span className="text-xs text-slate-400 px-2 py-1">
              +{entities.length - 8} more
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
