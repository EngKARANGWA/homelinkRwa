"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  ListChecks,
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
import { listProperties } from "@/lib/api/properties";
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
} from "@/lib/api/types";
import {
  CHART_COLORS,
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
} from "@/lib/chart-colors";
import { StatCard, type StatAccent } from "@/components/dashboard/StatCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const ARREARS_THRESHOLD_DAYS = 30;

const TRANSACTION_QUICK_ACTIONS: {
  key: "All" | "Pending Approval" | "Overdue" | "Arrears";
  paymentsStatus: "All" | "pending" | "overdue";
  labelKey: keyof Translations["dashboard"]["landlord"]["overview"]["tabs"];
  icon: typeof Building2;
}[] = [
  { key: "All", paymentsStatus: "All", labelKey: "all", icon: ListChecks },
  { key: "Pending Approval", paymentsStatus: "pending", labelKey: "pendingApproval", icon: Clock },
  { key: "Overdue", paymentsStatus: "overdue", labelKey: "overdue", icon: AlertTriangle },
  { key: "Arrears", paymentsStatus: "overdue", labelKey: "arrears", icon: AlertOctagon },
];

const STAT_META: Record<
  string,
  {
    href: string;
    icon: typeof Building2;
    accent: StatAccent;
    labelKey: keyof Translations["dashboard"]["landlord"]["overview"]["statLabels"];
    subtitleKey: keyof Translations["dashboard"]["landlord"]["overview"]["statSubtitles"];
  }
> = {
  "My Properties": {
    href: "/landlord/properties",
    icon: Building2,
    accent: "blue",
    labelKey: "myProperties",
    subtitleKey: "registeredByYou",
  },
  "Active Leases": {
    href: "/landlord/leases",
    icon: FileText,
    accent: "emerald",
    labelKey: "activeLeases",
    subtitleKey: "currentlyActive",
  },
  "Pending Maintenance": {
    href: "/landlord/maintenance",
    icon: Wrench,
    accent: "amber",
    labelKey: "pendingMaintenance",
    subtitleKey: "awaitingAction",
  },
  "Revenue Collected": {
    href: "/landlord/payments",
    icon: Wallet,
    accent: "teal",
    labelKey: "revenueCollected",
    subtitleKey: "thisMonth",
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
  const { user } = useAuth();
  const { t } = useLanguage();
  const c = t.dashboard.landlord.overview;
  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingMaintenanceCount, setPendingMaintenanceCount] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getOwnerDashboard(),
      listProperties({ ownerId: user.id, limit: 100 }),
      listLeases({ status: "active", limit: 100 }),
      listInvoices({ limit: 100 }),
      listPayments({ limit: 100 }),
      listMaintenanceRequests({ limit: 100 }),
    ])
      .then(([dash, propertiesRes, leasesRes, invoicesRes, paymentsRes, maintenanceRes]) => {
        setDashboard(dash);
        setProperties(propertiesRes.data);
        setLeases(leasesRes.data);
        setInvoices(invoicesRes.data);
        setPayments(paymentsRes.data);
        setPendingMaintenanceCount(
          maintenanceRes.data.filter((m) => m.status !== "completed").length,
        );
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load your dashboard."),
      )
      .finally(() => setLoading(false));
  }, [user]);

  const leaseById = new Map(leases.map((l) => [l.id, l]));

  const overdueInvoices = invoices.filter((inv) => inv.status === "overdue");
  const pendingApprovalPayments = payments.filter((p) => p.approvalStatus === "pending");

  const daysOverdue = (inv: Invoice) =>
    Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  const arrearsInvoices = overdueInvoices.filter((inv) => daysOverdue(inv) >= ARREARS_THRESHOLD_DAYS);

  const overdueTenantIds = new Set(
    overdueInvoices
      .map((inv) => leaseById.get(inv.leaseId)?.tenantId)
      .filter((id): id is string => Boolean(id)),
  );
  const pendingApprovalTenantIds = new Set(pendingApprovalPayments.map((p) => p.tenantId));

  const overdueBalance = overdueInvoices.reduce((sum, inv) => sum + Number(inv.amountDue), 0);
  const arrearsBalance = arrearsInvoices.reduce((sum, inv) => sum + Number(inv.amountDue), 0);
  const pendingApprovalBalance = pendingApprovalPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  );
  const balanceDue = (dashboard?.outstandingRent ?? 0) + pendingApprovalBalance;
  const outstandingTenants = new Set([...overdueTenantIds, ...pendingApprovalTenantIds]).size;

  const handleSendReminder = () => {
    setReminderNotice(
      outstandingTenants > 0
        ? c.reminderSentTemplate
            .replace("{count}", String(outstandingTenants))
            .replace("{plural}", outstandingTenants === 1 ? "" : "s")
        : c.noOutstandingTenants,
    );
  };

  const stats = [
    { label: "My Properties", value: dashboard?.occupancy.totalProperties ?? properties.length },
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

  const transactionTabCounts: Record<(typeof TRANSACTION_QUICK_ACTIONS)[number]["key"], number> = {
    All: overdueInvoices.length + pendingApprovalPayments.length,
    "Pending Approval": pendingApprovalPayments.length,
    Overdue: overdueInvoices.length,
    Arrears: arrearsInvoices.length,
  };

  const transactionTabAmounts: Record<(typeof TRANSACTION_QUICK_ACTIONS)[number]["key"], number> = {
    All: balanceDue,
    "Pending Approval": pendingApprovalBalance,
    Overdue: overdueBalance,
    Arrears: arrearsBalance,
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.subtitlePrefix}{user?.firstName ?? ""}{c.subtitleSuffix}
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
              label={meta ? c.statLabels[meta.labelKey] : label}
              value={isLoading ? "…" : value}
              subtitle={meta ? c.statSubtitles[meta.subtitleKey] : undefined}
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
            { label: c.balanceDue, value: `${formatMoney(balanceDue)} RWF` },
            { label: c.tenantsOutstanding, value: outstandingTenants },
          ]}
          message={balanceDue > 0 ? c.alertMessage : c.allPaidMessage}
        >
          <button
            type="button"
            onClick={handleSendReminder}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Bell className="h-4 w-4" />
            {c.sendReminder}
          </button>
          <Link
            href="/landlord/reports"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {c.viewReport}
          </Link>
        </AlertBanner>

        {properties.length > 0 && (
          <div className="order-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:order-2">
            <p className="font-semibold text-navy">{c.revenueByMonth}</p>
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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-navy">{c.transactionsTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {c.transactionsSubtitle}
            </p>
          </div>
          <Link
            href="/landlord/payments"
            className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-gold hover:underline"
          >
            {t.dashboard.actions.viewAll}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TRANSACTION_QUICK_ACTIONS.map((action) => (
            <Link
              key={action.key}
              href={`/landlord/payments?status=${encodeURIComponent(action.paymentsStatus)}`}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-3 text-center transition-colors hover:border-gold/40 hover:bg-slate-50"
            >
              <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-medium text-navy">
                <span className="flex items-center gap-1.5">
                  <action.icon className="h-4 w-4 shrink-0 text-slate-500" />
                  {c.tabs[action.labelKey]}
                </span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  {isLoading ? "…" : transactionTabCounts[action.key]}
                </span>
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {isLoading ? "…" : `${formatMoney(transactionTabAmounts[action.key])} RWF`}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
