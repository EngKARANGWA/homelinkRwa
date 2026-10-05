"use client";

import { useState } from "react";
import { Equal, ListPlus, Plus, Wand2 } from "lucide-react";
import { createUnit, deleteUnit, generateUnits } from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { PropertyUnit } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

type Mode = "manual" | "generate" | "exact";

/**
 * Adds units to ONE floor of a property — invoked from that floor's "Manage
 * Floor" action. Each floor already exists (auto-created from the
 * property's numberOfFloors at registration); this only ever adds units
 * onto the given floorId, never creates/distributes floors itself.
 */
export function UnitSetupForm({
  propertyId,
  floorId,
  floorName,
  units,
  onDone,
  onSkip,
}: {
  propertyId: string;
  floorId: string;
  floorName: string;
  /** This floor's current real unit records — powers the "Set exact total" mode. */
  units: PropertyUnit[];
  onDone: (result: { created: number; removed: number }) => void;
  onSkip: () => void;
}) {
  const [mode, setMode] = useState<Mode>("generate");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual, one-at-a-time
  const [label, setLabel] = useState("");
  const [unitBedrooms, setUnitBedrooms] = useState("");
  const [unitBathrooms, setUnitBathrooms] = useState("");
  const [unitRent, setUnitRent] = useState("");
  const [addedUnits, setAddedUnits] = useState<{ label: string; rentAmount: number }[]>([]);

  // Bulk generate
  const [count, setCount] = useState("10");
  const [rentAmount, setRentAmount] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  // Set exact total
  const [exactTarget, setExactTarget] = useState("");
  const [exactRentAmount, setExactRentAmount] = useState("");
  const [exactBedrooms, setExactBedrooms] = useState("");
  const [exactBathrooms, setExactBathrooms] = useState("");
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  const vacantUnits = units.filter((u) => u.status !== "occupied");
  const exactDiff = exactTarget.trim() ? Number(exactTarget) - units.length : null;

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
        floorId,
        bedrooms: unitBedrooms.trim() ? Number(unitBedrooms) : undefined,
        bathrooms: unitBathrooms.trim() ? Number(unitBathrooms) : undefined,
        rentAmount: Number(unitRent),
      });
      setAddedUnits((prev) => [...prev, { label: unit.label, rentAmount: Number(unit.rentAmount) }]);
      setLabel("");
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
    try {
      const createdUnits = await generateUnits(propertyId, {
        floorId,
        count: Number(count),
        bedrooms: bedrooms.trim() ? Number(bedrooms) : undefined,
        bathrooms: bathrooms.trim() ? Number(bathrooms) : undefined,
        rentAmount: Number(rentAmount),
      });
      onDone({ created: createdUnits.length, removed: 0 });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate units.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetExact = async () => {
    if (!exactTarget.trim() || Number(exactTarget) < 0) {
      setError("Enter the exact number of units this floor should have.");
      return;
    }
    const target = Number(exactTarget);
    const diff = target - units.length;

    if (diff === 0) {
      setError("This floor already has exactly that many units.");
      return;
    }

    if (diff > 0) {
      if (!exactRentAmount.trim() || Number(exactRentAmount) <= 0) {
        setError("Enter a monthly rent for the new units.");
        return;
      }
    } else {
      const removableCount = -diff;
      if (vacantUnits.length < removableCount) {
        setError(
          `Only ${vacantUnits.length} vacant unit${vacantUnits.length === 1 ? "" : "s"} can be removed — ${
            units.length - vacantUnits.length
          } ${units.length - vacantUnits.length === 1 ? "is" : "are"} occupied and protected. Lowest reachable total right now is ${vacantUnits.length ? units.length - vacantUnits.length : units.length}.`,
        );
        return;
      }
      setError(null);
      setConfirmingRemoval(true);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const createdUnits = await generateUnits(propertyId, {
        floorId,
        count: diff,
        bedrooms: exactBedrooms.trim() ? Number(exactBedrooms) : undefined,
        bathrooms: exactBathrooms.trim() ? Number(exactBathrooms) : undefined,
        rentAmount: Number(exactRentAmount),
      });
      onDone({ created: createdUnits.length, removed: 0 });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update the unit count.");
    } finally {
      setSubmitting(false);
    }
  };

  const performRemoval = async () => {
    const removableCount = units.length - Number(exactTarget);
    const toRemove = [...vacantUnits]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, removableCount);
    for (const unit of toRemove) {
      await deleteUnit(propertyId, unit.id);
    }
    setConfirmingRemoval(false);
    onDone({ created: 0, removed: toRemove.length });
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const removableCount = exactDiff != null && exactDiff < 0 ? -exactDiff : 0;

  return (
    <>
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slate-500">
        Add units to <strong>{floorName}</strong> — one at a time, generated in bulk with a shared
        default price, or by setting the exact total you want this floor to have.
      </p>

      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => switchMode("manual")}
          className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "manual" ? "bg-white text-navy shadow-sm" : "text-slate-500"
          }`}
        >
          <ListPlus className="h-4 w-4" />
          Add manually
        </button>
        <button
          type="button"
          onClick={() => switchMode("generate")}
          className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "generate" ? "bg-white text-navy shadow-sm" : "text-slate-500"
          }`}
        >
          <Wand2 className="h-4 w-4" />
          Generate units
        </button>
        <button
          type="button"
          onClick={() => switchMode("exact")}
          className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            mode === "exact" ? "bg-white text-navy shadow-sm" : "text-slate-500"
          }`}
        >
          <Equal className="h-4 w-4" />
          Set exact total
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
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
            <div className="grid grid-cols-2 gap-4 sm:col-span-2">
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

      {mode === "exact" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">
            {floorName} currently has <strong>{units.length}</strong> unit
            {units.length === 1 ? "" : "s"}
            {vacantUnits.length < units.length && (
              <> ({units.length - vacantUnits.length} occupied)</>
            )}
            . Enter the exact total you want — units are added or removed to match.
          </p>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Set total units to
            <input
              type="number"
              min={0}
              value={exactTarget}
              onChange={(e) => setExactTarget(e.target.value)}
              placeholder={`e.g. ${units.length}`}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>

          {exactDiff != null && exactDiff > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <p className="text-sm text-slate-500 sm:col-span-2">
                This will create <strong>{exactDiff}</strong> new unit{exactDiff === 1 ? "" : "s"}.
              </p>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Monthly rent for new units
                <input
                  type="number"
                  min={0}
                  value={exactRentAmount}
                  onChange={(e) => setExactRentAmount(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Bedrooms (optional)
                <input
                  type="number"
                  min={0}
                  value={exactBedrooms}
                  onChange={(e) => setExactBedrooms(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Bathrooms (optional)
                <input
                  type="number"
                  min={0}
                  value={exactBathrooms}
                  onChange={(e) => setExactBathrooms(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </label>
            </div>
          )}

          {exactDiff != null && exactDiff < 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This will remove <strong>{-exactDiff}</strong> vacant unit{-exactDiff === 1 ? "" : "s"}{" "}
              (most recently added first). Occupied units are never touched.
              {vacantUnits.length < -exactDiff && (
                <>
                  {" "}
                  Only {vacantUnits.length} vacant unit{vacantUnits.length === 1 ? "" : "s"}{" "}
                  {vacantUnits.length === 1 ? "is" : "are"} available to remove right now.
                </>
              )}
            </p>
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
              onClick={() => onDone({ created: addedUnits.length, removed: 0 })}
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
        ) : (
          <button
            type="button"
            disabled={submitting || !exactTarget.trim() || exactDiff === 0}
            onClick={handleSetExact}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
          >
            {submitting ? "Working..." : "Apply"}
          </button>
        )}
      </div>
    </div>

    {confirmingRemoval && (
      <ConfirmModal
        title="Remove units"
        description={`This will permanently remove ${removableCount} vacant unit${removableCount === 1 ? "" : "s"} (most recently added first). Occupied units are never touched. This can't be undone.`}
        confirmLabel="Remove"
        tone="danger"
        onCancel={() => setConfirmingRemoval(false)}
        onConfirm={performRemoval}
      />
    )}
    </>
  );
}
