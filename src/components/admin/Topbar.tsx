import Link from "next/link";
import { Bell, LogOut, Menu, UserCircle } from "lucide-react";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4 lg:justify-end lg:px-10">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>

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
            <p className="text-sm font-semibold text-navy">Super Admin</p>
            <p className="hidden text-xs text-slate-500 sm:block">
              admin@homelinkrwanda.com
            </p>
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
