"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  downloadUnitsImportTemplate,
  importUnits,
  previewImportUnits,
} from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { CreateUnitInput, Floor, ImportUnitsRowError } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";

/**
 * Bulk-creates units from an uploaded .xlsx, one row per unit, across any
 * of the property's floors at once — each row's Floor column must match an
 * existing floor's name (e.g. "Ground", "Floor 1").
 */
export function ImportUnitsForm({
  propertyId,
  floors,
  onDone,
  onCancel,
}: {
  propertyId: string;
  floors: Floor[];
  onDone: (createdCount: number) => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<ImportUnitsRowError[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CreateUnitInput[] | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const floorNameById = new Map(floors.map((f) => [f.id, f.name]));

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
      const importedUnits = await importUnits(propertyId, file);
      onDone(importedUnits.length);
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

  return (
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

      {!preview ? (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Units spreadsheet (.xlsx)
          <span className="font-normal text-slate-400">
            Columns: label, floor (must match an existing floor name, e.g. &quot;Ground&quot;),
            bedrooms, bathrooms, rentAmount — one row per unit, each with its own price.
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
                    <td className="px-3 py-2 text-slate-500">
                      {floorNameById.get(row.floorId) ?? "—"}
                    </td>
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

      <div className="mt-2 flex justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        {!preview ? (
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
