"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/core/AppShell";
import LoadingCard from "../../components/core/LoadingCard";
import StoryArcBoard from "../../components/story/StoryArcBoard";
import StoryArcInput from "../../components/story/StoryArcInput";
import { useRequireAuth } from "../../lib/authGuard";
import { fetchStories } from "../../lib/api";

export default function StoryArcPage() {
  const { ready, isAuthenticated } = useRequireAuth();
  const [stories, setStories] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !isAuthenticated) return;

    (async () => {
      try {
        const data = await fetchStories();
        setStories(data || []);
        setSelectedId(data?.[0]?._id || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, isAuthenticated]);

  if (!ready || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingCard label="Checking session" />
      </main>
    );
  }

  const active = stories.find((s) => s._id === selectedId) || stories[0] || null;

  function handleTracked(data) {
    const normalized = {
      _id: data.arcId,
      headline: data.headline,
      entities: data.entities,
      entityMentions: data.entityMentions,
      sentimentTrend: data.sentimentTrend,
      evolutionSummary: data.evolutionSummary,
      timeline: data.timeline
    };

    setStories((prev) => [normalized, ...prev.filter((item) => item._id !== normalized._id)]);
    setSelectedId(normalized._id);
  }

  return (
    <AppShell
      title="Story Arcs"
      subtitle="Watch how narratives unfold — key players, turning points, and where it's heading."
    >
      {loading ? <LoadingCard label="Loading Story Arcs" /> : null}
      {error ? <div className="panel p-4 text-sm text-rose-300">{error}</div> : null}

      {!loading ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <StoryArcInput onTracked={handleTracked} />
            <Link
              href="/story-arcs/builder"
              className="panel p-5 border border-dashed border-cyan-300/30 hover:border-cyan-300/60 hover:bg-cyan-300/5 transition flex flex-col items-center justify-center text-center"
            >
              <p className="text-2xl mb-2">🏗️</p>
              <p className="font-semibold text-slate-100">Build New Arc</p>
              <p className="text-xs text-slate-400 mt-1">
                Manually connect multiple articles to create a story arc
              </p>
            </Link>
          </div>

          <div className="panel p-4">
            <p className="eyebrow">Arc Selector</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {stories.map((story) => (
                <button
                  key={story._id}
                  onClick={() => setSelectedId(story._id)}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    selectedId === story._id ? "bg-cyan-300 text-slate-950 font-semibold" : "bg-white/5 border border-white/10 text-slate-200"
                  }`}
                >
                  {story.headline.slice(0, 48)}
                </button>
              ))}
            </div>
          </div>

          <StoryArcBoard arc={active} />
        </>
      ) : null}
    </AppShell>
  );
}
