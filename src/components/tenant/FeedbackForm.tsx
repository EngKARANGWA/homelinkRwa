"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FeedbackForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (rating: number, comment?: string) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { t } = useLanguage();
  const c = t.dashboard.tenant.feedbackForm;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess(rating, comment.trim() || undefined);
      }}
    >
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Rating
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)}
                {"☆".repeat(5 - n)} ({n}/5)
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.question}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={c.placeholder}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
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
