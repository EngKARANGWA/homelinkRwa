"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, CheckCircle2, Eye, Plus, X } from "lucide-react";
import { listUsers } from "@/lib/api/admin";
import { listProperties } from "@/lib/api/properties";
import {
  approveLeaseChangeRequest,
  createLease,
  getLeaseDocument,
  listLeaseChangeRequests,
  listLeases,
  rejectLeaseChangeRequest,
} from "@/lib/api/leases";
import { ApiError } from "@/lib/api/client";
import type { CreateLeaseInput, Lease, Property, User } from "@/lib/api/types";
import { formatLeaseStatus, LEASE_STATUS_STYLES } from "@/lib/leaseStatus";
import { useAuth } from "@/components/auth/AuthContext";
import { Modal } from "@/components/admin/Modal";
import { LeaseForm } from "@/components/admin/LeaseForm";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";

export default function LandlordLeasesPage() {
  const { user } = useAuth();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const propertyFor = (id: string) => properties.find((p) => p.id === id);
  const tenantName = (id: string) => {
    const tenant = tenants.find((t) => t.id === id);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : "—";
  };

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      listLeases({ page, limit: DEFAULT_PAGE_SIZE }),
      listProperties({ ownerId: user.id, limit: 100 }),
      listUsers({ role: "tenant", limit: 100 }),
    ])
      .then(([leasesRes, propertiesRes, tenantsRes]) => {
        setLeases(leasesRes.data);
        setTotalPages(leasesRes.meta.totalPages);
        setTotalItems(leasesRes.meta.total);
        setProperties(propertiesRes.data);
        setTenants(tenantsRes.data);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load leases."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [user, page]);

  const addLease = async (values: CreateLeaseInput) => {
    setFormError(null);
    try {
      await createLease(values);
      setModalOpen(false);
      setJustCreated(true);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create lease.");
    }
  };

  const viewDocument = async (lease: Lease) => {
    setActionError(null);
    try {
      const { url } = await getLeaseDocument(lease.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Failed to load lease document.",
      );
    }
  };

  const resolveRequest = async (lease: Lease, approve: boolean) => {
    setActionError(null);
    setProcessingId(lease.id);
    try {
      const changeRequests = await listLeaseChangeRequests(lease.id);
      const pending = changeRequests.find((cr) => cr.status === "pending");
      if (!pending) {
        setActionError("No pending change request found for this lease.");
        return;
      }
      if (approve) {
        await approveLeaseChangeRequest(pending.id);
      } else {
        await rejectLeaseChangeRequest(pending.id);
      }
      load();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Failed to resolve the request.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Leases</h1>
          <p className="mt-1 text-sm text-slate-500">
            Lease agreements on your properties.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Create Lease
        </button>
      </div>

      {justCreated && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Lease created successfully.
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

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[10rem] px-4 py-3 sm:px-6">Tenant</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Property</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Rent (RWF)</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">Term</Th>
            <Th className="px-4 py-3 sm:px-6">Status</Th>
            <Th className="px-4 py-3 sm:px-6">Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {isLoading ? (
            <EmptyRow colSpan={6}>Loading leases...</EmptyRow>
          ) : leases.length === 0 ? (
            <EmptyRow colSpan={6}>No leases on your properties yet.</EmptyRow>
          ) : (
            leases.map((lease) => {
              const property = propertyFor(lease.propertyId);
              const name = tenantName(lease.tenantId);
              const isProcessing = processingId === lease.id;
              return (
                <Tr key={lease.id}>
                  <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                      {name}
                    </p>
                    <p className="truncate text-xs text-slate-400 md:hidden">
                      {property?.title ?? "—"} · {formatMoney(Number(lease.rentAmount))} RWF
                    </p>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {property?.title ?? "—"}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {formatMoney(Number(lease.rentAmount))}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                    {lease.startDate} → {lease.endDate ?? "Open-ended"}
                  </Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${LEASE_STATUS_STYLES[lease.status]}`}
                    >
                      {formatLeaseStatus(lease.status)}
                    </span>
                  </Td>
                  <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => viewDocument(lease)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>

                      {(lease.status === "renewal_requested" ||
                        lease.status === "termination_requested") && (
                        <>
                          <button
                            type="button"
                            onClick={() => resolveRequest(lease, true)}
                            disabled={isProcessing}
                            aria-label={`Approve request for ${name}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveRequest(lease, false)}
                            disabled={isProcessing}
                            aria-label={`Reject request for ${name}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
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
        totalItems={totalItems}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {isModalOpen && (
        <Modal
          title="Create Lease"
          description="Create a new digital lease agreement."
          onClose={() => setModalOpen(false)}
        >
          {formError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
          <LeaseForm
            properties={properties}
            tenants={tenants}
            onCancel={() => setModalOpen(false)}
            onSuccess={addLease}
          />
        </Modal>
      )}
    </div>
  );
}
