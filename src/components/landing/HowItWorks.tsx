import { Building2, FileSignature, UserPlus, Wrench } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create your account",
    description:
      "Sign up as a landlord, tenant or property manager in minutes.",
  },
  {
    icon: Building2,
    step: "02",
    title: "List or find a property",
    description:
      "Landlords list properties for approval; tenants browse verified listings.",
  },
  {
    icon: FileSignature,
    step: "03",
    title: "Sign leases & pay rent",
    description:
      "Create digital leases and collect rent via Mobile Money or bank transfer.",
  },
  {
    icon: Wrench,
    step: "04",
    title: "Maintain & grow",
    description:
      "Handle maintenance requests and track everything from your dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
          Get started in four simple steps
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          From sign-up to rent collection, HomeLink Rwanda guides every step
          of the rental journey.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, step, title, description }) => (
            <div
              key={step}
              className="relative flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <span className="absolute right-4 top-4 text-3xl font-extrabold text-slate-200">
                {step}
              </span>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
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
