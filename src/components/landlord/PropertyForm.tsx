"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { Property } from "@/lib/mock-admin-data";

export type PropertyFormValues = {
  name: string;
  address: string;
  type: Property["type"];
  rent: number;
  availability: Property["availability"];
  terms: string[];
};

export function PropertyForm({
  initialProperty,
  onSuccess,
  onCancel,
}: {
  initialProperty?: Property;
  onSuccess: (values: PropertyFormValues) => void;
  onCancel: () => void;
}) {
  const [conditions, setConditions] = useState<string[]>(
    initialProperty?.terms && initialProperty.terms.length > 0
      ? initialProperty.terms
      : [""],
  );

  const updateCondition = (index: number, value: string) => {
    setConditions((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSuccess({
          name: String(formData.get("name")),
          address: String(formData.get("address")),
          type: String(formData.get("type")) as Property["type"],
          rent: Number(formData.get("rent")) || 0,
          availability: String(
            formData.get("availability"),
          ) as Property["availability"],
          terms: conditions.map((c) => c.trim()).filter(Boolean),
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          Property name
          <input
            name="name"
            type="text"
            required
            defaultValue={initialProperty?.name}
            placeholder="e.g. Kigali Heights Apartment 4B"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          Address
          <input
            name="address"
            type="text"
            required
            defaultValue={initialProperty?.address}
            placeholder="District, Sector, Cell"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Property type
          <select
            name="type"
            defaultValue={initialProperty?.type ?? "Apartment"}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option>Apartment</option>
            <option>House</option>
            <option>Studio</option>
            <option>Commercial</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Monthly rent (RWF)
          <input
            name="rent"
            type="number"
            min={0}
            required
            defaultValue={initialProperty?.rent}
            placeholder="e.g. 450000"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Availability
          <select
            name="availability"
            defaultValue={initialProperty?.availability ?? "Available"}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option>Available</option>
            <option>Occupied</option>
          </select>
        </label>

        <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          Rent conditions
          <div className="flex flex-col gap-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => updateCondition(index, e.target.value)}
                  placeholder="e.g. 12-month lease"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  aria-label="Remove condition"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-400 hover:bg-slate-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setConditions((prev) => [...prev, ""])}
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gold hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add condition
          </button>
        </div>
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
          {initialProperty ? "Save Changes" : "Add Property"}
        </button>
      </div>
    </form>
  );
}
