import type { LeaseStatus } from "@/lib/api/types";

export const LEASE_STATUS_STYLES: Record<LeaseStatus, string> = {
  pending_signatures: "bg-sky-50 text-sky-700",
  active: "bg-emerald-50 text-emerald-700",
  renewal_requested: "bg-amber-50 text-amber-700",
  termination_requested: "bg-amber-50 text-amber-700",
  terminated: "bg-red-50 text-red-700",
  expired: "bg-slate-100 text-slate-600",
};

export function formatLeaseStatus(status: LeaseStatus): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
