"use client";

import { daysVacant, type Property } from "@/lib/mock-admin-data";

const APPROVAL_STYLES: Record<Property["approval"], string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Rejected: "bg-red-50 text-red-700",
};

const AVAILABILITY_STYLES: Record<Property["availability"], string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Occupied: "bg-slate-100 text-slate-600",
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
  const vacantDays = daysVacant(property.vacantSince);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Field label="Property">{property.name}</Field>
        <Field label="Owner">{property.owner}</Field>

        <Field label="UPI">{property.upi}</Field>
        <Field label="Type">
          {property.buildingType} · {property.type}
          {property.size && ` · ${property.size}`}
        </Field>

        <Field label="Monthly Rent">{property.rent.toLocaleString()} RWF</Field>
        <Field label="Availability">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${AVAILABILITY_STYLES[property.availability]}`}
          >
            {property.availability}
          </span>
          {vacantDays != null && (
            <span className="ml-2 text-xs font-normal text-slate-400">
              {vacantDays} days vacant
            </span>
          )}
        </Field>

        <Field label="Approval">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[property.approval]}`}
          >
            {property.approval}
          </span>
        </Field>
      </div>

      <Field label="Address">{property.address}</Field>

      {property.terms.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Rent Conditions
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
            Additional Details
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
        <Field label="Document on File">{property.documentName}</Field>
      )}
    </div>
  );
}
