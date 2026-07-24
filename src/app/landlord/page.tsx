"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  Eye,
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
import {
  LEASES,
  MAINTENANCE_REQUESTS,
  PAYMENTS,
  PROPERTIES,
  TODAY,
  type Payment,
} from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { getUnitsForProperty, type Unit } from "@/lib/units";
import {
  CHART_COLORS,
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
} from "@/lib/chart-colors";
import { StatCard, type StatAccent } from "@/components/dashboard/StatCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { formatMoney } from "@/lib/money";

type TransactionRowStatus = Payment["status"] | "Overdue" | "Arrears";

const TRANSACTION_STATUS_STYLES: Record<TransactionRowStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Late: "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700",
  "Pending Approval": "bg-sky-50 text-sky-700",
  Overdue: "bg-amber-50 text-amber-700",
  Arrears: "bg-red-50 text-red-700",
};

const TRANSACTION_STATUS_PRIORITY: Record<TransactionRowStatus, number> = {
  Arrears: 0,
  Overdue: 1,
  Late: 2,
  "Pending Approval": 3,
  Pending: 4,
  Paid: 5,
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
  actions: { type: "unit"; propertyId: string; unitId: string } | { type: "payment" };
};

function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function arrearsPeriodLabel(unit: Unit): string {
  const paidEntries = unit.paymentHistory.filter((p) => p.status === "Paid" && p.paidDate);
  if (paidEntries.length === 0) return "No payments on file";
  const last = paidEntries[paidEntries.length - 1];
  const days = daysBetween(last.paidDate as string, TODAY);
  const period = days < 60 ? `${days} days` : `${Math.round(days / 30)} months`;
  return `${period} overdue`;
}

const TRANSACTION_TABS: {
  key: "All" | "Pending Approval" | "Overdue" | "Arrears";
  label: string;
}[] = [
  { key: "All", label: "All" },
  { key: "Pending Approval", label: "Pending Approval" },
  { key: "Overdue", label: "Overdue" },
  { key: "Arrears", label: "Arrears" },
];

const STAT_META: Record<
  string,
  { href: string; icon: typeof Building2; accent: StatAccent; subtitle: string }
