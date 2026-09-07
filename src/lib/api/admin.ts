import { apiFetch } from "./client";
import type { PaginatedResponse, Role, SuccessResponse, User } from "./types";

export type ListUsersParams = {
  role?: Role;
  isApproved?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};

export async function listUsers(
  params: ListUsersParams = {},
): Promise<PaginatedResponse<User>> {
  return apiFetch<PaginatedResponse<User>>("/admin/users", { query: params });
}

export async function getUser(id: string): Promise<User> {
  const res = await apiFetch<SuccessResponse<User>>(`/admin/users/${id}`);
  return res.data;
}

export type CreateHouseOwnerInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export async function createHouseOwner(
  input: CreateHouseOwnerInput,
): Promise<User> {
  const res = await apiFetch<SuccessResponse<User>>("/admin/house-owners", {
    method: "POST",
    body: input,
  });
  return res.data;
}

export async function setUserStatus(
  id: string,
  isActive: boolean,
): Promise<User> {
  const res = await apiFetch<SuccessResponse<User>>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: { isActive },
  });
  return res.data;
}

export async function countPropertiesForOwner(ownerId: string): Promise<number> {
  const res = await apiFetch<PaginatedResponse<unknown>>("/properties", {
    query: { ownerId, limit: 1 },
  });
  return res.meta.total;
}

export async function updateUserRole(id: string, role: Role): Promise<User> {
  const res = await apiFetch<SuccessResponse<User>>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: { role },
  });
  return res.data;
}

export type ActiveSession = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: Role;
  ipAddress: string | null;
  deviceType: string;
  browser: string;
  os: string;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
};

export async function listActiveSessions(
  params: { userId?: string; page?: number; limit?: number } = {},
): Promise<PaginatedResponse<ActiveSession>> {
  return apiFetch<PaginatedResponse<ActiveSession>>("/admin/sessions", { query: params });
}

export async function revokeSession(id: string): Promise<void> {
  await apiFetch(`/admin/sessions/${id}`, { method: "DELETE" });
}

export type AuditLogEntry = {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor?: { id: string; firstName: string; lastName: string; email: string; phone: string };
};

export async function listAuditLogs(
  params: { userId?: string; entity?: string; action?: string; page?: number; limit?: number } = {},
): Promise<PaginatedResponse<AuditLogEntry>> {
  return apiFetch<PaginatedResponse<AuditLogEntry>>("/admin/audit-logs", { query: params });
}
