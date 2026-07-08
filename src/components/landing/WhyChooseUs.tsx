import { Clock, MapPin, ShieldCheck, TrendingUp } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Manage your business anytime, anywhere.",
  },
  {
    icon: MapPin,
    title: "Built for Rwanda",
    description: "Mobile Money and bank payments, built for the local market.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Platform",
    description: "Your data is safe with us.",
  },
  {
    icon: TrendingUp,
    title: "Scalable Solution",
    description: "Grow your portfolio without limits.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="features" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          Everything in one place
        </p>
        <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
          The complete solution for modern property management
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          From listing to leases, payments to maintenance — we&apos;ve got you
          covered.
        </p>

        <div className="mt-10 grid gap-8 rounded-2xl border border-slate-200 bg-white p-8 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/40 text-gold">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </span>
              <p className="font-semibold text-navy">{title}</p>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
