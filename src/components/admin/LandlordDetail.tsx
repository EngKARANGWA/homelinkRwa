"use client";

import { type Landlord } from "@/lib/mock-admin-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const STATUS_STYLES: Record<Landlord["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-red-50 text-red-700",
};

const STATUS_KEY: Record<Landlord["status"], "active" | "pending" | "suspended"> = {
  Active: "active",
  Pending: "pending",
  Suspended: "suspended",
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

export function LandlordDetail({ landlord }: { landlord: Landlord }) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.landlordDetail;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label={c.name}>{landlord.name}</Field>
      <Field label={c.status}>
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[landlord.status]}`}
        >
          {t.dashboard.status[STATUS_KEY[landlord.status]]}
        </span>
      </Field>
      <Field label={c.email}>{landlord.email}</Field>
      <Field label={c.phone}>{landlord.phone}</Field>
      <Field label={c.properties}>{landlord.properties}</Field>
      <Field label={c.registered}>{landlord.registeredAt}</Field>
    </div>
  );
}
