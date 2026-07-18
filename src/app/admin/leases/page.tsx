"use client";

import { useState } from "react";
import { Check, CheckCircle2, Eye, Plus, X } from "lucide-react";
import { LEASES, type Lease } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { LeaseForm, type LeaseFormValues } from "@/components/admin/LeaseForm";
import { LeaseDocument } from "@/components/admin/LeaseDocument";

const STATUS_STYLES: Record<Lease["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  "Renewal Requested": "bg-amber-50 text-amber-700",
  "Termination Requested": "bg-amber-50 text-amber-700",
  Terminated: "bg-red-50 text-red-700",
  Expired: "bg-slate-100 text-slate-600",
};

export default function LeasesPage() {
  const [leases, setLeases] = useState(LEASES);
  const [isModalOpen, setModalOpen] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [viewingLease, setViewingLease] = useState<Lease | null>(null);

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
          <h1 className="text-2xl font-bold text-navy">Leases</h1>
          <p className="mt-1 text-sm text-slate-500">
            Digital lease agreements across the platform.
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

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="max-w-[10rem] px-4 py-3 font-medium sm:px-6">Tenant</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Property</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">Owner</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Rent (RWF)</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">Term</th>
              <th className="px-4 py-3 font-medium sm:px-6">Status</th>
              <th className="px-4 py-3 font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leases.map((lease) => (
              <tr key={lease.id} className="border-t border-slate-100">
                <td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {lease.tenant}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {lease.property} · {lease.rent.toLocaleString()} RWF
                  </p>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {lease.property}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 lg:table-cell">{lease.owner}</td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {lease.rent.toLocaleString()}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {lease.startDate} → {lease.endDate ?? "Open-ended"}
                </td>
                <td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[lease.status]}`}
                  >
                    {lease.status}
                  </span>
                </td>
                <td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingLease(lease)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>

                    {(lease.status === "Renewal Requested" ||
                      lease.status === "Termination Requested") && (
                      <>
                        <button
                          type="button"
                          onClick={() => resolveRequest(lease.id, true)}
                          aria-label={`Approve request for ${lease.tenant}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => resolveRequest(lease.id, false)}
                          aria-label={`Reject request for ${lease.tenant}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal
          title="Create Lease"
          description="Create a new digital lease agreement."
          onClose={() => setModalOpen(false)}
        >
          <LeaseForm onCancel={() => setModalOpen(false)} onSuccess={addLease} />
        </Modal>
      )}

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
