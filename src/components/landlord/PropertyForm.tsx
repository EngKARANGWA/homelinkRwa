"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Upload, X } from "lucide-react";
import {
  PROPERTY_TYPES_BY_BUILDING,
  type BuildingType,
  type Property,
  type PropertyAttribute,
  type PropertyType,
} from "@/lib/mock-admin-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type PropertyFormValues = {
  name: string;
  address: string;
  upi: string;
  buildingType: BuildingType;
  type: PropertyType;
  size: string | null;
  rent: number;
  availability: Property["availability"];
  terms: string[];
  attributes: PropertyAttribute[];
  documentName: string | null;
};

const PROPERTY_TYPE_KEY: Record<string, "house" | "apartment" | "unitDoor" | "unit"> = {
  House: "house",
  Apartment: "apartment",
  "Unit (Door)": "unitDoor",
  Unit: "unit",
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
  const { t } = useLanguage();
  const c = t.dashboard.admin.propertyForm;
  const STEPS = [
    c.steps.basicInfo,
    c.steps.typeAndRent,
    c.steps.rentConditions,
    c.steps.additionalDetails,
    c.steps.documentsAndConfirm,
  ];
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const [name, setName] = useState(initialProperty?.name ?? "");
  const [address, setAddress] = useState(initialProperty?.address ?? "");
  const [upi, setUpi] = useState(initialProperty?.upi ?? "");
  const [rent, setRent] = useState(String(initialProperty?.rent ?? ""));
  const [availability, setAvailability] = useState<Property["availability"]>(
    initialProperty?.availability ?? "Available",
  );
  const [buildingType, setBuildingType] = useState<BuildingType>(
    initialProperty?.buildingType ?? "Residential",
  );
  const [propertyType, setPropertyType] = useState<PropertyType>(
    initialProperty?.type ?? PROPERTY_TYPES_BY_BUILDING.Residential[0],
  );
  const [size, setSize] = useState(initialProperty?.size ?? "");
  const [documentName, setDocumentName] = useState<string | null>(
    initialProperty?.documentName ?? null,
  );
  const [confirmed, setConfirmed] = useState(false);
  const [conditions, setConditions] = useState<string[]>(
    initialProperty?.terms && initialProperty.terms.length > 0
      ? initialProperty.terms
      : [""],
  );
  const [attributes, setAttributes] = useState<PropertyAttribute[]>(
    initialProperty?.attributes && initialProperty.attributes.length > 0
      ? initialProperty.attributes
      : [{ label: "", value: "" }],
  );

  const propertyTypeOptions = PROPERTY_TYPES_BY_BUILDING[buildingType];

  const handleBuildingTypeChange = (next: BuildingType) => {
    setBuildingType(next);
    if (!PROPERTY_TYPES_BY_BUILDING[next].includes(propertyType)) {
      setPropertyType(PROPERTY_TYPES_BY_BUILDING[next][0]);
    }
  };

  const updateCondition = (index: number, value: string) => {
    setConditions((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (
    index: number,
    field: "label" | "value",
    value: string,
  ) => {
    setAttributes((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const goNext = () => {
    if (step === 1 && (!name.trim() || !address.trim() || !upi.trim())) {
      setStepError(c.errorBasicInfo);
      return;
    }
    if (step === 2 && (!rent.trim() || Number(rent) <= 0)) {
      setStepError(c.errorRent);
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
    onSuccess({
      name: name.trim(),
      address: address.trim(),
      upi: upi.trim(),
      buildingType,
      type: propertyType,
      size: buildingType === "Commercial" ? size.trim() || null : null,
      rent: Number(rent) || 0,
      availability,
      terms: conditions.map((c) => c.trim()).filter(Boolean),
      attributes: attributes
        .map((a) => ({ label: a.label.trim(), value: a.value.trim() }))
        .filter((a) => a.label && a.value),
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
            {c.propertyName}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.propertyNamePlaceholder}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.address}
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={c.addressPlaceholder}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.upi}
            <input
              type="text"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              placeholder={c.upiPlaceholder}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.buildingType}
            <select
              value={buildingType}
              onChange={(e) =>
                handleBuildingTypeChange(e.target.value as BuildingType)
              }
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option value="Residential">{t.dashboard.status.residential}</option>
              <option value="Commercial">{t.dashboard.status.commercial}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.propertyType}
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              {propertyTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {t.dashboard.status[PROPERTY_TYPE_KEY[option] ?? "unit"]}
                </option>
              ))}
            </select>
          </label>

          {buildingType === "Commercial" && (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {c.size}
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder={c.sizePlaceholder}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>
          )}

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
            {c.availability}
            <select
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value as Property["availability"])
              }
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option value="Available">{t.dashboard.status.available}</option>
              <option value="Occupied">{t.dashboard.status.occupied}</option>
            </select>
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.rentConditionsLabel}
          <div className="flex flex-col gap-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => updateCondition(index, e.target.value)}
                  placeholder={c.rentConditionPlaceholder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  aria-label={c.removeCondition}
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
            {c.addCondition}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.additionalDetailsLabel}
          <p className="text-xs font-normal text-slate-400">
            {c.additionalDetailsHint}
          </p>
          <div className="flex flex-col gap-2">
            {attributes.map((attribute, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={attribute.label}
                  onChange={(e) =>
                    updateAttribute(index, "label", e.target.value)
                  }
                  placeholder={c.attributeLabelPlaceholder}
                  className="w-2/5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <input
                  type="text"
                  value={attribute.value}
                  onChange={(e) =>
                    updateAttribute(index, "value", e.target.value)
                  }
                  placeholder={c.attributeValuePlaceholder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  aria-label={c.removeDetail}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-400 hover:bg-slate-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setAttributes((prev) => [...prev, { label: "", value: "" }])
            }
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gold hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            {c.addDetail}
          </button>
        </div>
      )}

      {step === 5 && (
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
              initialProperty ? c.saveChanges : c.submit
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
