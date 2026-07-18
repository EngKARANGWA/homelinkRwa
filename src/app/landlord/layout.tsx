"use client";

import { Suspense, useState } from "react";
import { Sidebar } from "@/components/landlord/Sidebar";
import { Topbar } from "@/components/landlord/Topbar";
import { LandlordProvider } from "@/components/landlord/LandlordContext";
import { useIdleLogout } from "@/lib/useIdleLogout";
import { RequireRole } from "@/components/auth/RequireRole";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  useIdleLogout();

  return (
    <RequireRole role="owner">
      <Suspense fallback={null}>
        <LandlordProvider>
          <div className="min-h-screen bg-slate-50">
            <Sidebar
              isOpen={isMobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
            />
            <div className="flex flex-col lg:pl-64">
              <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
              <main className="flex-1 p-6 lg:p-10">{children}</main>
            </div>
          </div>
        </LandlordProvider>
      </Suspense>
    </RequireRole>
  );
}
