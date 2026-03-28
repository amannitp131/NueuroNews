"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../../components/core/AppShell";
import LoadingCard from "../../../components/core/LoadingCard";
import StoryArcBuilder from "../../../components/story/StoryArcBuilder";
import { useRequireAuth } from "../../../lib/authGuard";

export default function StoryArcBuilderPage() {
  const { ready, isAuthenticated } = useRequireAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      setLoading(false);
    }
  }, [ready]);

  if (!ready || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingCard label="Checking session" />
      </main>
    );
  }

  return (
    <AppShell
      title="New Story Arc"
      subtitle="Connect multiple related articles to track how a narrative evolves over time."
    >
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* MAIN BUILDER */}
          <div className="lg:col-span-3">
            <StoryArcBuilder />
          </div>

          {/* SIDEBAR GUIDE */}
          <div className="space-y-4">
            {/* TIPS */}
            <div className="panel p-4 space-y-3">
              <p className="eyebrow text-sm">💡 TIPS</p>

              <div className="space-y-2 text-xs text-slate-300">
                <div>
                  <p className="font-semibold text-slate-200">1. Choose a Headline</p>
                  <p className="text-slate-400 mt-0.5">
                    Describe the big story connecting all articles.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="font-semibold text-slate-200">2. Add Articles in Order</p>
                  <p className="text-slate-400 mt-0.5">
                    Add them chronologically for best timeline visualization.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="font-semibold text-slate-200">3. Include Key Context</p>
                  <p className="text-slate-400 mt-0.5">
                    Write summaries that highlight how each article advances the narrative.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="font-semibold text-slate-200">4. Set Accurate Dates</p>
                  <p className="text-slate-400 mt-0.5">
                    Dates matter — they determine the timeline order.
                  </p>
                </div>
              </div>
            </div>

            {/* EXAMPLES */}
            <div className="panel p-4 space-y-2">
              <p className="eyebrow text-sm">📚 EXAMPLES</p>
              <div className="text-xs text-slate-400 space-y-2">
                <p>• "AI Regulation Debate 2026"</p>
                <p>• "Economic Times IPO Journey"</p>
                <p>• "Elon's Mars Mission Timeline"</p>
                <p>• "Crypto Recovery Arc"</p>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="panel p-4 space-y-2">
              <p className="eyebrow text-sm">🔗 QUICK LINKS</p>
              <Link
                href="/story-arcs"
                className="block text-xs text-cyan-300 hover:text-cyan-200 font-semibold transition"
              >
                ← Back to Story Arcs
              </Link>
              <Link
                href="/news"
                className="block text-xs text-cyan-300 hover:text-cyan-200 font-semibold transition"
              >
                Browse Articles →
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
