"use client";

import { AppLink as Link } from "@/components/shared/AppLink";
import { usePathname } from "next/navigation";
import { CreditCard, FileText, LayoutDashboard, Wrench } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const BOTTOM_NAV_ITEMS = [
  { key: "overview", href: "/tenant", icon: LayoutDashboard },
  { key: "lease", href: "/tenant/lease", icon: FileText },
  { key: "maintenance", href: "/tenant/maintenance", icon: Wrench },
  { key: "payments", href: "/tenant/payments", icon: CreditCard },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] lg:hidden">
      {BOTTOM_NAV_ITEMS.map(({ key, href, icon: Icon }) => {
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
            {t.dashboard.nav[key]}
          </Link>
        );
      })}
    </nav>
  );
}
