"use client";

import { useMemo, useState } from "react";
import { TODAY, type Property } from "@/lib/mock-admin-data";
import { getUnitsForProperty, type Unit, type UnitOverrides } from "@/lib/units";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const METHODS = ["Cash", "MTN Mobile Money", "Airtel Money", "Bank Transfer"] as const;

export function RecordPaymentForm({
  properties,
  unitOverrides,
  onSuccess,
  onCancel,
}: {
  properties: Property[];
  unitOverrides: UnitOverrides;
  onSuccess: (unit: Unit, values: { amount: number; method: string; paidDate: string }) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.recordPaymentForm;
  const methodLabel: Record<(typeof METHODS)[number], string> = {
    Cash: t.dashboard.landlord.paymentMethods.cash,
    "MTN Mobile Money": t.dashboard.landlord.paymentMethods.mtnMobileMoney,
    "Airtel Money": t.dashboard.landlord.paymentMethods.airtelMoney,
    "Bank Transfer": t.dashboard.landlord.paymentMethods.bankTransfer,
  };
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [unitId, setUnitId] = useState("");
  const [amount, setAmount] = useState(String(properties[0]?.rent ?? ""));
  const [method, setMethod] = useState("Cash");
  const [paidDate, setPaidDate] = useState(TODAY);
  const [error, setError] = useState<string | null>(null);

  const selectedProperty = properties.find((p) => p.id === propertyId) ?? null;

  const occupiedUnits = useMemo(() => {
    if (!selectedProperty) return [];
    return getUnitsForProperty(selectedProperty, unitOverrides).filter(
      (u) => u.occupancyStatus === "Occupied",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty?.id, unitOverrides]);

  const selectedUnit = occupiedUnits.find((u) => u.id === unitId) ?? occupiedUnits[0] ?? null;

  const handlePropertyChange = (id: string) => {
    setPropertyId(id);
    setUnitId("");
    const property = properties.find((p) => p.id === id);
    if (property) setAmount(String(property.rent));
  };

  const handleUnitChange = (id: string) => {
    setUnitId(id);
    const unit = occupiedUnits.find((u) => u.id === id);
    if (unit) setAmount(String(unit.monthlyRent));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) {
      setError(c.errorNoTenants);
      return;
    }
    const amountValue = Number(amount);
    if (!amountValue || amountValue <= 0) {
      setError(c.errorAmount);
      return;
    }
    setError(null);
    onSuccess(selectedUnit, { amount: amountValue, method, paidDate });
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
          {c.property}
          <SearchableSelect
            value={propertyId}
            onChange={handlePropertyChange}
            options={properties.map((property) => ({
              value: property.id,
              label: property.name,
            }))}
            placeholder={c.selectProperty}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.tenantUnit}
          <SearchableSelect
            value={selectedUnit?.id ?? ""}
            onChange={handleUnitChange}
            disabled={occupiedUnits.length === 0}
            placeholder={occupiedUnits.length === 0 ? c.noTenants : c.selectTenant}
            options={occupiedUnits.map((unit) => ({
              value: unit.id,
              label: `${unit.unitNumber} · ${unit.tenant}`,
            }))}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.amountRwf}
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.paymentMethod}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{methodLabel[m]}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          {c.dateReceived}
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
          {t.dashboard.actions.cancel}
        </button>
        <button
          type="submit"
          disabled={occupiedUnits.length === 0}
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {c.submit}
        </button>
      </div>
    </form>
  );
}
