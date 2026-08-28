import { apiFetch } from "./client";
import type {
  CreatePropertyInput,
  CreateUnitInput,
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
    method: "PUT",
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
