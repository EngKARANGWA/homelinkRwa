"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, FileText, Home, LayoutDashboard, Wrench } from "lucide-react";

const TENANT_NAV_ITEMS = [
  { label: "Overview", href: "/tenant", icon: LayoutDashboard },
  { label: "My Lease", href: "/tenant/lease", icon: FileText },
  { label: "Maintenance", href: "/tenant/maintenance", icon: Wrench },
  { label: "Payments", href: "/tenant/payments", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col bg-navy text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex">
      <Link href="/" className="flex items-center gap-2 px-6 py-5">
        <Home className="h-7 w-7 text-gold" strokeWidth={2.2} />
        <span className="leading-tight">
          <span className="block text-lg font-bold text-white">
            HomeLink
          </span>
          <span className="block text-[11px] font-semibold tracking-[0.2em] text-gold">
            TENANT
          </span>
        </span>
      </Link>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {TENANT_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/tenant" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
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

      <div className="border-t border-white/10 px-6 py-4 text-xs text-white/50">
        HomeLink Rwanda &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
}
