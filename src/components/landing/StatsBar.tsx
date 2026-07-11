const STATS = [
  { value: "99%", label: "Customer Satisfaction" },
  { value: "50+", label: "Properties Managed" },
  { value: "10+", label: "Districts Covered" },
  { value: "100%", label: "Secure Payments" },
];

export function StatsBar() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {STATS.map(({ value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-xl font-extrabold text-gold">
              {value}
            </span>
            <p className="text-sm font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
