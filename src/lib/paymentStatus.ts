import type { InvoiceStatus, PaymentStatus } from "@/lib/api/types";

export const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  unpaid: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  overdue: "bg-red-50 text-red-700",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  success: "bg-emerald-50 text-emerald-700",
  pending: "bg-sky-50 text-sky-700",
  failed: "bg-red-50 text-red-700",
};

export function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
