"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { PROPERTIES, type Property } from "@/lib/mock-admin-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type LeaseFormValues = {
  tenant: string;
  property: string;
  owner: string;
  startDate: string;
  endDate: string | null;
  paymentDate: string | null;
  leasePeriodNote: string | null;
  rent: number;
  deposit: number;
  momoNumber: string;
  documentName: string | null;
};

export function LeaseForm({
  properties = PROPERTIES,
  onSuccess,
  onCancel,
}: {
  properties?: Property[];
  onSuccess: (values: LeaseFormValues) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.leaseForm;
  const STEPS = [
    c.steps.tenantAndProperty,
    c.steps.datesAndTerm,
    c.steps.rentAndDeposit,
    c.steps.documentsAndConfirm,
  ];
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const [tenant, setTenant] = useState("");
  const [propertyName, setPropertyName] = useState(properties[0]?.name ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [leasePeriodNote, setLeasePeriodNote] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const goNext = () => {
    if (step === 1 && (!tenant.trim() || !propertyName)) {
      setStepError(c.errorTenantProperty);
      return;
    }
    if (step === 2 && !startDate) {
      setStepError(c.errorStartDate);
      return;
    }
    if (step === 3 && (!rent.trim() || Number(rent) <= 0 || !deposit.trim() || !momoNumber.trim())) {
      setStepError(c.errorRentDeposit);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goBack = () => {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const submitForm = () => {
    if (!confirmed) {
      setStepError(c.errorConfirm);
      return;
    }
    setStepError(null);
    const owner = properties.find((p) => p.name === propertyName)?.owner ?? "";
    onSuccess({
      tenant: tenant.trim(),
      property: propertyName,
      owner,
      startDate,
      endDate: endDate || null,
      paymentDate: paymentDate || null,
      leasePeriodNote: leasePeriodNote.trim() || null,
      rent: Number(rent) || 0,
      deposit: Number(deposit) || 0,
      momoNumber: momoNumber.trim(),
      documentName,
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (step === STEPS.length) submitForm();
      }}
    >
      <div className="mb-6 flex items-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  i + 1 <= step
                    ? "bg-gold text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`hidden text-[11px] font-medium sm:block ${
                  i + 1 === step ? "text-navy" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-px flex-1 ${
                  i + 1 < step ? "bg-gold" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {stepError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {stepError}
        </p>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-5">
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
            {c.property}
            <select
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              {properties.map((property) => (
                <option key={property.id}>{property.name}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 sm:grid-cols-2">
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

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
            {c.leasePeriod}
            <textarea
              value={leasePeriodNote}
              onChange={(e) => setLeasePeriodNote(e.target.value)}
              rows={2}
              placeholder={c.leasePeriodPlaceholder}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-5 sm:grid-cols-2">
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

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
            {c.rentMomoNumber}
            <input
              type="tel"
              value={momoNumber}
              onChange={(e) => setMomoNumber(e.target.value)}
              placeholder="+250 7XX XXX XXX"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.documentLabel}
            <p className="text-xs font-normal text-slate-400">
              {c.documentHint}
            </p>
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Upload className="h-4 w-4" />
                {c.chooseFile}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setDocumentName(e.target.files?.[0]?.name ?? null)
                  }
                />
              </label>
              {documentName && (
                <span className="text-sm text-slate-600">{documentName}</span>
              )}
            </div>
          </label>

          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-gold"
            />
            {c.confirmCheckbox}
          </label>
        </div>
      )}

      <div className="mt-6 flex justify-between gap-3">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {c.back}
            </button>
          )}
        </div>
        <div className="flex gap-3">
          {step === 1 && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              {t.dashboard.actions.cancel}
            </button>
          )}
          <button
            type="button"
            onClick={step < STEPS.length ? goNext : submitForm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            {step < STEPS.length ? (
              <>
                {c.next}
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              c.submit
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
