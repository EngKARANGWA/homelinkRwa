"use client";

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
import { useLanguage } from "@/lib/i18n/LanguageContext";

const VALUE_ICONS = [Target, MapPin, ShieldCheck, HeartHandshake];

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-navy py-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              {t.aboutPage.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl">
              {t.aboutPage.titlePrefix}
              <span className="text-gold">{t.aboutPage.titleHighlight}</span>
              {t.aboutPage.titleSuffix}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              {t.aboutPage.description}
            </p>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                {t.aboutPage.storyEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy">
                {t.aboutPage.storyTitle}
              </h2>
              <p className="mt-4 text-slate-500">{t.aboutPage.storyP1}</p>
              <p className="mt-4 text-slate-500">{t.aboutPage.storyP2}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {t.aboutPage.values.map(({ title, description }, index) => {
                const Icon = VALUE_ICONS[index];
                return (
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
                );
              })}
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
              {t.aboutPage.whereHeadedTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              {t.aboutPage.whereHeadedDescription}
            </p>
          </div>
        </section>

        <section className="bg-navy py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center lg:px-10">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {t.aboutPage.cta.title}
            </h2>
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
            >
              {t.aboutPage.cta.button}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
