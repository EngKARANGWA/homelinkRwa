import { apiFetch } from "./client";
import type { AdminDashboard, OwnerDashboard, SuccessResponse, TenantDashboard } from "./types";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const res = await apiFetch<SuccessResponse<AdminDashboard>>("/dashboard/admin");
  return res.data;
}

export async function getOwnerDashboard(): Promise<OwnerDashboard> {
  const res = await apiFetch<SuccessResponse<OwnerDashboard>>("/dashboard/owner");
  return res.data;
}

export async function getTenantDashboard(): Promise<TenantDashboard> {
  const res = await apiFetch<SuccessResponse<TenantDashboard>>("/dashboard/tenant");
  return res.data;
}
