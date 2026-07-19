"use client";

import { useMemo, useState } from "react";
import { TODAY, type Lease, type Property } from "@/lib/mock-admin-data";
import { getUnitsForProperty, type UnitOverrides } from "@/lib/units";

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
      setError("Please select a property.");
      return;
    }
    if (!selectedUnit) {
      setError("This property has no vacant units right now.");
      return;
    }
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
          Property
          <select
            value={propertyId}
            onChange={(e) => handlePropertyChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Unit
          <select
            value={selectedUnit?.unitNumber ?? ""}
            onChange={(e) => setUnitNumber(e.target.value)}
            disabled={vacantUnits.length === 0}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            {vacantUnits.length === 0 ? (
              <option>No vacant units</option>
            ) : (
              vacantUnits.map((unit) => (
                <option key={unit.id} value={unit.unitNumber}>
                  {unit.unitNumber}
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Tenant name
          <input
            type="text"
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            placeholder="e.g. Claudine Uwase"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Phone number
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+250 7XX XXX XXX"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Monthly rent (RWF)
          <input
            type="number"
            min={0}
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            placeholder={selectedProperty ? String(selectedProperty.rent) : "e.g. 450000"}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Security deposit (RWF)
          <input
            type="number"
            min={0}
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="e.g. 900000"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
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
          Lease period (optional)
          <input
            type="text"
            value={leasePeriodNote}
            onChange={(e) => setLeasePeriodNote(e.target.value)}
            placeholder="e.g. 12-month renewable lease"
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
          Cancel
        </button>
        <button
          type="submit"
          disabled={vacantUnits.length === 0}
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add Tenant
        </button>
      </div>
    </form>
  );
}
