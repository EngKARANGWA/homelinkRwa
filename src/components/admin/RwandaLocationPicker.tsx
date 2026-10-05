"use client";

import { AutocompleteInput } from "@/components/shared/AutocompleteInput";
import { listCells, listDistricts, listProvinces, listSectors } from "@/lib/rwandaLocations";

export type RwandaLocationValue = {
  province: string;
  district: string;
  sector: string;
  cell: string;
};

function exactMatch(value: string, options: string[]): string | null {
  const q = value.trim().toLowerCase();
  return options.find((o) => o.toLowerCase() === q) ?? null;
}

/**
 * Province -> District -> Sector -> Cell as free-typing fields with live
 * suggestions (not click-to-open selects) — typing just edits the text;
 * picking a suggestion resolves that level and clears the levels below it,
 * since that's the deliberate "this is final" signal.
 */
export function RwandaLocationPicker({
  value,
  onChange,
}: {
  value: RwandaLocationValue;
  onChange: (next: RwandaLocationValue) => void;
}) {
  const { province, district, sector, cell } = value;

  const provinces = listProvinces();
  const resolvedProvince = exactMatch(province, provinces);

  const districts = resolvedProvince ? listDistricts(resolvedProvince) : [];
  const resolvedDistrict = resolvedProvince ? exactMatch(district, districts) : null;

  const sectors = resolvedProvince && resolvedDistrict ? listSectors(resolvedProvince, resolvedDistrict) : [];
  const resolvedSector = resolvedDistrict ? exactMatch(sector, sectors) : null;

  const cells =
    resolvedProvince && resolvedDistrict && resolvedSector
      ? listCells(resolvedProvince, resolvedDistrict, resolvedSector)
      : [];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
        Province
        <AutocompleteInput
          value={province}
          onChange={(next) => onChange({ ...value, province: next })}
          onSelect={(next) => onChange({ province: next, district: "", sector: "", cell: "" })}
          placeholder="Type to search..."
          options={provinces}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
        District
        <AutocompleteInput
          value={district}
          onChange={(next) => onChange({ ...value, district: next })}
          onSelect={(next) => onChange({ province, district: next, sector: "", cell: "" })}
          placeholder="Type to search..."
          disabled={!resolvedProvince}
          options={districts}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
        Sector
        <AutocompleteInput
          value={sector}
          onChange={(next) => onChange({ ...value, sector: next })}
          onSelect={(next) => onChange({ province, district, sector: next, cell: "" })}
          placeholder="Type to search..."
          disabled={!resolvedDistrict}
          options={sectors}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
        Cell
        <AutocompleteInput
          value={cell}
          onChange={(next) => onChange({ ...value, cell: next })}
          onSelect={(next) => onChange({ province, district, sector, cell: next })}
          placeholder="Type to search..."
          disabled={!resolvedSector}
          options={cells}
        />
      </label>
    </div>
  );
}
