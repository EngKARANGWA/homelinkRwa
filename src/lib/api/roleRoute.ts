import type { Role } from "./types";

export const ROLE_ROUTES: Partial<Record<Role, string>> = {
  admin: "/admin",
  // Backend treats these as fully equivalent (ADMIN_ROLES = ["admin",
  // "superadmin"] everywhere in homelink-bn's authorization checks) — no
  // separate superadmin capability exists to give it its own section, so
  // it shares the admin dashboard. See admin/layout.tsx's RequireRole.
  superadmin: "/admin",
  owner: "/landlord",
  tenant: "/tenant",
  house_manager: "/house-manager",
  agent: "/agent",
};
