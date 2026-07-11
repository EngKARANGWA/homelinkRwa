"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  // { label: "Pricing", href: "#pricing" },
  { label: "About us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="#home" className="flex items-center gap-2">
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
            {NAV_LINKS.map((link, index) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    index === 0
                      ? "border-b-2 border-gold text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-lg border border-white/25 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              href="/get-started"
              className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
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
                href="#home"
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
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-6">
              <Link
                href="/get-started"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-gold px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gold/90"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-white/25 px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
