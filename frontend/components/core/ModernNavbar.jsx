"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

const PRIVATE_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/story-arcs", label: "Story Arcs" },
  { href: "/profile", label: "Profile" }
];

const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Register" }
];

export default function ModernNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, ready } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = isAuthenticated ? PRIVATE_NAV : PUBLIC_NAV;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="group flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.8)] transition group-hover:scale-110" />
          <span className="text-sm font-semibold tracking-wide text-slate-100 md:text-base">NeuroNews</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? "bg-cyan-300 text-slate-950"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((state) => !state)}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 md:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            Menu
          </button>

          {ready && isAuthenticated ? (
            <>
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 md:block">
                {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-3 md:hidden">
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    active ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {ready && isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm text-slate-200"
              >
                Logout
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
