import { apiFetch } from "./client";
import type { PaginatedResponse, SuccessResponse } from "./types";

export type MaintenancePriority = "low" | "medium" | "high";
export type MaintenanceStatus = "submitted" | "assigned" | "in_progress" | "completed";

export type MaintenanceRequest = {
  id: string;
  propertyId: string;
  tenantId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo: string | null;
  itemsCost: string | null;
  laborCost: string | null;
  completionNotes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceFeedback = {
  id: string;
  requestId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type ListMaintenanceParams = {
  status?: MaintenanceStatus;
  propertyId?: string;
  page?: number;
  limit?: number;
};

export type CreateMaintenanceRequestInput = {
  propertyId: string;
  title: string;
  description: string;
  priority?: MaintenancePriority;
};

export type CompleteMaintenanceInput = {
  itemsCost?: number;
  laborCost?: number;
  completionNotes?: string;
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
  const res = await apiFetch<SuccessResponse<MaintenanceRequest>>("/maintenance-requests", {
    method: "POST",
    body: input,
  });
  return res.data;
}

export async function assignMaintenanceRequest(
  id: string,
  assignedTo: string,
): Promise<MaintenanceRequest> {
  const res = await apiFetch<SuccessResponse<MaintenanceRequest>>(
    `/maintenance-requests/${id}/assign`,
    { method: "PATCH", body: { assignedTo } },
  );
  return res.data;
}

export async function startMaintenanceProgress(id: string): Promise<MaintenanceRequest> {
  const res = await apiFetch<SuccessResponse<MaintenanceRequest>>(
    `/maintenance-requests/${id}/status`,
    { method: "PATCH", body: { status: "in_progress" } },
  );
  return res.data;
}

export async function completeMaintenanceRequest(
  id: string,
  input: CompleteMaintenanceInput,
): Promise<MaintenanceRequest> {
  const res = await apiFetch<SuccessResponse<MaintenanceRequest>>(
    `/maintenance-requests/${id}/complete`,
    { method: "PATCH", body: input },
  );
  return res.data;
}

export async function submitMaintenanceFeedback(
  id: string,
  rating: number,
  comment?: string,
): Promise<MaintenanceFeedback> {
  const res = await apiFetch<SuccessResponse<MaintenanceFeedback>>(
    `/maintenance-requests/${id}/feedback`,
    { method: "POST", body: { rating, comment } },
  );
  return res.data;
}

export async function getMaintenanceFeedback(
  id: string,
): Promise<MaintenanceFeedback | null> {
  const res = await apiFetch<SuccessResponse<MaintenanceFeedback | null>>(
    `/maintenance-requests/${id}/feedback`,
  );
  return res.data;
}
