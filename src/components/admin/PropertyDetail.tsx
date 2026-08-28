"use client";

import type { ApprovalStatus, Property, PropertyStatus } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const APPROVAL_STYLES: Record<ApprovalStatus, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
};

const STATUS_STYLES: Record<PropertyStatus, string> = {
  available: "bg-emerald-50 text-emerald-700",
  occupied: "bg-slate-100 text-slate-600",
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

export function PropertyDetail({
  property,
  ownerName,
}: {
  property: Property;
  ownerName: string;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.propertyDetail;
  const addressParts = [
    property.addressLine,
    property.city,
    property.state,
    property.postalCode,
    property.country,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Field label={c.property}>{property.title}</Field>
        <Field label={c.owner}>{ownerName}</Field>

        <Field label="Category">{t.dashboard.status[property.category]}</Field>
        <Field label={c.type}>{capitalize(property.type)}</Field>

        <Field label={c.availability}>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[property.status]}`}
          >
            {t.dashboard.status[property.status]}
          </span>
        </Field>
        <Field label={c.approval}>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[property.approvalStatus]}`}
          >
            {t.dashboard.status[property.approvalStatus]}
          </span>
        </Field>
      </div>

      <Field label={c.address}>{addressParts.join(", ")}</Field>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {property.sizeSqm != null && (
          <Field label="Size">{property.sizeSqm} sqm</Field>
        )}
        {property.unitsCount != null && (
          <Field label="Units / Doors">{property.unitsCount}</Field>
        )}
        {property.bedrooms != null && (
          <Field label="Bedrooms">{property.bedrooms}</Field>
        )}
        {property.bathrooms != null && (
          <Field label="Bathrooms">{property.bathrooms}</Field>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Field label={c.monthlyRent}>
          {formatMoney(Number(property.rentAmount))} RWF
        </Field>
        <Field label={c.rentConditions}>
          {property.rentConditions ?? "—"}
        </Field>
      </div>

      {property.description && (
        <Field label="Description">{property.description}</Field>
      )}

      {property.approvalStatus === "rejected" && property.rejectionReason && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
            Rejection Reason
          </p>
          <p className="mt-1 text-sm text-red-700">{property.rejectionReason}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 border-t border-slate-100 pt-4">
        <Field label="Listed On">{formatDate(property.createdAt)}</Field>
        <Field label="Last Updated">{formatDate(property.updatedAt)}</Field>
      </div>
    </div>
  );
}
