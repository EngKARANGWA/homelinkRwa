"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye } from "lucide-react";
import { listProperties } from "@/lib/api/properties";
import {
  getLeaseDocument,
  listLeases,
  requestLeaseRenewal,
  requestLeaseTermination,
} from "@/lib/api/leases";
import { ApiError } from "@/lib/api/client";
import type { Lease, Property } from "@/lib/api/types";
import { formatLeaseStatus, LEASE_STATUS_STYLES } from "@/lib/leaseStatus";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";

export default function TenantLeasePage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const propertyFor = (id: string) => properties.find((p) => p.id === id);
  const ownerName = (id: string) => `Owner ${id.slice(0, 8).toUpperCase()}`;

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      listLeases({ page, limit: DEFAULT_PAGE_SIZE }),
      listProperties({ limit: 100 }),
    ])
      .then(([leasesRes, propertiesRes]) => {
        setLeases(leasesRes.data);
        setTotalPages(leasesRes.meta.totalPages);
        setTotalItems(leasesRes.meta.total);
        setProperties(propertiesRes.data);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load your leases."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

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

  const requestChange = async (lease: Lease, type: "renewal" | "termination") => {
    if (type === "renewal") {
      const proposedEndDate = window.prompt(
        "Proposed new end date (YYYY-MM-DD):",
        lease.endDate ?? "",
      )?.trim();
      if (!proposedEndDate) return;
      setActionError(null);
      setProcessingId(lease.id);
      try {
        await requestLeaseRenewal(lease.id, { proposedEndDate });
        setNotice("Renewal request sent to your landlord.");
        load();
      } catch (err) {
        setActionError(
          err instanceof ApiError ? err.message : "Failed to submit the request.",
        );
      } finally {
        setProcessingId(null);
      }
      return;
    }

    setActionError(null);
    setProcessingId(lease.id);
    try {
      await requestLeaseTermination(lease.id);
      setNotice("Termination request sent to your landlord.");
      load();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Failed to submit the request.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Lease</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your lease agreements on HomeLink Rwanda.
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

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[10rem] px-4 py-3 sm:px-6">Property</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Owner</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">Rent (RWF)</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">Term</Th>
            <Th className="px-4 py-3 sm:px-6">Status</Th>
            <Th className="px-4 py-3 sm:px-6">Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {isLoading ? (
            <EmptyRow colSpan={6}>Loading your leases...</EmptyRow>
          ) : leases.length === 0 ? (
            <EmptyRow colSpan={6}>No lease agreements on file yet.</EmptyRow>
          ) : (
            leases.map((lease) => {
              const property = propertyFor(lease.propertyId);
              const isProcessing = processingId === lease.id;
              return (
                <Tr key={lease.id}>
                  <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                      {property?.title ?? "—"}
                    </p>
                    <p className="truncate text-xs text-slate-400 md:hidden">
                      {ownerName(lease.ownerId)} · {formatMoney(Number(lease.rentAmount))} RWF
                    </p>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {ownerName(lease.ownerId)}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
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
                      {lease.status === "active" && (
                        <>
                          <button
                            type="button"
                            onClick={() => requestChange(lease, "renewal")}
                            disabled={isProcessing}
                            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Request Renewal
                          </button>
                          <button
                            type="button"
                            onClick={() => requestChange(lease, "termination")}
                            disabled={isProcessing}
                            className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Request Termination
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
    </div>
  );
}
