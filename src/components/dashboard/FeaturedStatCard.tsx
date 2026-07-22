export function FeaturedStatCard({
  title,
  value,
  label,
  subtext,
  size = "lg",
}: {
  title: string;
  value: string | number;
  label: string;
  subtext?: string;
  size?: "lg" | "md";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="truncate font-semibold text-navy">{title}</p>
      <p className={`mt-3 font-bold text-navy ${size === "lg" ? "text-3xl" : "text-lg"}`}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
      {subtext && <p className="mt-2 text-sm text-slate-500">{subtext}</p>}
    </div>
  );
}
