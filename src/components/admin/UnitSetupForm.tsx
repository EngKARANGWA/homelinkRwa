"use client";

import { useState } from "react";
import { generateUnits } from "@/lib/api/properties";
import { formatApiError } from "@/lib/api/client";
import type { PropertyType } from "@/lib/api/types";
import { unitTypeSuggestions } from "@/lib/propertyType";
import { SuggestionInput } from "@/components/shared/SuggestionInput";
import { Modal } from "@/components/admin/Modal";

/**
 * Adds units to ONE floor of a property — invoked from that floor's "Manage
 * Floor" action. Each floor already exists (auto-created from the
 * property's numberOfFloors at registration); this only ever adds units
 * onto the given floorId, never creates/distributes floors itself.
 */
export function UnitSetupForm({
  propertyId,
  propertyType,
  floorId,
  floorName,
  existingUnitsCount,
  onDone,
}: {
  propertyId: string;
  propertyType: PropertyType;
  floorId: string;
  floorName: string;
  /** This floor's current (non-deleted) unit count — generated units always
   * continue numbering from here, so when it's > 0 we confirm first rather
   * than silently appending. */
  existingUnitsCount: number;
  onDone: (result: { created: number }) => void;
}) {
  const isCommercial = propertyType === "commercial";
  const typeSuggestions = unitTypeSuggestions(propertyType);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingContinue, setConfirmingContinue] = useState(false);

  const [count, setCount] = useState("10");
  const [unitType, setUnitType] = useState("");
  const [scale, setScale] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  // startAt omitted lets the backend auto-continue from the floor's current
  // count; startAt=0 forces numbering from Unit 1 regardless (offered as a
  // real choice below, not just a fallback — the existing units may well
  // have been renamed to something that won't actually collide).
  const submitGenerate = async (startAt?: number) => {
    setSubmitting(true);
    setError(null);
    try {
      const createdUnits = await generateUnits(propertyId, {
        floorId,
        count: Number(count),
        unitType: unitType.trim() || undefined,
        bedrooms: !isCommercial && bedrooms.trim() ? Number(bedrooms) : undefined,
        bathrooms: !isCommercial && bathrooms.trim() ? Number(bathrooms) : undefined,
        scale: scale.trim() ? Number(scale) : undefined,
        startAt,
      });
      onDone({ created: createdUnits.length });
      setConfirmingContinue(false);
    } catch (err) {
      setError(formatApiError(err, "Failed to generate units."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateClick = () => {
    if (!count.trim() || Number(count) < 1) {
      setError("Enter how many units to create.");
      return;
    }
    setError(null);
    // Nothing to continue from yet — generate right away.
    if (existingUnitsCount === 0) {
      void submitGenerate();
      return;
    }
    // Otherwise ask which numbering to use, since this floor already has
    // units on it.
    setConfirmingContinue(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500">
        Generate units for <strong>{floorName}</strong> in bulk — size can be set per unit
        afterward via Edit.
      </p>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

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
          Unit type
          <SuggestionInput
            value={unitType}
            onChange={setUnitType}
            suggestions={typeSuggestions}
            placeholder={isCommercial ? "e.g. Shop" : "e.g. 2 Bedroom"}
            otherPlaceholder="Enter unit type"
          />
        </label>
        {!isCommercial && (
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

      <div className="mt-2 flex justify-end gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={handleGenerateClick}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
        >
          {submitting ? "Working..." : "Generate units"}
        </button>
      </div>

      {confirmingContinue && (
        <Modal
          title="Add to existing units?"
          description={`${floorName} already has ${existingUnitsCount} unit${existingUnitsCount === 1 ? "" : "s"}.`}
          onClose={() => setConfirmingContinue(false)}
          maxWidthClassName="max-w-md"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Generating {count || "0"} more — continue numbering from Unit {existingUnitsCount + 1}, or
              start fresh from Unit 1 instead?
            </p>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={() => submitGenerate(existingUnitsCount)}
              className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
            >
              {submitting ? "Working..." : `Continue from Unit ${existingUnitsCount + 1}`}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitGenerate(0)}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              Start from Unit 1
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => setConfirmingContinue(false)}
              className="text-sm font-medium text-slate-500 hover:text-navy disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
