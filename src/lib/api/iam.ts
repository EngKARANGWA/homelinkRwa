import { apiFetch } from "./client";

export type InviteRole = "house_manager" | "tenant";
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
