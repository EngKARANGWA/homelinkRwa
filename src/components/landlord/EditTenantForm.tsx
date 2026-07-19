"use client";

import { useState } from "react";
import type { TenantEditValues, Unit } from "@/lib/units";

const PAYMENT_METHODS = [
  "MTN Mobile Money",
  "Airtel Money",
  "Bank Transfer",
  "Cash",
];

export function EditTenantForm({
  unit,
  onSuccess,
  onCancel,
}: {
  unit: Unit;
  onSuccess: (values: TenantEditValues) => void;
  onCancel: () => void;
}) {
  const [tenant, setTenant] = useState(unit.tenant ?? "");
  const [phone, setPhone] = useState(unit.phone ?? "");
  const [rent, setRent] = useState(String(unit.monthlyRent));
  const [deposit, setDeposit] = useState(String(unit.deposit ?? ""));
  const [startDate, setStartDate] = useState(unit.startDate ?? "");
  const [endDate, setEndDate] = useState(unit.endDate ?? "");
  const [paymentMethod, setPaymentMethod] = useState(
    unit.paymentMethod ?? PAYMENT_METHODS[0],
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant.trim() || !phone.trim()) {
      setError("Please enter the tenant's name and phone number.");
      return;
    }
    const rentValue = Number(rent);
    if (!rentValue || rentValue <= 0) {
      setError("Please enter a valid monthly rent.");
      return;
    }
    setError(null);
    onSuccess({
      tenant: tenant.trim(),
      phone: phone.trim(),
      monthlyRent: rentValue,
      deposit: Number(deposit) || 0,
      startDate,
      endDate: endDate || null,
      paymentMethod,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Tenant name
          <input
            type="text"
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Phone number
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Monthly rent (RWF)
          <input
            type="number"
            min={0}
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Security deposit (RWF)
          <input
            type="number"
            min={0}
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Start date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          End date (optional)
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          Payment method
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
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
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
