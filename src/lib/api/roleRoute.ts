import type { Role } from "./types";

export const ROLE_ROUTES: Partial<Record<Role, string>> = {
  admin: "/admin",
  owner: "/landlord",
  tenant: "/tenant",
  house_manager: "/house-manager",
};
