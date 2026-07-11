import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const POINTS = [
  "Verified landlords, agents and tenants on every listing",
  "Rent collected securely via Mobile Money or bank transfer",
  "Real-time dashboards for revenue, occupancy and maintenance",
];

export function TrustedPartner() {
  return (
    <section className="bg-navy py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Why homelink rwanda
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Your trusted partner in property management
          </h2>
          <p className="mt-4 text-white/70">
            From listing to lease to rent collection, HomeLink Rwanda gives
            landlords, agents and tenants a single, secure place to manage
            every step of the rental journey.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <span className="text-white/80">{point}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/get-started"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative h-[320px] overflow-hidden rounded-2xl sm:h-[400px]">
          <Image
            src="/images/tower.jpg"
            alt="Modern apartment building managed on HomeLink Rwanda"
            fill
            unoptimized
            loading="eager"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/10 to-transparent" />
          <p className="absolute inset-x-0 bottom-0 p-6 text-lg font-semibold text-white">
            Empowering Rwanda&apos;s rental market through smart property
            solutions.
          </p>
        </div>
      </div>
    </section>
  );
}
