"use client";

import { useState } from "react";
import { Download, ListPlus, Plus, UploadCloud, Wand2 } from "lucide-react";
import {
  createUnit,
  downloadUnitsImportTemplate,
  generateUnits,
  importUnits,
  previewImportUnits,
} from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { CreateUnitInput, ImportUnitsRowError } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";

type Mode = "manual" | "generate" | "import";

/**
 * Shown right after creating an apartment/commercial property — offers a
 * fast way to set up many units at once instead of adding them one by one.
 * Purely optional: onSkip leaves the property with just its single default
 * unit, same as before this existed.
 */
export function UnitSetupForm({
  propertyId,
  onDone,
  onSkip,
}: {
  propertyId: string;
  onDone: (unitsCreated: number) => void;
  onSkip: () => void;
}) {
  const [mode, setMode] = useState<Mode>("generate");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<ImportUnitsRowError[] | null>(null);

  // Manual, one-at-a-time
  const [label, setLabel] = useState("");
  const [floor, setFloor] = useState("");
  const [unitBedrooms, setUnitBedrooms] = useState("");
  const [unitBathrooms, setUnitBathrooms] = useState("");
  const [unitRent, setUnitRent] = useState("");
  const [addedUnits, setAddedUnits] = useState<{ label: string; rentAmount: number }[]>([]);

  // Bulk generate
  const [count, setCount] = useState("10");
  const [floors, setFloors] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  // Excel import
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CreateUnitInput[] | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const handleAddUnit = async () => {
    if (!label.trim()) {
      setError("Enter a unit number/name, e.g. A001.");
      return;
    }
    if (!unitRent.trim() || Number(unitRent) <= 0) {
      setError("Enter a valid monthly rent for this unit.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const unit = await createUnit(propertyId, {
        label: label.trim(),
        floor: floor.trim() ? Number(floor) : undefined,
        bedrooms: unitBedrooms.trim() ? Number(unitBedrooms) : undefined,
        bathrooms: unitBathrooms.trim() ? Number(unitBathrooms) : undefined,
        rentAmount: Number(unitRent),
      });
      setAddedUnits((prev) => [...prev, { label: unit.label, rentAmount: Number(unit.rentAmount) }]);
      setLabel("");
      setFloor("");
      setUnitBedrooms("");
      setUnitBathrooms("");
      setUnitRent("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add this unit.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = async () => {
    if (!count.trim() || Number(count) < 1) {
      setError("Enter how many units to create.");
      return;
    }
    if (!rentAmount.trim() || Number(rentAmount) <= 0) {
      setError("Enter a default rent amount — you can adjust individual unit prices afterward.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setRowErrors(null);
    try {
      const units = await generateUnits(propertyId, {
        count: Number(count),
        floors: floors.trim() ? Number(floors) : undefined,
        bedrooms: bedrooms.trim() ? Number(bedrooms) : undefined,
        bathrooms: bathrooms.trim() ? Number(bathrooms) : undefined,
        rentAmount: Number(rentAmount),
      });
      onDone(units.length);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate units.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    setError(null);
    try {
      await downloadUnitsImportTemplate();
    } catch {
      setError("Failed to download the template. Please try again.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setError("Choose a .xlsx file first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setRowErrors(null);
    try {
      const result = await previewImportUnits(propertyId, file);
      setPreview(result.values);
      setRowErrors(result.errors);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to read this file.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const units = await importUnits(propertyId, file);
      onDone(units.length);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (Array.isArray(err.errors)) {
          setRowErrors(err.errors as ImportUnitsRowError[]);
        }
      } else {
        setError("Failed to import units.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setPreview(null);
    setRowErrors(null);
    setError(null);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setRowErrors(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500">
        This property has multiple units — set them all up now, or skip and add units one at a
        time later.
      </p>

      <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => switchMode("manual")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "manual" ? "bg-white text-navy shadow-sm" : "text-slate-500"
          }`}
        >
          <ListPlus className="h-4 w-4" />
          Add manually
        </button>
        <button
          type="button"
          onClick={() => switchMode("generate")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "generate" ? "bg-white text-navy shadow-sm" : "text-slate-500"
          }`}
        >
          <Wand2 className="h-4 w-4" />
          Generate units
        </button>
        <button
          type="button"
          onClick={() => switchMode("import")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "import" ? "bg-white text-navy shadow-sm" : "text-slate-500"
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          Import from Excel
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {rowErrors && rowErrors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <p className="mb-1 font-semibold">Fix these rows and re-upload:</p>
          <ul className="list-inside list-disc">
            {rowErrors.map((e) => (
              <li key={e.row}>
                Row {e.row}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode === "manual" && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Unit number/name
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. A001"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Monthly rent
              <input
                type="number"
                min={0}
                value={unitRent}
                onChange={(e) => setUnitRent(e.target.value)}
                placeholder="e.g. 150000"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Floor (optional)
              <input
                type="number"
                min={0}
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Bedrooms
                <input
                  type="number"
                  min={0}
                  value={unitBedrooms}
                  onChange={(e) => setUnitBedrooms(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Bathrooms
                <input
                  type="number"
                  min={0}
                  value={unitBathrooms}
                  onChange={(e) => setUnitBathrooms(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleAddUnit}
            className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add this unit
          </button>

          {addedUnits.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Added so far ({addedUnits.length})
              </p>
              <ul className="flex flex-col gap-1 text-sm text-slate-600">
                {addedUnits.map((u, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{u.label}</span>
                    <span className="text-slate-400">{formatMoney(u.rentAmount)} RWF</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {mode === "generate" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            How many units?
            <input
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Number of floors (optional)
            <input
              type="number"
              min={1}
              value={floors}
              onChange={(e) => setFloors(e.target.value)}
              placeholder="Units are distributed evenly across floors"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Default rent per unit
            <input
              type="number"
              min={0}
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              placeholder="You can edit individual unit prices afterward"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
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

      {mode === "import" && (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-gold hover:underline disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            {downloadingTemplate ? "Downloading..." : "Download Excel template"}
          </button>

          {!preview ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Units spreadsheet (.xlsx)
              <span className="font-normal text-slate-400">
                Columns: label, floor, bedrooms, bathrooms, rentAmount — one row per unit, each
                with its own price.
              </span>
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setPreview(null);
                  setRowErrors(null);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy file:mr-3 file:rounded-md file:border-0 file:bg-gold/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-gold"
              />
            </label>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-700">
                Preview — {preview.length} unit{preview.length === 1 ? "" : "s"} will be created
              </p>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">Label</th>
                      <th className="px-3 py-2 font-medium">Floor</th>
                      <th className="px-3 py-2 font-medium">Bed</th>
                      <th className="px-3 py-2 font-medium">Bath</th>
                      <th className="px-3 py-2 font-medium">Rent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium text-navy">{row.label}</td>
                        <td className="px-3 py-2 text-slate-500">{row.floor ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-500">{row.bedrooms ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-500">{row.bathrooms ?? "—"}</td>
                        <td className="px-3 py-2 text-slate-500">{formatMoney(row.rentAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={resetImport}
                className="self-start text-sm font-medium text-slate-500 hover:text-navy"
              >
                Choose a different file
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex justify-between gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          {mode === "manual" && addedUnits.length > 0 ? "Done" : "Skip for now"}
        </button>
        {mode === "manual" ? (
          addedUnits.length > 0 && (
            <button
              type="button"
              onClick={() => onDone(addedUnits.length)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
            >
              Finish ({addedUnits.length} added)
            </button>
          )
        ) : mode === "generate" ? (
          <button
            type="button"
            disabled={submitting}
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
          >
            {submitting ? "Working..." : "Generate units"}
          </button>
        ) : !preview ? (
          <button
            type="button"
            disabled={submitting || !file}
            onClick={handlePreview}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
          >
            {submitting ? "Reading..." : "Preview import"}
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting || (rowErrors?.length ?? 0) > 0}
            onClick={handleConfirmImport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
          >
            {submitting ? "Importing..." : `Confirm import (${preview.length})`}
          </button>
        )}
      </div>
    </div>
  );
}
