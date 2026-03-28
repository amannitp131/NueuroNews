"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/core/AuthProvider";
import { loginUser } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [ready, isAuthenticated, router]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser({ email, password });
      login(data);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mesh-overlay min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-md px-4 py-12 md:py-16">
        <form onSubmit={handleLogin} className="panel p-6 space-y-4">
          <div>
            <p className="eyebrow">Welcome Back</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-100">Sign In</h1>
            <p className="mt-2 text-sm text-slate-300">Access your dashboard and your intelligence.</p>
          </div>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
            placeholder="Email"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
            placeholder="Password"
          />

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-slate-300">
            New user? <Link href="/signup" className="text-cyan-200 underline">Create account</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
