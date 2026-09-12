"use client";

import { useState } from "react";
import { updateUnit } from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { ManualUnitStatus, PropertyUnit } from "@/lib/api/types";

/**
 * Edits one unit's own fields via PATCH /properties/:id/units/:unitId.
 * Status is only editable while the unit is vacant — the backend rejects
 * a status change on an occupied unit (it only flips via a lease).
 */
export function EditUnitForm({
  propertyId,
  unit,
  onCancel,
  onSuccess,
}: {
  propertyId: string;
  unit: PropertyUnit;
  onCancel: () => void;
  onSuccess: (updated: PropertyUnit) => void;
}) {
  const [label, setLabel] = useState(unit.label);
  const [floor, setFloor] = useState(unit.floor != null ? String(unit.floor) : "");
  const [bedrooms, setBedrooms] = useState(unit.bedrooms != null ? String(unit.bedrooms) : "");
  const [bathrooms, setBathrooms] = useState(unit.bathrooms != null ? String(unit.bathrooms) : "");
  const [rentAmount, setRentAmount] = useState(unit.rentAmount);
  const [status, setStatus] = useState<ManualUnitStatus>(
    unit.status === "occupied" ? "available" : unit.status,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!label.trim()) {
      setError("Enter a unit number/name.");
      return;
    }
    if (!rentAmount.toString().trim() || Number(rentAmount) <= 0) {
      setError("Enter a valid monthly rent.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateUnit(propertyId, unit.id, {
        label: label.trim(),
        floor: floor.trim() ? Number(floor) : undefined,
        bedrooms: bedrooms.trim() ? Number(bedrooms) : undefined,
        bathrooms: bathrooms.trim() ? Number(bathrooms) : undefined,
        rentAmount: Number(rentAmount),
        ...(unit.status === "occupied" ? {} : { status }),
      });
      onSuccess(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update this unit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Unit number/name
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Monthly rent
          <input
            type="number"
            min={0}
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
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
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Bathrooms
            <input
              type="number"
              min={0}
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            />
          </label>
        </div>
        {unit.status === "occupied" ? (
          <p className="text-sm text-slate-500 sm:col-span-2">
            Status: <strong>Occupied</strong> — end the lease on this unit to change its status.
          </p>
        ) : (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ManualUnitStatus)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        )}
      </div>

      <div className="mt-2 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
