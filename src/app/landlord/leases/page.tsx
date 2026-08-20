"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, Eye, Plus, X } from "lucide-react";
import { LEASES, PROPERTIES, type Lease } from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import { LeaseForm, type LeaseFormValues } from "@/components/admin/LeaseForm";
import { LeaseDocument } from "@/components/admin/LeaseDocument";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const STATUS_STYLES: Record<Lease["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  "Renewal Requested": "bg-amber-50 text-amber-700",
  "Termination Requested": "bg-amber-50 text-amber-700",
  Terminated: "bg-red-50 text-red-700",
  Expired: "bg-slate-100 text-slate-600",
};

const STATUS_KEY: Record<Lease["status"], keyof Translations["dashboard"]["status"]> = {
  Active: "active",
  "Renewal Requested": "renewalRequested",
  "Termination Requested": "terminationRequested",
  Terminated: "terminated",
  Expired: "expired",
};

export default function LandlordLeasesPage() {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.leases;
  const lc = t.dashboard.admin.leases;
  const { landlordName } = useLandlord();
  const [leases, setLeases] = useState(LEASES);
  const [isModalOpen, setModalOpen] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [viewingLease, setViewingLease] = useState<Lease | null>(null);

  const myLeases = leases.filter((l) => l.owner === landlordName);
  const myProperties = PROPERTIES.filter((p) => p.owner === landlordName);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(myLeases.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedLeases = myLeases.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

  const addLease = (values: LeaseFormValues) => {
    const newLease: Lease = {
      id: String(Date.now()),
      status: "Active",
      ...values,
    };
    setLeases((prev) => [newLease, ...prev]);
    setModalOpen(false);
    setJustCreated(true);
  };

  const resolveRequest = (id: string, approve: boolean) => {
    setLeases((prev) =>
      prev.map((lease) => {
        if (lease.id !== id) return lease;
        if (lease.status === "Renewal Requested") {
          return { ...lease, status: approve ? "Active" : "Expired" };
        }
        if (lease.status === "Termination Requested") {
          return { ...lease, status: approve ? "Terminated" : "Active" };
        }
        return lease;
      }),
    );
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
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          {lc.createLease}
        </button>
      </div>

      {justCreated && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {lc.successNotice}
        </div>
      )}

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[10rem] px-4 py-3 sm:px-6">{t.dashboard.table.tenant}</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.property}</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.rentRwf}</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.term}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
          </Tr>
        </THead>
        <TBody>
          {pagedLeases.map((lease) => (
            <Tr key={lease.id}>
              <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                  {lease.tenant}
                </p>
                <p className="truncate text-xs text-slate-400 md:hidden">
                  {lease.property} · {formatMoney(lease.rent)} RWF
                </p>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">{lease.property}</Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {formatMoney(lease.rent)}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                {lease.startDate} → {lease.endDate ?? lc.openEnded}
              </Td>
              <Td className="px-4 py-3 sm:px-6">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[lease.status]}`}
                >
                  {t.dashboard.status[STATUS_KEY[lease.status]]}
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
                    {t.dashboard.actions.view}
                  </button>

                  {(lease.status === "Renewal Requested" ||
                    lease.status === "Termination Requested") && (
                    <>
                      <button
                        type="button"
                        onClick={() => resolveRequest(lease.id, true)}
                        aria-label={lc.approveRequestAriaTemplate.replace("{name}", lease.tenant)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveRequest(lease.id, false)}
                        aria-label={lc.rejectRequestAriaTemplate.replace("{name}", lease.tenant)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
          {pagedLeases.length === 0 && (
            <EmptyRow colSpan={6}>{c.noLeases}</EmptyRow>
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

      {isModalOpen && (
        <Modal
          title={lc.createTitle}
          description={lc.createDescription}
          onClose={() => setModalOpen(false)}
        >
          <LeaseForm
            properties={myProperties}
            onCancel={() => setModalOpen(false)}
            onSuccess={addLease}
          />
        </Modal>
      )}

      {viewingLease && (
        <Modal
          title={lc.agreementTitle}
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
