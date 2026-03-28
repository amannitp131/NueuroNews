"use client";

import { useEffect, useState } from "react";

export default function WowMoment({ userInterests = [], articles = [] }) {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Trigger animation after a slight delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (dismissed || !userInterests?.length || !articles?.length) {
    return null;
  }

  // Generate a random wow moment based on user interests and articles
  const relevantArticles = articles.filter(a => 
    userInterests.some(interest => 
      (a.title?.toLowerCase().includes(interest.toLowerCase()) ||
       a.content?.toLowerCase().includes(interest.toLowerCase()))
    )
  ).slice(0, 3);

  if (!relevantArticles.length) {
    return null;
  }

  const count = relevantArticles.length;
  const topInterest = userInterests[0] || "trending";
  const wowMessages = [
    `🚀 Based on your interest in ${topInterest.toLowerCase()}, ${count} major stories broke overnight.`,
    `⚡ Your watchlist just got interesting — ${count} developments in ${topInterest.toLowerCase()} that matter.`,
    `📈 ${topInterest} just hit the news cycle hard. ${count} stories you should see.`,
    `🎯 Signal found: ${count} ${topInterest.toLowerCase()} stories that align with your goals.`
  ];

  const message = wowMessages[Math.floor(Math.random() * wowMessages.length)];

  return (
    <div
      className={`fixed top-20 right-4 max-w-sm transform transition-all duration-500 ease-out ${
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      }`}
      style={{
        zIndex: 50,
        animation: isVisible ? "slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none"
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(20, 241, 217, 0.3); }
          50% { box-shadow: 0 0 30px rgba(20, 241, 217, 0.6); }
        }
      `}</style>

      <div
        className="panel p-4 border-2 border-cyan-300/50 bg-gradient-to-br from-cyan-300/10 via-slate-900 to-slate-950 overflow-hidden"
        style={{
          animation: "pulse-glow 3s ease-in-out"
        }}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-300 to-transparent" />
        
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-100">{message}</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-slate-300 text-lg shrink-0"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1">
            {relevantArticles.slice(0, 2).map((article, idx) => (
              <a
                key={idx}
                href={`/news/${article._id}`}
                className="text-xs text-cyan-300 hover:text-cyan-200 transition line-clamp-1 hover:underline"
              >
                → {article.title}
              </a>
            ))}
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="w-full text-xs text-cyan-300 hover:text-cyan-200 font-semibold transition mt-2 py-1"
          >
            Got it! ✨
          </button>
        </div>
      </div>
    </div>
  );
}
