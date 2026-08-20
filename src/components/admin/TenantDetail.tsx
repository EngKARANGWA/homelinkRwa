"use client";

import { type Tenant } from "@/lib/mock-admin-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const STATUS_STYLES: Record<Tenant["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const STATUS_KEY: Record<Tenant["status"], "active" | "pending" | "inactive"> = {
  Active: "active",
  Pending: "pending",
  Inactive: "inactive",
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
  const { t } = useLanguage();
  const c = t.dashboard.admin.tenantDetail;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label={c.name}>{tenant.name}</Field>
      <Field label={c.status}>
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[tenant.status]}`}
        >
          {t.dashboard.status[STATUS_KEY[tenant.status]]}
        </span>
      </Field>
      <Field label={c.email}>{tenant.email}</Field>
      <Field label={c.phone}>{tenant.phone}</Field>
      <Field label={c.currentProperty}>{tenant.property}</Field>
      <Field label={c.registered}>{tenant.registeredAt}</Field>
    </div>
  );
}
