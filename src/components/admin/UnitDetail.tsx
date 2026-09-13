"use client";

import type { PropertyUnit, UnitStatus } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const STATUS_STYLES: Record<UnitStatus, string> = {
  available: "bg-slate-100 text-slate-600",
  occupied: "bg-emerald-50 text-emerald-700",
  maintenance: "bg-amber-50 text-amber-700",
  inactive: "bg-slate-200 text-slate-500",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-navy">{children}</div>
    </div>
  );
}

export function UnitDetail({ unit }: { unit: PropertyUnit }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Field label="Unit number/name">{unit.label}</Field>
        <Field label="Status">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[unit.status]}`}
          >
            {t.dashboard.status[unit.status]}
          </span>
        </Field>
      </div>

      {unit.unitType && <Field label="Unit type">{unit.unitType}</Field>}

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <Field label="Floor">{unit.floor ?? "—"}</Field>
        <Field label="Bedrooms">{unit.bedrooms ?? "—"}</Field>
        <Field label="Bathrooms">{unit.bathrooms ?? "—"}</Field>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Monthly rent">{formatMoney(Number(unit.rentAmount))} RWF</Field>
        <Field label="Deposit">
          {unit.deposit != null ? `${formatMoney(Number(unit.deposit))} RWF` : "—"}
        </Field>
      </div>

      {unit.description && <Field label="Description">{unit.description}</Field>}

      <div className="grid grid-cols-2 gap-5 border-t border-slate-100 pt-4">
        <Field label="Created">{formatDate(unit.createdAt)}</Field>
        <Field label="Last updated">{formatDate(unit.updatedAt)}</Field>
      </div>
    </div>
  );
}
