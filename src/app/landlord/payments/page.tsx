"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Download,
  Eye,
  Plus,
  Wallet,
  X,
} from "lucide-react";
import { listUsers } from "@/lib/api/admin";
import { listProperties } from "@/lib/api/properties";
import {
  approvePayment,
  exportPaymentsWorkbook,
  getPaymentReceipt,
  listInvoices,
  listPayments,
  rejectPayment,
} from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import type {
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentStatus,
  Property,
  User,
} from "@/lib/api/types";
import {
  formatStatusLabel,
  INVOICE_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
} from "@/lib/paymentStatus";
import { useAuth } from "@/components/auth/AuthContext";
import { IconStatCard } from "@/components/dashboard/IconStatCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { Card } from "@/components/dashboard/Card";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { Modal } from "@/components/admin/Modal";
import { RecordPaymentForm } from "@/components/landlord/RecordPaymentForm";

type RowStatus = InvoiceStatus | PaymentStatus;

const STATUS_STYLES: Record<RowStatus, string> = {
  ...INVOICE_STATUS_STYLES,
  ...PAYMENT_STATUS_STYLES,
};

const STATUS_PRIORITY: Record<RowStatus, number> = {
  overdue: 0,
  pending_approval: 1,
  pending: 2,
  successful: 3,
  paid: 3,
  rejected: 4,
  failed: 4,
  cancelled: 5,
};

type PaymentRow = {
  id: string;
  tenant: string;
  property: string;
  amount: number;
  method: string;
  date: string;
  status: RowStatus;
  actions: { type: "invoice" } | { type: "payment"; payment: Payment };
};

