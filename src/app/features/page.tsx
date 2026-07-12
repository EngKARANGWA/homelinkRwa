import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CreditCard,
  FileSignature,
  FileText,
  Home,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Wallet,
  Wrench,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const LANDLORD_FEATURES = [
  {
    icon: Building2,
    title: "Property Listings",
    description:
      "Register properties with unit location, UPI (Unique Parcel Identifier), unit type, rent and lease conditions.",
  },
  {
    icon: FileText,
    title: "Lease Tracking",
    description:
      "Track lease start and end dates, rent, security deposit, rent MoMo number and the digital lease document.",
  },
  {
    icon: Home,
    title: "Unit & Vacancy Tracking",
    description:
      "Mark units vacant or occupied and automatically track how many days each unit has been vacant.",
  },
  {
    icon: Wallet,
    title: "Rent Management",
    description:
      "See what's due, what's paid and what's in arrears across every property you manage.",
  },
  {
    icon: Receipt,
    title: "Rent Payments & Statements",
    description:
      "Collect rent, generate receipts and invoices, and download a full payment statement anytime.",
  },
  {
    icon: Wrench,
    title: "Maintenance Management",
    description:
      "Assign requests to a handler, track progress, and confirm completion with cost and work notes.",
  },
];

const TENANT_FEATURES = [
  {
    icon: FileSignature,
    title: "My Lease",
    description:
      "View your lease agreement as a proper document, and request a renewal or termination.",
  },
  {
    icon: CreditCard,
    title: "Pay Rent",
    description:
      "Pay via MTN Mobile Money, Airtel Money, bank transfer or card — whatever's convenient.",
  },
  {
    icon: Receipt,
    title: "Payment History & Receipts",
    description:
      "View every payment, download receipts and invoices, and export your full statement.",
  },
  {
    icon: Wrench,
    title: "Maintenance Requests",
    description:
      "Submit issues with multiple items at once, track status, and leave feedback once resolved.",
  },
  {
    icon: MessageCircle,
    title: "Notifications",
    description:
      "Stay informed about payments, lease updates and maintenance without chasing anyone down.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-navy py-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Platform features
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl">
              Everything you need to{" "}
              <span className="text-gold">manage properties</span> in Rwanda.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              HomeLink Rwanda is a property management platform, not a
              listing site. Every feature below exists to help landlords,
              property managers and tenants run the day-to-day of a rental
              — leases, rent, maintenance and reporting — in one place.
            </p>
          </div>
        </section>

        <section id="landlords" className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                For landlords & property managers
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
                Run every property from one dashboard
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {LANDLORD_FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
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

        <section id="tenants" className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                For tenants
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
                Everything you need as a renter
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TENANT_FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
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

        {/* <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
              <ShieldCheck className="h-7 w-7 text-gold" strokeWidth={2} />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">
              Plus platform-wide oversight
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              A super admin layer approves listings, manages landlord and
              tenant accounts, oversees maintenance and payments platform-wide,
              and generates filterable, exportable reports.
            </p>
          </div>
        </section> */}

        <section className="bg-navy py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center lg:px-10">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to get started?
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
