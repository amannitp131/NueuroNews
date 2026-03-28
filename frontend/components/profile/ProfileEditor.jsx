"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../core/AuthProvider";
import { saveProfile } from "../../lib/api";

export default function ProfileEditor({ user }) {
  const { login, token } = useAuth();
  const [form, setForm] = useState({
    email: user?.email || "",
    name: user?.name || "",
    profession: user?.profession || "",
    interests: (user?.interests || []).join(","),
    goals: (user?.goals || []).join(",")
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      email: user?.email || "",
      name: user?.name || "",
      profession: user?.profession || "",
      interests: (user?.interests || []).join(","),
      goals: (user?.goals || []).join(",")
    });
  }, [user]);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const interests = form.interests.split(",").map((v) => v.trim()).filter(Boolean);
      const goals = form.goals.split(",").map((v) => v.trim()).filter(Boolean);

      if (!form.name.trim() || !form.profession.trim() || interests.length === 0) {
        setError("Name, profession and at least one interest are required.");
        setLoading(false);
        return;
      }

      await saveProfile({
        name: form.name.trim(),
        profession: form.profession.trim(),
        interests,
        goals
      });

      login({
        token,
        user: {
          ...user,
          email: form.email,
          name: form.name.trim(),
          profession: form.profession.trim(),
          interests,
          goals
        }
      });
      setMessage("Profile saved. Your intelligence and briefing will now personalize to this strategy.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="panel p-6">
        <p className="eyebrow">Identity</p>
        <h2 className="mt-1 text-xl font-semibold">Profile Settings</h2>
        <p className="mt-2 text-sm text-slate-300">
          Keep your profile up to date so recommendations and insights stay relevant.
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          Signed in as <span className="font-medium text-slate-100">{form.email || "-"}</span>
        </div>
      </div>

      <div className="panel grid gap-3 p-6 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-cyan-200">Name</span>
          <input
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wider text-cyan-200">Profession</span>
          <input
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
            placeholder="Example: Equity Analyst"
            value={form.profession}
            onChange={(e) => setForm((s) => ({ ...s, profession: e.target.value }))}
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-xs uppercase tracking-wider text-cyan-200">Interests</span>
          <input
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
            placeholder="AI, macro, banking"
            value={form.interests}
            onChange={(e) => setForm((s) => ({ ...s, interests: e.target.value }))}
          />
          <p className="text-xs text-slate-400">Use commas to separate interests.</p>
        </label>

        <label className="space-y-1 md:col-span-2">
          <span className="text-xs uppercase tracking-wider text-cyan-200">Goals</span>
          <textarea
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
            rows={3}
            placeholder="Track turnaround sectors, monitor policy-driven moves"
            value={form.goals}
            onChange={(e) => setForm((s) => ({ ...s, goals: e.target.value }))}
          />
        </label>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="text-sm text-cyan-200">{message}</p> : null}

      <button disabled={loading} className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60">
        {loading ? "Saving" : "Save Profile"}
      </button>
    </form>
  );
}
