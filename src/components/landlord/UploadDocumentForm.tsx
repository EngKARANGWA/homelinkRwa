"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { TODAY, type Property } from "@/lib/mock-admin-data";
import { getUnitsForProperty, type UnitOverrides } from "@/lib/units";
import type { DocumentCategory, LandlordDocument } from "@/lib/documents";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const CATEGORIES: DocumentCategory[] = [
  "Property Document",
  "Lease Agreement",
  "ID Verification",
  "Other",
];

export function UploadDocumentForm({
  properties,
  unitOverrides,
  onSuccess,
  onCancel,
}: {
  properties: Property[];
  unitOverrides: UnitOverrides;
  onSuccess: (doc: LandlordDocument) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.uploadDocumentForm;
  const categoryLabel: Record<DocumentCategory, string> = {
    "Property Document": c.categories.propertyDocument,
    "Lease Agreement": c.categories.leaseAgreement,
    "ID Verification": c.categories.idVerification,
    Other: c.categories.other,
  };
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [unitNumber, setUnitNumber] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("Property Document");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedProperty = properties.find((p) => p.id === propertyId) ?? null;

  const occupiedUnits = useMemo(() => {
    if (!selectedProperty) return [];
    return getUnitsForProperty(selectedProperty, unitOverrides).filter(
      (u) => u.occupancyStatus === "Occupied",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty?.id, unitOverrides]);

  const selectedUnit = occupiedUnits.find((u) => u.unitNumber === unitNumber) ?? null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) {
      setError(c.errorSelectProperty);
      return;
    }
    if (!fileName) {
      setError(c.errorChooseFile);
      return;
    }
    setError(null);

    onSuccess({
      id: String(Date.now()),
      name: fileName,
      category,
      propertyId: selectedProperty.id,
      propertyName: selectedProperty.name,
      unitNumber: selectedUnit?.unitNumber ?? null,
      tenant: selectedUnit?.tenant ?? null,
      uploadedAt: TODAY,
      isUploaded: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        {c.file}
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            {c.chooseFile}
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
          {fileName && <span className="text-sm text-slate-600">{fileName}</span>}
        </div>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.category}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{categoryLabel[cat]}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.property}
          <SearchableSelect
            value={propertyId}
            onChange={(value) => {
              setPropertyId(value);
              setUnitNumber("");
            }}
            options={properties.map((property) => ({
              value: property.id,
              label: property.name,
            }))}
            placeholder={c.selectProperty}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          {c.unitOptional}
          <SearchableSelect
            value={unitNumber}
            onChange={setUnitNumber}
            options={[
              { value: "", label: c.propertyWideDocument },
              ...occupiedUnits.map((unit) => ({
                value: unit.unitNumber,
                label: `${unit.unitNumber} · ${unit.tenant}`,
              })),
            ]}
            placeholder={c.propertyWideDocument}
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
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          {c.submit}
        </button>
      </div>
    </form>
  );
}
