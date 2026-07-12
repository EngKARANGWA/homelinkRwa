import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardCheck,
  CreditCard,
  FileSignature,
  Search,
  UserPlus,
  Wrench,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const LANDLORD_STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register your account",
    description:
      "Sign up as a landlord or property manager and tell us about yourself.",
  },
  {
    icon: Building2,
    step: "02",
    title: "List your property",
    description:
      "Add unit location, UPI, unit type, rent and lease conditions for admin approval.",
  },
  {
    icon: FileSignature,
    step: "03",
    title: "Sign leases & collect rent",
    description:
      "Create a digital lease and collect rent via Mobile Money, bank transfer or card.",
  },
  {
    icon: BarChart3,
    step: "04",
    title: "Track & manage",
    description:
      "Monitor vacancy, arrears, maintenance and performance from your dashboard.",
  },
];

const TENANT_STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Get set up on a property",
    description:
      "Your landlord or agent adds you to a property and shares your lease.",
  },
  {
    icon: FileSignature,
    step: "02",
    title: "Sign your lease",
    description:
      "Review and view your digital lease agreement — start date, rent and deposit.",
  },
  {
    icon: CreditCard,
    step: "03",
    title: "Pay rent",
    description:
      "Pay via MTN Mobile Money, Airtel Money, bank transfer or card, and get a receipt.",
  },
  {
    icon: Wrench,
    step: "04",
    title: "Request maintenance",
    description:
      "Submit issues, track progress, and leave feedback once work is done.",
  },
];

function StepGrid({
  steps,
}: {
  steps: {
    icon: typeof UserPlus;
    step: string;
    title: string;
    description: string;
  }[];
}) {
  return (
    <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(({ icon: Icon, step, title, description }) => (
        <div
          key={step}
          className="relative flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center"
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
  );
}

export default function HowItWorksPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-navy py-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              How it works
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl">
              A simple flow for{" "}
              <span className="text-gold">landlords and tenants</span> alike.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              HomeLink Rwanda guides property managers and tenants through
              every step of the rental journey — from sign-up to rent
              collection to maintenance.
            </p>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                For landlords & property managers
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
                From listing to rent collected
              </h2>
            </div>
            <StepGrid steps={LANDLORD_STEPS} />
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                For tenants
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
                From lease to move-in and beyond
              </h2>
            </div>
            <StepGrid steps={TENANT_STEPS} />
          </div>
        </section>
{/* 
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
              <ClipboardCheck className="h-7 w-7 text-gold" strokeWidth={2} />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">
              A super admin approves and oversees it all
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              Every property listing is reviewed before it goes live, and
              admins keep an eye on users, payments and maintenance
              platform-wide.
            </p>
          </div>
        </section> */}

        <section className="bg-navy py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center lg:px-10">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to try it yourself?
            </h2>
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
