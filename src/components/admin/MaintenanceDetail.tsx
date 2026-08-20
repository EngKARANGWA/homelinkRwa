"use client";

import { type MaintenanceRequest } from "@/lib/mock-admin-data";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const STATUS_STYLES: Record<MaintenanceRequest["status"], string> = {
  Submitted: "bg-amber-50 text-amber-700",
  Assigned: "bg-sky-50 text-sky-700",
  "In Progress": "bg-sky-50 text-sky-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

const PRIORITY_STYLES: Record<MaintenanceRequest["priority"], string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-red-50 text-red-700",
};

const STATUS_KEY: Record<MaintenanceRequest["status"], "submitted" | "assigned" | "inProgress" | "completed"> = {
  Submitted: "submitted",
  Assigned: "assigned",
  "In Progress": "inProgress",
  Completed: "completed",
};

const PRIORITY_KEY: Record<MaintenanceRequest["priority"], "low" | "medium" | "high"> = {
  Low: "low",
  Medium: "medium",
  High: "high",
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

export function MaintenanceDetail({ request }: { request: MaintenanceRequest }) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.maintenanceDetail;
  const totalLaborCost = request.laborers.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <Field label={c.tenant}>{request.tenant}</Field>
        <Field label={c.property}>{request.property}</Field>

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

        <Field label={c.submitted}>{request.submittedAt}</Field>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {c.reportedIssues}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          {request.issue.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {c.assignedLaborers}
        </p>
        {request.laborers.length > 0 ? (
          <div className="mt-2 flex flex-col gap-2">
            {request.laborers.map((laborer, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-navy">
                    {laborer.name}
                    {laborer.role && (
                      <span className="font-normal text-slate-400"> · {laborer.role}</span>
                    )}
                  </p>
                  {laborer.contact && (
                    <p className="text-xs text-slate-400">{laborer.contact}</p>
                  )}
                </div>
                <p className="font-medium text-navy">
                  {formatMoney(laborer.amount)} RWF
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-sm font-medium text-slate-600">{c.laborCostTotal}</span>
              <span className="font-bold text-navy">
                {formatMoney(totalLaborCost)} RWF
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-400">{c.notYetAssigned}</p>
        )}
      </div>

      {request.status === "Completed" && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <Field label={c.workDone}>{request.workDone ?? "—"}</Field>
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{c.laborCost}</span>
              <span className="font-medium text-navy">
                {formatMoney(totalLaborCost)} RWF
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{c.itemMaterialsCost}</span>
              <span className="font-medium text-navy">
                {formatMoney(request.itemCost ?? 0)} RWF
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
              <span className="font-medium text-slate-600">{c.totalExpense}</span>
              <span className="font-bold text-navy">
                {formatMoney(totalLaborCost + (request.itemCost ?? 0))} RWF
              </span>
            </div>
          </div>
          {request.feedback && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {c.tenantFeedback}
              </p>
              <p className="mt-1 text-sm italic text-slate-600">
                &ldquo;{request.feedback}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
