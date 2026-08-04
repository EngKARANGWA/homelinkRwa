"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, PlayCircle, Plus, UserPlus, Wrench } from "lucide-react";
import {
  listMaintenanceRequests,
  assignLaborers,
  startProgress as startProgressAPI,
  completeMaintenanceRequest,
  type MaintenanceRequest,
  type Laborer,
} from "@/lib/api/maintenance";
import { ApiError } from "@/lib/api/client";
import { Modal } from "@/components/admin/Modal";
import { MaintenanceRequestForm } from "@/components/admin/MaintenanceRequestForm";
import { AssignHandlerForm } from "@/components/admin/AssignHandlerForm";
import { CompleteRequestForm } from "@/components/admin/CompleteRequestForm";
import { MaintenanceDetail } from "@/components/admin/MaintenanceDetail";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";

const STATUS_STYLES: Record<MaintenanceRequest["status"], string> = {
  submitted: "bg-amber-50 text-amber-700",
  assigned: "bg-sky-50 text-sky-700",
  in_progress: "bg-sky-50 text-sky-700",
  completed: "bg-emerald-50 text-emerald-700",
};

const PRIORITY_STYLES: Record<MaintenanceRequest["priority"], string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};

const STATUS_DISPLAY: Record<MaintenanceRequest["status"], string> = {
  submitted: "Submitted",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
};

const PRIORITY_DISPLAY: Record<MaintenanceRequest["priority"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewRequestOpen, setNewRequestOpen] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<MaintenanceRequest | null>(null);
  const [page, setPage] = useState(1);

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listMaintenanceRequests({ page, limit: DEFAULT_PAGE_SIZE });
      setRequests(data.data);
      setTotal(data.meta.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load maintenance requests.");
      console.error("Failed to load maintenance requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  const startProgress = async (id: string) => {
    try {
      const updated = await startProgressAPI(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      console.error("Failed to start progress:", err);
    }
  };

  const assignHandler = async (id: string, laborers: Laborer[]) => {
    try {
      const updated = await assignLaborers(id, { laborers });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setAssigningId(null);
    } catch (err) {
      console.error("Failed to assign laborers:", err);
    }
  };

  const completeRequest = async (
    id: string,
    workDone: string,
    itemCost: number,
    feedback?: string,
  ) => {
    try {
      const updated = await completeMaintenanceRequest(id, { workDone, itemCost, feedback });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setCompletingId(null);
    } catch (err) {
      console.error("Failed to complete request:", err);
    }
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

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadRequests}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {justSubmitted && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Maintenance request submitted.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-gold" />
            <p className="mt-2 text-sm text-slate-500">Loading maintenance requests...</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-8 text-center">
          <Wrench className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-medium text-slate-600">No maintenance requests yet</p>
          <p className="text-xs text-slate-500">Submitted requests will appear here.</p>
        </div>
      ) : (
        <>
          <Table variant="standalone">
            <THead>
              <Tr>
                <Th className="max-w-[10rem] px-4 py-3 sm:px-6">Tenant</Th>
                <Th className="hidden px-6 py-3 md:table-cell">Property</Th>
                <Th className="hidden px-6 py-3 lg:table-cell">Issue</Th>
                <Th className="hidden px-6 py-3 sm:table-cell">Priority</Th>
                <Th className="hidden px-6 py-3 lg:table-cell">Assigned To</Th>
                <Th className="px-4 py-3 sm:px-6">Status</Th>
                <Th className="hidden px-6 py-3 lg:table-cell">Cost / Feedback</Th>
                <Th className="px-4 py-3 sm:px-6">Actions</Th>
              </Tr>
            </THead>
            <TBody>
              {requests.map((request) => (
                <Tr key={request.id}>
                  <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                      {request.tenantName}
                    </p>
                    <p className="truncate text-xs text-slate-400 md:hidden">
                      {request.propertyName}
                    </p>
                    <p className="text-xs text-slate-400 sm:hidden">
                      {PRIORITY_DISPLAY[request.priority]} priority
                    </p>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {request.propertyName}
                  </Td>
                  <Td className="hidden max-w-xs px-6 py-3 text-slate-500 lg:table-cell">
                    {request.description}
                  </Td>
                  <Td className="hidden px-6 py-3 sm:table-cell">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[request.priority]}`}
                    >
                      {PRIORITY_DISPLAY[request.priority]}
                    </span>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                    {request.assignedLaborers.length > 0
                      ? `${request.assignedLaborers.length} worker${request.assignedLaborers.length === 1 ? "" : "s"}`
                      : "—"}
                  </Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                    >
                      {STATUS_DISPLAY[request.status]}
                    </span>
                  </Td>
                  <Td className="hidden max-w-xs px-6 py-3 text-slate-500 lg:table-cell">
                    {request.status === "completed" ? (
                      <>
                        <p className="font-medium text-navy">
                          {formatMoney((request.laborCost ?? 0) + (request.itemCost ?? 0))}{" "}
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
                  </Td>
                  <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingRequest(request)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                      {request.status === "submitted" && (
                        <button
                          type="button"
                          onClick={() => setAssigningId(request.id)}
                          aria-label={`Assign handler for ${request.tenantName}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Assign</span>
                        </button>
                      )}
                      {request.status === "assigned" && (
                        <button
                          type="button"
                          onClick={() => startProgress(request.id)}
                          aria-label={`Start progress for ${request.tenantName}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Start</span>
                        </button>
                      )}
                      {request.status === "in_progress" && (
                        <button
                          type="button"
                          onClick={() => setCompletingId(request.id)}
                          aria-label={`Mark completed for ${request.tenantName}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          <Wrench className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Mark Completed</span>
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

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
              setTimeout(() => setJustSubmitted(false), 5000);
              loadRequests();
            }}
          />
        </Modal>
      )}

      {viewingRequest && (
        <Modal
          title="Maintenance Request"
          description={`${viewingRequest.tenantName} · ${viewingRequest.propertyName}`}
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
