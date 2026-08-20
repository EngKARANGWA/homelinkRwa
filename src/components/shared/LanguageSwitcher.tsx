"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { locales, type Locale } from "@/lib/i18n/translations";

const LABELS: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
};

export function LanguageSwitcher({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const { locale, setLocale } = useLanguage();

  const wrapperClasses =
    variant === "dark"
      ? "border-white/25"
      : "border-slate-300";

  return (
    <div
      className={`inline-flex items-center rounded-lg border p-0.5 text-xs font-semibold ${wrapperClasses} ${className}`}
      role="group"
      aria-label="Language"
    >
      {locales.map((code) => {
        const isActive = code === locale;
        const activeClasses =
          variant === "dark"
            ? "bg-gold text-white"
            : "bg-navy text-white";
        const inactiveClasses =
          variant === "dark"
            ? "text-white/70 hover:text-white"
            : "text-slate-500 hover:text-navy";

        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={isActive}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              isActive ? activeClasses : inactiveClasses
            }`}
          >
            {LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
