"use client";

import { useState } from "react";
import { saveProfile } from "../lib/api";

const initial = {
  email: "analyst@neuronews.ai",
  name: "Aarav Mehta",
  profession: "Equity Research Analyst",
  interests: "AI,EVs,macro",
  goals: "find emerging winners,detect policy-driven opportunities"
};

export default function ProfileForm({ onSaved }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const profile = await saveProfile({
        ...form,
        interests: form.interests.split(",").map((x) => x.trim()).filter(Boolean),
        goals: form.goals.split(",").map((x) => x.trim()).filter(Boolean)
      });

      onSaved(profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card p-4 space-y-3" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-ink">Investor Profile</h2>
      <input className="w-full rounded-xl border p-2" placeholder="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
      <input className="w-full rounded-xl border p-2" placeholder="Name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
      <input className="w-full rounded-xl border p-2" placeholder="Profession" value={form.profession} onChange={(e) => setForm((s) => ({ ...s, profession: e.target.value }))} />
      <input className="w-full rounded-xl border p-2" placeholder="Interests (comma-separated)" value={form.interests} onChange={(e) => setForm((s) => ({ ...s, interests: e.target.value }))} />
      <input className="w-full rounded-xl border p-2" placeholder="Goals (comma-separated)" value={form.goals} onChange={(e) => setForm((s) => ({ ...s, goals: e.target.value }))} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button disabled={busy} className="rounded-xl bg-accent text-white px-4 py-2 font-medium">
        {busy ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
