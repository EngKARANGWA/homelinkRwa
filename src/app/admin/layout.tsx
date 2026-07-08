import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-col lg:pl-64">
        <Topbar />
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
