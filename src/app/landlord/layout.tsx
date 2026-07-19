"use client";

import { Suspense, useState } from "react";
import { Sidebar } from "@/components/landlord/Sidebar";
import { Topbar } from "@/components/landlord/Topbar";
import { BottomNav } from "@/components/landlord/BottomNav";
import { LandlordProvider } from "@/components/landlord/LandlordContext";
import { useIdleLogout } from "@/lib/useIdleLogout";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  useIdleLogout();

  return (
    <Suspense fallback={null}>
      <LandlordProvider>
        <div className="min-h-screen bg-slate-50">
          <Sidebar
            isOpen={isMobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
          <div className="flex flex-col lg:pl-64">
            <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
            <main className="flex-1 p-6 pb-20 lg:p-10">{children}</main>
          </div>
          <BottomNav />
        </div>
      </LandlordProvider>
    </Suspense>
  );
}
