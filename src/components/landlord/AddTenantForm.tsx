"use client";

import { useMemo, useState } from "react";
import { TODAY, type Lease, type Property } from "@/lib/mock-admin-data";
import { getUnitsForProperty, type UnitOverrides } from "@/lib/units";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function AddTenantForm({
  properties,
  unitOverrides,
  onSuccess,
  onCancel,
}: {
  properties: Property[];
  unitOverrides: UnitOverrides;
  onSuccess: (lease: Lease) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.addTenantForm;
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [unitNumber, setUnitNumber] = useState("");
  const [tenant, setTenant] = useState("");
  const [phone, setPhone] = useState("");
  const [rent, setRent] = useState(String(properties[0]?.rent ?? ""));
  const [deposit, setDeposit] = useState("");
  const [startDate, setStartDate] = useState(TODAY);
  const [leasePeriodNote, setLeasePeriodNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedProperty = properties.find((p) => p.id === propertyId) ?? null;

  const vacantUnits = useMemo(() => {
    if (!selectedProperty) return [];
    return getUnitsForProperty(selectedProperty, unitOverrides).filter(
      (u) => u.occupancyStatus === "Vacant",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty?.id, unitOverrides]);

  const selectedUnit = vacantUnits.find((u) => u.unitNumber === unitNumber) ?? vacantUnits[0];

  const handlePropertyChange = (id: string) => {
    setPropertyId(id);
    setUnitNumber("");
    const property = properties.find((p) => p.id === id);
    if (property) setRent(String(property.rent));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) {
      setError(c.errorSelectProperty);
      return;
    }
    if (!selectedUnit) {
      setError(c.errorNoVacantUnits);
      return;
    }
    if (!tenant.trim() || !phone.trim()) {
      setError(c.errorNamePhone);
      return;
    }
    const rentValue = Number(rent);
    if (!rentValue || rentValue <= 0) {
      setError(c.errorRent);
      return;
    }
    setError(null);

    onSuccess({
      id: String(Date.now()),
      tenant: tenant.trim(),
      property: selectedProperty.name,
      owner: selectedProperty.owner,
      rent: rentValue,
      deposit: Number(deposit) || rentValue * 2,
      momoNumber: phone.trim(),
      startDate,
      endDate: null,
      paymentDate: startDate,
      leasePeriodNote: leasePeriodNote.trim() || null,
      documentName: null,
      status: "Active",
      unitNumber: selectedUnit.unitNumber,
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
          {c.unit}
          <SearchableSelect
            value={selectedUnit?.unitNumber ?? ""}
            onChange={setUnitNumber}
            disabled={vacantUnits.length === 0}
            placeholder={vacantUnits.length === 0 ? c.noVacantUnits : c.selectUnit}
            options={vacantUnits.map((unit) => ({
              value: unit.unitNumber,
              label: unit.unitNumber,
            }))}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.tenantName}
          <input
            type="text"
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            placeholder={c.tenantNamePlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.phoneNumber}
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+250 7XX XXX XXX"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.monthlyRent}
          <input
            type="number"
            min={0}
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            placeholder={selectedProperty ? String(selectedProperty.rent) : c.monthlyRentPlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.securityDeposit}
          <input
            type="number"
            min={0}
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder={c.securityDepositPlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
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
          {c.leasePeriod}
          <input
            type="text"
            value={leasePeriodNote}
            onChange={(e) => setLeasePeriodNote(e.target.value)}
            placeholder={c.leasePeriodPlaceholder}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
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
          disabled={vacantUnits.length === 0}
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {c.submit}
        </button>
      </div>
    </form>
  );
}
