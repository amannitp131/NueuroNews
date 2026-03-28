"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "../../lib/api";
import { useAuth } from "../core/AuthProvider";

const ROLES = [
  { id: "student", label: "Student", emoji: "🎓" },
  { id: "investor", label: "Investor", emoji: "💰" },
  { id: "founder", label: "Founder", emoji: "🚀" },
  { id: "job_seeker", label: "Job Seeker", emoji: "💼" }
];

const INTERESTS = [
  { id: "ai", label: "AI & ML", emoji: "🤖" },
  { id: "startups", label: "Startups", emoji: "⚡" },
  { id: "finance", label: "Finance", emoji: "📊" },
  { id: "tech", label: "Tech", emoji: "💻" },
  { id: "health", label: "Healthcare", emoji: "🏥" },
  { id: "policy", label: "Government", emoji: "🏛️" }
];

const GOALS = [
  { id: "learn", label: "Learn & Stay Updated", emoji: "📚" },
  { id: "invest", label: "Find Investment Ideas", emoji: "🎯" },
  { id: "career", label: "Grow My Career", emoji: "📈" },
  { id: "build", label: "Build Something", emoji: "🛠️" }
];

export default function OnboardingForm() {
  const router = useRouter();
  const { user, login, token } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete() {
    if (!role || selectedInterests.length === 0 || !goal) {
      setError("Please complete all steps");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profession = ROLES.find((r) => r.id === role)?.label || "Professional";
      const interestLabels = INTERESTS.filter((i) => selectedInterests.includes(i.id)).map((i) => i.label);
      const goalLabel = GOALS.find((g) => g.id === goal)?.label || "";

      await saveProfile({
        name: user?.name || "User",
        profession,
        interests: interestLabels,
        goals: [goalLabel]
      });

      login({
        token,
        user: {
          ...user,
          profession,
          interests: interestLabels,
          goals: [goalLabel]
        }
      });

      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const progressPercent = (step / 3) * 100;

  return (
    <main className="mesh-overlay min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold">
              {step === 1 && "What describes you best?"}
              {step === 2 && "What interests you?"}
              {step === 3 && "What's your goal?"}
            </h1>
            <span className="text-sm text-slate-400">
              {step}/3
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-cyan-300 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step 1: Role selection */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300 mb-6">
              Tell us about you so we can personalize your experience.
            </p>
            <div className="grid gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-4 rounded-xl border-2 transition text-left flex items-center gap-3 ${
                    role === r.id
                      ? "border-cyan-300 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20"
                  }`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="font-semibold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Interests selection */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300 mb-6">
              Pick at least 2 topics you want to track.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => {
                    setSelectedInterests((prev) =>
                      prev.includes(interest.id)
                        ? prev.filter((i) => i !== interest.id)
                        : [...prev, interest.id]
                    );
                  }}
                  className={`p-3 rounded-xl border-2 transition text-center flex flex-col items-center gap-2 ${
                    selectedInterests.includes(interest.id)
                      ? "border-cyan-300 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20"
                  }`}
                >
                  <span className="text-2xl">{interest.emoji}</span>
                  <span className="text-sm font-semibold">{interest.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Goal selection */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300 mb-6">
              What would you like to achieve?
            </p>
            <div className="grid gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`p-4 rounded-xl border-2 transition text-left flex items-center gap-3 ${
                    goal === g.id
                      ? "border-cyan-300 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20"
                  }`}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="font-semibold">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-rose-300 mt-4">{error}</p>}

        {/* Buttons */}
        <div className="mt-8 flex gap-3 justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-200 disabled:opacity-40"
          >
            Back
          </button>

          <button
            onClick={() => {
              if (step === 3) {
                handleComplete();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={
              loading ||
              (step === 1 && !role) ||
              (step === 2 && selectedInterests.length < 2) ||
              (step === 3 && !goal)
            }
            className="rounded-full bg-cyan-300 px-6 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {step === 3 ? (loading ? "Setting up..." : "Complete Setup") : "Next"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Step {step} of 3: {step === 1 && "Role"}{step === 2 && "Interests"}{step === 3 && "Goal"}
        </p>
      </div>
    </main>
  );
}
