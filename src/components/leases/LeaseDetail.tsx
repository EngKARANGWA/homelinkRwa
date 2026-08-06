"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { getLeaseDocument } from "@/lib/api/leases";
import { ApiError } from "@/lib/api/client";
import type { Lease } from "@/lib/api/types";
import { formatLeaseStatus, LEASE_STATUS_STYLES } from "@/lib/leaseStatus";
import { formatMoney } from "@/lib/money";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-navy">{children}</div>
    </div>
  );
}

export function LeaseDetail({
  lease,
  propertyLabel,
  unitLabel,
  tenantLabel,
  ownerLabel,
}: {
  lease: Lease;
  propertyLabel: string;
  unitLabel: string;
  tenantLabel: string;
  ownerLabel: string;
}) {
  const [isDownloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadDocument = async () => {
    setError(null);
    setDownloading(true);
    try {
      const { url } = await getLeaseDocument(lease.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load the lease PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Field label="Property">{propertyLabel}</Field>
        <Field label="Unit">{unitLabel}</Field>
        <Field label="Tenant">{tenantLabel}</Field>
        <Field label="Owner">{ownerLabel}</Field>
        <Field label="Status">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${LEASE_STATUS_STYLES[lease.status]}`}
          >
            {formatLeaseStatus(lease.status)}
          </span>
        </Field>
        <Field label="Rent">{formatMoney(lease.rentAmount)} RWF / month</Field>
        <Field label="Deposit">
          {lease.deposit !== null ? `${formatMoney(lease.deposit)} RWF` : "—"}
        </Field>
        <Field label="Payment Date">{lease.paymentDate ?? "—"}</Field>
        <Field label="Term">
          {lease.startDate} → {lease.endDate ?? "Open-ended"}
        </Field>
        <Field label="Mobile Money Number">{lease.momoNumber ?? "—"}</Field>
      </div>

      {lease.leasePeriodNote && (
        <Field label="Lease Period Note">{lease.leasePeriodNote}</Field>
      )}

      <div className="grid grid-cols-2 gap-5 border-t border-slate-100 pt-4">
        <Field label="Tenant Signed">
          {lease.tenantSignedAt ? new Date(lease.tenantSignedAt).toLocaleString() : "Not yet"}
        </Field>
        <Field label="Owner Signed">
          {lease.ownerSignedAt ? new Date(lease.ownerSignedAt).toLocaleString() : "Not yet"}
        </Field>
        <Field label="Documents Confirmed">
          {lease.documentsConfirmed
            ? lease.documentsConfirmedAt
              ? new Date(lease.documentsConfirmedAt).toLocaleString()
              : "Yes"
            : "Not yet"}
        </Field>
        {lease.terminatedAt && (
          <Field label="Terminated">{new Date(lease.terminatedAt).toLocaleString()}</Field>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={downloadDocument}
        disabled={isDownloading}
        className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isDownloading ? "Loading PDF..." : "Download Lease PDF"}
      </button>
    </div>
  );
}
