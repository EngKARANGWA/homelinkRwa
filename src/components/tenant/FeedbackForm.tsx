"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FeedbackForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (feedback: string) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.tenant.feedbackForm;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSuccess(String(formData.get("feedback")));
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        {c.question}
        <textarea
          name="feedback"
          required
          rows={3}
          placeholder={c.placeholder}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
        />
      </label>

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
