"use client";

import { useState } from "react";
import { CheckCircle2, Eye, PlayCircle, Plus, UserPlus, Wrench } from "lucide-react";
import { MAINTENANCE_REQUESTS, type Laborer, type MaintenanceRequest } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { MaintenanceRequestForm } from "@/components/admin/MaintenanceRequestForm";
import { AssignHandlerForm } from "@/components/admin/AssignHandlerForm";
import { CompleteRequestForm } from "@/components/admin/CompleteRequestForm";
import { MaintenanceDetail } from "@/components/admin/MaintenanceDetail";

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

export default function MaintenancePage() {
  const [requests, setRequests] = useState(MAINTENANCE_REQUESTS);
  const [isNewRequestOpen, setNewRequestOpen] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<MaintenanceRequest | null>(null);

  const startProgress = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "In Progress" } : r)),
    );
  };

  const assignHandler = (id: string, laborers: Laborer[]) => {
    const laborCost = laborers.reduce((sum, l) => sum + l.amount, 0);
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Assigned", laborers, laborCost } : r,
      ),
    );
    setAssigningId(null);
  };

  const completeRequest = (id: string, workDone: string, itemCost: number) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Completed", workDone, itemCost } : r,
      ),
    );
    setCompletingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Maintenance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Maintenance and repair requests across the platform.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNewRequestOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {justSubmitted && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Maintenance request submitted.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="max-w-[10rem] px-4 py-3 font-medium sm:px-6">Tenant</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Property</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">Issue</th>
              <th className="hidden px-6 py-3 font-medium sm:table-cell">Priority</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">Assigned To</th>
              <th className="px-4 py-3 font-medium sm:px-6">Status</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">
                Cost / Feedback
              </th>
              <th className="px-4 py-3 font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t border-slate-100">
                <td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {request.tenant}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {request.property}
                  </p>
                  <p className="text-xs text-slate-400 sm:hidden">
                    {request.priority} priority
                  </p>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {request.property}
                </td>
                <td className="hidden max-w-xs px-6 py-3 text-slate-500 lg:table-cell">
                  {request.issue.join("; ")}
                </td>
                <td className="hidden px-6 py-3 sm:table-cell">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[request.priority]}`}
                  >
                    {request.priority}
                  </span>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {request.laborers.length > 0
                    ? `${request.laborers.length} worker${request.laborers.length === 1 ? "" : "s"}`
                    : "—"}
                </td>
                <td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="hidden max-w-xs px-6 py-3 text-slate-500 lg:table-cell">
                  {request.status === "Completed" ? (
                    <>
                      <p className="font-medium text-navy">
                        {(
                          (request.laborCost ?? 0) + (request.itemCost ?? 0)
                        ).toLocaleString()}{" "}
                        RWF
                      </p>
                      {request.feedback && (
                        <p className="text-xs italic text-slate-400">
                          &ldquo;{request.feedback}&rdquo;
                        </p>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingRequest(request)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    {request.status === "Submitted" && (
                      <button
                        type="button"
                        onClick={() => setAssigningId(request.id)}
                        aria-label={`Assign handler for ${request.tenant}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Assign</span>
                      </button>
                    )}
                    {request.status === "Assigned" && (
                      <button
                        type="button"
                        onClick={() => startProgress(request.id)}
                        aria-label={`Start progress for ${request.tenant}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Start</span>
                      </button>
                    )}
                    {request.status === "In Progress" && (
                      <button
                        type="button"
                        onClick={() => setCompletingId(request.id)}
                        aria-label={`Mark completed for ${request.tenant}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Mark Completed</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isNewRequestOpen && (
        <Modal
          title="New Maintenance Request"
          description="Submit a repair or maintenance request on behalf of a tenant."
          onClose={() => setNewRequestOpen(false)}
        >
          <MaintenanceRequestForm
            onCancel={() => setNewRequestOpen(false)}
            onSuccess={() => {
              setNewRequestOpen(false);
              setJustSubmitted(true);
            }}
          />
        </Modal>
      )}

      {viewingRequest && (
        <Modal
          title="Maintenance Request"
          description={`${viewingRequest.tenant} · ${viewingRequest.property}`}
          onClose={() => setViewingRequest(null)}
        >
          <MaintenanceDetail request={viewingRequest} />
        </Modal>
      )}

      {assigningId && (
        <Modal
          title="Assign Handler"
          description="Add the laborers who will handle this request and what each will be paid."
          onClose={() => setAssigningId(null)}
        >
          <AssignHandlerForm
            onCancel={() => setAssigningId(null)}
            onSuccess={(laborers) => assignHandler(assigningId, laborers)}
          />
        </Modal>
      )}

      {completingId && (
        <Modal
          title="Complete Request"
          description="Confirm the work that was done."
          onClose={() => setCompletingId(null)}
        >
          <CompleteRequestForm
            onCancel={() => setCompletingId(null)}
            onSuccess={(workDone, itemCost) =>
              completeRequest(completingId, workDone, itemCost)
            }
          />
        </Modal>
      )}
    </div>
  );
}
