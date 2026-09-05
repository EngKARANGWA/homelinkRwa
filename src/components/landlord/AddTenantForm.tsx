"use client";

import { useEffect, useState } from "react";
import { listAvailableUnits } from "@/lib/api/properties";
import { createLease } from "@/lib/api/leases";
import { ApiError } from "@/lib/api/client";
import type { AvailableUnit, Lease } from "@/lib/api/types";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const TODAY = new Date().toISOString().slice(0, 10);

export function AddTenantForm({
  propertyId,
  defaultRentAmount,
  onSuccess,
  onCancel,
}: {
  propertyId: string;
  defaultRentAmount?: number;
  onSuccess: (lease: Lease) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.addTenantForm;

  const [units, setUnits] = useState<AvailableUnit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [unitId, setUnitId] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rent, setRent] = useState(defaultRentAmount ? String(defaultRentAmount) : "");
  const [deposit, setDeposit] = useState("");
  const [startDate, setStartDate] = useState(TODAY);
  const [leasePeriodNote, setLeasePeriodNote] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingUnits(true);
    listAvailableUnits({ propertyId })
      .then((result) => {
        if (cancelled) return;
        setUnits(result);
        setUnitId(result[0]?.id ?? "");
      })
      .catch(() => {
        if (!cancelled) setUnits([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingUnits(false);
      });
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const selectedUnit = units.find((u) => u.id === unitId);

  const handleUnitChange = (id: string) => {
    setUnitId(id);
    const unit = units.find((u) => u.id === id);
    if (unit) setRent(unit.rentAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) {
      setError(c.errorNoVacantUnits);
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError("Please enter the tenant's name, email, and phone number.");
      return;
    }
    const rentValue = Number(rent);
    if (!rentValue || rentValue <= 0) {
      setError(c.errorRent);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const lease = await createLease({
        propertyId,
        unitId: selectedUnit.id,
        newTenant: {
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        },
        startDate,
        rentAmount: rentValue,
        deposit: deposit.trim() ? Number(deposit) : undefined,
        leasePeriodNote: leasePeriodNote.trim() || undefined,
      });
      onSuccess(lease);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add tenant.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        {c.unit}
        <SearchableSelect
          value={unitId}
          onChange={handleUnitChange}
          disabled={loadingUnits || units.length === 0}
          placeholder={loadingUnits ? "Loading units..." : units.length === 0 ? c.noVacantUnits : c.selectUnit}
          options={units.map((unit) => ({
            value: unit.id,
            label: unit.floor != null ? `${unit.label} (Floor ${unit.floor})` : unit.label,
          }))}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          First name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Claudine"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Last name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Uwase"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tenant@example.com"
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
            placeholder={c.monthlyRentPlaceholder}
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

      <p className="text-xs text-slate-400">
        The tenant will receive an email to set their own password and access their account.
      </p>

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
          disabled={submitting || loadingUnits || units.length === 0}
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Adding..." : c.submit}
        </button>
      </div>
    </form>
  );
}
