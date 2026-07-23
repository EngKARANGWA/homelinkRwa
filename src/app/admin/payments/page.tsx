"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Download, Eye, X } from "lucide-react";
import { listUsers } from "@/lib/api/admin";
import { listProperties } from "@/lib/api/properties";
import {
  approvePayment,
  exportPaymentsWorkbook,
  getPaymentReceipt,
  listPayments,
  rejectPayment,
} from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import type { Payment, Property, User } from "@/lib/api/types";
import { formatStatusLabel, PAYMENT_STATUS_STYLES } from "@/lib/paymentStatus";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const propertyFor = (id: string) => properties.find((p) => p.id === id);
  const tenantName = (id: string) => {
    const tenant = tenants.find((t) => t.id === id);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : "—";
  };

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      listPayments({ page, limit: DEFAULT_PAGE_SIZE }),
      listProperties({ limit: 100 }),
      listUsers({ role: "tenant", limit: 100 }),
    ])
      .then(([paymentsRes, propertiesRes, tenantsRes]) => {
        setPayments(paymentsRes.data);
        setTotalPages(paymentsRes.meta.totalPages);
        setTotalItems(paymentsRes.meta.total);
        setProperties(propertiesRes.data);
        setTenants(tenantsRes.data);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load payments."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const resolvePayment = async (id: string, approve: boolean) => {
    setActionError(null);
    setProcessingId(id);
    try {
      if (approve) {
        await approvePayment(id);
      } else {
        await rejectPayment(id);
      }
      load();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Failed to resolve the payment.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const viewReceipt = async (payment: Payment) => {
    setActionError(null);
    try {
      const { url } = await getPaymentReceipt(payment.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to load receipt.");
    }
  };

  const handleExport = async () => {
    setActionError(null);
    try {
      await exportPaymentsWorkbook();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to export payments.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Rent payments and platform revenue.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4" />
          {actionError}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
          <button type="button" onClick={load} className="underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="px-6 py-3">Tenant</Th>
            <Th className="px-6 py-3">Property</Th>
            <Th className="px-6 py-3">Amount (RWF)</Th>
            <Th className="px-6 py-3">Method</Th>
            <Th className="px-6 py-3">Paid Date</Th>
            <Th className="px-6 py-3">Status</Th>
            <Th className="px-6 py-3">Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {isLoading ? (
            <EmptyRow colSpan={7}>Loading payments...</EmptyRow>
          ) : payments.length === 0 ? (
            <EmptyRow colSpan={7}>No payments on the platform yet.</EmptyRow>
          ) : (
            payments.map((payment) => {
              const isProcessing = processingId === payment.id;
              return (
                <Tr key={payment.id}>
                  <Td className="px-6 py-3 font-medium text-navy">
                    {tenantName(payment.tenantId)}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {propertyFor(payment.propertyId)?.title ?? "—"}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {Number(payment.amount).toLocaleString()}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {formatStatusLabel(payment.method)}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {payment.paidAt ?? "—"}
                  </Td>
                  <Td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[payment.status]}`}
                    >
                      {formatStatusLabel(payment.status)}
                    </span>
                  </Td>
                  <Td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      {payment.status === "successful" && (
                        <button
                          type="button"
                          onClick={() => viewReceipt(payment)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Receipt
                        </button>
                      )}
                      {payment.status === "pending_approval" && (
                        <>
                          <button
                            type="button"
                            onClick={() => resolvePayment(payment.id, true)}
                            disabled={isProcessing}
                            aria-label={`Approve payment from ${tenantName(payment.tenantId)}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => resolvePayment(payment.id, false)}
                            disabled={isProcessing}
                            aria-label={`Reject payment from ${tenantName(payment.tenantId)}`}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })
          )}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
