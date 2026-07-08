"use client";

import { useState } from "react";
import { PlayCircle, UserPlus, Wrench } from "lucide-react";
import {
  MAINTENANCE_REQUESTS,
  PROPERTIES,
  type MaintenanceRequest,
} from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import { AssignHandlerForm } from "@/components/admin/AssignHandlerForm";
import { CompleteRequestForm } from "@/components/admin/CompleteRequestForm";

const STATUS_STYLES: Record<MaintenanceRequest["status"], string> = {
  Submitted: "bg-amber-50 text-amber-700",
  Assigned: "bg-sky-50 text-sky-700",
  "In Progress": "bg-sky-50 text-sky-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

const PRIORITY_STYLES: Record<MaintenanceRequest["priority"], string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-red-50 text-red-700",
};

export default function LandlordMaintenancePage() {
  const { landlordName } = useLandlord();
  const [requests, setRequests] = useState(MAINTENANCE_REQUESTS);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const myPropertyNames = PROPERTIES.filter(
    (p) => p.owner === landlordName,
  ).map((p) => p.name);
  const myRequests = requests.filter((r) =>
    myPropertyNames.includes(r.property),
  );

  const startProgress = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "In Progress" } : r)),
    );
  };

  const assignHandler = (id: string, handler: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Assigned", assignedTo: handler } : r,
      ),
    );
    setAssigningId(null);
  };

  const completeRequest = (id: string, workDone: string, laborCost: number) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Completed", workDone, laborCost } : r,
      ),
    );
    setCompletingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Maintenance</h1>
        <p className="mt-1 text-sm text-slate-500">
          Maintenance and repair requests on your properties.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">Tenant</th>
              <th className="px-6 py-3 font-medium">Property</th>
              <th className="px-6 py-3 font-medium">Issue</th>
              <th className="px-6 py-3 font-medium">Priority</th>
              <th className="px-6 py-3 font-medium">Assigned To</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myRequests.map((request) => (
              <tr key={request.id} className="border-t border-slate-100">
                <td className="px-6 py-3 font-medium text-navy">
                  {request.tenant}
                </td>
                <td className="px-6 py-3 text-slate-500">
                  {request.property}
                </td>
                <td className="max-w-xs px-6 py-3 text-slate-500">
                  {request.issue}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[request.priority]}`}
                  >
                    {request.priority}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-500">
                  {request.assignedTo ?? "—"}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {request.status === "Submitted" && (
                    <button
                      type="button"
                      onClick={() => setAssigningId(request.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Assign
                    </button>
                  )}
                  {request.status === "Assigned" && (
                    <button
                      type="button"
                      onClick={() => startProgress(request.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Start
                    </button>
                  )}
                  {request.status === "In Progress" && (
                    <button
                      type="button"
                      onClick={() => setCompletingId(request.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      Mark Completed
                    </button>
                  )}
                  {request.status === "Completed" && (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {myRequests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  No maintenance requests on your properties.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {assigningId && (
        <Modal
          title="Assign Handler"
          description="Choose who will handle this maintenance request."
          onClose={() => setAssigningId(null)}
        >
          <AssignHandlerForm
            onCancel={() => setAssigningId(null)}
            onSuccess={(handler) => assignHandler(assigningId, handler)}
          />
        </Modal>
      )}

      {completingId && (
        <Modal
          title="Complete Request"
          description="Confirm the work done and labor cost."
          onClose={() => setCompletingId(null)}
        >
          <CompleteRequestForm
            onCancel={() => setCompletingId(null)}
            onSuccess={(workDone, laborCost) =>
              completeRequest(completingId, workDone, laborCost)
            }
          />
        </Modal>
      )}
    </div>
  );
}
