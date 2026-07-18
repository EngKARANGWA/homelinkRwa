"use client";

import { type Landlord } from "@/lib/mock-admin-data";

const STATUS_STYLES: Record<Landlord["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-red-50 text-red-700",
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
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label="Name">{landlord.name}</Field>
      <Field label="Status">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[landlord.status]}`}
        >
          {landlord.status}
        </span>
      </Field>
      <Field label="Email">{landlord.email}</Field>
      <Field label="Phone">{landlord.phone}</Field>
      <Field label="Properties">{landlord.properties}</Field>
      <Field label="Registered">{landlord.registeredAt}</Field>
    </div>
  );
}
