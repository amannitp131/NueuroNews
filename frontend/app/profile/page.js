"use client";

import AppShell from "../../components/core/AppShell";
import LoadingCard from "../../components/core/LoadingCard";
import ProfileEditor from "../../components/profile/ProfileEditor";
import { useRequireAuth } from "../../lib/authGuard";

export default function ProfilePage() {
  const { user, ready, isAuthenticated } = useRequireAuth();

  if (!ready || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingCard label="Checking session" />
      </main>
    );
  }

  return (
    <AppShell
      title="Profile"
      subtitle="Set your professional context, interests, and goals to improve your intelligence relevance and AI briefing quality."
    >
      <ProfileEditor user={user} />
    </AppShell>
  );
}
