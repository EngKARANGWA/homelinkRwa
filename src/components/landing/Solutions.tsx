import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  MessageCircle,
  Wrench,
} from "lucide-react";

const SOLUTIONS = [
  {
    icon: Building2,
    title: "Property Listings",
    description: "List, edit and get properties approved for rent.",
  },
  {
    icon: FileText,
    title: "Leases & Agreements",
    description:
      "Create digital leases, e-sign, and manage renewals or terminations.",
  },
  {
    icon: CreditCard,
    title: "Rent & Payments",
    description:
      "Accept Mobile Money and bank payments, with automatic rent tracking.",
  },
  {
    icon: Wrench,
    title: "Maintenance & Repairs",
    description: "Tenants submit requests. You assign, track and resolve.",
  },
  {
    icon: MessageCircle,
    title: "Communication",
    description: "In-app messaging keeps you and your tenants connected.",
  },
  {
    icon: BarChart3,
    title: "Financial Dashboard & Reports",
    description: "Revenue, occupancy, and performance reports at a glance.",
  },
];

export function Solutions() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          Our solutions
        </p>
        <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
          Solutions that drive your success
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          Everything a landlord, agent or tenant needs, in one connected
          platform.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                <Icon className="h-6 w-6 text-gold" strokeWidth={2} />
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
