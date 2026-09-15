import { apiFetch } from "./client";
import type { TenantSummary } from "./types";

export type InviteRole = "house_manager" | "tenant" | "owner";
export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";

export interface Invite {
  id: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
}

export interface ManagerAssignment {
  id: string;
  ownerId: string;
  managerId: string;
  status: "active" | "revoked";
  assignedAt: string;
}

export async function inviteManager(email: string): Promise<Invite> {
  const res = await apiFetch<{ data: Invite }>("/iam/managers/invite", {
    method: "POST",
    body: { email },
  });
  return res.data;
}

export async function inviteTenant(
  email: string,
  propertyId?: string,
): Promise<Invite> {
  const res = await apiFetch<{ data: Invite }>("/iam/tenants/invite", {
    method: "POST",
    body: { email, propertyId },
  });
  return res.data;
}

/**
 * Owners/house managers can't hit the admin-only user list — this is the
 * narrow, tenant-only search they use to find an existing tenant account to
 * assign directly to a unit instead of always registering a new one.
 */
export async function searchTenants(search: string): Promise<TenantSummary[]> {
  if (search.trim().length < 2) return [];
  const res = await apiFetch<{ data: TenantSummary[] }>("/iam/tenants/search", {
    query: { search: search.trim() },
  });
  return res.data;
}

export async function inviteLandlord(email: string): Promise<Invite> {
  const res = await apiFetch<{ data: Invite }>("/iam/landlords/invite", {
    method: "POST",
    body: { email },
  });
  return res.data;
}

// Backend returns: { success: true, data: Invite[] } — plain array, no pagination wrapper.
export async function listInvites(
  page = 1,
  limit = 20,
): Promise<Invite[]> {
  const res = await apiFetch<{ data: Invite[] }>(
    "/iam/invites",
    { query: { page, limit } }
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function listManagers(): Promise<ManagerAssignment[]> {
  const res = await apiFetch<{ data: ManagerAssignment[] }>("/iam/managers");
  return res.data;
}

export interface AcceptInviteInput {
  token: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}

export async function acceptInvite(input: AcceptInviteInput): Promise<void> {
  await apiFetch("/iam/invites/accept", {
    method: "POST",
    body: input,
    auth: false,
  });
}
