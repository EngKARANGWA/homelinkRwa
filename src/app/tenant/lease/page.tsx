"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { LEASES, type Lease } from "@/lib/mock-admin-data";
import { useTenant } from "@/components/tenant/TenantContext";
import { getTenantUnitNumber } from "@/lib/units";
import { Modal } from "@/components/admin/Modal";
import { LeaseDocument } from "@/components/admin/LeaseDocument";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";

const STATUS_STYLES: Record<Lease["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  "Renewal Requested": "bg-amber-50 text-amber-700",
  "Termination Requested": "bg-amber-50 text-amber-700",
  Terminated: "bg-red-50 text-red-700",
  Expired: "bg-slate-100 text-slate-600",
};

export default function TenantLeasePage() {
  const { tenantName } = useTenant();
  const [leases, setLeases] = useState(LEASES);
  const [viewingLease, setViewingLease] = useState<Lease | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const myLeases = leases.filter((l) => l.tenant === tenantName);

  const totalPages = Math.max(1, Math.ceil(myLeases.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedLeases = myLeases.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

  const requestChange = (
    id: string,
    status: "Renewal Requested" | "Termination Requested",
  ) => {
    setLeases((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l)),
    );
    setNotice(
      status === "Renewal Requested"
        ? "Renewal request sent to your landlord."
        : "Termination request sent to your landlord.",
    );
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

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[10rem] px-4 py-3 sm:px-6">Property</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">Unit</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Owner</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">Rent (RWF)</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">Term</Th>
            <Th className="px-4 py-3 sm:px-6">Status</Th>
            <Th className="px-4 py-3 sm:px-6">Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {pagedLeases.map((lease) => {
            const unitNumber = getTenantUnitNumber(lease.property, lease.tenant);
            return (
            <Tr key={lease.id}>
              <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                  {lease.property}
                </p>
                <p className="truncate text-xs text-slate-400 md:hidden">
                  {unitNumber ? `Unit ${unitNumber} · ` : ""}
                  {lease.owner} · {formatMoney(lease.rent)} RWF
                </p>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                {unitNumber ?? "—"}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">{lease.owner}</Td>
              <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                {formatMoney(lease.rent)}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                {lease.startDate} → {lease.endDate ?? "Open-ended"}
              </Td>
              <Td className="px-4 py-3 sm:px-6">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[lease.status]}`}
                >
                  {lease.status}
                </span>
              </Td>
              <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingLease(lease)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                  {lease.status === "Active" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          requestChange(lease.id, "Renewal Requested")
                        }
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Request Renewal
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          requestChange(lease.id, "Termination Requested")
                        }
                        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Request Termination
                      </button>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
            );
          })}
          {pagedLeases.length === 0 && (
            <EmptyRow colSpan={7}>No lease agreements on file yet.</EmptyRow>
          )}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={myLeases.length}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {viewingLease && (
        <Modal
          title="Lease Agreement"
          description={`${viewingLease.tenant} · ${viewingLease.property}`}
          onClose={() => setViewingLease(null)}
          maxWidthClassName="max-w-3xl"
        >
          <LeaseDocument lease={viewingLease} />
        </Modal>
      )}
    </div>
  );
}
