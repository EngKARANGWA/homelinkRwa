"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type {
  CreatePropertyInput,
<<<<<<< HEAD
  Property,
=======
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
  PropertyCategory,
  PropertyType,
  User,
} from "@/lib/api/types";

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

const STEPS = ["Basic Info", "Type & Details", "Rent & Owner"];

export function PropertyForm({
  owners,
<<<<<<< HEAD
  initialProperty,
  showOwnerField = true,
=======
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
  onSuccess,
  onCancel,
}: {
  owners: User[];
<<<<<<< HEAD
  initialProperty?: Property;
  showOwnerField?: boolean;
=======
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
  onSuccess: (values: CreatePropertyInput) => void;
  onCancel: () => void;
}) {
  const isEditing = !!initialProperty;
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

<<<<<<< HEAD
  const [title, setTitle] = useState(initialProperty?.title ?? "");
  const [description, setDescription] = useState(initialProperty?.description ?? "");
  const [addressLine, setAddressLine] = useState(initialProperty?.addressLine ?? "");
  const [city, setCity] = useState(initialProperty?.city ?? "");
  const [state, setState] = useState(initialProperty?.state ?? "");
  const [country, setCountry] = useState(initialProperty?.country ?? "Rwanda");
  const [postalCode, setPostalCode] = useState(initialProperty?.postalCode ?? "");

  const [category, setCategory] = useState<PropertyCategory>(
    initialProperty?.category ?? "residential",
  );
  const [type, setType] = useState<PropertyType>(initialProperty?.type ?? "apartment");
  const [sizeSqm, setSizeSqm] = useState(
    initialProperty?.sizeSqm != null ? String(initialProperty.sizeSqm) : "",
  );
  const [unitsCount, setUnitsCount] = useState(
    initialProperty?.unitsCount != null ? String(initialProperty.unitsCount) : "",
  );
  const [bedrooms, setBedrooms] = useState(
    initialProperty?.bedrooms != null ? String(initialProperty.bedrooms) : "",
  );
  const [bathrooms, setBathrooms] = useState(
    initialProperty?.bathrooms != null ? String(initialProperty.bathrooms) : "",
  );

  const [rentAmount, setRentAmount] = useState(initialProperty?.rentAmount ?? "");
  const [rentConditions, setRentConditions] = useState(
    initialProperty?.rentConditions ?? "",
  );
  const [ownerId, setOwnerId] = useState(initialProperty?.ownerId ?? owners[0]?.id ?? "");

=======
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Rwanda");
  const [postalCode, setPostalCode] = useState("");

  const [category, setCategory] = useState<PropertyCategory>("residential");
  const [type, setType] = useState<PropertyType>("apartment");
  const [sizeSqm, setSizeSqm] = useState("");
  const [unitsCount, setUnitsCount] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const [rentAmount, setRentAmount] = useState("");
  const [rentConditions, setRentConditions] = useState("");
  const [ownerId, setOwnerId] = useState(owners[0]?.id ?? "");

>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
  const typeOptions = TYPE_OPTIONS[category];

  const handleCategoryChange = (next: PropertyCategory) => {
    setCategory(next);
    if (!TYPE_OPTIONS[next].includes(type)) {
      setType(TYPE_OPTIONS[next][0]);
    }
  };

  const goNext = () => {
    if (step === 1 && (!title.trim() || !addressLine.trim() || !city.trim() || !country.trim())) {
      setStepError("Please fill in title, address, city, and country.");
      return;
    }
    if (step === 2 && category === "commercial" && !sizeSqm.trim()) {
      setStepError("Size (sqm) is required for commercial properties.");
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
<<<<<<< HEAD
    if (!rentAmount.toString().trim() || Number(rentAmount) <= 0) {
      setStepError("Please enter a valid monthly rent.");
      return;
    }
    if (showOwnerField && !ownerId) {
=======
    if (!rentAmount.trim() || Number(rentAmount) <= 0) {
      setStepError("Please enter a valid monthly rent.");
      return;
    }
    if (!ownerId) {
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
      setStepError("Please select an owner.");
      return;
    }
    setStepError(null);
    onSuccess({
      title: title.trim(),
      description: description.trim() || undefined,
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim() || undefined,
      country: country.trim(),
      postalCode: postalCode.trim() || undefined,
      category,
      type,
      sizeSqm: category === "commercial" ? Number(sizeSqm) : undefined,
      unitsCount: type === "apartment" && unitsCount.trim() ? Number(unitsCount) : undefined,
      bedrooms: bedrooms.trim() ? Number(bedrooms) : undefined,
      bathrooms: bathrooms.trim() ? Number(bathrooms) : undefined,
      rentAmount: Number(rentAmount),
      rentConditions: rentConditions.trim() || undefined,
<<<<<<< HEAD
      ...(showOwnerField ? { ownerId } : {}),
=======
      ownerId,
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
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
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kigali Heights Apartment 4B"
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
            Address
            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. KG 7 Ave, Nyarutarama"
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
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Category
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as PropertyCategory)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Type
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
              Size (sqm)
              <input
                type="number"
                min={0}
                value={sizeSqm}
                onChange={(e) => setSizeSqm(e.target.value)}
                placeholder="e.g. 85"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>
          )}

          {type === "apartment" && (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Units / doors in building
              <input
                type="number"
                min={0}
                value={unitsCount}
                onChange={(e) => setUnitsCount(e.target.value)}
                placeholder="e.g. 12"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>
          )}

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
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Monthly rent (RWF)
              <input
                type="number"
                min={0}
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                placeholder="e.g. 450000"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

<<<<<<< HEAD
            {showOwnerField && (
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Owner
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
=======
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Owner
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
>>>>>>> 9449faea5b8da912e44a7723fb71d6c1e2db28d3
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Rent conditions (optional)
            <input
              type="text"
              value={rentConditions}
              onChange={(e) => setRentConditions(e.target.value)}
              placeholder="e.g. 12-month lease, 2 months deposit"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
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
              Back
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
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={step < STEPS.length ? goNext : submitForm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            {step < STEPS.length ? (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              isEditing ? "Save Changes" : "Add Property"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
