"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, FileText, LayoutDashboard, Wrench } from "lucide-react";

const BOTTOM_NAV_ITEMS = [
  { label: "Overview", href: "/tenant", icon: LayoutDashboard },
  { label: "Lease", href: "/tenant/lease", icon: FileText },
  { label: "Maintenance", href: "/tenant/maintenance", icon: Wrench },
  { label: "Payments", href: "/tenant/payments", icon: CreditCard },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] lg:hidden">
      {BOTTOM_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive =
          href === "/tenant" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              isActive ? "text-gold" : "text-slate-400"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
