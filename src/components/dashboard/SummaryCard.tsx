export type SummaryCardAccent = "navy" | "emerald" | "red" | "amber" | "blue";

export const SUMMARY_VALUE_COLOR: Record<SummaryCardAccent, string> = {
  navy: "text-navy",
  emerald: "text-emerald-600",
  red: "text-red-600",
  amber: "text-amber-600",
  blue: "text-blue-600",
};

export function SummaryCard({
  label,
  value,
  accent = "navy",
  subtitle,
}: {
  label: string;
  value: string | number;
  accent?: SummaryCardAccent;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${SUMMARY_VALUE_COLOR[accent]}`}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
