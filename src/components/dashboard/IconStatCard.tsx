import type { LucideIcon } from "lucide-react";

type IconStatAccent = "gold" | "emerald" | "red" | "blue" | "amber";

const ICON_BG: Record<IconStatAccent, string> = {
  gold: "bg-gold/10 text-gold",
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
};

const VALUE_COLOR: Record<IconStatAccent, string> = {
  gold: "text-navy",
  emerald: "text-emerald-600",
  red: "text-red-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
};

const BAR: Record<IconStatAccent, string> = {
  gold: "from-amber-300 via-gold to-amber-500",
  emerald: "from-emerald-400 via-teal-500 to-emerald-600",
  red: "from-rose-400 via-red-500 to-rose-600",
  blue: "from-indigo-400 via-blue-500 to-violet-600",
  amber: "from-amber-300 via-orange-400 to-amber-500",
};

export function IconStatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  accent = "gold",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: IconStatAccent;
}) {
  return (
    <div className="relative flex w-full items-center gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 pr-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:w-72">
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${ICON_BG[accent]}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${VALUE_COLOR[accent]}`}>{value}</p>
        {subtitle && <p className="mt-1 truncate text-xs text-slate-400">{subtitle}</p>}
      </div>
      <span
        className={`absolute inset-y-3 right-2 w-1.5 rounded-full bg-gradient-to-b ${BAR[accent]} opacity-80`}
      />
    </div>
  );
}
