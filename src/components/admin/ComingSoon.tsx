import { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
        <Icon className="h-6 w-6 text-gold" strokeWidth={2} />
      </span>
      <h2 className="text-lg font-bold text-navy">{title}</h2>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}
