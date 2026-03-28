"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/core/AuthProvider";
export default function HomePage() {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [ready, isAuthenticated, router]);

  return (
    <main className="mesh-overlay min-h-[calc(100vh-4rem)]">
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3 md:py-16">
        <div className="panel col-span-2 p-8 md:p-10">
          <p className="eyebrow">Business Intelligence Platform</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-100 md:text-6xl">
            Modern News Workspace
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
            Stay on top of market narratives with your intelligence, structured story arcs, and AI briefings in one organized workspace.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950">
              Create Account
            </Link>
            <Link href="/login" className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm text-slate-100">
              Sign In
            </Link>
          </div>
        </div>

        <div className="panel p-6">
          <p className="eyebrow">Why NeuroNews</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>Your intelligence on business news</li>
            <li>Track evolving story arcs</li>
            <li>Ask your analyst and see what's happening</li>
            <li>Clear dashboard-first workflow</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
