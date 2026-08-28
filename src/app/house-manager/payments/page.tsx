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
  Wallet,
  X,
} from "lucide-react";
import { listProperties } from "@/lib/api/properties";
import { listLeases } from "@/lib/api/leases";
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
  Lease,
  Payment,
  PaymentStatus,
  Property,
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
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type RowStatus = InvoiceStatus | PaymentStatus;

const STATUS_STYLES: Record<RowStatus, string> = {
  ...INVOICE_STATUS_STYLES,
  ...PAYMENT_STATUS_STYLES,
};

const STATUS_PRIORITY: Record<RowStatus, number> = {
  overdue: 0,
  pending: 1,
  unpaid: 2,
  success: 3,
  paid: 3,
  failed: 4,
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

export default function HouseManagerPaymentsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const c = t.dashboard.houseManager.payments;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [propertyFilter, setPropertyFilter] = useState(c.allProperties);
  const [statusFilter, setStatusFilter] = useState<"All" | RowStatus>("All");
  const [methodFilter, setMethodFilter] = useState<"All" | Payment["method"]>("All");
  const [page, setPage] = useState(1);

  const TABS: { key: "All" | "pending" | "overdue"; label: string }[] = [
    { key: "All", label: t.dashboard.actions.all },
    { key: "pending", label: t.dashboard.status.pendingApproval },
    { key: "overdue", label: t.dashboard.status.overdue },
  ];

  const leaseById = new Map(leases.map((l) => [l.id, l]));
  const invoiceById = new Map(invoices.map((i) => [i.id, i]));
  const propertyById = new Map(properties.map((p) => [p.id, p]));
  const tenantName = (id: string) => `Tenant ${id.slice(0, 8).toUpperCase()}`;
  const propertyOptions = [c.allProperties, ...properties.map((p) => p.title)];

  const leaseForInvoice = (invoice: Invoice) => leaseById.get(invoice.leaseId);
  const leaseForPayment = (payment: Payment) => {
    const invoice = invoiceById.get(payment.invoiceId);
    return invoice ? leaseById.get(invoice.leaseId) : undefined;
  };
  const propertyForInvoice = (invoice: Invoice) => {
    const lease = leaseForInvoice(invoice);
    return lease ? propertyById.get(lease.propertyId) : undefined;
  };
  const propertyForPayment = (payment: Payment) => {
    const lease = leaseForPayment(payment);
    return lease ? propertyById.get(lease.propertyId) : undefined;
  };

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      listInvoices({ limit: 100 }),
      listPayments({ page, limit: DEFAULT_PAGE_SIZE }),
      listProperties({ limit: 100 }),
      listLeases({ limit: 100 }),
    ])
      .then(([invoicesRes, paymentsRes, propertiesRes, leasesRes]) => {
        setInvoices(invoicesRes.data);
        setPayments(paymentsRes.data);
        setProperties(propertiesRes.data);
        setLeases(leasesRes.data);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load payments."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [user, page]);

  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
  const totalInArrears = overdueInvoices.reduce(
    (sum, inv) => sum + Number(inv.amountDue),
    0,
  );

  const collected = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const outstanding = invoices
    .filter((inv) => inv.status === "unpaid" || inv.status === "overdue")
    .reduce((sum, inv) => sum + Number(inv.amountDue), 0);

  const propertyFilteredOverdueInvoices = overdueInvoices.filter(
    (inv) =>
      propertyFilter === c.allProperties ||
      propertyForInvoice(inv)?.title === propertyFilter,
  );
  const filteredOverdueInvoices =
    methodFilter === "All" && (statusFilter === "All" || statusFilter === "overdue")
      ? propertyFilteredOverdueInvoices
      : [];

  const propertyMethodFilteredPayments = payments.filter((p) => {
    const matchesProperty =
      propertyFilter === c.allProperties ||
      propertyForPayment(p)?.title === propertyFilter;
    const matchesMethod = methodFilter === "All" || p.method === methodFilter;
    return matchesProperty && matchesMethod;
  });
  const filteredPayments = propertyMethodFilteredPayments.filter(
    (p) => statusFilter === "All" || p.status === statusFilter,
  );

  const tabCounts: Record<(typeof TABS)[number]["key"], number> = {
    All: propertyMethodFilteredPayments.length + propertyFilteredOverdueInvoices.length,
    pending: propertyMethodFilteredPayments.filter((p) => p.approvalStatus === "pending")
      .length,
    overdue: propertyFilteredOverdueInvoices.length,
  };

  const rows: PaymentRow[] = [
    ...filteredOverdueInvoices.map(
      (invoice): PaymentRow => ({
        id: `invoice-${invoice.id}`,
        tenant: tenantName(leaseForInvoice(invoice)?.tenantId ?? "—"),
        property: propertyForInvoice(invoice)?.title ?? "—",
        amount: Number(invoice.amountDue),
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
        property: propertyForPayment(payment)?.title ?? "—",
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
    let reason = "";
    if (!approve) {
      reason = window.prompt(c.rejectPrompt)?.trim() ?? "";
      if (!reason) return;
    }
    setActionError(null);
    setProcessingId(paymentId);
    try {
      if (approve) {
        await approvePayment(paymentId);
      } else {
        await rejectPayment(paymentId, reason);
      }
      setNotice(approve ? c.approvedNotice : c.rejectedNotice);
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
        ? c.reminderSentTemplate
            .replace("{count}", String(overdueInvoices.length))
            .replace("{plural}", overdueInvoices.length === 1 ? "" : "s")
        : c.noArrearsTenants,
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            {c.exportExcel}
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <IconStatCard
          icon={Wallet}
          label={c.statCollected}
          value={`${formatMoney(collected)} RWF`}
          subtitle={c.statCollectedSubtitle}
          accent="emerald"
        />
        <IconStatCard
          icon={AlertCircle}
          label={c.statOutstanding}
          value={`${formatMoney(outstanding)} RWF`}
          subtitle={c.statOutstandingSubtitle}
          accent="red"
        />
        <IconStatCard
          icon={AlertTriangle}
          label={c.statArrears}
          value={`${formatMoney(totalInArrears)} RWF`}
          subtitle={c.statArrearsSubtitle}
          accent="amber"
        />
      </div>

      <AlertBanner
        isAlert={overdueInvoices.length > 0}
        stats={[
          { label: c.statArrears, value: `${formatMoney(totalInArrears)} RWF` },
          { label: c.invoicesOverdue, value: overdueInvoices.length },
        ]}
      >
        <button
          type="button"
          onClick={handleSendArrearsReminder}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Bell className="h-4 w-4" />
          {c.sendReminder}
        </button>
      </AlertBanner>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.filterProperty}
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

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.filterStatus}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option value="All">{t.dashboard.actions.all}</option>
              <option value="overdue">{t.dashboard.status.overdue}</option>
              <option value="success">{c.statusSuccessful}</option>
              <option value="pending">{t.dashboard.status.pendingApproval}</option>
              <option value="failed">{c.statusFailed}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.filterMethod}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option value="All">{t.dashboard.actions.all}</option>
              <option value="mobile_money">{c.methodMobileMoney}</option>
              <option value="bank_transfer">{c.methodBankTransfer}</option>
              <option value="cash">{c.methodCash}</option>
            </select>
          </label>
        </div>
      </div>

      <Card title={c.transactionsTitle}>
        <p className="mt-1 text-sm text-slate-500">{c.transactionsSubtitle}</p>

        <div className="mt-4 flex items-center gap-6 overflow-x-auto border-b border-slate-200">
          {TABS.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-gold text-navy"
                    : "border-transparent text-slate-500 hover:text-navy"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive ? "bg-gold/10 text-gold" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tabCounts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        <Table variant="card">
          <THead>
            <Tr>
              <Th className="max-w-[10rem] px-4 py-3 sm:px-6">{t.dashboard.table.tenant}</Th>
              <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.property}</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">{t.dashboard.table.amountRwf}</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.method}</Th>
              <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.date}</Th>
              <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
              <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <EmptyRow colSpan={7}>{c.loading}</EmptyRow>
            ) : pagedRows.length === 0 ? (
              <EmptyRow colSpan={7}>{c.empty}</EmptyRow>
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
                        {formatMoney(row.amount)} RWF
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
                      {formatMoney(row.amount)}
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
                              {payment.status === "success" && (
                                <button
                                  type="button"
                                  onClick={() => viewReceipt(payment)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  {c.receipt}
                                </button>
                              )}
                              {payment.approvalStatus === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => resolvePayment(payment.id, true)}
                                    disabled={isProcessing}
                                    aria-label={c.approveAriaTemplate.replace("{name}", row.tenant)}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => resolvePayment(payment.id, false)}
                                    disabled={isProcessing}
                                    aria-label={c.rejectAriaTemplate.replace("{name}", row.tenant)}
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
    </div>
  );
}
