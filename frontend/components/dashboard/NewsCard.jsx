import Link from "next/link";

export default function NewsCard({ article }) {
  return (
    <article className="panel p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
      <p className="eyebrow">Personalized Signal</p>
      <h3 className="mt-2 text-base font-semibold text-slate-100 line-clamp-2">{article.title}</h3>
      <p className="mt-2 text-sm text-slate-300 line-clamp-3">{article.content}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        <span className="mono">Sentiment {article.sentimentScore}</span>
      </div>
      <Link
        href={`/news/${article._id}`}
        className="mt-4 inline-flex items-center rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-300/20"
      >
        Open Detail
      </Link>
    </article>
  );
}
