"use client";

export function CompleteRequestForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (workDone: string, laborCost: number) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSuccess(
          String(formData.get("workDone")),
          Number(formData.get("laborCost")) || 0,
        );
      }}
    >
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Work done
          <textarea
            name="workDone"
            required
            rows={3}
            placeholder="e.g. Replaced faulty valve and resealed pipe joint."
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Labor cost (RWF)
          <input
            type="number"
            name="laborCost"
            min={0}
            required
            placeholder="e.g. 15000"
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
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          Mark Completed
        </button>
      </div>
    </form>
  );
}
