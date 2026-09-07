import type { Role } from "./types";

export const ROLE_ROUTES: Partial<Record<Role, string>> = {
  admin: "/admin",
  superadmin: "/admin",
  owner: "/landlord",
  tenant: "/tenant",
  house_manager: "/house-manager",
  agent: "/agent",
};
