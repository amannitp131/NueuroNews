"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/core/AuthProvider";
import { signupUser } from "../../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { login, ready, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState("");
  const [interests, setInterests] = useState("");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [ready, isAuthenticated, router]);

  async function handleSignup(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await signupUser({
        name,
        email,
        password,
        profession,
        interests: interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        goals: goals
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });
      login(data);
      router.replace("/onboarding");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mesh-overlay min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-md px-4 py-12 md:py-16">
        <form onSubmit={handleSignup} className="panel p-6 space-y-4">
          <div>
            <p className="eyebrow">New Account</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-100">Register</h1>
            <p className="mt-2 text-sm text-slate-300">Create your account and set your interests.</p>
          </div>

          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" placeholder="Name" required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" placeholder="Email" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" placeholder="Password" required minLength={6} />
          <input value={profession} onChange={(e) => setProfession(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" placeholder="Profession (optional)" />
          <input value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" placeholder="Interests (comma separated)" />
          <input value={goals} onChange={(e) => setGoals(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" placeholder="Goals (comma separated)" />

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button type="submit" disabled={loading} className="w-full rounded-full bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60">
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-sm text-slate-300">
            Already have an account? <Link href="/login" className="text-cyan-200 underline">Login</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
