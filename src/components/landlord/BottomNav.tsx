"use client";

import { AppLink as Link } from "@/components/shared/AppLink";
import { usePathname } from "next/navigation";
import { Building2, CreditCard, LayoutDashboard, MessageSquare } from "lucide-react";

const BOTTOM_NAV_ITEMS = [
  { label: "Dashboard", href: "/landlord", icon: LayoutDashboard },
  { label: "Properties", href: "/landlord/properties", icon: Building2 },
  { label: "Payments", href: "/landlord/payments", icon: CreditCard },
  { label: "Messages", href: "/landlord/messages", icon: MessageSquare },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] lg:hidden">
      {BOTTOM_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        // Unit detail pages are nested under /landlord/properties/[id]/units/[unitId]
        // but represent a tenant, not the properties list, so don't light up Properties.
        const isActive =
          href === "/landlord"
            ? pathname === href
            : href === "/landlord/properties"
              ? pathname.startsWith(href) && !pathname.includes("/units/")
              : pathname.startsWith(href);

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
