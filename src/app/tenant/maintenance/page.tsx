"use client";

import { useEffect, useState } from "react";
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
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";

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
  const [page, setPage] = useState(1);

  const myRequests = requests.filter((r) => r.tenant === tenantName);

  const totalPages = Math.max(1, Math.ceil(myRequests.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedRequests = myRequests.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE,
  );
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
      laborers: [],
      workDone: null,
      laborCost: null,
      itemCost: null,
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
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
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

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[9rem] px-4 py-3 sm:px-6">Property</Th>
            <Th className="hidden max-w-xs px-6 py-3 lg:table-cell">Issue</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">Priority</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">Assigned To</Th>
            <Th className="px-4 py-3 sm:px-6">Status</Th>
            <Th className="px-4 py-3 sm:px-6">Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {pagedRequests.map((request) => (
            <Tr key={request.id}>
              <Td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                <p className="truncate text-slate-500 sm:overflow-visible sm:whitespace-normal">
                  {request.property}
                </p>
                <p className="truncate text-xs text-slate-400 lg:hidden">
                  {request.issue.join("; ")}
                </p>
                <p className="text-xs text-slate-400 sm:hidden">
                  {request.priority} priority
                </p>
              </Td>
              <Td className="hidden max-w-xs px-6 py-3 text-slate-500 lg:table-cell">
                {request.issue.join("; ")}
              </Td>
              <Td className="hidden px-6 py-3 sm:table-cell">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[request.priority]}`}
                >
                  {request.priority}
                </span>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                {request.laborers.length > 0
                  ? `${request.laborers.length} worker${request.laborers.length === 1 ? "" : "s"}`
                  : "—"}
              </Td>
              <Td className="px-4 py-3 sm:px-6">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                >
                  {request.status}
                </span>
              </Td>
              <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                {request.status === "Completed" && !request.feedback ? (
                  <button
                    type="button"
                    onClick={() => setFeedbackId(request.id)}
                    aria-label={`Leave feedback for ${request.property}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Leave Feedback</span>
                  </button>
                ) : request.feedback ? (
                  <span className="text-xs italic text-slate-400">
                    &ldquo;{request.feedback}&rdquo;
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </Td>
            </Tr>
          ))}
          {pagedRequests.length === 0 && (
            <EmptyRow colSpan={6}>No maintenance requests yet.</EmptyRow>
          )}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={myRequests.length}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

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
