"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CreditCard, LayoutDashboard, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

type NavItem =
  | { key: keyof Translations["dashboard"]["nav"]; label?: undefined; href: string; icon: typeof LayoutDashboard }
  | { key?: undefined; label: string; href: string; icon: typeof LayoutDashboard };

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/landlord", icon: LayoutDashboard },
  { key: "properties", href: "/landlord/properties", icon: Building2 },
  { key: "payments", href: "/landlord/payments", icon: CreditCard },
  { key: "team", href: "/landlord/team", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] lg:hidden">
      {BOTTOM_NAV_ITEMS.map(({ key, label, href, icon: Icon }) => {
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
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              isActive ? "text-gold" : "text-slate-400"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
            {key ? t.dashboard.nav[key] : label}
          </Link>
        );
      })}
    </nav>
  );
}
