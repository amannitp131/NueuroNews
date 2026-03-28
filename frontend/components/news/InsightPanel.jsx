export default function InsightPanel({ briefing }) {
  const hasData = Boolean(briefing?.personalizedSummary);

  return (
    <section className="panel p-5 space-y-4">
      <div>
        <p className="eyebrow">AI Deep Briefing</p>
        <h2 className="mt-1 text-lg font-semibold">What's happening and impact</h2>
      </div>

      {!hasData ? (
        <p className="text-sm text-slate-400">Generate what's happening to view insights and impact analysis.</p>
      ) : (
        <>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200 whitespace-pre-wrap">
            {briefing.personalizedSummary}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mono text-xs text-cyan-200">Key Insights</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {(briefing.keyInsights || []).map((insight, i) => (
                  <li key={i}>• {insight}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mono text-xs text-cyan-200">What happens next</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {(briefing.predictions || []).map((prediction, i) => (
                  <li key={i}>• {prediction}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200">
            <p className="mono text-xs text-cyan-200">Impact Analysis</p>
            <p className="mt-2"><span className="text-slate-400">Short-term:</span> {briefing.impactAnalysis?.shortTerm}</p>
            <p className="mt-2"><span className="text-slate-400">Mid-term:</span> {briefing.impactAnalysis?.midTerm}</p>
            <p className="mt-2"><span className="text-slate-400">Long-term:</span> {briefing.impactAnalysis?.longTerm}</p>
          </div>
        </>
      )}
    </section>
  );
}
