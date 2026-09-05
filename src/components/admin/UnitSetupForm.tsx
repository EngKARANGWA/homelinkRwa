"use client";

import { useState } from "react";
import { UploadCloud, Wand2 } from "lucide-react";
import { generateUnits, importUnits } from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";

type Mode = "generate" | "import";

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
  const [rowErrors, setRowErrors] = useState<{ row: number; message: string }[] | null>(null);

  const [count, setCount] = useState("10");
  const [floors, setFloors] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const [file, setFile] = useState<File | null>(null);

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

  const handleImport = async () => {
    if (!file) {
      setError("Choose a .xlsx file first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setRowErrors(null);
    try {
      const units = await importUnits(propertyId, file);
      onDone(units.length);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (Array.isArray(err.errors)) {
          setRowErrors(err.errors as { row: number; message: string }[]);
        }
      } else {
        setError("Failed to import units.");
      }
    } finally {
      setSubmitting(false);
    }
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
          onClick={() => setMode("generate")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "generate" ? "bg-white text-navy shadow-sm" : "text-slate-500"
          }`}
        >
          <Wand2 className="h-4 w-4" />
          Generate units
        </button>
        <button
          type="button"
          onClick={() => setMode("import")}
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

      {mode === "generate" ? (
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
      ) : (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Units spreadsheet (.xlsx)
          <span className="font-normal text-slate-400">
            Columns: label, floor, bedrooms, bathrooms, rentAmount — one row per unit, each with
            its own price.
          </span>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy file:mr-3 file:rounded-md file:border-0 file:bg-gold/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-gold"
          />
        </label>
      )}

      <div className="mt-2 flex justify-between gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Skip for now
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={mode === "generate" ? handleGenerate : handleImport}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
        >
          {submitting ? "Working..." : mode === "generate" ? "Generate units" : "Import units"}
        </button>
      </div>
    </div>
  );
}
