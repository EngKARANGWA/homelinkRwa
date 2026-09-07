"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, Copy, MessageCircle, Send } from "lucide-react";
import { listAvailableUnits } from "@/lib/api/properties";
import { createLease } from "@/lib/api/leases";
import { ApiError } from "@/lib/api/client";
import type { AvailableUnit, Lease } from "@/lib/api/types";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatMoney } from "@/lib/money";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser — the value is still
      // visible on screen for a manual copy either way.
    }
  };

  const isMultiline = value.includes("\n");

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p
          className={`font-mono text-sm font-medium text-navy ${
            isMultiline ? "whitespace-pre-line" : "truncate"
          }`}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

const TODAY = new Date().toISOString().slice(0, 10);

export function AddTenantForm({
  propertyId,
  defaultRentAmount,
  onSuccess,
  onCancel,
}: {
  /** Omit to search available units across the landlord's whole portfolio
   * instead of one fixed property — each result then shows which property
   * it belongs to. */
  propertyId?: string;
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
  const [createdLease, setCreatedLease] = useState<Lease | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingUnits(true);
    listAvailableUnits(propertyId ? { propertyId } : {})
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
        propertyId: propertyId ?? selectedUnit.propertyId,
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
      setCreatedLease(lease);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add tenant.");
    } finally {
      setSubmitting(false);
    }
  };

  if (createdLease) {
    const credentials = createdLease.newTenantCredentials;
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Tenant added and assigned to their unit.
        </div>

        {credentials ? (
          (() => {
            const message = `Hi ${firstName.trim()}, here are your HomeLink login details:\nEmail: ${credentials.email}\nPassword: ${credentials.tempPassword}\nLog in at: ${typeof window !== "undefined" ? window.location.origin : ""}/login`;
            const digits = phone.replace(/[^\d+]/g, "");
            const waDigits = digits.replace(/^\+/, "");
            const encoded = encodeURIComponent(message);
            return (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-600">
                  Share these with the tenant so they can log in. This password won&apos;t be
                  shown again after you close this window.
                </p>
                <CopyField label="Email" value={credentials.email} />
                <CopyField label="Temporary password" value={credentials.tempPassword} />
                <CopyField label="Email + password (both)" value={message} />

                {digits && (
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://wa.me/${waDigits}?text=${encoded}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Send via WhatsApp
                    </a>
                    <a
                      href={`sms:${digits}?&body=${encoded}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Send className="h-4 w-4" />
                      Send via SMS
                    </a>
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <p className="text-sm text-slate-600">
            The tenant will receive an email at <strong>{email.trim()}</strong> to set their own
            password and access their account.
          </p>
        )}

        <div className="mt-1 flex justify-end">
          <button
            type="button"
            onClick={() => onSuccess(createdLease)}
            className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

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
          options={units.map((unit) => {
            const floorPart = unit.floor != null ? ` (Floor ${unit.floor})` : "";
            const propertyPart = propertyId ? "" : ` — ${unit.propertyTitle}`;
            return {
              value: unit.id,
              label: `${unit.label}${floorPart}${propertyPart} — ${formatMoney(Number(unit.rentAmount))} RWF`,
            };
          })}
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
