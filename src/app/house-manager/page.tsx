"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  Building2,
  CheckCircle2,
  FileText,
  Wallet,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/components/auth/AuthContext";
import { getOwnerDashboard } from "@/lib/api/dashboard";
import { listProperties, listUnits } from "@/lib/api/properties";
import { listLeases } from "@/lib/api/leases";
import { listInvoices, listPayments } from "@/lib/api/payments";
import { listMaintenanceRequests } from "@/lib/api/maintenance";
import { ApiError } from "@/lib/api/client";
import type {
  Invoice,
  Lease,
  OwnerDashboard,
  Payment,
  Property,
  PropertyUnit,
} from "@/lib/api/types";
import {
  CHART_COLORS,
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
} from "@/lib/chart-colors";
import { StatCard, type StatAccent } from "@/components/dashboard/StatCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { formatMoney } from "@/lib/money";

type TransactionRowStatus = "Overdue" | "Pending Approval";

const TRANSACTION_STATUS_STYLES: Record<TransactionRowStatus, string> = {
  Overdue: "bg-red-50 text-red-700",
  "Pending Approval": "bg-sky-50 text-sky-700",
};

const TRANSACTION_STATUS_PRIORITY: Record<TransactionRowStatus, number> = {
  Overdue: 0,
  "Pending Approval": 1,
};

type TransactionRow = {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  method: string;
  dueDate: string;
  status: TransactionRowStatus;
};

const TRANSACTION_TABS: { key: "All" | TransactionRowStatus; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Pending Approval", label: "Pending Approval" },
  { key: "Overdue", label: "Overdue" },
];

const STAT_META: Record<
  string,
  { href: string; icon: typeof Building2; accent: StatAccent; subtitle: string }
> = {
  "Managed Properties": {
    href: "/house-manager/properties",
    icon: Building2,
    accent: "blue",
    subtitle: "Owned by your assigned landlord",
  },
  "Active Leases": {
    href: "/house-manager/leases",
    icon: FileText,
    accent: "emerald",
    subtitle: "Currently active",
  },
  "Pending Maintenance": {
    href: "/house-manager/maintenance",
    icon: Wrench,
    accent: "amber",
    subtitle: "Awaiting action",
  },
  "Revenue Collected": {
    href: "/house-manager/payments",
    icon: Wallet,
    accent: "teal",
    subtitle: "This month",
  },
};

const axisTick = { fontSize: 12, fill: CHART_TEXT_COLOR };

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonth(month: string): string {
  return MONTH_LABELS[Number(month.slice(5, 7)) - 1] ?? month;
}

