import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Rental history, occupancy, maintenance and revenue reports.
        </p>
      </div>
      <ComingSoon
        icon={BarChart3}
        title="Reports coming soon"
        description="Generate rental history, payment history, occupancy, maintenance activity and revenue reports from here."
      />
    </div>
  );
}
