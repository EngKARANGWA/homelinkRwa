"use client";

import { useState } from "react";
import { SELECTABLE_PROPERTY_TYPES, type CreatePropertyInput, type Property, type PropertyType, type User } from "@/lib/api/types";
import { RwandaLocationPicker, type RwandaLocationValue } from "@/components/admin/RwandaLocationPicker";
import { formatPropertyType } from "@/lib/propertyType";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
  onSuccess: (values: CreatePropertyInput, documentFile: File | null) => void | Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.propertyForm;
  const isEditing = !!initialProperty;
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState(initialProperty?.title ?? "");
  const [type, setType] = useState<PropertyType>(initialProperty?.type ?? "apartment");
  // Only apartment/commercial/mixed_use are offered for a new selection —
  // but an existing property already on a legacy type (house/studio/condo/
  // other) keeps showing its real type here rather than silently snapping
  // to "Apartment", which would misclassify it the moment the form is saved.
  const typeOptions = SELECTABLE_PROPERTY_TYPES.includes(type)
    ? SELECTABLE_PROPERTY_TYPES
    : [type, ...SELECTABLE_PROPERTY_TYPES];
  // Existing properties store a free-text location that doesn't necessarily
  // match this structured picker — kept only as a fallback for editing an
  // older property whose picker fields are left untouched (empty).
  const [originalLocation] = useState(initialProperty?.location ?? "");
  const [locationParts, setLocationParts] = useState<RwandaLocationValue>({
    province: "",
    district: "",
    sector: "",
    cell: "",
  });
  const composedLocation = [locationParts.cell, locationParts.sector, locationParts.district, locationParts.province]
    .filter(Boolean)
    .join(", ");
  const [numberOfFloors, setNumberOfFloors] = useState(
    initialProperty?.numberOfFloors != null ? String(initialProperty.numberOfFloors) : "1",
  );
  const [hasBasement, setHasBasement] = useState(
    initialProperty?.numberOfBasementFloors != null && initialProperty.numberOfBasementFloors > 0,
  );
  const [numberOfBasementFloors, setNumberOfBasementFloors] = useState(
    initialProperty?.numberOfBasementFloors != null ? String(initialProperty.numberOfBasementFloors) : "1",
  );
  const [ownerId, setOwnerId] = useState(initialProperty?.ownerId ?? owners[0]?.id ?? "");

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(isEditing);

  const submitForm = async () => {
    // Guards against the double-submit that happens when a slow network makes
    // someone click "Add Property" more than once — each click used to fire
    // its own independent create request, creating real duplicate properties.
    if (submitting) return;

    if (!title.trim() || (!composedLocation && !originalLocation)) {
      setFormError(c.errorBasicInfo);
      return;
    }
    if (showOwnerField && !ownerId) {
      setFormError(c.errorBasicInfo);
      return;
    }
    if (!isEditing && (!numberOfFloors.trim() || Number(numberOfFloors) < 1)) {
      setFormError(c.errorBasicInfo);
      return;
    }
    if (!isEditing && hasBasement && (!numberOfBasementFloors.trim() || Number(numberOfBasementFloors) < 1)) {
      setFormError(c.errorBasicInfo);
      return;
    }
    if (!confirmed) {
      setFormError(c.errorConfirm);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await onSuccess(
        {
          title: title.trim(),
          type,
          location: composedLocation || originalLocation,
          numberOfFloors: Number(numberOfFloors),
          numberOfBasementFloors: hasBasement ? Number(numberOfBasementFloors) : 0,
          ...(showOwnerField ? { ownerId } : {}),
        },
        documentFile,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitForm();
      }}
    >
      {formError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
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
            {c.propertyType}
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PropertyType)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              {typeOptions.map((value) => (
                <option key={value} value={value}>
                  {formatPropertyType(value)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-slate-700">{c.address}</p>
          <RwandaLocationPicker value={locationParts} onChange={setLocationParts} />
          {originalLocation && !composedLocation && (
            <p className="text-xs text-slate-400">Current: {originalLocation}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {!isEditing && (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {c.numberOfFloors}
              <input
                type="number"
                min={1}
                max={200}
                value={numberOfFloors}
                onChange={(e) => setNumberOfFloors(e.target.value)}
                placeholder={c.numberOfFloorsPlaceholder}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
              <span className="font-normal text-slate-400">{c.numberOfFloorsHint}</span>
            </label>
          )}

          {!isEditing && (
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={hasBasement}
                  onChange={(e) => setHasBasement(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-gold focus:ring-gold"
                />
                Has basement
              </label>
              {hasBasement && (
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={numberOfBasementFloors}
                  onChange={(e) => setNumberOfBasementFloors(e.target.value)}
                  placeholder="Number of basement floors"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
              )}
            </div>
          )}

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

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          {t.dashboard.actions.cancel}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? isEditing
              ? "Saving..."
              : "Adding..."
            : isEditing
              ? c.saveChanges
              : c.submit}
        </button>
      </div>
    </form>
  );
}
