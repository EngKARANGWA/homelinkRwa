"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { MAINTENANCE_HANDLERS, type Laborer } from "@/lib/mock-admin-data";

type LaborerRow = { name: string; role: string; contact: string; amount: string };

const EMPTY_ROW: LaborerRow = { name: "", role: "", contact: "", amount: "" };

export function AssignHandlerForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (laborers: Laborer[]) => void;
  onCancel: () => void;
}) {
  const [laborers, setLaborers] = useState<LaborerRow[]>([{ ...EMPTY_ROW }]);
  const [error, setError] = useState<string | null>(null);

  const updateLaborer = (
    index: number,
    field: keyof LaborerRow,
    value: string,
  ) => {
    setLaborers((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    );
  };

  const removeLaborer = (index: number) => {
    setLaborers((prev) => prev.filter((_, i) => i !== index));
  };

  const total = laborers.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const cleaned: Laborer[] = laborers
          .filter((l) => l.name.trim())
          .map((l) => ({
            name: l.name.trim(),
            role: l.role.trim(),
            contact: l.contact.trim(),
            amount: Number(l.amount) || 0,
          }));

        if (cleaned.length === 0) {
          setError("Add at least one laborer with a name.");
          return;
        }
        setError(null);
        onSuccess(cleaned);
      }}
    >
      <datalist id="known-handlers">
        {MAINTENANCE_HANDLERS.map((handler) => (
          <option key={handler} value={handler} />
        ))}
      </datalist>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {laborers.map((laborer, index) => (
          <div key={index} className="relative rounded-lg border border-slate-200 p-4">
            {laborers.length > 1 && (
              <button
                type="button"
                onClick={() => removeLaborer(index)}
                aria-label="Remove laborer"
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="grid gap-4 pr-8 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Name
                <input
                  type="text"
                  list="known-handlers"
                  value={laborer.name}
                  onChange={(e) => updateLaborer(index, "name", e.target.value)}
                  placeholder="e.g. Faustin Gasana"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Role
                <input
                  type="text"
                  value={laborer.role}
                  onChange={(e) => updateLaborer(index, "role", e.target.value)}
                  placeholder="e.g. Electrician, Plumber"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Contact
                <input
                  type="text"
                  value={laborer.contact}
                  onChange={(e) => updateLaborer(index, "contact", e.target.value)}
                  placeholder="e.g. +250 788 123 456"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Amount to pay (RWF)
                <input
                  type="number"
                  min={0}
                  value={laborer.amount}
                  onChange={(e) => updateLaborer(index, "amount", e.target.value)}
                  placeholder="e.g. 15000"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setLaborers((prev) => [...prev, { ...EMPTY_ROW }])}
        className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gold hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        Add another laborer
      </button>

      <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
        <span className="text-sm font-medium text-slate-600">
          Total labor cost
        </span>
        <span className="text-lg font-bold text-navy">
          {total.toLocaleString()} RWF
        </span>
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
          Assign
        </button>
      </div>
    </form>
  );
}
