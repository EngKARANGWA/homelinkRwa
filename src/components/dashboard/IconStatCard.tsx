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

export function IconStatCard({
  icon: Icon,
  label,
  value,
  accent = "gold",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: IconStatAccent;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${ICON_BG[accent]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${VALUE_COLOR[accent]}`}>{value}</p>
    </div>
  );
}
