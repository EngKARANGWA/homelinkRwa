"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Eye, Wallet } from "lucide-react";
import {
  getPaymentReceipt,
  listInvoices,
  listPayments,
  payInvoice,
} from "@/lib/api/payments";
import { listProperties } from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { Invoice, PayInvoiceInput, Payment, Property } from "@/lib/api/types";
import {
  formatStatusLabel,
  INVOICE_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
} from "@/lib/paymentStatus";
import { Modal } from "@/components/admin/Modal";
import { PayNowForm } from "@/components/tenant/PayNowForm";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { downloadCSV } from "@/lib/csv";

export default function TenantPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const propertyFor = (id: string) => properties.find((p) => p.id === id);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      listInvoices({ limit: 100 }),
      listPayments({ page, limit: DEFAULT_PAGE_SIZE }),
      listProperties({ limit: 100 }),
    ])
      .then(([invoicesRes, paymentsRes, propertiesRes]) => {
        setInvoices(invoicesRes.data);
        setPayments(paymentsRes.data);
        setTotalPages(paymentsRes.meta.totalPages);
        setTotalItems(paymentsRes.meta.total);
        setProperties(propertiesRes.data);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load payments."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const outstandingInvoices = invoices.filter(
    (inv) => inv.status === "pending" || inv.status === "overdue",
  );

  const handlePay = async (values: PayInvoiceInput) => {
    if (!payingInvoice) return;
    setActionError(null);
    try {
      await payInvoice(payingInvoice.id, values);
      setPayingInvoice(null);
      setNotice(
        values.method === "mobile_money"
          ? "Payment successful. Your receipt is ready to view."
          : "Payment submitted. Awaiting your landlord's approval.",
      );
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to submit payment.");
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

  const handleDownloadStatement = () => {
    downloadCSV(
      "my-rent-statement.csv",
      ["Property", "Amount", "Method", "Status", "Paid Date"],
      payments.map((p) => [
        propertyFor(p.propertyId)?.title ?? "—",
        p.amount,
        p.method,
        p.status,
        p.paidAt ?? "—",
      ]),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your rent invoices and payment history.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadStatement}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Download Statement
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      {(error || actionError) && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error ?? actionError}
          </span>
          {error && (
            <button type="button" onClick={load} className="underline hover:no-underline">
              Retry
            </button>
          )}
        </div>
      )}

      <div>
        <p className="mb-3 font-semibold text-navy">Outstanding Invoices</p>
        <Table variant="standalone">
          <THead>
            <Tr>
              <Th className="max-w-[9rem] px-4 py-3 sm:px-6">Property</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">Amount (RWF)</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Due Date</Th>
              <Th className="px-4 py-3 sm:px-6">Status</Th>
              <Th className="px-4 py-3 sm:px-6">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <EmptyRow colSpan={5}>Loading invoices...</EmptyRow>
            ) : outstandingInvoices.length === 0 ? (
              <EmptyRow colSpan={5}>You have no outstanding invoices.</EmptyRow>
            ) : (
              outstandingInvoices.map((invoice) => (
                <Tr key={invoice.id}>
                  <Td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                      {propertyFor(invoice.propertyId)?.title ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400 sm:hidden">
                      {Number(invoice.amount).toLocaleString()} RWF
                    </p>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                    {Number(invoice.amount).toLocaleString()}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {invoice.dueDate}
                  </Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${INVOICE_STATUS_STYLES[invoice.status]}`}
                    >
                      {formatStatusLabel(invoice.status)}
                    </span>
                  </Td>
                  <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                    <button
                      type="button"
                      onClick={() => setPayingInvoice(invoice)}
                      aria-label={`Pay now for ${propertyFor(invoice.propertyId)?.title ?? "this invoice"}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-2.5 py-1 text-xs font-semibold text-white hover:bg-gold/90"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Pay Now</span>
                    </button>
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </div>

      <div>
        <p className="mb-3 font-semibold text-navy">Payment History</p>
        <Table variant="standalone">
          <THead>
            <Tr>
              <Th className="max-w-[9rem] px-4 py-3 sm:px-6">Property</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">Amount (RWF)</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">Method</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Paid Date</Th>
              <Th className="px-4 py-3 sm:px-6">Status</Th>
              <Th className="px-4 py-3 sm:px-6">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <EmptyRow colSpan={6}>Loading payments...</EmptyRow>
            ) : payments.length === 0 ? (
              <EmptyRow colSpan={6}>No payments on file yet.</EmptyRow>
            ) : (
              payments.map((payment) => (
                <Tr key={payment.id}>
                  <Td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                      {propertyFor(payment.propertyId)?.title ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400 sm:hidden">
                      {Number(payment.amount).toLocaleString()} RWF
                    </p>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                    {Number(payment.amount).toLocaleString()}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                    {formatStatusLabel(payment.method)}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {payment.paidAt ?? "—"}
                  </Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[payment.status]}`}
                    >
                      {formatStatusLabel(payment.status)}
                    </span>
                  </Td>
                  <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
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
                  </Td>
                </Tr>
              ))
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

      {payingInvoice && (
        <Modal
          title="Pay Rent"
          description={propertyFor(payingInvoice.propertyId)?.title ?? "Invoice"}
          onClose={() => setPayingInvoice(null)}
        >
          <PayNowForm
            amount={Number(payingInvoice.amount)}
            onCancel={() => setPayingInvoice(null)}
            onSuccess={handlePay}
          />
        </Modal>
      )}
    </div>
  );
}
