"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function StoryTracker({ stories = [] }) {
  const first = stories[0];
  const trend = (first?.sentimentTrend || []).map((value, idx) => ({
    step: idx + 1,
    score: value
  }));

  return (
    <section className="card p-4 space-y-3">
      <h2 className="text-lg font-semibold">Story Arc Tracker</h2>
      {!first ? (
        <p className="text-sm text-slate-500">No story arcs available yet. Ingest articles to build timelines.</p>
      ) : (
        <>
          <div>
            <h3 className="font-semibold">{first.headline}</h3>
            <p className="text-xs text-slate-500 mt-1">Entities: {(first.entities || []).join(", ")}</p>
          </div>

          <div className="h-44 rounded-xl border p-2 bg-white">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0EA5A6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 max-h-52 overflow-auto pr-1">
            {(first.timeline || []).map((point, idx) => (
              <div key={`${point.articleId}-${idx}`} className="rounded-xl border p-2 text-sm">
                <p className="font-medium">{point.title}</p>
                <p className="text-xs text-slate-500">{new Date(point.publishedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
