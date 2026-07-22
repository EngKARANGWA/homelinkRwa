import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EntityCardAccent = "gold" | "emerald" | "red" | "blue" | "amber";

const ICON_BG: Record<EntityCardAccent, string> = {
  gold: "bg-gold/10 text-gold",
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
};

const GRID_COLS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export type EntityCardStat = {
  label: string;
  value: string | number;
  valueClassName?: string;
};

export function EntityCard({
  icon: Icon,
  iconAccent = "gold",
  title,
  subtitle,
  stats,
  href,
  onClick,
  overlayAction,
}: {
  icon: LucideIcon;
  iconAccent?: EntityCardAccent;
  title: string;
  subtitle?: string;
  stats: EntityCardStat[];
  href?: string;
  onClick?: () => void;
  overlayAction?: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-start gap-3 pr-8">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ICON_BG[iconAccent]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy">{title}</p>
          {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div
        className={`mt-5 grid gap-3 border-t border-slate-100 pt-4 ${GRID_COLS[stats.length] ?? "grid-cols-3"}`}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <p className="text-xs text-slate-400">{stat.label}</p>
            <p className={`mt-0.5 truncate font-semibold ${stat.valueClassName ?? "text-navy"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {overlayAction}
      {href ? (
        <Link href={href} className="block p-5">
          {body}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className="block w-full p-5 text-left">
          {body}
        </button>
      )}
    </div>
  );
}
