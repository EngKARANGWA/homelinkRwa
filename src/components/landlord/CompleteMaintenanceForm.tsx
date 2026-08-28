"use client";

import { useState } from "react";

export type CompleteMaintenanceValues = {
  itemsCost?: number;
  laborCost?: number;
  completionNotes?: string;
};

export function CompleteMaintenanceForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (values: CompleteMaintenanceValues) => void;
  onCancel: () => void;
}) {
  const [itemsCost, setItemsCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess({
          itemsCost: itemsCost.trim() ? Number(itemsCost) : undefined,
          laborCost: laborCost.trim() ? Number(laborCost) : undefined,
          completionNotes: completionNotes.trim() || undefined,
        });
      }}
    >
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Completion notes
          <textarea
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Replaced faulty valve and resealed pipe joint."
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Labor cost (RWF)
          <input
            type="number"
            min={0}
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)}
            placeholder="Leave blank if none"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Items / materials cost (RWF)
          <input
            type="number"
            min={0}
            value={itemsCost}
            onChange={(e) => setItemsCost(e.target.value)}
            placeholder="Leave blank if none"
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
