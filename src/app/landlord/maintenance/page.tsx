"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, PlayCircle, UserPlus, Wrench } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { listProperties } from "@/lib/api/properties";
import {
  assignMaintenanceRequest,
  completeMaintenanceRequest,
  listMaintenanceRequests,
  startMaintenanceProgress,
  type MaintenancePriority,
  type MaintenanceRequest,
  type MaintenanceStatus,
} from "@/lib/api/maintenance";
import { ApiError } from "@/lib/api/client";
import type { Property } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import {
  CompleteMaintenanceForm,
  type CompleteMaintenanceValues,
} from "@/components/landlord/CompleteMaintenanceForm";
import { Card } from "@/components/dashboard/Card";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

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

const STATUS_KEY: Record<MaintenanceStatus, keyof Translations["dashboard"]["status"]> = {
  submitted: "submitted",
  assigned: "assigned",
  in_progress: "inProgress",
  completed: "completed",
};

const PRIORITY_KEY: Record<MaintenancePriority, keyof Translations["dashboard"]["status"]> = {
  low: "low",
  medium: "medium",
  high: "high",
};

export default function LandlordMaintenancePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const c = t.dashboard.landlord.maintenance;
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<MaintenanceRequest | null>(null);

  const [propertyFilter, setPropertyFilter] = useState(t.dashboard.landlord.payments.allProperties);
  const [statusFilter, setStatusFilter] = useState<"All" | MaintenanceStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | MaintenancePriority>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const propertyById = new Map(properties.map((p) => [p.id, p]));
  const propertyOptions = [t.dashboard.landlord.payments.allProperties, ...properties.map((p) => p.title)];
  const propertyIdFor = (name: string) => properties.find((p) => p.title === name)?.id;

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      listMaintenanceRequests({
        limit: 100,
        status: statusFilter === "All" ? undefined : statusFilter,
        propertyId:
          propertyFilter === t.dashboard.landlord.payments.allProperties
            ? undefined
            : propertyIdFor(propertyFilter),
      }),
      listProperties({ ownerId: user.id, limit: 100 }),
    ])
      .then(([requestsRes, propertiesRes]) => {
        setRequests(requestsRes.data);
        setProperties(propertiesRes.data);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load maintenance requests."),
      )
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [user, statusFilter, propertyFilter]);

  const filteredRequests = requests
    .filter((r) => priorityFilter === "All" || r.priority === priorityFilter)
    .filter((r) => !dateFrom || r.createdAt.slice(0, 10) >= dateFrom)
    .filter((r) => !dateTo || r.createdAt.slice(0, 10) <= dateTo);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedRequests = filteredRequests.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE,
  );

  const assigneeLabel = (assignedTo: string | null) => {
    if (!assignedTo) return "—";
    if (assignedTo === user?.id) return "You";
    return `Assignee ${assignedTo.slice(0, 8).toUpperCase()}`;
  };

  const handleAssignToMe = async (id: string) => {
    if (!user) return;
    setActionError(null);
    setProcessingId(id);
    try {
      await assignMaintenanceRequest(id, user.id);
      setNotice("Request assigned to you.");
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to assign request.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleStartProgress = async (id: string) => {
    setActionError(null);
    setProcessingId(id);
    try {
      await startMaintenanceProgress(id);
      setNotice("Request moved to In Progress.");
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update request.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (values: CompleteMaintenanceValues) => {
    if (!completingId) return;
    setActionError(null);
    setProcessingId(completingId);
    try {
      await completeMaintenanceRequest(completingId, values);
      setNotice("Request marked completed.");
      setCompletingId(null);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to complete request.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.subtitle}
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      {(error || actionError) && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error ?? actionError}
          </span>
          {error && (
            <button type="button" onClick={load} className="underline hover:no-underline">
              Retry
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {t.dashboard.table.property}
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {propertyOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {t.dashboard.table.status}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">{t.dashboard.actions.all}</option>
            <option value="submitted">{t.dashboard.status.submitted}</option>
            <option value="assigned">{t.dashboard.status.assigned}</option>
            <option value="in_progress">{t.dashboard.status.inProgress}</option>
            <option value="completed">{t.dashboard.status.completed}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {t.dashboard.table.priority}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">{t.dashboard.actions.all}</option>
            <option value="low">{t.dashboard.status.low}</option>
            <option value="medium">{t.dashboard.status.medium}</option>
            <option value="high">{t.dashboard.status.high}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {t.dashboard.table.start}
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {t.dashboard.table.end}
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        {(propertyFilter !== t.dashboard.landlord.payments.allProperties ||
          statusFilter !== "All" ||
          priorityFilter !== "All" ||
          dateFrom ||
          dateTo) && (
          <button
            type="button"
            onClick={() => {
              setPropertyFilter(t.dashboard.landlord.payments.allProperties);
              setStatusFilter("All");
              setPriorityFilter("All");
              setDateFrom("");
              setDateTo("");
            }}
            className="text-sm font-medium text-slate-500 hover:text-navy"
          >
            {c.clearFilters}
          </button>
        )}
      </div>

      <Card title={c.requestsTitle}>
        <p className="mt-1 text-sm text-slate-500">
          {c.requestsSubtitle}
        </p>
        <Table variant="card">
          <THead>
            <Tr>
              <Th className="max-w-[10rem] px-4 py-3 sm:px-6">{t.dashboard.table.property}</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.issue}</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">{t.dashboard.table.priority}</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.assignedTo}</Th>
              <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.submitted}</Th>
              <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
              <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <EmptyRow colSpan={7}>Loading maintenance requests...</EmptyRow>
            ) : pagedRequests.length === 0 ? (
              <EmptyRow colSpan={7}>{c.noRequestsMatch}</EmptyRow>
            ) : (
              pagedRequests.map((request) => {
                const isProcessing = processingId === request.id;
                return (
                  <Tr key={request.id}>
                    <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                      <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                        {propertyById.get(request.propertyId)?.title ?? "—"}
                      </p>
                      <p className="truncate text-xs text-slate-400 lg:hidden">
                        {request.title}
                      </p>
                    </Td>
                    <Td className="hidden max-w-xs px-6 py-3 text-slate-500 lg:table-cell">
                      {request.title}
                    </Td>
                    <Td className="hidden px-6 py-3 sm:table-cell">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[request.priority]}`}
                      >
                        {t.dashboard.status[PRIORITY_KEY[request.priority]]}
                      </span>
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                      {assigneeLabel(request.assignedTo)}
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                      {request.createdAt.slice(0, 10)}
                    </Td>
                    <Td className="px-4 py-3 sm:px-6">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                      >
                        {t.dashboard.status[STATUS_KEY[request.status]]}
                      </span>
                    </Td>
                    <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingRequest(request)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t.dashboard.actions.view}
                        </button>
                        {request.status === "submitted" && (
                          <button
                            type="button"
                            onClick={() => handleAssignToMe(request.id)}
                            disabled={isProcessing}
                            aria-label={`Assign ${request.title} to me`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                              {isProcessing ? "Assigning..." : "Assign to Me"}
                            </span>
                          </button>
                        )}
                        {request.status === "assigned" && (
                          <button
                            type="button"
                            onClick={() => handleStartProgress(request.id)}
                            disabled={isProcessing}
                            aria-label={`Start progress on ${request.title}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Start</span>
                          </button>
                        )}
                        {(request.status === "assigned" || request.status === "in_progress") && (
                          <button
                            type="button"
                            onClick={() => setCompletingId(request.id)}
                            disabled={isProcessing}
                            aria-label={`Mark completed for ${request.title}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Mark Completed</span>
                          </button>
                        )}
                      </div>
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
          totalItems={filteredRequests.length}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>

      {viewingRequest && (
        <Modal
          title="Maintenance Request"
          description={propertyById.get(viewingRequest.propertyId)?.title ?? "Request"}
          onClose={() => setViewingRequest(null)}
        >
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Title
              </p>
              <p className="mt-1 text-sm font-medium text-navy">{viewingRequest.title}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Description
              </p>
              <p className="mt-1 text-sm text-slate-600">{viewingRequest.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t.dashboard.table.priority}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[viewingRequest.priority]}`}
                >
                  {t.dashboard.status[PRIORITY_KEY[viewingRequest.priority]]}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t.dashboard.table.status}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[viewingRequest.status]}`}
                >
                  {t.dashboard.status[STATUS_KEY[viewingRequest.status]]}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t.dashboard.table.assignedTo}
                </p>
                <p className="mt-1 text-sm font-medium text-navy">
                  {assigneeLabel(viewingRequest.assignedTo)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t.dashboard.table.submitted}
                </p>
                <p className="mt-1 text-sm font-medium text-navy">
                  {viewingRequest.createdAt.slice(0, 10)}
                </p>
              </div>
            </div>
            {viewingRequest.status === "completed" && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Completion Notes
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {viewingRequest.completionNotes ?? "—"}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Labor cost</span>
                    <span className="font-medium text-navy">
                      {formatMoney(Number(viewingRequest.laborCost ?? 0))} RWF
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Items / materials cost</span>
                    <span className="font-medium text-navy">
                      {formatMoney(Number(viewingRequest.itemsCost ?? 0))} RWF
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
                    <span className="font-medium text-slate-600">Total expense</span>
                    <span className="font-bold text-navy">
                      {formatMoney(
                        Number(viewingRequest.laborCost ?? 0) +
                          Number(viewingRequest.itemsCost ?? 0),
                      )}{" "}
                      RWF
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {completingId && (
        <Modal
          title="Complete Request"
          description="Confirm the work that was done."
          onClose={() => setCompletingId(null)}
        >
          <CompleteMaintenanceForm
            onCancel={() => setCompletingId(null)}
            onSuccess={handleComplete}
          />
        </Modal>
      )}
    </div>
  );
}
