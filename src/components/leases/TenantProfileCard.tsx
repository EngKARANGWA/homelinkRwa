"use client";

import { Mail, Phone, User } from "lucide-react";
import type { Lease } from "@/lib/api/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-navy">{children}</div>
    </div>
  );
}

/**
 * A lease's tenant contact details, resolved server-side (GET /leases/:id
 * only) — falls back to a plain notice if that enrichment isn't available.
 */
export function TenantProfileCard({ lease }: { lease: Lease }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="mb-4 font-semibold text-navy">Tenant Profile</p>
      {lease.tenant ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <User className="h-4 w-4" />
            </span>
            <Field label="Name">
              {lease.tenant.firstName} {lease.tenant.lastName}
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Mail className="h-4 w-4" />
            </span>
            <Field label="Email">{lease.tenant.email}</Field>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Phone className="h-4 w-4" />
            </span>
            <Field label="Phone">{lease.tenant.phone}</Field>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Tenant profile unavailable.</p>
      )}
    </div>
  );
}
