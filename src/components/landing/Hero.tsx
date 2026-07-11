import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Home, MapPin, Search } from "lucide-react";

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
          Find. Grow. Settle.
        </p>

        <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
          Find Your Ideal Home in the{" "}
          <span className="text-gold">Heart of Rwanda.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-white/80">
          The most trusted platform for property rentals, sales and
          professional management across the Land of a Thousand Hills.
          Empowering families and investors to achieve their goals.
        </p>

        {/* <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-white/10 bg-navy/60 p-3 backdrop-blur-md sm:flex-row sm:items-center sm:gap-0">
          <div className="flex flex-1 items-center gap-3 px-4 py-2.5 sm:border-r sm:border-white/15">
            <MapPin className="h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="text-xs text-white/50">Location</p>
              <p className="text-sm font-medium text-white">Kigali, Rwanda</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
            <Home className="h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="text-xs text-white/50">Property Type</p>
              <p className="text-sm font-medium text-white">Modern Villa</p>
            </div>
          </div>
        </div> */}

        {/* <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
          >
            Our Listings
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#about"
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            About Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div> */}
      </div>
    </section>
  );
}
