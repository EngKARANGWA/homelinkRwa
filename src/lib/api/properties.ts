import { apiFetch } from "./client";
import type {
  AvailableUnit,
  CreatePropertyInput,
  CreateUnitInput,
  GenerateUnitsInput,
  ListAvailableUnitsParams,
  PaginatedResponse,
  Property,
  PropertyUnit,
  SuccessResponse,
  UpdatePropertyInput,
} from "./types";

export type ListPropertiesParams = {
  status?: string;
  type?: string;
  category?: string;
  city?: string;
  minRent?: number;
  maxRent?: number;
  ownerId?: string;
  page?: number;
  limit?: number;
};

export async function listProperties(
  params: ListPropertiesParams = {},
): Promise<PaginatedResponse<Property>> {
  return apiFetch<PaginatedResponse<Property>>("/properties", { query: params });
}

export async function getProperty(id: string): Promise<Property> {
  const res = await apiFetch<SuccessResponse<Property>>(`/properties/${id}`);
  return res.data;
}

export async function createProperty(
  input: CreatePropertyInput,
): Promise<Property> {
  const res = await apiFetch<SuccessResponse<Property>>("/properties", {
    method: "POST",
    body: input,
  });
  return res.data;
}

export async function updateProperty(
  id: string,
  input: UpdatePropertyInput,
): Promise<Property> {
  const res = await apiFetch<SuccessResponse<Property>>(`/properties/${id}`, {
    method: "PATCH",
    body: input,
  });
  return res.data;
}

export async function approveProperty(id: string): Promise<Property> {
  const res = await apiFetch<SuccessResponse<Property>>(
    `/properties/${id}/approve`,
    { method: "PATCH" },
  );
  return res.data;
}

export async function rejectProperty(
  id: string,
  rejectionReason: string,
): Promise<Property> {
  const res = await apiFetch<SuccessResponse<Property>>(
    `/properties/${id}/reject`,
    { method: "PATCH", body: { rejectionReason } },
  );
  return res.data;
}

export async function listUnits(propertyId: string): Promise<PropertyUnit[]> {
  const res = await apiFetch<SuccessResponse<PropertyUnit[]>>(
    `/properties/${propertyId}/units`,
  );
  return res.data;
}

export async function createUnit(
  propertyId: string,
  input: CreateUnitInput,
): Promise<PropertyUnit> {
  const res = await apiFetch<SuccessResponse<PropertyUnit>>(
    `/properties/${propertyId}/units`,
    { method: "POST", body: input },
  );
  return res.data;
}

export async function generateUnits(
  propertyId: string,
  input: GenerateUnitsInput,
): Promise<PropertyUnit[]> {
  const res = await apiFetch<SuccessResponse<PropertyUnit[]>>(
    `/properties/${propertyId}/units/generate`,
    { method: "POST", body: input },
  );
  return res.data;
}

/**
 * On success, one unit per data row in the uploaded file. On failure (any
 * row invalid), the thrown ApiError's `errors` is an
 * `{ row, message }[]` describing exactly which rows to fix — nothing is
 * imported in that case.
 */
export async function importUnits(
  propertyId: string,
  file: File,
): Promise<PropertyUnit[]> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiFetch<SuccessResponse<PropertyUnit[]>>(
    `/properties/${propertyId}/units/import`,
    { method: "POST", body: formData },
  );
  return res.data;
}

export async function listAvailableUnits(
  params: ListAvailableUnitsParams = {},
): Promise<AvailableUnit[]> {
  const res = await apiFetch<SuccessResponse<AvailableUnit[]>>("/properties/units", {
    query: params,
  });
  return res.data;
}
