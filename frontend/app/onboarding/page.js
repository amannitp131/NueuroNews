"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/core/AuthProvider";
import OnboardingForm from "../../components/onboarding/OnboardingForm";
import LoadingCard from "../../components/core/LoadingCard";

export default function OnboardingPage() {
  const { user, ready, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <LoadingCard label="Loading" />
      </main>
    );
  }

  return <OnboardingForm />;
}
