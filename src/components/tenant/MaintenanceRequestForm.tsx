"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export function MaintenanceRequestForm({
  property,
  onSuccess,
  onCancel,
}: {
  property: string;
  onSuccess: (items: string[], priority: "Low" | "Medium" | "High") => void;
  onCancel: () => void;
}) {
  const [items, setItems] = useState<string[]>([""]);

  const updateItem = (index: number, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSuccess(
          items.map((item) => item.trim()).filter(Boolean),
          String(formData.get("priority")) as "Low" | "Medium" | "High",
        );
      }}
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Property
          </p>
          <p className="mt-1 text-sm font-medium text-navy">{property}</p>
        </div>

        <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Issues
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder="e.g. Kitchen sink is leaking under the cabinet."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label="Remove item"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-400 hover:bg-slate-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, ""])}
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gold hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add item
          </button>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Priority
          <select
            name="priority"
            defaultValue="Medium"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
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
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          Submit Request
        </button>
      </div>
    </form>
  );
}
