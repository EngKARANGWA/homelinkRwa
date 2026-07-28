export function AlertBanner({
  isAlert,
  stats,
  message,
  children,
  className = "",
}: {
  isAlert: boolean;
  stats: { label: string; value: string | number }[];
  message?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const toneText = isAlert ? "text-amber-700" : "text-emerald-700";
  const toneBorder = isAlert
    ? "border-amber-200 bg-amber-50/60"
    : "border-emerald-200 bg-emerald-50/60";

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border p-5 shadow-sm ${toneBorder} ${className}`}
    >
      {stats.length > 0 && (
        <div className="flex flex-wrap items-center gap-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${toneText}`}>
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-bold text-navy">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
      {message && (
        <p
          className={`rounded-lg border bg-white/60 px-4 py-2.5 text-sm ${toneText} ${toneBorder}`}
        >
          {message}
        </p>
      )}
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}
