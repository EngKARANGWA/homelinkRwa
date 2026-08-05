"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, MessageSquarePlus, Plus } from "lucide-react";
import { listProperties } from "@/lib/api/properties";
import { listLeases } from "@/lib/api/leases";
import {
  createMaintenanceRequest,
  getMaintenanceFeedback,
  listMaintenanceRequests,
  submitMaintenanceFeedback,
  type MaintenanceFeedback,
  type MaintenancePriority,
  type MaintenanceRequest,
  type MaintenanceStatus,
} from "@/lib/api/maintenance";
import { ApiError } from "@/lib/api/client";
import type { Lease, Property } from "@/lib/api/types";
import { formatStatusLabel } from "@/lib/paymentStatus";
import { Modal } from "@/components/admin/Modal";
import {
  MaintenanceRequestForm,
  type NewMaintenanceRequestValues,
} from "@/components/tenant/MaintenanceRequestForm";
import { FeedbackForm } from "@/components/tenant/FeedbackForm";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";

const STATUS_STYLES: Record<MaintenanceStatus, string> = {
  submitted: "bg-amber-50 text-amber-700",
  assigned: "bg-sky-50 text-sky-700",
  in_progress: "bg-sky-50 text-sky-700",
  completed: "bg-emerald-50 text-emerald-700",
};

const PRIORITY_STYLES: Record<MaintenancePriority, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};

export default function TenantMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentLease, setCurrentLease] = useState<Lease | null>(null);
  const [feedbackByRequestId, setFeedbackByRequestId] = useState<
    Record<string, MaintenanceFeedback | null>
  >({});
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewRequestOpen, setNewRequestOpen] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const propertyById = new Map(properties.map((p) => [p.id, p]));

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      listMaintenanceRequests({ limit: 100 }),
      listProperties({ limit: 100 }),
      listLeases({ status: "active", limit: 1 }),
    ])
      .then(async ([requestsRes, propertiesRes, leasesRes]) => {
        setRequests(requestsRes.data);
        setProperties(propertiesRes.data);
        setCurrentLease(leasesRes.data[0] ?? null);

        const completed = requestsRes.data.filter((r) => r.status === "completed");
        const feedbackEntries = await Promise.all(
          completed.map(async (r) => [r.id, await getMaintenanceFeedback(r.id)] as const),
        );
        setFeedbackByRequestId(Object.fromEntries(feedbackEntries));
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load maintenance requests."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const totalPages = Math.max(1, Math.ceil(requests.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedRequests = requests.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

  const submitRequest = async (values: NewMaintenanceRequestValues) => {
    if (!currentLease) return;
    setError(null);
    try {
      await createMaintenanceRequest({ propertyId: currentLease.propertyId, ...values });
      setNewRequestOpen(false);
      setNotice("Maintenance request submitted.");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit request.");
    }
  };

  const submitFeedback = async (rating: number, comment?: string) => {
    if (!feedbackId) return;
    setError(null);
    try {
      await submitMaintenanceFeedback(feedbackId, rating, comment);
      setFeedbackId(null);
      setNotice("Thanks for your feedback.");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit feedback.");
    }
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

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
          <button type="button" onClick={load} className="underline hover:no-underline">
            Retry
          </button>
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
          {isLoading ? (
            <EmptyRow colSpan={6}>Loading maintenance requests...</EmptyRow>
          ) : pagedRequests.length === 0 ? (
            <EmptyRow colSpan={6}>No maintenance requests yet.</EmptyRow>
          ) : (
            pagedRequests.map((request) => {
              const feedback = feedbackByRequestId[request.id];
              return (
                <Tr key={request.id}>
                  <Td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate text-slate-500 sm:overflow-visible sm:whitespace-normal">
                      {propertyById.get(request.propertyId)?.title ?? "—"}
                    </p>
                    <p className="truncate text-xs text-slate-400 lg:hidden">
                      {request.title}
                    </p>
                    <p className="text-xs text-slate-400 sm:hidden">
                      {formatStatusLabel(request.priority)} priority
                    </p>
                  </Td>
                  <Td className="hidden max-w-xs px-6 py-3 text-slate-500 lg:table-cell">
                    {request.title}
                  </Td>
                  <Td className="hidden px-6 py-3 sm:table-cell">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[request.priority]}`}
                    >
                      {formatStatusLabel(request.priority)}
                    </span>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                    {request.assignedTo ? "Assigned" : "—"}
                  </Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                    >
                      {formatStatusLabel(request.status)}
                    </span>
                  </Td>
                  <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                    {request.status === "completed" && !feedback ? (
                      <button
                        type="button"
                        onClick={() => setFeedbackId(request.id)}
                        aria-label={`Leave feedback for ${request.title}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <MessageSquarePlus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Leave Feedback</span>
                      </button>
                    ) : feedback ? (
                      <span className="text-xs italic text-slate-400">
                        &ldquo;{feedback.comment ?? `${feedback.rating}/5`}&rdquo;
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </Td>
                </Tr>
              );
            })
          )}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={requests.length}
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
            property={propertyById.get(currentLease.propertyId)?.title ?? "Your property"}
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
          <FeedbackForm onCancel={() => setFeedbackId(null)} onSuccess={submitFeedback} />
        </Modal>
      )}
    </div>
  );
}
