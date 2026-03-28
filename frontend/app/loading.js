import LoadingCard from "../components/core/LoadingCard";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 grid gap-4 md:grid-cols-2">
      <LoadingCard label="Loading Dashboard" />
      <LoadingCard label="Loading AI Modules" />
    </div>
  );
}
