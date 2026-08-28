"use client";

import { useEffect, useState } from "react";
import { listUnits } from "@/lib/api/properties";
import type { CreateLeaseInput, Property, PropertyUnit, User } from "@/lib/api/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LeaseForm({
  properties,
  tenants,
  onSuccess,
  onCancel,
}: {
  properties: Property[];
  tenants: User[];
  onSuccess: (values: CreateLeaseInput) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.leaseForm;
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [unitId, setUnitId] = useState("");
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setUnits([]);
      setUnitId("");
      return;
    }
    listUnits(propertyId).then((allUnits) => {
      const available = allUnits.filter((u) => u.status === "available");
      setUnits(available);
      setUnitId(available[0]?.id ?? "");
    });
  }, [propertyId]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!propertyId || !unitId || !tenantId || !startDate || !rentAmount.trim()) {
          setError("Please fill in the property, unit, tenant, start date, and rent.");
          return;
        }
        setError(null);
        onSuccess({
          propertyId,
          unitId,
          tenantId,
          startDate,
          endDate: endDate || undefined,
          paymentDate: paymentDate || undefined,
          rentAmount: Number(rentAmount),
        });
      }}
    >
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          {c.property}
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          {t.dashboard.table.unit}
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {units.length === 0 ? (
              <option value="">No available units</option>
            ) : (
              units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          {t.dashboard.table.tenant}
          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.firstName} {tenant.lastName}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.startDate}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.endDate}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.paymentDate}
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.monthlyRent}
          <input
            type="number"
            min={0}
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            placeholder={c.monthlyRentPlaceholder}
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
          {t.dashboard.actions.cancel}
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          {c.submit}
        </button>
      </div>
    </form>
  );
}
