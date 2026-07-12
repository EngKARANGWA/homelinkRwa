import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  Lightbulb,
  MapPin,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { StatsBar } from "@/components/landing/StatsBar";
import { Footer } from "@/components/landing/Footer";

const VALUES = [
  {
    icon: Target,
    title: "Management, not just listing",
    description:
      "We're built for the day-to-day of running a rental — leases, rent, maintenance and reporting — not just discovery.",
  },
  {
    icon: MapPin,
    title: "Built for Rwanda",
    description:
      "Mobile Money payments, UPI property records and local workflows designed around how rentals actually work here.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & transparency",
    description:
      "Verified landlords and tenants, reviewed listings, and a clear paper trail for every lease and payment.",
  },
  {
    icon: HeartHandshake,
    title: "Fair to every side",
    description:
      "Landlords get visibility and control. Tenants get clarity and an easy way to pay and get help.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-navy py-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              About us
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl">
              Simplifying property{" "}
              <span className="text-gold">management</span> across Rwanda.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              HomeLink Rwanda was built to solve one problem: managing a
              rental property in Rwanda meant spreadsheets, paper leases and
              chasing tenants for rent by phone. We built a better way.
            </p>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                Our story
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy">
                A management platform, not another listing site
              </h2>
              <p className="mt-4 text-slate-500">
                Rwanda already has places to find a home. What was missing
                was a way to actually run one — tracking leases and deposits,
                collecting rent through Mobile Money, following up on
                maintenance, and knowing at a glance which units are vacant
                and which tenants are behind.
              </p>
              <p className="mt-4 text-slate-500">
                HomeLink Rwanda brings landlords, property managers and
                tenants onto one platform built specifically for that job —
                from the property listing itself, right through to the
                rent receipt.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {VALUES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15">
                    <Icon className="h-5 w-5 text-gold" strokeWidth={2} />
                  </span>
                  <p className="text-sm font-semibold text-navy">{title}</p>
                  <p className="text-xs leading-snug text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <StatsBar />

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
              <Lightbulb className="h-7 w-7 text-gold" strokeWidth={2} />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">
              Where we're headed
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              We're growing district by district, adding the reporting and
              automation that make managing ten properties as easy as
              managing one — without losing the local-first details that
              make it work here.
            </p>
          </div>
        </section>

        <section className="bg-navy py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center lg:px-10">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Come manage your properties with us.
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
