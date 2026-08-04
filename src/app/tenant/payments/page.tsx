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
import { listLeases } from "@/lib/api/leases";
import { ApiError } from "@/lib/api/client";
import type {
  Invoice,
  Lease,
  PayInvoiceInput,
  Payment,
  PaymentMethod,
  Property,
} from "@/lib/api/types";
import {
  formatStatusLabel,
  INVOICE_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
} from "@/lib/paymentStatus";
import { Modal } from "@/components/admin/Modal";
import { PayNowForm } from "@/components/tenant/PayNowForm";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { downloadCSV } from "@/lib/csv";
import { formatMoney } from "@/lib/money";

const TABS = [
  { id: "invoices", label: "Invoices" },
  { id: "payments", label: "Payments" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const METHOD_CODES: Record<PaymentMethod, string> = {
  mobile_money: "MOMO",
  bank_transfer: "BNK",
  cash: "CSH",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function monthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function invoiceNumber(invoice: Invoice) {
  return invoice.invoiceNumber;
}

function paymentId(payment: Payment) {
  return payment.paymentNumber;
}

function paymentReference(payment: Payment) {
  const datePart = (payment.paidAt ?? payment.createdAt).slice(0, 10).replaceAll("-", "");
  return `${METHOD_CODES[payment.method]}-${datePart}-${payment.id.slice(0, 6).toUpperCase()}`;
}

export default function TenantPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("invoices");
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [invoicePage, setInvoicePage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentTotalPages, setPaymentTotalPages] = useState(1);
  const [paymentTotalItems, setPaymentTotalItems] = useState(0);

  const leaseById = new Map(leases.map((l) => [l.id, l]));
  const propertyById = new Map(properties.map((p) => [p.id, p]));
  const propertyForInvoice = (invoice: Invoice | null | undefined) => {
    if (!invoice) return undefined;
    const lease = leaseById.get(invoice.leaseId);
    return lease ? propertyById.get(lease.propertyId) : undefined;
  };

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      listInvoices({ limit: 100 }),
      listPayments({ status: "success", page: paymentPage, limit: DEFAULT_PAGE_SIZE }),
      listProperties({ limit: 100 }),
      listLeases({ limit: 100 }),
    ])
      .then(([invoicesRes, paymentsRes, propertiesRes, leasesRes]) => {
        setInvoices(invoicesRes.data);
        setPayments(paymentsRes.data);
        setPaymentTotalPages(paymentsRes.meta.totalPages);
        setPaymentTotalItems(paymentsRes.meta.total);
        setProperties(propertiesRes.data);
        setLeases(leasesRes.data);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load payments."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [paymentPage]);

  const outstandingInvoices = invoices
    .filter((inv) => inv.status === "unpaid" || inv.status === "overdue")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const pendingInvoice = outstandingInvoices[0] ?? null;
  const otherPendingCount = Math.max(outstandingInvoices.length - 1, 0);

  const primaryProperty = propertyForInvoice(pendingInvoice ?? invoices[0]) ?? properties[0];

  const invoiceTotalPages = Math.max(1, Math.ceil(invoices.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (invoicePage > invoiceTotalPages) setInvoicePage(invoiceTotalPages);
  }, [invoicePage, invoiceTotalPages]);
  const pagedInvoices = invoices.slice(
    (invoicePage - 1) * DEFAULT_PAGE_SIZE,
    invoicePage * DEFAULT_PAGE_SIZE,
  );

  const handlePay = async (values: PayInvoiceInput, invoice: Invoice) => {
    setActionError(null);
    try {
      await payInvoice(invoice.id, values);
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

  const handleDownloadInvoices = () => {
    downloadCSV(
      "my-invoices.csv",
      ["Sn#", "Invoice #", "Month", "Date Due", "Total Amount", "Status"],
      invoices.map((inv, i) => [
        i + 1,
        invoiceNumber(inv),
        monthLabel(inv.dueDate),
        inv.dueDate,
        Number(inv.amountDue),
        formatStatusLabel(inv.status),
      ]),
    );
    setNotice("my-invoices.csv downloaded — check your browser's Downloads.");
  };

  const handleDownloadPayments = () => {
    downloadCSV(
      "my-payments.csv",
      ["No#", "Payment ID", "Amount Paid", "Reference", "Payment Date", "Payment Method", "Status"],
      payments.map((p, i) => [
        i + 1,
        paymentId(p),
        Number(p.amount),
        paymentReference(p),
        p.paidAt ?? "—",
        formatStatusLabel(p.method),
        formatStatusLabel(p.status),
      ]),
    );
    setNotice("my-payments.csv downloaded — check your browser's Downloads.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            {primaryProperty
              ? `${primaryProperty.title} · ${primaryProperty.addressLine}, ${primaryProperty.city}`
              : "Your rent payments and invoices."}
          </p>
        </div>
        <button
          type="button"
          onClick={tab === "invoices" ? handleDownloadInvoices : handleDownloadPayments}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          {tab === "invoices" ? "Download Invoices" : "Download Statement"}
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

      <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-gold text-navy"
                  : "border-transparent text-slate-500 hover:text-navy"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "invoices" && (
        <>
          <Table variant="standalone">
            <THead>
              <Tr>
                <Th className="px-4 py-3 text-center sm:px-6">Sn.#</Th>
                <Th className="max-w-[8rem] px-4 py-3 sm:px-6">Invoice #</Th>
                <Th className="hidden px-6 py-3 sm:table-cell">Month</Th>
                <Th className="hidden px-6 py-3 md:table-cell">Date Due</Th>
                <Th className="hidden px-6 py-3 sm:table-cell">Total Amount (RWF)</Th>
                <Th className="px-4 py-3 sm:px-6">Status</Th>
                <Th className="px-4 py-3 sm:px-6">Actions</Th>
              </Tr>
            </THead>
            <TBody>
              {isLoading ? (
                <EmptyRow colSpan={7}>Loading invoices...</EmptyRow>
              ) : pagedInvoices.length === 0 ? (
                <EmptyRow colSpan={7}>No invoices on file yet.</EmptyRow>
              ) : (
                pagedInvoices.map((invoice, i) => (
                  <Tr key={invoice.id}>
                    <Td className="px-4 py-3 text-center text-slate-500 sm:px-6">
                      {(invoicePage - 1) * DEFAULT_PAGE_SIZE + i + 1}
                    </Td>
                    <Td className="max-w-[8rem] px-4 py-3 sm:max-w-none sm:px-6">
                      <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                        {invoiceNumber(invoice)}
                      </p>
                      <p className="truncate text-xs text-slate-400 sm:hidden">
                        {monthLabel(invoice.dueDate)} · {formatMoney(Number(invoice.amountDue))} RWF
                      </p>
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                      {monthLabel(invoice.dueDate)}
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                      {formatDate(invoice.dueDate)}
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                      {formatMoney(Number(invoice.amountDue))}
                    </Td>
                    <Td className="px-4 py-3 sm:px-6">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${INVOICE_STATUS_STYLES[invoice.status]}`}
                      >
                        {formatStatusLabel(invoice.status)}
                      </span>
                    </Td>
                    <Td className="px-4 py-3 sm:px-6">
                      {(invoice.status === "unpaid" || invoice.status === "overdue") && (
                        <button
                          type="button"
                          onClick={() => setPayingInvoice(invoice)}
                          aria-label={`Pay now for ${propertyForInvoice(invoice)?.title ?? "this invoice"}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-2.5 py-1 text-xs font-semibold text-white hover:bg-gold/90"
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Pay Now</span>
                        </button>
                      )}
                    </Td>
                  </Tr>
                ))
              )}
            </TBody>
          </Table>

          <Pagination
            page={invoicePage}
            totalPages={invoiceTotalPages}
            totalItems={invoices.length}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setInvoicePage}
          />
        </>
      )}

      {tab === "payments" && (
        <>
          {pendingInvoice ? (
            <AlertBanner
              isAlert
              stats={[
                { label: "Amount Due", value: `${formatMoney(Number(pendingInvoice.amountDue))} RWF` },
                { label: "Due Date", value: formatDate(pendingInvoice.dueDate) },
                { label: "Status", value: formatStatusLabel(pendingInvoice.status) },
              ]}
              message={
                pendingInvoice.status === "overdue"
                  ? "This payment is overdue. Please settle it as soon as possible."
                  : `Rent is due on ${formatDate(pendingInvoice.dueDate)}.`
              }
            >
              <button
                type="button"
                onClick={() => setPayingInvoice(pendingInvoice)}
                className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
              >
                <Wallet className="h-4 w-4" />
                Pay Now
              </button>
              {otherPendingCount > 0 && (
                <span className="text-sm text-slate-500">
                  +{otherPendingCount} more invoice{otherPendingCount === 1 ? "" : "s"} due — see
                  the Invoices tab.
                </span>
              )}
            </AlertBanner>
          ) : (
            <AlertBanner
              isAlert={false}
              stats={[]}
              message="You're all caught up — no pending payments right now."
            />
          )}

          <Table variant="standalone">
            <THead>
              <Tr>
                <Th className="px-4 py-3 text-center sm:px-6">No.#</Th>
                <Th className="max-w-[8rem] px-4 py-3 sm:px-6">Payment ID</Th>
                <Th className="hidden px-6 py-3 sm:table-cell">Amount Paid (RWF)</Th>
                <Th className="hidden px-6 py-3 lg:table-cell">Reference</Th>
                <Th className="hidden px-6 py-3 md:table-cell">Payment Date</Th>
                <Th className="hidden px-6 py-3 lg:table-cell">Payment Method</Th>
                <Th className="px-4 py-3 sm:px-6">Status</Th>
                <Th className="px-4 py-3 sm:px-6">Actions</Th>
              </Tr>
            </THead>
            <TBody>
              {isLoading ? (
                <EmptyRow colSpan={8}>Loading payments...</EmptyRow>
              ) : payments.length === 0 ? (
                <EmptyRow colSpan={8}>No confirmed payments yet.</EmptyRow>
              ) : (
                payments.map((payment, i) => (
                  <Tr key={payment.id}>
                    <Td className="px-4 py-3 text-center text-slate-500 sm:px-6">
                      {(paymentPage - 1) * DEFAULT_PAGE_SIZE + i + 1}
                    </Td>
                    <Td className="max-w-[8rem] px-4 py-3 sm:max-w-none sm:px-6">
                      <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                        {paymentId(payment)}
                      </p>
                      <p className="truncate text-xs text-slate-400 sm:hidden">
                        {formatMoney(Number(payment.amount))} RWF · {payment.paidAt ?? "—"}
                      </p>
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                      {formatMoney(Number(payment.amount))}
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                      {paymentReference(payment)}
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                      {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                      {formatStatusLabel(payment.method)}
                    </Td>
                    <Td className="px-4 py-3 sm:px-6">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[payment.status]}`}
                      >
                        {formatStatusLabel(payment.status)}
                      </span>
                    </Td>
                    <Td className="px-4 py-3 sm:px-6">
                      <button
                        type="button"
                        onClick={() => viewReceipt(payment)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                    </Td>
                  </Tr>
                ))
              )}
            </TBody>
          </Table>

          <Pagination
            page={paymentPage}
            totalPages={paymentTotalPages}
            totalItems={paymentTotalItems}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setPaymentPage}
          />
        </>
      )}

      {payingInvoice && (
        <Modal
          title="Pay Rent"
          description={propertyForInvoice(payingInvoice)?.title ?? "Invoice"}
          onClose={() => setPayingInvoice(null)}
        >
          <PayNowForm
            amount={Number(payingInvoice.amountDue)}
            onCancel={() => setPayingInvoice(null)}
            onSuccess={(values) => handlePay(values, payingInvoice)}
          />
        </Modal>
      )}
    </div>
  );
}
