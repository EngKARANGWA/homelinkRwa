import { apiFetch, apiFetchBlob } from "./client";
import type {
  Invoice,
  PaginatedResponse,
  PayInvoiceInput,
  Payment,
  PaymentReceiptUrl,
  SuccessResponse,
} from "./types";

export type ListInvoicesParams = {
  status?: string;
  page?: number;
  limit?: number;
};

export async function listInvoices(
  params: ListInvoicesParams = {},
): Promise<PaginatedResponse<Invoice>> {
  return apiFetch<PaginatedResponse<Invoice>>("/invoices", { query: params });
}

export async function getInvoice(id: string): Promise<Invoice> {
  const res = await apiFetch<SuccessResponse<Invoice>>(`/invoices/${id}`);
  return res.data;
}

export async function payInvoice(
  id: string,
  input: PayInvoiceInput,
): Promise<Payment> {
  const res = await apiFetch<SuccessResponse<Payment>>(`/invoices/${id}/pay`, {
    method: "POST",
    body: input,
  });
  return res.data;
}

export type ListPaymentsParams = {
  status?: string;
  page?: number;
  limit?: number;
};

export async function listPayments(
  params: ListPaymentsParams = {},
): Promise<PaginatedResponse<Payment>> {
  return apiFetch<PaginatedResponse<Payment>>("/payments", { query: params });
}

export async function getPaymentReceipt(id: string): Promise<PaymentReceiptUrl> {
  const res = await apiFetch<SuccessResponse<PaymentReceiptUrl>>(
    `/payments/${id}/receipt`,
  );
  return res.data;
}

export async function approvePayment(id: string): Promise<Payment> {
  const res = await apiFetch<SuccessResponse<Payment>>(
    `/payments/${id}/approve`,
    { method: "PATCH" },
  );
  return res.data;
}

export async function rejectPayment(
  id: string,
  rejectionReason?: string,
): Promise<Payment> {
  const res = await apiFetch<SuccessResponse<Payment>>(
    `/payments/${id}/reject`,
    { method: "PATCH", body: rejectionReason ? { rejectionReason } : undefined },
  );
  return res.data;
}

export async function exportPaymentsWorkbook(
  params: { status?: string } = {},
): Promise<void> {
  const blob = await apiFetchBlob("/payments/export", { query: params });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "payments.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}
