import { FolderOpen } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";

export default function LandlordDocumentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lease agreements, receipts, and property paperwork.
        </p>
      </div>
      <ComingSoon
        icon={FolderOpen}
        title="Document library coming soon"
        description="Lease agreements, payment receipts, and property documents will be searchable and downloadable from here."
      />
    </div>
  );
}
