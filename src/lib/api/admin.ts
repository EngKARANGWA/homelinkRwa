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
