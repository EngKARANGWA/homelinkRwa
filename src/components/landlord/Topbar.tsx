"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, User, UserCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const name = user ? `${user.firstName} ${user.lastName}` : "";

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
        aria-label="Open menu"
        className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>

      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
        </button>

        <div className="relative min-w-0 border-l border-slate-200 pl-2 sm:pl-4" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Account menu"
            className="flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 hover:bg-slate-50"
          >
            <UserCircle className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
            <div className="leading-tight text-left">
              <p className="text-sm font-semibold text-navy">{name}</p>
              <p className="hidden text-xs text-slate-500 sm:block">Property Owner</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              <Link
                href="/landlord/profile"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <User className="h-4 w-4" strokeWidth={2} />
                Profile
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push("/login");
                }}
                aria-label="Log out"
                className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
