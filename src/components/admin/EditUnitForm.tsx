"use client";

import { useState } from "react";
import { updateUnit } from "@/lib/api/properties";
import { formatApiError } from "@/lib/api/client";
import type { Floor, ManualUnitStatus, PropertyType, PropertyUnit } from "@/lib/api/types";
import { unitTypeSuggestions } from "@/lib/propertyType";
import { SuggestionInput } from "@/components/shared/SuggestionInput";

/**
 * Edits one unit's own fields via PATCH /properties/:id/units/:unitId.
 * Status is only editable while the unit is vacant — the backend rejects
 * a status change on an occupied unit (it only flips via a lease).
 */
export function EditUnitForm({
  propertyId,
  propertyType,
  unit,
  floors,
  onCancel,
  onSuccess,
}: {
  propertyId: string;
  propertyType: PropertyType;
  unit: PropertyUnit;
  floors: Floor[];
  onCancel: () => void;
  onSuccess: (updated: PropertyUnit) => void;
}) {
  const isCommercial = propertyType === "commercial";
  const [name, setName] = useState(unit.name ?? "");
  const [floorId, setFloorId] = useState(unit.floorId);
  const [unitType, setUnitType] = useState(unit.unitType ?? "");
  const [bedrooms, setBedrooms] = useState(unit.bedrooms != null ? String(unit.bedrooms) : "");
  const [bathrooms, setBathrooms] = useState(unit.bathrooms != null ? String(unit.bathrooms) : "");
  const [scale, setScale] = useState(unit.scale ?? "");
  const [status, setStatus] = useState<ManualUnitStatus>(
    unit.status === "occupied" ? "available" : unit.status,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateUnit(propertyId, unit.id, {
        name: name.trim() || undefined,
        floorId,
        unitType: unitType.trim() || undefined,
        bedrooms: !isCommercial && bedrooms.trim() ? Number(bedrooms) : undefined,
        bathrooms: !isCommercial && bathrooms.trim() ? Number(bathrooms) : undefined,
        scale: scale.toString().trim() ? Number(scale) : undefined,
        ...(unit.status === "occupied" ? {} : { status }),
      });
      onSuccess(updated);
    } catch (err) {
      setError(formatApiError(err, "Failed to update this unit."));
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
          Unit ID
          <input
            type="text"
            value={unit.label}
            disabled
            title="System-generated — not editable"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 disabled:cursor-not-allowed"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Unit name (optional)
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Shop A"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Scale (size/area, optional)
          <input
            type="number"
            min={0}
            value={scale}
            onChange={(e) => setScale(e.target.value)}
            placeholder="e.g. 20"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Floor
          <select
            value={floorId}
            onChange={(e) => setFloorId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Unit type
          <SuggestionInput
            value={unitType}
            onChange={setUnitType}
            suggestions={unitTypeSuggestions(propertyType)}
            placeholder={isCommercial ? "e.g. Shop" : "e.g. 2 Bedroom"}
            otherPlaceholder="Enter unit type"
          />
        </label>
        {!isCommercial && (
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
        )}
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
