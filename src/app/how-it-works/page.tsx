"use client";

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
import { useLanguage } from "@/lib/i18n/LanguageContext";

const LANDLORD_ICONS = [UserPlus, Building2, FileSignature, BarChart3];
const TENANT_ICONS = [Search, FileSignature, CreditCard, Wrench];
const STEP_NUMBERS = ["01", "02", "03", "04"];

function StepGrid({
  steps,
  icons,
}: {
  steps: { title: string; description: string }[];
  icons: typeof UserPlus[];
}) {
  return (
    <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(({ title, description }, index) => {
        const Icon = icons[index];
        return (
          <div
            key={title}
            className="relative flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center"
          >
            <span className="absolute right-4 top-4 text-3xl font-extrabold text-slate-200">
              {STEP_NUMBERS[index]}
            </span>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
              <Icon className="h-6 w-6 text-gold" strokeWidth={2} />
            </span>
            <p className="font-semibold text-navy">{title}</p>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function HowItWorksPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-navy py-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              {t.howItWorksPage.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl">
              {t.howItWorksPage.titlePrefix}
              <span className="text-gold">{t.howItWorksPage.titleHighlight}</span>
              {t.howItWorksPage.titleSuffix}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              {t.howItWorksPage.description}
            </p>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                {t.howItWorksPage.landlordEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
                {t.howItWorksPage.landlordTitle}
              </h2>
            </div>
            <StepGrid steps={t.howItWorksPage.landlordSteps} icons={LANDLORD_ICONS} />
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                {t.howItWorksPage.tenantEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
                {t.howItWorksPage.tenantTitle}
              </h2>
            </div>
            <StepGrid steps={t.howItWorksPage.tenantSteps} icons={TENANT_ICONS} />
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
              {t.howItWorksPage.cta.title}
            </h2>
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
            >
              {t.howItWorksPage.cta.button}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
