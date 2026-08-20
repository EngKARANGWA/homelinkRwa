"use client";

import { daysVacant, type Property } from "@/lib/mock-admin-data";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const APPROVAL_STYLES: Record<Property["approval"], string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Rejected: "bg-red-50 text-red-700",
};

const AVAILABILITY_STYLES: Record<Property["availability"], string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Occupied: "bg-slate-100 text-slate-600",
};

const APPROVAL_KEY: Record<Property["approval"], "approved" | "pending" | "rejected"> = {
  Approved: "approved",
  Pending: "pending",
  Rejected: "rejected",
};

const AVAILABILITY_KEY: Record<Property["availability"], "available" | "occupied"> = {
  Available: "available",
  Occupied: "occupied",
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

export function PropertyDetail({ property }: { property: Property }) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.propertyDetail;
  const vacantDays = daysVacant(property.vacantSince);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Field label={c.property}>{property.name}</Field>
        <Field label={c.owner}>{property.owner}</Field>

        <Field label={c.upi}>{property.upi}</Field>
        <Field label={c.type}>
          {property.buildingType} · {property.type}
          {property.size && ` · ${property.size}`}
        </Field>

        <Field label={c.monthlyRent}>{formatMoney(property.rent)} RWF</Field>
        <Field label={c.availability}>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${AVAILABILITY_STYLES[property.availability]}`}
          >
            {t.dashboard.status[AVAILABILITY_KEY[property.availability]]}
          </span>
          {vacantDays != null && (
            <span className="ml-2 text-xs font-normal text-slate-400">
              {c.daysVacantTemplate.replace("{value}", String(vacantDays))}
            </span>
          )}
        </Field>

        <Field label={c.approval}>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[property.approval]}`}
          >
            {t.dashboard.status[APPROVAL_KEY[property.approval]]}
          </span>
        </Field>
      </div>

      <Field label={c.address}>{property.address}</Field>

      {property.terms.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {c.rentConditions}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {property.terms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
      )}

      {property.attributes.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {c.additionalDetails}
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {property.attributes.map((attribute, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="text-slate-500">{attribute.label}</span>
                <span className="font-medium text-navy">{attribute.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {property.documentName && (
        <Field label={c.documentOnFile}>{property.documentName}</Field>
      )}
    </div>
  );
}
