"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function TenantForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.tenantForm;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.fullName}
          <input
            type="text"
            required
            placeholder={c.fullNamePlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.nationalId}
          <input
            type="text"
            required
            placeholder={c.nationalIdPlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.emailAddress}
          <input
            type="email"
            required
            placeholder={c.emailPlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.phoneNumber}
          <input
            type="tel"
            required
            placeholder={c.phonePlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          {c.status}
          <select className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none">
            <option>{t.dashboard.status.active}</option>
            <option>{t.dashboard.status.pending}</option>
            <option>{t.dashboard.status.inactive}</option>
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
