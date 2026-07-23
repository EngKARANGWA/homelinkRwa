"use client";

import { useState } from "react";
import type { Property } from "@/lib/api/types";

export type RecordPaymentValues = {
  propertyId: string;
  tenantName: string;
  amount: number;
  paidDate: string;
};

export function RecordPaymentForm({
  properties,
  onSuccess,
  onCancel,
}: {
  properties: Property[];
  onSuccess: (values: RecordPaymentValues) => void;
  onCancel: () => void;
}) {
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [tenantName, setTenantName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidDate, setPaidDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) {
      setError("Please select a property.");
      return;
    }
    if (!tenantName.trim()) {
      setError("Please enter the tenant's name.");
      return;
    }
    const amountValue = Number(amount);
    if (!amountValue || amountValue <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setError(null);
    onSuccess({ propertyId, tenantName: tenantName.trim(), amount: amountValue, paidDate });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
        Cash payments can&apos;t be submitted to the platform yet — this will only be
        noted here until that&apos;s supported.
      </p>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Property
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {properties.length === 0 ? (
              <option value="">No properties</option>
            ) : (
              properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Tenant name
          <input
            type="text"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            placeholder="e.g. Jean Mugisha"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Amount (RWF)
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Date received
          <input
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-1 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={properties.length === 0}
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Record Payment
        </button>
      </div>
    </form>
  );
}
