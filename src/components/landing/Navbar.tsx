"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogIn, Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_LINKS = [
    { label: t.nav.home, href: "/#home" },
    { label: t.nav.features, href: "/features" },
    { label: t.nav.howItWorks, href: "/how-it-works" },
    // { label: "Pricing", href: "#pricing" },
    { label: t.nav.aboutUs, href: "/about" },
    { label: t.nav.contact, href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/#home" className="flex items-center gap-2">
            <Home className="h-7 w-7 text-gold" strokeWidth={2.2} />
            <span className="leading-tight">
              <span className="block text-lg font-bold text-white">
                HomeLink
              </span>
              <span className="block text-[11px] font-semibold tracking-[0.2em] text-gold">
                RWANDA
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive = link.href.split("#")[0] === pathname;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? "border-b-2 border-gold text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher variant="dark" />
            <Link
              href="/login"
              className="rounded-lg border border-white/25 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {t.common.login}
            </Link>
            <Link
              href="/get-started"
              className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
            >
              {t.common.getStarted}
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
            <LanguageSwitcher variant="dark" />
            <Link
              href="/login"
              aria-label={t.common.login}
              className="rounded-lg border border-white/25 p-2 text-white transition-colors hover:bg-white/10"
            >
              <LogIn className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-white hover:bg-white/10"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-navy/70"
          />

          <div className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col bg-navy p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Link
                href="/#home"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <Home className="h-6 w-6 text-gold" strokeWidth={2.2} />
                <span className="text-base font-bold text-white">
                  HomeLink
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="mt-8 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = link.href.split("#")[0] === pathname;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                        isActive
                          ? "bg-white/10 text-gold"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-6">
              <Link
                href="/get-started"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-gold px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gold/90"
              >
                {t.common.getStarted}
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-white/25 px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                {t.common.login}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
