import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileText,
  Home,
  MessageCircle,
  Wrench,
} from "lucide-react";
import { BuildingIllustration } from "./BuildingIllustration";

const FEATURE_CARDS = [
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

const TRUST_BADGES = ["Easy to use", "Secure & Reliable", "Built for Rwanda"];

export function Hero() {
  return (
    <section id="home" className="bg-navy">
      <div className="mx-auto grid max-w-7xl gap-12 px-2 py-16 lg:grid-cols-2 lg:items-start lg:gap-8 lg:px-4 lg:py-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/90">
            <Home className="h-4 w-4 text-gold" />
            All-in-One Property Management Platform
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            Manage properties.
            <br />
            Delight tenants.
            <br />
            <span className="text-gold">Grow your business.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-white/70">
            HomeLink Rwanda helps property owners and managers simplify
            operations, keep tenants happy and grow their rental business —
            all in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#get-started"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-navy transition-colors hover:bg-gold/90"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Book a Demo
              <Calendar className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-6">
            {TRUST_BADGES.map((label) => (
              <div key={label} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span className="text-sm text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[440px] sm:h-[520px]">
          <BuildingIllustration />

          <div className="absolute inset-0 grid grid-cols-2 content-center gap-5 p-6 sm:grid-cols-3">
            {FEATURE_CARDS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-lg"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15">
                  <Icon className="h-5 w-5 text-gold" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-bold text-navy">{title}</p>
                  <p className="mt-1 text-xs leading-snug text-slate-500">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
