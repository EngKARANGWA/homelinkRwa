"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, UserCircle } from "lucide-react";
import { TENANTS } from "@/lib/mock-admin-data";
import { useTenant } from "./TenantContext";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { tenantId, setTenantId, tenantName } = useTenant();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>

        <label className="flex items-center gap-2 text-sm text-slate-500">
          <span className="hidden sm:inline">Viewing as</span>
          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-navy focus:border-gold focus:outline-none"
          >
            {TENANTS.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <UserCircle className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-navy">{tenantName}</p>
            <p className="hidden text-xs text-slate-500 sm:block">Tenant</p>
          </div>
        </div>
        <Link
          href="/login"
          aria-label="Log out"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-navy"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          Logout
        </Link>
      </div>
    </header>
  );
}
