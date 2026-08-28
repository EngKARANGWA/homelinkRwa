"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  Wrench,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const NAV_ITEMS = [
  { key: "dashboard", href: "/house-manager", icon: LayoutDashboard },
  { key: "properties", href: "/house-manager/properties", icon: Building2 },
  { key: "leases", href: "/house-manager/leases", icon: FileText },
  { key: "payments", href: "/house-manager/payments", icon: CreditCard },
  { key: "maintenance", href: "/house-manager/maintenance", icon: Wrench },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
        const isActive =
          href === "/house-manager" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-gold/15 text-gold"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {t.dashboard.nav[key]}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useLanguage();

  return (
    <>
      <aside className="hidden w-64 flex-col bg-navy text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex">
        <Link href="/" className="flex items-center gap-2 px-6 py-5">
          <Home className="h-7 w-7 text-gold" strokeWidth={2.2} />
          <span className="leading-tight">
            <span className="block text-lg font-bold text-white">HomeLink</span>
            <span className="block text-[11px] font-semibold tracking-[0.2em] text-gold">
              {t.dashboard.roleBadge.houseManager}
            </span>
          </span>
        </Link>

        <NavLinks />

        <div className="border-t border-white/10 px-6 py-4 text-xs text-white/50">
          HomeLink Rwanda &copy; {new Date().getFullYear()}
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t.dashboard.topbar.closeMenu}
            onClick={onClose}
            className="absolute inset-0 bg-navy/70"
          />

          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-navy text-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5">
              <Link href="/" onClick={onClose} className="flex items-center gap-2">
                <Home className="h-7 w-7 text-gold" strokeWidth={2.2} />
                <span className="leading-tight">
                  <span className="block text-lg font-bold text-white">HomeLink</span>
                  <span className="block text-[11px] font-semibold tracking-[0.2em] text-gold">
                    {t.dashboard.roleBadge.houseManager}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.dashboard.topbar.closeMenu}
                className="rounded-lg p-2 text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <NavLinks onNavigate={onClose} />

            <div className="border-t border-white/10 px-6 py-4 text-xs text-white/50">
              HomeLink Rwanda &copy; {new Date().getFullYear()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
