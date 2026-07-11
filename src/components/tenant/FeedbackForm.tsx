"use client";

export function FeedbackForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (feedback: string) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSuccess(String(formData.get("feedback")));
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        How was the repair?
        <textarea
          name="feedback"
          required
          rows={3}
          placeholder="e.g. Fixed quickly, very professional."
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
        />
      </label>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          Submit Feedback
        </button>
      </div>
    </form>
  );
}
