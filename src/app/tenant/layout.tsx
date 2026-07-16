"use client";

import { Suspense, useState } from "react";
import { Sidebar } from "@/components/tenant/Sidebar";
import { Topbar } from "@/components/tenant/Topbar";
import { TenantProvider } from "@/components/tenant/TenantContext";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Suspense fallback={null}>
      <TenantProvider>
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
      </TenantProvider>
    </Suspense>
  );
}
