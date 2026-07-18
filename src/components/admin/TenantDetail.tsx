"use client";

import { type Tenant } from "@/lib/mock-admin-data";

const STATUS_STYLES: Record<Tenant["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium text-navy">{children}</div>
    </div>
  );
}

export function TenantDetail({ tenant }: { tenant: Tenant }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label="Name">{tenant.name}</Field>
      <Field label="Status">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[tenant.status]}`}
        >
          {tenant.status}
        </span>
      </Field>
      <Field label="Email">{tenant.email}</Field>
      <Field label="Phone">{tenant.phone}</Field>
      <Field label="Current Property">{tenant.property}</Field>
      <Field label="Registered">{tenant.registeredAt}</Field>
    </div>
  );
}
