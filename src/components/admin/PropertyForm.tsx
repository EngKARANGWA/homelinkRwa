"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import {
  LANDLORDS,
  PROPERTY_TYPES_BY_BUILDING,
  type BuildingType,
  type Property,
  type PropertyAttribute,
  type PropertyType,
} from "@/lib/mock-admin-data";

export type PropertyFormValues = {
  name: string;
  address: string;
  upi: string;
  owner: string;
  buildingType: BuildingType;
  type: PropertyType;
  rent: number;
  availability: Property["availability"];
  terms: string[];
  attributes: PropertyAttribute[];
};

const STEPS = ["Basic Info", "Type & Rent", "Rent Conditions", "Additional Details"];

export function PropertyForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (values: PropertyFormValues) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [upi, setUpi] = useState("");
  const [owner, setOwner] = useState(LANDLORDS[0].name);
  const [rent, setRent] = useState("");
  const [availability, setAvailability] =
    useState<Property["availability"]>("Available");
  const [buildingType, setBuildingType] = useState<BuildingType>("Residential");
  const [propertyType, setPropertyType] = useState<PropertyType>(
    PROPERTY_TYPES_BY_BUILDING.Residential[0],
  );
  const [conditions, setConditions] = useState<string[]>([""]);
  const [attributes, setAttributes] = useState<PropertyAttribute[]>([
    { label: "", value: "" },
  ]);

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
      setStepError("Please fill in property name, address, and UPI.");
      return;
    }
    if (step === 2 && (!rent.trim() || Number(rent) <= 0)) {
      setStepError("Please enter a valid monthly rent.");
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
    onSuccess({
      name: name.trim(),
      address: address.trim(),
      upi: upi.trim(),
      owner,
      buildingType,
      type: propertyType,
      rent: Number(rent) || 0,
      availability,
      terms: conditions.map((c) => c.trim()).filter(Boolean),
      attributes: attributes
        .map((a) => ({ label: a.label.trim(), value: a.value.trim() }))
        .filter((a) => a.label && a.value),
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
            Property name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kigali Heights Apartment 4B"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Address
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="District, Sector, Cell"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            UPI (Unique Parcel Identifier)
            <input
              type="text"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              placeholder="e.g. 1/01/03/02/1156"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Owner (landlord)
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              {LANDLORDS.map((landlord) => (
                <option key={landlord.id}>{landlord.name}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Building type
            <select
              value={buildingType}
              onChange={(e) =>
                handleBuildingTypeChange(e.target.value as BuildingType)
              }
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option>Residential</option>
              <option>Commercial</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Property type
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              {propertyTypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Monthly rent (RWF)
            <input
              type="number"
              min={0}
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="e.g. 450000"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Availability
            <select
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value as Property["availability"])
              }
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option>Available</option>
              <option>Occupied</option>
            </select>
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Rent conditions
          <div className="flex flex-col gap-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => updateCondition(index, e.target.value)}
                  placeholder="e.g. 12-month lease"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  aria-label="Remove condition"
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
            Add condition
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Additional details
          <p className="text-xs font-normal text-slate-400">
            Context that depends on the unit — e.g. which floor it&apos;s on, whether
            the door opens onto the street, parking, etc. Add as many as apply.
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
                  placeholder="e.g. Floor"
                  className="w-2/5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <input
                  type="text"
                  value={attribute.value}
                  onChange={(e) =>
                    updateAttribute(index, "value", e.target.value)
                  }
                  placeholder="e.g. Ground Floor, faces main road"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  aria-label="Remove detail"
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
            Add detail
          </button>
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
              "Add Property"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
