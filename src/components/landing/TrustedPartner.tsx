"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function TrustedPartner() {
  const { t } = useLanguage();

  return (
    <section className="bg-navy py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            {t.trustedPartner.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            {t.trustedPartner.title}
          </h2>
          <p className="mt-4 text-white/70">{t.trustedPartner.description}</p>

          <ul className="mt-6 flex flex-col gap-3">
            {t.trustedPartner.points.map((point) => (
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
            {t.trustedPartner.cta}
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
            {t.trustedPartner.imageCaption}
          </p>
        </div>
      </div>
    </section>
  );
}
