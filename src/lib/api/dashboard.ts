import { apiFetch } from "./client";
import type { AdminDashboard, SuccessResponse } from "./types";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const res = await apiFetch<SuccessResponse<AdminDashboard>>("/dashboard/admin");
  return res.data;
}
