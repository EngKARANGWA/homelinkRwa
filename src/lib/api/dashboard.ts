import { apiFetch } from "./client";
import type { AdminDashboard, OwnerDashboard, SuccessResponse } from "./types";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const res = await apiFetch<SuccessResponse<AdminDashboard>>("/dashboard/admin");
  return res.data;
}

export async function getOwnerDashboard(): Promise<OwnerDashboard> {
  const res = await apiFetch<SuccessResponse<OwnerDashboard>>("/dashboard/owner");
  return res.data;
}
