import { apiFetch } from "./client";
import type { PaginatedResponse, SuccessResponse } from "./types";

export type MaintenanceRequestStatus = "submitted" | "assigned" | "in_progress" | "completed";
export type MaintenancePriority = "low" | "medium" | "high";

export type Laborer = {
  id: string;
  name: string;
  role: string;
  contact: string;
  amount: number;
};

export type MaintenanceRequest = {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  title: string;
  description: string;
  issues: string[];
  priority: MaintenancePriority;
  status: MaintenanceRequestStatus;
  assignedLaborers: Laborer[];
  workDone: string | null;
  laborCost: number | null;
  itemCost: number | null;
  feedback: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type ListMaintenanceParams = {
  status?: MaintenanceRequestStatus;
  priority?: MaintenancePriority;
  propertyId?: string;
  page?: number;
  limit?: number;
};

export type CreateMaintenanceRequestInput = {
  propertyId: string;
  title: string;
  description: string;
  issues?: string[];
  priority?: MaintenancePriority;
};

export type AssignLaborersInput = {
  laborers: Laborer[];
};

export type CompleteMaintenanceInput = {
  workDone: string;
  laborCost?: number;
  itemCost?: number;
  feedback?: string;
};

export async function listMaintenanceRequests(
  params: ListMaintenanceParams = {},
): Promise<PaginatedResponse<MaintenanceRequest>> {
  return apiFetch<PaginatedResponse<MaintenanceRequest>>("/maintenance-requests", {
    query: params,
  });
}

export async function getMaintenanceRequest(id: string): Promise<MaintenanceRequest> {
  const res = await apiFetch<SuccessResponse<MaintenanceRequest>>(
    `/maintenance-requests/${id}`,
  );
  return res.data;
}

export async function createMaintenanceRequest(
  input: CreateMaintenanceRequestInput,
): Promise<MaintenanceRequest> {
  const res = await apiFetch<SuccessResponse<MaintenanceRequest>>("/maintenance", {
    method: "POST",
    body: input,
  });
  return res.data;
}

export async function assignLaborers(
  id: string,
  input: AssignLaborersInput,
): Promise<MaintenanceRequest> {
  const res = await apiFetch<SuccessResponse<MaintenanceRequest>>(`/maintenance/${id}/assign`, {
    method: "PATCH",
    body: input,
  });
  return res.data;
}

export async function startProgress(id: string): Promise<MaintenanceRequest> {
  const res = await apiFetch<SuccessResponse<MaintenanceRequest>>(
    `/maintenance/${id}/start-progress`,
    { method: "PATCH" },
  );
  return res.data;
}

export async function completeMaintenanceRequest(
  id: string,
  input: CompleteMaintenanceInput,
): Promise<MaintenanceRequest> {
  const res = await apiFetch<SuccessResponse<MaintenanceRequest>>(`/maintenance/${id}/complete`, {
    method: "PATCH",
    body: input,
  });
  return res.data;
}