> = {
  "My Properties": {
    href: "/landlord/properties",
    icon: Building2,
    accent: "blue",
    subtitle: "Registered by you",
  },
  "Active Leases": {
    href: "/landlord/leases",
    icon: FileText,
    accent: "emerald",
    subtitle: "Currently active",
  },
  "Pending Maintenance": {
    href: "/landlord/maintenance",
    icon: Wrench,
    accent: "amber",
    subtitle: "Awaiting action",
  },
  "Revenue Collected": {
    href: "/landlord/payments",
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

export default function LandlordOverviewPage() {
  const { landlordName, unitOverrides } = useLandlord();
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"All" | TransactionRowStatus>("All");

  const myProperties = PROPERTIES.filter((p) => p.owner === landlordName);
  const myPropertyNames = myProperties.map((p) => p.name);
  const myLeases = LEASES.filter((l) => l.owner === landlordName);
  const myMaintenance = MAINTENANCE_REQUESTS.filter((m) =>
    myPropertyNames.includes(m.property),
  );
  const myPayments = PAYMENTS.filter((p) => p.owner === landlordName);

  const allTenantUnits = myProperties.flatMap((property) =>
    getUnitsForProperty(property, unitOverrides).filter(
      (u) => u.occupancyStatus === "Occupied",
    ),
  );

  const overdueTenantUnits = allTenantUnits.filter(
    (u) => u.currentPaymentStatus === "Overdue" || u.currentPaymentStatus === "Arrears",
  );
  const overdueOnlyUnits = allTenantUnits.filter((u) => u.currentPaymentStatus === "Overdue");
  const arrearsOnlyUnits = allTenantUnits.filter((u) => u.currentPaymentStatus === "Arrears");
  const arrearsBalance = overdueTenantUnits.reduce((sum, u) => sum + u.monthlyRent, 0);
  const overdueOnlyBalance = overdueOnlyUnits.reduce((sum, u) => sum + u.monthlyRent, 0);
  const arrearsOnlyBalance = arrearsOnlyUnits.reduce((sum, u) => sum + u.monthlyRent, 0);

  const pendingApprovalPayments = myPayments.filter((p) => p.status === "Pending Approval");
  const pendingApprovalBalance = pendingApprovalPayments.reduce(
    (sum, p) => sum + p.amount,
    0,
  );

  let balanceDue: number;
  let outstandingTenants: number;
  if (statusFilter === "Arrears") {
    balanceDue = arrearsOnlyBalance;
    outstandingTenants = arrearsOnlyUnits.length;
  } else if (statusFilter === "Overdue") {
    balanceDue = overdueOnlyBalance;
    outstandingTenants = overdueOnlyUnits.length;
  } else if (statusFilter === "Pending Approval") {
    balanceDue = pendingApprovalBalance;
    outstandingTenants = new Set(pendingApprovalPayments.map((p) => p.tenant)).size;
  } else {
    balanceDue = arrearsBalance + pendingApprovalBalance;
    outstandingTenants = new Set([
      ...overdueTenantUnits.map((u) => u.tenant),
      ...pendingApprovalPayments.map((p) => p.tenant),
    ]).size;
  }

  const handleSendReminder = () => {
    setReminderNotice(
      outstandingTenants > 0
        ? `Reminder sent to ${outstandingTenants} tenant${outstandingTenants === 1 ? "" : "s"} with an outstanding balance.`
        : "No tenants currently have an outstanding balance.",
    );
  };

  const stats = [
    { label: "My Properties", value: myProperties.length },
    {
      label: "Active Leases",
      value: myLeases.filter((l) => l.status === "Active").length,
    },
    {
      label: "Pending Maintenance",
      value: myMaintenance.filter((m) => m.status !== "Completed").length,
    },
    {
      label: "Revenue Collected",
      value: `${formatMoney(
        myPayments
          .filter((p) => p.status === "Paid")
          .reduce((sum, p) => sum + p.amount, 0),
      )} RWF`,
    },
  ];

  const revenueByMonth = (() => {
    const currentYear = TODAY.slice(0, 4);
    const totals = new Map<string, number>();
    myPayments
      .filter((p) => p.status === "Paid")
      .forEach((p) => {
        const month = (p.paidDate ?? p.dueDate).slice(0, 7);
        totals.set(month, (totals.get(month) ?? 0) + p.amount);
      });
    return Array.from({ length: 12 }, (_, i) => {
      const month = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
      return { month, amount: totals.get(month) ?? 0 };
    });
  })();

  const filteredPayments = myPayments.filter(
    (p) => statusFilter === "All" || p.status === statusFilter,
  );

  const filteredArrearsUnits =
    statusFilter === "All" || statusFilter === "Overdue" || statusFilter === "Arrears"
      ? overdueTenantUnits.filter(
          (u) => statusFilter === "All" || u.currentPaymentStatus === statusFilter,
        )
      : [];

  const transactionTabCounts: Record<(typeof TRANSACTION_TABS)[number]["key"], number> = {
    All: myPayments.length + overdueTenantUnits.length,
    "Pending Approval": myPayments.filter((p) => p.status === "Pending Approval").length,
    Overdue: overdueOnlyUnits.length,
    Arrears: arrearsOnlyUnits.length,
  };

  const transactionRows: TransactionRow[] = [
    ...filteredArrearsUnits.map(
      (unit): TransactionRow => ({
        id: `unit-${unit.id}`,
        tenant: unit.tenant ?? "Unknown tenant",
        property: unit.propertyName,
        unit: unit.unitNumber,
        amount: unit.monthlyRent,
        method: "—",
        dueDate: arrearsPeriodLabel(unit),
        status: unit.currentPaymentStatus === "Arrears" ? "Arrears" : "Overdue",
        actions: { type: "unit", propertyId: unit.propertyId, unitId: unit.id },
      }),
    ),
    ...filteredPayments.map(
      (payment): TransactionRow => ({
        id: `payment-${payment.id}`,
        tenant: payment.tenant,
        property: payment.property,
        unit: "—",
        amount: payment.amount,
        method: payment.method,
        dueDate: payment.dueDate,
        status: payment.status,
        actions: { type: "payment" },
      }),
    ),
  ].sort(
    (a, b) => TRANSACTION_STATUS_PRIORITY[a.status] - TRANSACTION_STATUS_PRIORITY[b.status],
  );
  const visibleTransactions = transactionRows.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          A quick look at your properties, {landlordName}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map(({ label, value }) => {
          const meta = STAT_META[label];
          return (
            <StatCard
              key={label}
              label={label}
              value={value}
              subtitle={meta?.subtitle}
              href={meta?.href ?? "/landlord"}
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
              ? "Some tenants haven't paid this month's rent yet. Send a reminder or check the full report."
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
          <Link
            href="/landlord/reports"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            View Report
          </Link>
        </AlertBanner>

        {myProperties.length > 0 && (
          <div className="order-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:order-2">
            <p className="font-semibold text-navy">Revenue by Month</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={axisTick} />
                <YAxis tickFormatter={(value) => formatMoney(Number(value))} tick={axisTick} />
                <Tooltip
                  labelFormatter={(label) => formatMonth(String(label))}
                  formatter={(value) => `${Number(value).toLocaleString()} RWF`}
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
              Rent payments and tenants currently in arrears, across your properties.
            </p>
          </div>
          <Link
            href="/landlord/payments"
            className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-gold hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
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
              <Th className="hidden px-6 py-3 md:table-cell">Due Date</Th>
              <Th className="px-4 py-3 sm:px-6">Status</Th>
              <Th className="px-4 py-3 text-right sm:px-6">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {visibleTransactions.map((row) => (
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
                <Td
                  className={`hidden px-6 py-3 sm:table-cell ${
                    row.status === "Overdue" || row.status === "Arrears" || row.status === "Late"
                      ? "font-medium text-red-600"
                      : "text-slate-500"
                  }`}
                >
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
                <Td className="px-4 py-3 text-right sm:px-6">
                  {row.actions.type === "unit" && (
                    <Link
                      href={`/landlord/properties/${row.actions.propertyId}/units/${row.actions.unitId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  )}
                </Td>
              </Tr>
            ))}
            {visibleTransactions.length === 0 && (
              <EmptyRow colSpan={8}>No transactions match this filter.</EmptyRow>
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
