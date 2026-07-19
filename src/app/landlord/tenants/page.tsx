import { Users } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";

export default function LandlordTenantsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Tenants</h1>
        <p className="mt-1 text-sm text-slate-500">
          Everyone renting from you, in one place.
        </p>
      </div>
      <ComingSoon
        icon={Users}
        title="Tenant directory coming soon"
        description="A dedicated view of every tenant across your properties, their lease status, and contact details will live here."
      />
    </div>
  );
}
