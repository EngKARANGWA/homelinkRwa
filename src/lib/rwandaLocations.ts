// Rwanda's administrative hierarchy (Province -> District -> Sector -> Cell),
// extracted from the knowbee/rwanda dataset (MIT) since the published npm
// package itself ships without its dist build. 5 provinces, 30 districts,
// 416 sectors, ~2148 cells.
import rwandaAdminDivisions from "./rwandaAdminDivisions.json";

type SectorMap = Record<string, string[]>;
type DistrictMap = Record<string, SectorMap>;

const DATA = rwandaAdminDivisions as Record<string, DistrictMap>;

export function listProvinces(): string[] {
  return Object.keys(DATA).sort();
}

export function listDistricts(province: string): string[] {
  return Object.keys(DATA[province] ?? {}).sort();
}

export function listSectors(province: string, district: string): string[] {
  return Object.keys(DATA[province]?.[district] ?? {}).sort();
}

export function listCells(province: string, district: string, sector: string): string[] {
  const cells = DATA[province]?.[district]?.[sector] ?? [];
  return cells.slice().sort();
}
