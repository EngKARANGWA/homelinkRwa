"use client";

import { Building2, FileSignature, UserPlus, Wrench } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ICONS = [UserPlus, Building2, FileSignature, Wrench];
const STEP_NUMBERS = ["01", "02", "03", "04"];

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="bg-white pt-8 pb-16">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          {t.howItWorks.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
          {t.howItWorks.title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          {t.howItWorks.description}
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.howItWorks.steps.map(({ title, description }, index) => {
            const Icon = ICONS[index];
            return (
              <div
                key={title}
                className="relative flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6"
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
      </div>
    </section>
  );
}
