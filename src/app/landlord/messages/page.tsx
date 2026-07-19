import { MessageSquare } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";

export default function LandlordMessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">
          Reminders and conversations with your tenants.
        </p>
      </div>
      <ComingSoon
        icon={MessageSquare}
        title="Messages coming soon"
        description="Send rent reminders and message tenants directly from HomeLink. Reminders sent from the dashboard will show up here."
      />
    </div>
  );
}
