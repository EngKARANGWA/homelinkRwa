"use client";

import { MAINTENANCE_HANDLERS } from "@/lib/mock-admin-data";

export function AssignHandlerForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (handler: string) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSuccess(String(formData.get("handler")));
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        Assign to
        <select
          name="handler"
          required
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
        >
          {MAINTENANCE_HANDLERS.map((handler) => (
            <option key={handler}>{handler}</option>
          ))}
        </select>
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
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold/90"
        >
          Assign
        </button>
      </div>
    </form>
  );
}
