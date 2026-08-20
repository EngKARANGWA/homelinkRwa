"use client";

import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  MessageCircle,
  Wrench,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ICONS = [Building2, FileText, CreditCard, Wrench, MessageCircle, BarChart3];

export function Solutions() {
  const { t } = useLanguage();

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          {t.solutions.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
          {t.solutions.title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          {t.solutions.description}
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.solutions.items.map(({ title, description }, index) => {
            const Icon = ICONS[index];
            return (
              <div
                key={title}
                className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
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
  );
}
