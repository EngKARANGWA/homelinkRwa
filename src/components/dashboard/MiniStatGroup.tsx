import { SUMMARY_VALUE_COLOR, type SummaryCardAccent } from "./SummaryCard";

export type MiniStat = {
  label: string;
  value: string | number;
  unit?: string;
  accent?: SummaryCardAccent;
};

const COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export function MiniStatGroup({ stats }: { stats: MiniStat[] }) {
  return (
    <div
      className={`mt-4 grid grid-cols-1 gap-4 sm:gap-0 sm:divide-x sm:divide-slate-100 ${
        COLS[stats.length] ?? "sm:grid-cols-3"
      }`}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={i === 0 ? "sm:pr-4" : i === stats.length - 1 ? "sm:pl-4" : "sm:px-4"}
        >
          <p className="text-xs text-slate-500">{stat.label}</p>
          <p className={`mt-1 text-xl font-bold ${SUMMARY_VALUE_COLOR[stat.accent ?? "navy"]}`}>
            {stat.value}
            {stat.unit && <span className="text-xs font-medium text-slate-400"> {stat.unit}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
