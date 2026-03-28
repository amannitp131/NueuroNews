export default function LoadingCard({ label = "Loading intelligence" }) {
  return (
    <div className="panel p-4 animate-pulse">
      <p className="eyebrow">{label}</p>
      <div className="mt-3 h-5 w-2/3 rounded bg-white/10" />
      <div className="mt-2 h-4 w-full rounded bg-white/10" />
      <div className="mt-2 h-4 w-5/6 rounded bg-white/10" />
    </div>
  );
}
