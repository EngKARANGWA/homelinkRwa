"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquarePlus, Plus } from "lucide-react";
import {
  LEASES,
  MAINTENANCE_REQUESTS,
  type MaintenanceRequest,
} from "@/lib/mock-admin-data";
import { useTenant } from "@/components/tenant/TenantContext";
import { Modal } from "@/components/admin/Modal";
import { MaintenanceRequestForm } from "@/components/tenant/MaintenanceRequestForm";
import { FeedbackForm } from "@/components/tenant/FeedbackForm";

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

export default function TenantMaintenancePage() {
  const { tenantName } = useTenant();
  const [requests, setRequests] = useState(MAINTENANCE_REQUESTS);
  const [isNewRequestOpen, setNewRequestOpen] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const myRequests = requests.filter((r) => r.tenant === tenantName);
  const currentLease = LEASES.find(
    (l) =>
      l.tenant === tenantName &&
      (l.status === "Active" ||
        l.status === "Renewal Requested" ||
        l.status === "Termination Requested"),
  );

  const submitRequest = (issue: string[], priority: MaintenanceRequest["priority"]) => {
    if (!currentLease) return;
    const newRequest: MaintenanceRequest = {
      id: String(Date.now()),
      tenant: tenantName,
      property: currentLease.property,
      issue,
      priority,
      status: "Submitted",
      assignedTo: null,
      workDone: null,
      laborCost: null,
      feedback: null,
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    setRequests((prev) => [newRequest, ...prev]);
    setNewRequestOpen(false);
    setNotice("Maintenance request submitted.");
  };

  const submitFeedback = (id: string, feedback: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, feedback } : r)),
    );
    setFeedbackId(null);
    setNotice("Thanks for your feedback.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Maintenance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your maintenance and repair requests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNewRequestOpen(true)}
          disabled={!currentLease}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
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
                <td className="px-6 py-3 text-slate-500">
                  {request.property}
                </td>
                <td className="max-w-xs px-6 py-3 text-slate-500">
                  {request.issue.join("; ")}
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
                  {request.status === "Completed" && !request.feedback ? (
                    <button
                      type="button"
                      onClick={() => setFeedbackId(request.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <MessageSquarePlus className="h-3.5 w-3.5" />
                      Leave Feedback
                    </button>
                  ) : request.feedback ? (
                    <span className="text-xs italic text-slate-400">
                      &ldquo;{request.feedback}&rdquo;
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {myRequests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No maintenance requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isNewRequestOpen && currentLease && (
        <Modal
          title="New Maintenance Request"
          description="Let your landlord know what needs fixing."
          onClose={() => setNewRequestOpen(false)}
        >
          <MaintenanceRequestForm
            property={currentLease.property}
            onCancel={() => setNewRequestOpen(false)}
            onSuccess={submitRequest}
          />
        </Modal>
      )}

      {feedbackId && (
        <Modal
          title="Leave Feedback"
          description="Let us know how the repair went."
          onClose={() => setFeedbackId(null)}
        >
          <FeedbackForm
            onCancel={() => setFeedbackId(null)}
            onSuccess={(feedback) => submitFeedback(feedbackId, feedback)}
          />
        </Modal>
      )}
    </div>
  );
}
