"use client";

import type { User } from "@/lib/api/types";

const STATUS_STYLES: Record<"Active" | "Pending" | "Suspended", string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-red-50 text-red-700",
};

function statusFor(user: User): "Active" | "Pending" | "Suspended" {
  if (!user.isApproved) return "Pending";
  if (!user.isActive) return "Suspended";
  return "Active";
}

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

export function LandlordDetail({
  landlord,
  propertyCount,
}: {
  landlord: User;
  propertyCount: number;
}) {
  const status = statusFor(landlord);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label="Name">
        {landlord.firstName} {landlord.lastName}
      </Field>
      <Field label="Status">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
        >
          {status}
        </span>
      </Field>
      <Field label="Email">{landlord.email}</Field>
      <Field label="Phone">{landlord.phone}</Field>
      <Field label="Properties">{propertyCount}</Field>
      <Field label="Registered">{landlord.createdAt?.slice(0, 10) ?? "—"}</Field>
    </div>
  );
}
