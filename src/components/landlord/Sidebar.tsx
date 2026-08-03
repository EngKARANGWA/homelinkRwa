"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CreditCard,
  FolderOpen,
  Home,
  LayoutDashboard,
  Users,
  Wrench,
  X,
} from "lucide-react";

const LANDLORD_NAV_ITEMS = [
  { label: "Dashboard", href: "/landlord", icon: LayoutDashboard },
  { label: "Properties", href: "/landlord/properties", icon: Building2 },
  { label: "Payments", href: "/landlord/payments", icon: CreditCard },
  { label: "Tenants", href: "/landlord/tenants", icon: Users },
  { label: "Reports", href: "/landlord/reports", icon: BarChart3 },
  { label: "Maintenance", href: "/landlord/maintenance", icon: Wrench },
  { label: "Documents", href: "/landlord/documents", icon: FolderOpen },
  { label: "Team", href: "/landlord/team", icon: Users },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
      {LANDLORD_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        // Unit detail pages live under /landlord/properties/[id]/units/[unitId]
        // but represent a tenant, so they should light up Tenants instead of
        // Properties even though the URL is nested there.
        const isUnitDetailPage = pathname.includes("/units/");
        const isActive =
          href === "/landlord"
            ? pathname === href
            : href === "/landlord/tenants"
              ? pathname.startsWith(href) || isUnitDetailPage
              : href === "/landlord/properties"
                ? pathname.startsWith(href) && !isUnitDetailPage
                : pathname.startsWith(href);

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
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside className="hidden w-64 flex-col bg-navy text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex">
        <Link href="/" className="flex items-center gap-2 px-6 py-5">
          <Home className="h-7 w-7 text-gold" strokeWidth={2.2} />
          <span className="leading-tight">
            <span className="block text-lg font-bold text-white">
              HomeLink
            </span>
            <span className="block text-[11px] font-semibold tracking-[0.2em] text-gold">
              LANDLORD
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
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 bg-navy/70"
          />

          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-navy text-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5">
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <Home className="h-7 w-7 text-gold" strokeWidth={2.2} />
                <span className="leading-tight">
                  <span className="block text-lg font-bold text-white">
                    HomeLink
                  </span>
                  <span className="block text-[11px] font-semibold tracking-[0.2em] text-gold">
                    LANDLORD
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
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
