import Link from "next/link";
import { Home } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

export function Footer() {
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
            <p className="mt-4 text-sm text-white/60">
              The all-in-one property management platform for landlords,
              agents and tenants across Rwanda.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Quick Links</p>
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
            <p className="text-sm font-semibold text-white">Legal</p>
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
            <p className="text-sm font-semibold text-white">Contact</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-white/60">
              <li>info@homelinkrwanda.com</li>
              <li>+250 7XX XXX XXX</li>
              <li>Kigali, Rwanda</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} HomeLink Rwanda. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
