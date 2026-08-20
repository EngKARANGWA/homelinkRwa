"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, PlayCircle, Plus, UserPlus, Wrench } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import {
  assignMaintenanceRequest,
  completeMaintenanceRequest,
  listMaintenanceRequests,
  startMaintenanceProgress,
  type MaintenanceRequest,
} from "@/lib/api/maintenance";
import { listProperties } from "@/lib/api/properties";
import { listUsers } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Property, User } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import { MaintenanceRequestForm } from "@/components/admin/MaintenanceRequestForm";
import { CompleteRequestForm } from "@/components/admin/CompleteRequestForm";
import { MaintenanceDetail } from "@/components/admin/MaintenanceDetail";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

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

const STATUS_KEY: Record<MaintenanceRequest["status"], keyof Translations["dashboard"]["status"]> = {
  submitted: "submitted",
  assigned: "assigned",
  in_progress: "inProgress",
  completed: "completed",
};

const PRIORITY_KEY: Record<MaintenanceRequest["priority"], keyof Translations["dashboard"]["status"]> = {
  low: "low",
  medium: "medium",
  high: "high",
};

export default function MaintenancePage() {
  const { t } = useLanguage();
  const c = t.dashboard.admin.maintenance;
  const { user } = useAuth();

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewRequestOpen, setNewRequestOpen] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<MaintenanceRequest | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  const propertyFor = (id: string) => properties.find((p) => p.id === id);
  const tenantName = (id: string) => {
    const tenant = tenants.find((tt) => tt.id === id);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : "—";
  };
  const assigneeLabel = (assignedTo: string | null) => {
    if (!assignedTo) return "—";
    if (assignedTo === user?.id) return "You";
    return `Assignee ${assignedTo.slice(0, 8).toUpperCase()}`;
  };

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, propertiesRes, tenantsRes] = await Promise.all([
        listMaintenanceRequests({ page, limit: DEFAULT_PAGE_SIZE }),
        listProperties({ limit: 100 }),
        listUsers({ role: "tenant", limit: 100 }),
      ]);
      setRequests(data.data);
      setTotal(data.meta.total);
      setProperties(propertiesRes.data);
      setTenants(tenantsRes.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load maintenance requests.");
      console.error("Failed to load maintenance requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const assignToSelf = async (id: string) => {
    if (!user) return;
    try {
      const updated = await assignMaintenanceRequest(id, user.id);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      console.error("Failed to assign request:", err);
    }
  };

  const startProgress = async (id: string) => {
    try {
      const updated = await startMaintenanceProgress(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      console.error("Failed to start progress:", err);
    }
  };

  const completeRequest = async (id: string, workDone: string, itemCost: number) => {
    try {
      const updated = await completeMaintenanceRequest(id, {
        completionNotes: workDone,
        itemsCost: itemCost,
      });
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
          <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {c.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNewRequestOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          {c.newRequest}
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
          {c.successNotice}
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
                <Th className="max-w-[10rem] px-4 py-3 sm:px-6">{t.dashboard.table.tenant}</Th>
                <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.property}</Th>
                <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.issue}</Th>
                <Th className="hidden px-6 py-3 sm:table-cell">{t.dashboard.table.priority}</Th>
                <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.assignedTo}</Th>
                <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
                <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.costFeedback}</Th>
                <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
              </Tr>
            </THead>
            <TBody>
              {requests.map((request) => (
                <Tr key={request.id}>
                  <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                      {tenantName(request.tenantId)}
                    </p>
                    <p className="truncate text-xs text-slate-400 md:hidden">
                      {propertyFor(request.propertyId)?.title ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400 sm:hidden">
                      {c.priorityLabelTemplate.replace(
                        "{priority}",
                        t.dashboard.status[PRIORITY_KEY[request.priority]],
                      )}
                    </p>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {propertyFor(request.propertyId)?.title ?? "—"}
                  </Td>
                  <Td className="hidden max-w-xs px-6 py-3 text-slate-500 lg:table-cell">
                    {request.description}
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
                  <Td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                    >
                      {t.dashboard.status[STATUS_KEY[request.status]]}
                    </span>
                  </Td>
                  <Td className="hidden max-w-xs px-6 py-3 text-slate-500 lg:table-cell">
                    {request.status === "completed" ? (
                      <>
                        <p className="font-medium text-navy">
                          {formatMoney(
                            (Number(request.laborCost) || 0) + (Number(request.itemsCost) || 0),
                          )}{" "}
                          RWF
                        </p>
                        {request.completionNotes && (
                          <p className="text-xs italic text-slate-400">
                            &ldquo;{request.completionNotes}&rdquo;
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
                        {t.dashboard.actions.view}
                      </button>
                      {request.status === "submitted" && (
                        <button
                          type="button"
                          onClick={() => assignToSelf(request.id)}
                          aria-label={c.assignAriaTemplate.replace(
                            "{name}",
                            tenantName(request.tenantId),
                          )}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{c.assign}</span>
                        </button>
                      )}
                      {request.status === "assigned" && (
                        <button
                          type="button"
                          onClick={() => startProgress(request.id)}
                          aria-label={c.startAriaTemplate.replace(
                            "{name}",
                            tenantName(request.tenantId),
                          )}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{c.start}</span>
                        </button>
                      )}
                      {request.status === "in_progress" && (
                        <button
                          type="button"
                          onClick={() => setCompletingId(request.id)}
                          aria-label={c.markCompletedAriaTemplate.replace(
                            "{name}",
                            tenantName(request.tenantId),
                          )}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          <Wrench className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{c.markCompleted}</span>
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
          title={c.newRequestTitle}
          description={c.newRequestDescription}
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
          title={c.requestTitle}
          description={`${tenantName(viewingRequest.tenantId)} · ${propertyFor(viewingRequest.propertyId)?.title ?? "—"}`}
          onClose={() => setViewingRequest(null)}
        >
          <MaintenanceDetail
            request={viewingRequest}
            tenantLabel={tenantName(viewingRequest.tenantId)}
            propertyLabel={propertyFor(viewingRequest.propertyId)?.title ?? "—"}
            assigneeLabel={assigneeLabel(viewingRequest.assignedTo)}
          />
        </Modal>
      )}

      {completingId && (
        <Modal
          title={c.completeRequestTitle}
          description={c.completeRequestDescription}
          onClose={() => setCompletingId(null)}
        >
          <CompleteRequestForm
            onCancel={() => setCompletingId(null)}
            onSuccess={(workDone, itemCost) => completeRequest(completingId, workDone, itemCost)}
          />
        </Modal>
      )}
    </div>
  );
}
