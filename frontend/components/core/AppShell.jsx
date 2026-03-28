"use client";

export default function AppShell({ title, subtitle, children }) {
  return (
    <main className="relative mesh-overlay min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-8 float-in">
        <header className="panel relative overflow-hidden p-6 md:p-8">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="absolute right-24 top-10 h-16 w-16 rounded-full bg-blue-400/25 blur-xl" />
          <div className="relative z-10">
            <div>
              <h1 className="mt-2 text-2xl md:text-4xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl">{subtitle}</p>
            </div>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
