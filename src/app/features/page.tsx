"use client";

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
import { useLanguage } from "@/lib/i18n/LanguageContext";

const LANDLORD_ICONS = [Building2, FileText, Home, Wallet, Receipt, Wrench];
const TENANT_ICONS = [FileSignature, CreditCard, Receipt, Wrench, MessageCircle];

export default function FeaturesPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-navy py-20">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              {t.featuresPage.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl">
              {t.featuresPage.titlePrefix}
              <span className="text-gold">{t.featuresPage.titleHighlight}</span>
              {t.featuresPage.titleSuffix}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              {t.featuresPage.description}
            </p>
          </div>
        </section>

        <section id="landlords" className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                {t.featuresPage.landlordEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
                {t.featuresPage.landlordTitle}
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {t.featuresPage.landlordFeatures.map(({ title, description }, index) => {
                const Icon = LANDLORD_ICONS[index];
                return (
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
                );
              })}
            </div>
          </div>
        </section>

        <section id="tenants" className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                {t.featuresPage.tenantEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
                {t.featuresPage.tenantTitle}
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {t.featuresPage.tenantFeatures.map(({ title, description }, index) => {
                const Icon = TENANT_ICONS[index];
                return (
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
                );
              })}
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
              {t.featuresPage.cta.title}
            </h2>
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
            >
              {t.featuresPage.cta.button}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
