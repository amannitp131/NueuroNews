export default function WorldToday({ articles = [] }) {
  const top = articles.slice(0, 4);

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Your World Today</p>
          <h2 className="mt-1 text-lg font-semibold">Macro Pulse and Opportunity Radar</h2>
        </div>
        <span className="mono rounded-lg border border-white/15 px-2 py-1 text-[11px] text-slate-300">Live View</span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {top.map((item) => (
          <div key={item._id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-sm font-medium text-slate-200 line-clamp-2">{item.title}</p>
            <p className="mt-2 text-xs text-slate-400 line-clamp-2">{item.entities?.join(", ") || "General market"}</p>
          </div>
        ))}
        {top.length === 0 ? <p className="text-sm text-slate-400">Save your profile to generate your world snapshot.</p> : null}
      </div>
    </section>
  );
}
