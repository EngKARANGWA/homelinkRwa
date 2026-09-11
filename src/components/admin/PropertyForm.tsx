"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import type {
  CreatePropertyInput,
  Property,
  PropertyAttribute,
  PropertyCategory,
  PropertyType,
  User,
} from "@/lib/api/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const TYPE_OPTIONS: Record<PropertyCategory, PropertyType[]> = {
  residential: ["apartment", "house", "studio", "condo", "other"],
  commercial: ["commercial"],
};

const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Apartment",
  house: "House",
  studio: "Studio",
  condo: "Condo",
  commercial: "Commercial Unit",
  other: "Other",
};

export function PropertyForm({
  owners,
  initialProperty,
  showOwnerField = true,
  onSuccess,
  onCancel,
}: {
  owners: User[];
  initialProperty?: Property;
  showOwnerField?: boolean;
  onSuccess: (values: CreatePropertyInput, documentFile: File | null) => void;
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
  const isEditing = !!initialProperty;
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialProperty?.title ?? "");
  const [description, setDescription] = useState(initialProperty?.description ?? "");
  const [addressLine, setAddressLine] = useState(initialProperty?.addressLine ?? "");
  const [city, setCity] = useState(initialProperty?.city ?? "");
  const [state, setState] = useState(initialProperty?.state ?? "");
  const [country, setCountry] = useState(initialProperty?.country ?? "Rwanda");
  const [postalCode, setPostalCode] = useState(initialProperty?.postalCode ?? "");
  const [upi, setUpi] = useState(initialProperty?.upi ?? "");
  const [ownerId, setOwnerId] = useState(initialProperty?.ownerId ?? owners[0]?.id ?? "");

  const [category, setCategory] = useState<PropertyCategory>(
    initialProperty?.category ?? "residential",
  );
  const [type, setType] = useState<PropertyType>(initialProperty?.type ?? "apartment");
  const [sizeSqm, setSizeSqm] = useState(
    initialProperty?.sizeSqm != null ? String(initialProperty.sizeSqm) : "",
  );
  const [rentAmount, setRentAmount] = useState(initialProperty?.rentAmount ?? "");

  // A single property has its own bedrooms/bathrooms; a multi-unit building
  // (apartment) or a commercial space doesn't — those are set per unit instead.
  const needsPropertyLevelRooms = type !== "apartment" && category !== "commercial";
  const [bedrooms, setBedrooms] = useState(
    initialProperty?.bedrooms != null ? String(initialProperty.bedrooms) : "",
  );
  const [bathrooms, setBathrooms] = useState(
    initialProperty?.bathrooms != null ? String(initialProperty.bathrooms) : "",
  );

  const [terms, setTerms] = useState<string[]>(initialProperty?.terms ?? []);
  const [attributes, setAttributes] = useState<PropertyAttribute[]>(
    initialProperty?.attributes ?? [],
  );

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(isEditing);

  const typeOptions = TYPE_OPTIONS[category];

  const handleCategoryChange = (next: PropertyCategory) => {
    setCategory(next);
    if (!TYPE_OPTIONS[next].includes(type)) {
      setType(TYPE_OPTIONS[next][0]);
    }
  };

  const addTerm = () => setTerms((prev) => [...prev, ""]);
  const updateTerm = (index: number, value: string) =>
    setTerms((prev) => prev.map((term, i) => (i === index ? value : term)));
  const removeTerm = (index: number) =>
    setTerms((prev) => prev.filter((_, i) => i !== index));

  const addAttribute = () => setAttributes((prev) => [...prev, { label: "", value: "" }]);
  const updateAttribute = (index: number, field: "label" | "value", value: string) =>
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)),
    );
  const removeAttribute = (index: number) =>
    setAttributes((prev) => prev.filter((_, i) => i !== index));

  const goNext = () => {
    if (
      step === 1 &&
      (!title.trim() || !addressLine.trim() || !city.trim() || !country.trim())
    ) {
      setStepError(c.errorBasicInfo);
      return;
    }
    if (step === 1 && showOwnerField && !ownerId) {
      setStepError(c.errorBasicInfo);
      return;
    }
    if (step === 2) {
      if (category === "commercial" && !sizeSqm.trim()) {
        setStepError("Size (sqm) is required for commercial properties.");
        return;
      }
      if (!rentAmount.toString().trim() || Number(rentAmount) <= 0) {
        setStepError(c.errorRent);
        return;
      }
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
    onSuccess(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: state.trim() || undefined,
        country: country.trim(),
        postalCode: postalCode.trim() || undefined,
        upi: upi.trim() || undefined,
        category,
        type,
        sizeSqm: category === "commercial" ? Number(sizeSqm) : undefined,
        bedrooms: needsPropertyLevelRooms && bedrooms.trim() ? Number(bedrooms) : undefined,
        bathrooms: needsPropertyLevelRooms && bathrooms.trim() ? Number(bathrooms) : undefined,
        rentAmount: Number(rentAmount),
        terms: terms.map((term) => term.trim()).filter(Boolean),
        attributes: attributes
          .map((attr) => ({ label: attr.label.trim(), value: attr.value.trim() }))
          .filter((attr) => attr.label && attr.value),
        ...(showOwnerField ? { ownerId } : {}),
      },
      documentFile,
    );
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
                  i + 1 <= step ? "bg-gold text-white" : "bg-slate-100 text-slate-400"
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
                className={`mx-2 h-px flex-1 ${i + 1 < step ? "bg-gold" : "bg-slate-200"}`}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={c.propertyNamePlaceholder}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional details about the property"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.address}
            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder={c.addressPlaceholder}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              City
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kigali"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Country
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Rwanda"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              State / Province (optional)
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Postal Code (optional)
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
              />
            </label>
          </div>

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

          {showOwnerField && (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {c.owner}
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
              >
                {owners.length === 0 && <option value="">No landlords yet</option>}
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.firstName} {owner.lastName}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.buildingType}
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as PropertyCategory)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option value="residential">{t.dashboard.status.residential}</option>
              <option value="commercial">{t.dashboard.status.commercial}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.propertyType}
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PropertyType)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {TYPE_LABELS[option]}
                </option>
              ))}
            </select>
          </label>

          {category === "commercial" && (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {c.size}
              <input
                type="number"
                min={0}
                value={sizeSqm}
                onChange={(e) => setSizeSqm(e.target.value)}
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
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              placeholder={c.monthlyRentPlaceholder}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          {needsPropertyLevelRooms && (
            <>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Bedrooms (optional)
                <input
                  type="number"
                  min={0}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Bathrooms (optional)
                <input
                  type="number"
                  min={0}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </label>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700">{c.rentConditionsLabel}</p>
          </div>

          {terms.length === 0 && (
            <p className="text-sm text-slate-400">No conditions added yet.</p>
          )}

          <div className="flex flex-col gap-3">
            {terms.map((term, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={term}
                  onChange={(e) => updateTerm(index, e.target.value)}
                  placeholder={c.rentConditionPlaceholder}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeTerm(index)}
                  aria-label={c.removeCondition}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTerm}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
          >
            <Plus className="h-4 w-4" />
            {c.addCondition}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700">{c.additionalDetailsLabel}</p>
            <p className="mt-1 text-xs text-slate-400">{c.additionalDetailsHint}</p>
          </div>

          {attributes.length === 0 && (
            <p className="text-sm text-slate-400">No additional details added yet.</p>
          )}

          <div className="flex flex-col gap-3">
            {attributes.map((attr, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={attr.label}
                  onChange={(e) => updateAttribute(index, "label", e.target.value)}
                  placeholder={c.attributeLabelPlaceholder}
                  className="w-1/3 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttribute(index, "value", e.target.value)}
                  placeholder={c.attributeValuePlaceholder}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  aria-label={c.removeDetail}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addAttribute}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
          >
            <Plus className="h-4 w-4" />
            {c.addDetail}
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.documentLabel}
            <span className="font-normal text-slate-400">{c.documentHint}</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy file:mr-3 file:rounded-md file:border-0 file:bg-gold/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-gold"
            />
          </label>

          <label className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-gold focus:ring-gold"
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
            ) : isEditing ? (
              c.saveChanges
            ) : (
              c.submit
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
