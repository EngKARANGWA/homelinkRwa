import Link from "next/link";
import { Home } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  // { label: "Pricing", href: "#pricing" },
  { label: "About us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  return (
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

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="rounded-lg border border-white/25 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            href="#get-started"
            className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gold/90"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
