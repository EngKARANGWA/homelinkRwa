"use client";

import { useEffect, useRef, useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { getInitials } from "@/lib/initials";
import { useTenant } from "./TenantContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { tenantName } = useTenant();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4 lg:justify-end lg:px-10">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={t.dashboard.topbar.openMenu}
        className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>

      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <LanguageSwitcher variant="light" className="shrink-0" />

        <button
          type="button"
          aria-label={t.dashboard.topbar.notifications}
          className="shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
        </button>

        <div className="relative min-w-0 border-l border-slate-200 pl-2 sm:pl-4" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={t.dashboard.topbar.accountMenu}
            className="flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
              {getInitials(tenantName)}
            </span>
            <div className="hidden min-w-0 leading-tight text-left sm:block">
              <p className="truncate text-sm font-semibold text-navy">{tenantName}</p>
              <p className="truncate text-xs text-slate-500">{t.dashboard.topbar.tenant}</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              <Link
                href="/login"
                aria-label={t.dashboard.topbar.logout}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                {t.dashboard.topbar.logout}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
