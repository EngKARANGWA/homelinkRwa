"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const QUICK_LINKS = [
    { label: t.nav.home, href: "/#home" },
    { label: t.nav.features, href: "/features" },
    { label: t.nav.howItWorks, href: "/how-it-works" },
    { label: t.nav.aboutUs, href: "/about" },
    { label: t.nav.contact, href: "/contact" },
  ];

  const LEGAL_LINKS = [
    { label: t.footer.privacyPolicy, href: "#" },
    { label: t.footer.termsOfService, href: "#" },
  ];

  return (
    <footer className="bg-navy-light">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-gold" strokeWidth={2.2} />
              <span className="leading-tight">
                <span className="block text-base font-bold text-white">
                  HomeLink
                </span>
                <span className="block text-[10px] font-semibold tracking-[0.2em] text-gold">
                  RWANDA
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm text-white/60">{t.footer.tagline}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {t.footer.quickLinks}
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">{t.footer.legal}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {t.footer.contact}
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-white/60">
              <li>info@homelinkrwanda.com</li>
              <li>+250 7XX XXX XXX</li>
              <li>Kigali, Rwanda</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} HomeLink Rwanda. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
