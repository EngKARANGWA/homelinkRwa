export function Card({
  title,
  className = "",
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {title && <p className="font-semibold text-navy">{title}</p>}
      {children}
    </div>
  );
}
