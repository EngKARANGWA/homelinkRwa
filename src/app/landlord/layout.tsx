import { Sidebar } from "@/components/landlord/Sidebar";
import { Topbar } from "@/components/landlord/Topbar";
import { LandlordProvider } from "@/components/landlord/LandlordContext";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LandlordProvider>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex flex-col lg:pl-64">
          <Topbar />
          <main className="flex-1 p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </LandlordProvider>
  );
}
