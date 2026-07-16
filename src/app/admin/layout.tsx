"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
  );
}
