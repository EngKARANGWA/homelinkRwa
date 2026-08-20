"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export default function GetStartedPage() {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        <Link href="/" className="flex items-center justify-center gap-2">
          <Home className="h-7 w-7 text-gold" strokeWidth={2.2} />
          <span className="leading-tight">
            <span className="block text-lg font-bold text-navy">
              HomeLink
            </span>
            <span className="block text-[11px] font-semibold tracking-[0.2em] text-gold">
              RWANDA
            </span>
          </span>
        </Link>

        <h1 className="mt-6 text-center text-2xl font-bold text-navy">
          {t.getStartedPage.title}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          {t.getStartedPage.description}
        </p>

        {submitted ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <p className="font-semibold text-emerald-800">
              {t.getStartedPage.success.title}
            </p>
            <p className="text-sm text-emerald-700">
              {t.getStartedPage.success.description}
            </p>
          </div>
        ) : (
          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {t.getStartedPage.form.fullName}
              <input
                type="text"
                required
                placeholder={t.getStartedPage.form.fullNamePlaceholder}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {t.getStartedPage.form.emailAddress}
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {t.getStartedPage.form.phoneNumber}
              <input
                type="tel"
                required
                placeholder="+250 7XX XXX XXX"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {t.getStartedPage.form.iAmA}
              <select className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none">
                <option>{t.getStartedPage.form.optionLandlord}</option>
                <option>{t.getStartedPage.form.optionManager}</option>
                <option>{t.getStartedPage.form.optionTenant}</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {t.getStartedPage.form.numProperties}
              <input
                type="number"
                min={0}
                placeholder={t.getStartedPage.form.numPropertiesPlaceholder}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {t.getStartedPage.form.anythingElse}
              <textarea
                rows={3}
                placeholder={t.getStartedPage.form.anythingElsePlaceholder}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="mt-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
            >
              {t.getStartedPage.form.requestAccess}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          {t.getStartedPage.alreadyHaveAccount}{" "}
          <Link
            href="/login"
            className="font-semibold text-gold hover:underline"
          >
            {t.getStartedPage.logIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
