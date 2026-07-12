import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-navy">
      <div className="absolute inset-0">
        <Image
          src="/images/animhouse.webp"
          alt="Modern managed property in Rwanda"
          fill
          unoptimized
          preload
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/50" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
          Manage. Track. Collect.
        </p>

        <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
          The Smarter Way to{" "}
          <span className="text-gold">Manage Properties</span> in Rwanda.
        </h1>

        <p className="mt-6 max-w-xl text-lg text-white/80">
          From leases and rent collection to maintenance and reporting,
          HomeLink Rwanda gives landlords, property managers and tenants one
          connected platform to manage every step of the rental journey.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
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
      </div>
    </section>
  );
}