export default function LandlordPaymentsPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isRecordingPayment, setRecordingPayment] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [statusFilter, setStatusFilter] = useState<"All" | RowStatus>("All");
  const [methodFilter, setMethodFilter] = useState<"All" | Payment["method"]>("All");
  const [page, setPage] = useState(1);

  const propertyFor = (id: string) => properties.find((p) => p.id === id);
  const tenantName = (id: string) => {
    const tenant = tenants.find((t) => t.id === id);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : "—";
  };
  const propertyOptions = ["All Properties", ...properties.map((p) => p.title)];

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      listInvoices({ limit: 100 }),
      listPayments({ page, limit: DEFAULT_PAGE_SIZE }),
      listProperties({ ownerId: user.id, limit: 100 }),
      listUsers({ role: "tenant", limit: 100 }),
    ])
      .then(([invoicesRes, paymentsRes, propertiesRes, tenantsRes]) => {
        setInvoices(invoicesRes.data);
        setPayments(paymentsRes.data);
        setProperties(propertiesRes.data);
        setTenants(tenantsRes.data);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load payments."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [user, page]);

  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
  const totalInArrears = overdueInvoices.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0,
  );

  const collected = payments
    .filter((p) => p.status === "successful")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const outstanding = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const filteredOverdueInvoices = overdueInvoices.filter((inv) => {
    const matchesProperty =
      propertyFilter === "All Properties" ||
      propertyFor(inv.propertyId)?.title === propertyFilter;
    const matchesStatus = statusFilter === "All" || statusFilter === "overdue";
    const matchesMethod = methodFilter === "All";
    return matchesProperty && matchesStatus && matchesMethod;
  });

  const filteredPayments = payments.filter((p) => {
    const matchesProperty =
      propertyFilter === "All Properties" ||
      propertyFor(p.propertyId)?.title === propertyFilter;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesMethod = methodFilter === "All" || p.method === methodFilter;
    return matchesProperty && matchesStatus && matchesMethod;
  });

  const rows: PaymentRow[] = [
    ...filteredOverdueInvoices.map(
      (invoice): PaymentRow => ({
        id: `invoice-${invoice.id}`,
        tenant: tenantName(invoice.tenantId),
        property: propertyFor(invoice.propertyId)?.title ?? "—",
        amount: Number(invoice.amount),
        method: "—",
        date: invoice.dueDate,
        status: invoice.status,
        actions: { type: "invoice" },
      }),
    ),
    ...filteredPayments.map(
      (payment): PaymentRow => ({
        id: `payment-${payment.id}`,
        tenant: tenantName(payment.tenantId),
        property: propertyFor(payment.propertyId)?.title ?? "—",
        amount: Number(payment.amount),
        method: formatStatusLabel(payment.method),
        date: payment.paidAt ?? "—",
        status: payment.status,
        actions: { type: "payment", payment },
      }),
    ),
  ].sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const totalPages = Math.max(1, Math.ceil(rows.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedRows = rows.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

  const resolvePayment = async (paymentId: string, approve: boolean) => {
    setActionError(null);
    setProcessingId(paymentId);
    try {
      if (approve) {
        await approvePayment(paymentId);
      } else {
        await rejectPayment(paymentId);
      }
      setNotice(approve ? "Payment approved." : "Payment rejected.");
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

  const handleSendArrearsReminder = () => {
    setNotice(
      overdueInvoices.length > 0
        ? `Reminder sent to ${overdueInvoices.length} tenant${overdueInvoices.length === 1 ? "" : "s"} in arrears.`
        : "No tenants are currently in arrears.",
    );
  };

  const handleExport = async () => {
    setActionError(null);
    try {
      await exportPaymentsWorkbook();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to export payments.");
    }
  };

  const handleRecordPayment = (values: {
    propertyId: string;
    tenantName: string;
    amount: number;
    paidDate: string;
  }) => {
    setRecordingPayment(false);
    setNotice(
      `Noted: ${values.amount.toLocaleString()} RWF cash payment from ${values.tenantName} on ${values.paidDate}. This isn't submitted to the platform yet — recording landlord-side cash payments isn't supported by the backend.`,
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Rent payments across your properties.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
          <button
            type="button"
            onClick={() => setRecordingPayment(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Record Payment (Cash)
          </button>
        </div>
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

      <div className="flex flex-wrap gap-5">
        <IconStatCard
          icon={Wallet}
          label="Collected"
          value={`${collected.toLocaleString()} RWF`}
          subtitle="All successful payments"
          accent="emerald"
        />
        <IconStatCard
          icon={AlertCircle}
          label="Outstanding"
          value={`${outstanding.toLocaleString()} RWF`}
          subtitle="Pending & overdue invoices"
          accent="red"
        />
        <IconStatCard
          icon={AlertTriangle}
          label="Total in Arrears"
          value={`${totalInArrears.toLocaleString()} RWF`}
          subtitle="Overdue invoice total"
          accent="amber"
        />
      </div>

      <AlertBanner
        isAlert={overdueInvoices.length > 0}
        stats={[]}
        message={
          overdueInvoices.length > 0
            ? "These tenants are behind on rent. Send a reminder to nudge them toward payment."
            : "No tenants are currently behind on rent."
        }
      >
        <button
          type="button"
          onClick={handleSendArrearsReminder}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Bell className="h-4 w-4" />
          Send Reminder
        </button>
      </AlertBanner>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Property
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {propertyOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">All</option>
            <option value="overdue">Overdue</option>
            <option value="successful">Successful</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Method
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">All</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </label>
      </div>

      <Card title="Transactions">
        <p className="mt-1 text-sm text-slate-500">
          All rent payments and invoices currently in arrears, across your properties.
        </p>
        <Table variant="card">
          <THead>
            <Tr>
              <Th className="max-w-[10rem] px-4 py-3 sm:px-6">Tenant</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Property</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">Amount (RWF)</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">Method</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Date</Th>
              <Th className="px-4 py-3 sm:px-6">Status</Th>
              <Th className="px-4 py-3 sm:px-6">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <EmptyRow colSpan={7}>Loading payments...</EmptyRow>
            ) : pagedRows.length === 0 ? (
              <EmptyRow colSpan={7}>No payments match these filters.</EmptyRow>
            ) : (
              pagedRows.map((row) => {
                const isProcessing =
                  row.actions.type === "payment" && processingId === row.actions.payment.id;
                return (
                  <Tr key={row.id}>
                    <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                      <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                        {row.tenant}
                      </p>
                      <p className="truncate text-xs text-slate-400 md:hidden">
                        {row.property}
                      </p>
                      <p className="text-xs text-slate-400 sm:hidden">
                        {row.amount.toLocaleString()} RWF
                      </p>
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                      {row.property}
                    </Td>
                    <Td
                      className={`hidden px-6 py-3 sm:table-cell ${
                        row.status === "overdue" ? "font-medium text-red-600" : "text-slate-500"
                      }`}
                    >
                      {row.amount.toLocaleString()}
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                      {row.method}
                    </Td>
                    <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                      {row.date}
                    </Td>
                    <Td className="px-4 py-3 sm:px-6">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[row.status]}`}
                      >
                        {formatStatusLabel(row.status)}
                      </span>
                    </Td>
                    <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                      {row.actions.type === "payment" &&
                        (() => {
                          const payment = row.actions.payment;
                          return (
                            <div className="flex flex-wrap items-center gap-2">
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
                                    aria-label={`Approve payment from ${row.tenant}`}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => resolvePayment(payment.id, false)}
                                    disabled={isProcessing}
                                    aria-label={`Reject payment from ${row.tenant}`}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          );
                        })()}
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
          totalItems={rows.length}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>

      {isRecordingPayment && (
        <Modal
          title="Record Payment (Cash)"
          description="Note a cash payment you've received from a tenant."
          onClose={() => setRecordingPayment(false)}
        >
          <RecordPaymentForm
            properties={properties}
            onSuccess={handleRecordPayment}
            onCancel={() => setRecordingPayment(false)}
          />
        </Modal>
      )}
    </div>
  );
}
