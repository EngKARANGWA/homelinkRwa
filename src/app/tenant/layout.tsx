import { Suspense } from "react";
import { Sidebar } from "@/components/tenant/Sidebar";
import { Topbar } from "@/components/tenant/Topbar";
import { TenantProvider } from "@/components/tenant/TenantContext";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <TenantProvider>
        <div className="min-h-screen bg-slate-50">
          <Sidebar />
          <div className="flex flex-col lg:pl-64">
            <Topbar />
            <main className="flex-1 p-6 lg:p-10">{children}</main>
          </div>
        </div>
      </TenantProvider>
    </Suspense>
  );
}
