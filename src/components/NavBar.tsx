"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function TodayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-1.8 2-2.6 3.9-2.6 5.4a2.6 2.6 0 0 0 5.2 0c0-.8-.3-1.7-.8-2.6.6.5 1.2 1.4 1.2 2.6a3.6 3.6 0 0 1-7.2 0C7.8 6.3 9.5 4.3 12 3Z" />
      <path d="M6 14a6 6 0 0 0 12 0" />
      <path d="M4.5 14h15" />
    </svg>
  );
}

function FoodsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a2 2 0 0 0 2 2v9" />
      <path d="M6 3v6M9 3v6" />
      <path d="M16 3c-2 0-3 2-3 5s1 4 3 4v9" />
    </svg>
  );
}

function WeightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9.5v3.8l2.3 1.4" />
      <path d="M10 3.5h4" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6M17.8 17.8l-1.6-1.6M7.8 7.8 6.2 6.2" />
    </svg>
  );
}

const links: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "Today", icon: <TodayIcon /> },
  { href: "/foods", label: "Foods", icon: <FoodsIcon /> },
  { href: "/weight", label: "Weight", icon: <WeightIcon /> },
  { href: "/stats", label: "Stats", icon: <StatsIcon /> },
  { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

export function NavBar() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-hairline bg-surface-raised/95 backdrop-blur">
      <div
        className="mx-auto flex max-w-2xl items-stretch justify-between px-2 pt-2"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 text-sm font-medium transition-colors ${
                active ? "text-sage" : "text-ink-muted"
              }`}
            >
              <span className="h-6 w-6">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
