"use client";

import { PROPERTIES, TENANTS } from "@/lib/mock-admin-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function MaintenanceRequestForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.maintenanceRequestForm;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.tenant}
          <select className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none">
            {TENANTS.map((tenant) => (
              <option key={tenant.id}>{tenant.name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.property}
          <select className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none">
            {PROPERTIES.map((property) => (
              <option key={property.id}>{property.name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          {c.issueDescription}
          <textarea
            required
            rows={3}
            placeholder={c.issuePlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          {c.priority}
          <select className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none">
            <option>{t.dashboard.status.low}</option>
            <option>{t.dashboard.status.medium}</option>
            <option>{t.dashboard.status.high}</option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          {t.dashboard.actions.cancel}
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          {c.submit}
        </button>
      </div>
    </form>
  );
}
