"use client";

import type { MaintenanceRequest } from "@/lib/api/maintenance";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const STATUS_STYLES: Record<MaintenanceRequest["status"], string> = {
  submitted: "bg-amber-50 text-amber-700",
  assigned: "bg-sky-50 text-sky-700",
  in_progress: "bg-sky-50 text-sky-700",
  completed: "bg-emerald-50 text-emerald-700",
};

const PRIORITY_STYLES: Record<MaintenanceRequest["priority"], string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};

const STATUS_KEY: Record<MaintenanceRequest["status"], "submitted" | "assigned" | "inProgress" | "completed"> = {
  submitted: "submitted",
  assigned: "assigned",
  in_progress: "inProgress",
  completed: "completed",
};

const PRIORITY_KEY: Record<MaintenanceRequest["priority"], "low" | "medium" | "high"> = {
  low: "low",
  medium: "medium",
  high: "high",
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

export function MaintenanceDetail({
  request,
  tenantLabel,
  propertyLabel,
  assigneeLabel,
}: {
  request: MaintenanceRequest;
  tenantLabel: string;
  propertyLabel: string;
  assigneeLabel: string;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.maintenanceDetail;
  const laborCost = Number(request.laborCost ?? 0);
  const itemsCost = Number(request.itemsCost ?? 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Field label={c.tenant}>{tenantLabel}</Field>
        <Field label={c.property}>{propertyLabel}</Field>

        <Field label={c.priority}>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[request.priority]}`}
          >
            {t.dashboard.status[PRIORITY_KEY[request.priority]]}
          </span>
        </Field>

        <Field label={c.status}>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
          >
            {t.dashboard.status[STATUS_KEY[request.status]]}
          </span>
        </Field>

        <Field label={c.submitted}>{request.createdAt.slice(0, 10)}</Field>
        <Field label={t.dashboard.table.assignedTo}>{assigneeLabel}</Field>
      </div>

      <Field label={c.title}>{request.title}</Field>
      <Field label={c.description}>{request.description}</Field>

      {request.status === "completed" && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <Field label={c.completionNotes}>{request.completionNotes ?? "—"}</Field>
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{c.laborCost}</span>
              <span className="font-medium text-navy">{formatMoney(laborCost)} RWF</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{c.itemMaterialsCost}</span>
              <span className="font-medium text-navy">{formatMoney(itemsCost)} RWF</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
              <span className="font-medium text-slate-600">{c.totalExpense}</span>
              <span className="font-bold text-navy">{formatMoney(laborCost + itemsCost)} RWF</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
