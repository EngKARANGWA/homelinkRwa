"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const ACCENTS = {
  blue: {
    iconBg: "bg-indigo-50 text-indigo-600",
    bar: "from-indigo-400 via-blue-500 to-violet-600",
    glow: "hover:shadow-indigo-100",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600",
    bar: "from-emerald-400 via-teal-500 to-emerald-600",
    glow: "hover:shadow-emerald-100",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600",
    bar: "from-amber-300 via-orange-400 to-amber-500",
    glow: "hover:shadow-amber-100",
  },
  teal: {
    iconBg: "bg-cyan-50 text-cyan-600",
    bar: "from-cyan-400 via-teal-500 to-blue-500",
    glow: "hover:shadow-cyan-100",
  },
  rose: {
    iconBg: "bg-rose-50 text-rose-600",
    bar: "from-pink-400 via-rose-500 to-fuchsia-600",
    glow: "hover:shadow-rose-100",
  },
} as const;

export type StatAccent = keyof typeof ACCENTS;

export function StatCard({
  label,
  value,
  subtitle,
  href,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  href: string;
  icon: LucideIcon;
  accent: StatAccent;
}) {
  const styles = ACCENTS[accent];

  return (
    <Link
      href={href}
      className={`group relative flex overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 pr-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${styles.glow}`}
    >
      <div className="min-w-0 flex-1">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${styles.iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-tight text-slate-500">{label}</p>
        <p className="mt-1 line-clamp-2 text-xl leading-tight font-bold text-navy sm:text-2xl">
          {value}
        </p>
        {subtitle && <p className="mt-1 line-clamp-1 text-xs text-slate-400">{subtitle}</p>}
      </div>

      <span
        className={`absolute inset-y-3 right-2 w-1.5 rounded-full bg-gradient-to-b ${styles.bar} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
      />
    </Link>
  );
}
