"use client";

import type { Payment } from "@/lib/mock-admin-data";

export function PayNowForm({
  amount,
  onSuccess,
  onCancel,
}: {
  amount: number;
  onSuccess: (method: Payment["method"]) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSuccess(String(formData.get("method")) as Payment["method"]);
      }}
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Amount due
          </p>
          <p className="mt-1 text-2xl font-bold text-navy">
            {amount.toLocaleString()} RWF
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Payment method
          <select
            name="method"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option>MTN Mobile Money</option>
            <option>Airtel Money</option>
            <option>Bank Transfer</option>
          </select>
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
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold/90"
        >
          Pay Now
        </button>
      </div>
    </form>
  );
}