export default function HouseManagerOverviewPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingMaintenanceCount, setPendingMaintenanceCount] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"All" | TransactionRowStatus>("All");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getOwnerDashboard(),
      listProperties({ limit: 100 }),
      listLeases({ status: "active", limit: 100 }),
      listInvoices({ limit: 100 }),
      listPayments({ limit: 100 }),
      listMaintenanceRequests({ limit: 100 }),
    ])
      .then(async ([dash, propertiesRes, leasesRes, invoicesRes, paymentsRes, maintenanceRes]) => {
        setDashboard(dash);
        setProperties(propertiesRes.data);
        setLeases(leasesRes.data);
        setInvoices(invoicesRes.data);
        setPayments(paymentsRes.data);
        setPendingMaintenanceCount(
          maintenanceRes.data.filter((m) => m.status !== "completed").length,
        );
        const unitsByProperty = await Promise.all(
          propertiesRes.data.map((p) => listUnits(p.id)),
        );
        setUnits(unitsByProperty.flat());
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load your dashboard."),
      )
      .finally(() => setLoading(false));
  }, [user]);

  const leaseById = new Map(leases.map((l) => [l.id, l]));
  const propertyById = new Map(properties.map((p) => [p.id, p]));
  const unitById = new Map(units.map((u) => [u.id, u]));
  const tenantLabel = (id: string) => `Tenant ${id.slice(0, 8).toUpperCase()}`;

  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
  const pendingApprovalPayments = payments.filter((p) => p.approvalStatus === "pending");

  const overdueTenantIds = new Set(
    overdueInvoices
      .map((inv) => leaseById.get(inv.leaseId)?.tenantId)
      .filter((id): id is string => Boolean(id)),
  );
  const pendingApprovalTenantIds = new Set(pendingApprovalPayments.map((p) => p.tenantId));

  const balanceDue =
    (dashboard?.outstandingRent ?? 0) +
    pendingApprovalPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const outstandingTenants = new Set([...overdueTenantIds, ...pendingApprovalTenantIds]).size;

  const handleSendReminder = () => {
    setReminderNotice(
      outstandingTenants > 0
        ? `Reminder sent to ${outstandingTenants} tenant${outstandingTenants === 1 ? "" : "s"} with an outstanding balance.`
        : "No tenants currently have an outstanding balance.",
    );
  };

  const stats = [
    { label: "Managed Properties", value: dashboard?.occupancy.totalProperties ?? properties.length },
    { label: "Active Leases", value: leases.length },
    { label: "Pending Maintenance", value: pendingMaintenanceCount },
    {
      label: "Revenue Collected",
      value: `${formatMoney(dashboard?.revenue.thisMonth ?? 0)} RWF`,
    },
  ];

  const revenueByMonth = (() => {
    const currentYear = new Date().getFullYear().toString();
    const totals = new Map<string, number>();
    payments
      .filter((p) => p.status === "success" && p.paidAt)
      .forEach((p) => {
        const month = (p.paidAt as string).slice(0, 7);
        totals.set(month, (totals.get(month) ?? 0) + Number(p.amount));
      });
    return Array.from({ length: 12 }, (_, i) => {
      const month = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
      return { month, amount: totals.get(month) ?? 0 };
    });
  })();

  const filteredOverdueInvoices =
    statusFilter === "All" || statusFilter === "Overdue" ? overdueInvoices : [];
  const filteredPendingPayments =
    statusFilter === "All" || statusFilter === "Pending Approval" ? pendingApprovalPayments : [];

  const transactionTabCounts: Record<(typeof TRANSACTION_TABS)[number]["key"], number> = {
    All: overdueInvoices.length + pendingApprovalPayments.length,
    "Pending Approval": pendingApprovalPayments.length,
    Overdue: overdueInvoices.length,
  };

  const transactionRows: TransactionRow[] = [
    ...filteredOverdueInvoices.map((invoice): TransactionRow => {
      const lease = leaseById.get(invoice.leaseId);
      return {
        id: `invoice-${invoice.id}`,
        tenant: lease ? tenantLabel(lease.tenantId) : "—",
        property: lease ? propertyById.get(lease.propertyId)?.title ?? "—" : "—",
        unit: lease ? unitById.get(lease.unitId)?.label ?? "—" : "—",
        amount: Number(invoice.amountDue),
        method: "—",
        dueDate: invoice.dueDate,
        status: "Overdue",
      };
    }),
    ...filteredPendingPayments.map((payment): TransactionRow => {
      const invoice = invoices.find((inv) => inv.id === payment.invoiceId);
      const lease = invoice ? leaseById.get(invoice.leaseId) : undefined;
      return {
        id: `payment-${payment.id}`,
        tenant: tenantLabel(payment.tenantId),
        property: lease ? propertyById.get(lease.propertyId)?.title ?? "—" : "—",
        unit: lease ? unitById.get(lease.unitId)?.label ?? "—" : "—",
        amount: Number(payment.amount),
        method: payment.method,
        dueDate: payment.createdAt,
        status: "Pending Approval",
      };
    }),
  ].sort(
    (a, b) => TRANSACTION_STATUS_PRIORITY[a.status] - TRANSACTION_STATUS_PRIORITY[b.status],
  );
  const visibleTransactions = transactionRows.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          A quick look at the properties you manage.
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map(({ label, value }) => {
          const meta = STAT_META[label];
          return (
            <StatCard
              key={label}
              label={label}
              value={isLoading ? "…" : value}
              subtitle={meta?.subtitle}
              href={meta?.href ?? "/house-manager"}
              icon={meta?.icon ?? Building2}
              accent={meta?.accent ?? "blue"}
            />
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AlertBanner
          className="order-2 lg:order-1"
          isAlert={balanceDue > 0}
          stats={[
            { label: "Balance Due", value: `${formatMoney(balanceDue)} RWF` },
            { label: "Tenants Outstanding", value: outstandingTenants },
          ]}
          message={
            balanceDue > 0
              ? "Some tenants haven't paid this month's rent yet. Send a reminder or check with the landlord."
              : "All tenants are paid up this month."
          }
        >
          <button
            type="button"
            onClick={handleSendReminder}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Bell className="h-4 w-4" />
            Send Reminder
          </button>
        </AlertBanner>

        {properties.length > 0 && (
          <div className="order-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:order-2">
            <p className="font-semibold text-navy">Revenue by Month</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={axisTick} />
                <YAxis tickFormatter={(value) => formatMoney(Number(value))} tick={axisTick} />
                <Tooltip
                  labelFormatter={(label) => formatMonth(String(label))}
                  formatter={(value) => `${formatMoney(Number(value))} RWF`}
                />
                <Bar dataKey="amount" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {reminderNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {reminderNotice}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-navy">Transactions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Overdue invoices and payments awaiting approval, across managed properties.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-100 px-6">
          {TRANSACTION_TABS.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
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
                  {transactionTabCounts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        <Table variant="plain">
          <THead>
            <Tr>
              <Th className="max-w-[10rem] px-4 py-3 sm:px-6">Tenant</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Property</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">Unit</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">Amount (RWF)</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">Method</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Date</Th>
              <Th className="px-4 py-3 sm:px-6">Status</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <EmptyRow colSpan={7}>Loading transactions...</EmptyRow>
            ) : visibleTransactions.length === 0 ? (
              <EmptyRow colSpan={7}>No transactions match this filter.</EmptyRow>
            ) : (
              visibleTransactions.map((row) => (
                <Tr key={row.id}>
                  <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                      {row.tenant}
                    </p>
                    <p className="truncate text-xs text-slate-400 md:hidden">{row.property}</p>
                    <p className="text-xs text-slate-400 sm:hidden">
                      {formatMoney(row.amount)} RWF
                    </p>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {row.property}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">{row.unit}</Td>
                  <Td className="hidden px-6 py-3 font-medium text-red-600 sm:table-cell">
                    {formatMoney(row.amount)}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">{row.method}</Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">{row.dueDate}</Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${TRANSACTION_STATUS_STYLES[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
